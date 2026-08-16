package com.shiptrackpro.repository;

import com.shiptrackpro.entity.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, String> {
    List<UserActivityLog> findAllByOrderByTimestampDesc();
    List<UserActivityLog> findByUserIdOrderByTimestampDesc(String userId);
}
