package com.shiptrack.repository;

import com.shiptrack.entity.Notification;
import com.shiptrack.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {



    
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);

    
    List<Notification> findByUserAndIsReadFalse(User user);

    
    long countByUserAndIsReadFalse(User user);

    
    Optional<Notification> findByIdAndUser(Long id, User user);

    
    List<Notification> findTop5ByUserOrderByCreatedAtDesc(User user);

    
    boolean existsByUser(User user);
}