package com.shiptrackpro.repository;

import com.shiptrackpro.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findAllByOrderByTimestampDesc();
    List<Notification> findByAssignedToUserIdOrderByTimestampDesc(String userId);
    List<Notification> findByReadFalse();
}
