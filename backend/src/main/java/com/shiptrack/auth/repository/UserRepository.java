package com.shiptrack.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shiptrack.auth.entity.Role;
import com.shiptrack.auth.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<User> findByGoogleId(String googleId);

    Optional<User> findById(User customer);

    List<User> findByRole(Role role);

}