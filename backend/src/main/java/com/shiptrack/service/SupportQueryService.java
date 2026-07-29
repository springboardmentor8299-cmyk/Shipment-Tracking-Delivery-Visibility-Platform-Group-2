package com.shiptrack.service;

import com.shiptrack.dto.SupportQueryRequest;
import com.shiptrack.dto.SupportQueryRespondRequest;
import com.shiptrack.dto.SupportQueryResponse;
import com.shiptrack.entity.SupportQuery;
import com.shiptrack.entity.User;
import com.shiptrack.exception.ForbiddenException;
import com.shiptrack.exception.ResourceNotFoundException;
import com.shiptrack.repository.SupportQueryRepository;
import com.shiptrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportQueryService {

    private final SupportQueryRepository repository;
    private final UserRepository userRepository;

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

    private SupportQueryResponse toResponse(SupportQuery query) {
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
                .respondedAt(query.getRespondedAt());

        if (query.getRespondedBy() != null) {
            builder.respondedByName(query.getRespondedBy().getName());
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
                .status("PENDING")
                .createdBy(currentUser)
                .build();

        query = repository.save(query);
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

    @Transactional
    public SupportQueryResponse respondToQuery(Long id, SupportQueryRespondRequest request, String currentUserEmail) {
        User currentUser = getUserByEmail(currentUserEmail);
        requireSupportOrAdmin(currentUser);

        SupportQuery query = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Query not found."));

        query.setResponse(request.getResponse());
        query.setStatus("RESOLVED");
        query.setRespondedBy(currentUser);
        query.setRespondedAt(LocalDateTime.now());

        query = repository.save(query);
        return toResponse(query);
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