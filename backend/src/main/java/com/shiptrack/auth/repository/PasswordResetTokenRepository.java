package com.shiptrack.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.shiptrack.auth.entity.PasswordResetToken;
import com.shiptrack.auth.entity.User;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    @Transactional
    @Modifying
    @Query("update PasswordResetToken t set t.used = true where t.user = :user and t.used = false")
    void invalidateAllActiveTokensForUser(@Param("user") User user);
}