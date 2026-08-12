package com.shiptrack.repository;

import com.shiptrack.entity.SupportRequest;
import com.shiptrack.entity.SupportRequestStatus;
import com.shiptrack.entity.TicketCategory;
import com.shiptrack.entity.TicketPriority;
import com.shiptrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface SupportRequestRepository extends JpaRepository<SupportRequest, Long> {

    List<SupportRequest> findByUserOrderByCreatedAtDesc(User user);

    long countByUser(User user);

    List<SupportRequest> findAllByOrderByCreatedAtDesc();

    long countByStatus(SupportRequestStatus status);

    long countByPriority(TicketPriority priority);

    long countByCategory(TicketCategory category);

    List<SupportRequest> findByStatusOrderByCreatedAtDesc(SupportRequestStatus status);

    List<SupportRequest> findByStatusInOrderByCreatedAtDesc(Collection<SupportRequestStatus> statuses);

    List<SupportRequest> findByCategoryOrderByCreatedAtDesc(TicketCategory category);

    List<SupportRequest> findByAssignedUser(User assignedUser);

    long countByAssignedUser(User assignedUser);

    long countByAssignedUserAndStatus(User user, SupportRequestStatus status);
}
