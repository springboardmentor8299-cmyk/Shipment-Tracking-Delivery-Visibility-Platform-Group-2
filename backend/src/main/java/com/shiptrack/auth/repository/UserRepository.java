package com.shiptrack.auth.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;

import com.shiptrack.auth.entity.User;

//@Repository  //In Spring Boot, when you extend JpaRepository<User, Long>, Spring Data JPA automatically recognizes this interface as a repository bean. It provides all the necessary database CRUD operations and exception translation out of the box........Because JpaRepository already handles this behind the scenes, explicitly adding the @Repository annotation on top of your interface is redundant. The Java extension is simply giving you a friendly warning that you have code you don't actually need.
public interface UserRepository extends JpaRepository<User, Long> 
{

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    Optional<User> findById(User customer);

}