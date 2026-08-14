package com.shiptrack.service;

import com.shiptrack.dto.SupportMessageRequest;
import com.shiptrack.dto.SupportMessageResponse;
import com.shiptrack.dto.SupportQueryRequest;
import com.shiptrack.dto.SupportQueryResponse;
import com.shiptrack.entity.SupportMessage;
import com.shiptrack.entity.SupportQuery;
import com.shiptrack.entity.User;
import com.shiptrack.exception.ForbiddenException;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.SupportMessageRepository;
import com.shiptrack.repository.SupportQueryRepository;
import com.shiptrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportQueryService {

    private final SupportQueryRepository repository;
    private final SupportMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private void requireSupportOrAdmin(User user) {
        String role = user.getRole();
        if (!"ADMIN".equalsIgnoreCase(role) && !"SUPPORT_ASSISTANT".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Access denied. Support or Admin only.");
        }
    }

    private boolean isSupportOrAdmin(User user) {
        String role = user.getRole();
        return "ADMIN".equalsIgnoreCase(role) || "SUPPORT_ASSISTANT".equalsIgnoreCase(role);
    }

    private SupportQuery getQuery(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Query not found."));
    }

    private void requireParticipant(SupportQuery query, User user) {
        if (!isSupportOrAdmin(user) && !query.getCreatedBy().getId().equals(user.getId())) {
            throw new ForbiddenException("Access denied to this conversation.");
        }
    }

    private SupportMessageResponse toMessageResponse(SupportMessage message) {
        return SupportMessageResponse.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .senderEmail(message.getSender().getEmail())
                .senderRole(message.getSender().getRole())
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .build();
    }

    private SupportQueryResponse toResponse(SupportQuery query) {
        List<SupportMessage> messages = messageRepository.findByQueryIdOrderBySentAtAsc(query.getId());
        LocalDateTime lastMessageAt = query.getRespondedAt();
        long messageCount = messages.size();
        if (!messages.isEmpty()) {
            lastMessageAt = messages.get(messages.size() - 1).getSentAt();
        } else if (query.getResponse() != null) {
            messageCount = 1;
        }

        SupportQueryResponse.SupportQueryResponseBuilder builder = SupportQueryResponse.builder()
                .id(query.getId())
                .subject(query.getSubject())
                .message(query.getMessage())
                .status(query.getStatus())
                .response(query.getResponse())
                .trackingNumber(query.getTrackingNumber())
                .customerName(query.getCreatedBy().getName())
                .customerEmail(query.getCreatedBy().getEmail())
                .createdAt(query.getCreatedAt())
                .respondedAt(query.getRespondedAt())
                .resolvedAt(query.getResolvedAt())
                .messageCount(messageCount)
                .lastMessageAt(lastMessageAt);

        if (query.getRespondedBy() != null) {
            builder.respondedByName(query.getRespondedBy().getName());
        }
        if (query.getResolvedBy() != null) {
            builder.resolvedByName(query.getResolvedBy().getName());
        }

        return builder.build();
    }

    @Transactional
    public SupportQueryResponse createQuery(SupportQueryRequest request, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);

        SupportQuery query = SupportQuery.builder()
                .subject(request.getSubject())
                .message(request.getMessage())
                .trackingNumber(request.getTrackingNumber())
                .status("ACTIVE")
                .createdBy(currentUser)
                .build();

        query = repository.save(query);

        SupportMessage firstMessage = SupportMessage.builder()
                .query(query)
                .sender(currentUser)
                .content(request.getMessage())
                .build();
        messageRepository.save(firstMessage);

        return toResponse(query);
    }

    @Transactional(readOnly = true)
    public List<SupportQueryResponse> getAllQueries(String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        requireSupportOrAdmin(currentUser);

        return repository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SupportQueryResponse> getMyQueries(String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);

        return repository.findByCreatedByIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SupportMessageResponse> getMessages(Long id, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        SupportQuery query = getQuery(id);
        requireParticipant(query, currentUser);

        List<SupportMessage> messages = messageRepository.findByQueryIdOrderBySentAtAsc(id);

        if (messages.isEmpty() && query.getResponse() != null && query.getRespondedBy() != null) {
            SupportMessage legacy = SupportMessage.builder()
                    .id(0L)
                    .query(query)
                    .sender(query.getRespondedBy())
                    .content(query.getResponse())
                    .sentAt(query.getRespondedAt())
                    .build();
            return List.of(toMessageResponse(legacy));
        }

        return messages.stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SupportMessageResponse sendMessage(Long id, SupportMessageRequest request, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        SupportQuery query = getQuery(id);
        requireParticipant(query, currentUser);

        if ("RESOLVED".equalsIgnoreCase(query.getStatus())) {
            throw new IllegalStateException("This conversation has been resolved and is read-only.");
        }

        SupportMessage message = SupportMessage.builder()
                .query(query)
                .sender(currentUser)
                .content(request.getContent().trim())
                .build();
        message = messageRepository.save(message);

        notifyUpdated(query);
        return toMessageResponse(message);
    }

    @Transactional
    public SupportQueryResponse resolveQuery(Long id, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        SupportQuery query = getQuery(id);
        requireParticipant(query, currentUser);

        query.setStatus("RESOLVED");
        query.setResolvedBy(currentUser);
        query.setResolvedAt(LocalDateTime.now());
        query = repository.save(query);

        notifyUpdated(query);
        return toResponse(query);
    }

    private void notifyUpdated(SupportQuery query) {
        messagingTemplate.convertAndSend(
                "/topic/support/" + query.getId(),
                "{\"queryId\": " + query.getId() + ", \"type\": \"UPDATED\"}");
    }

    @Transactional
    public void deleteQuery(Long id, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            throw new ForbiddenException("Only admins can delete queries.");
        }

        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Query not found.");
        }

        repository.deleteById(id);
    }
}
