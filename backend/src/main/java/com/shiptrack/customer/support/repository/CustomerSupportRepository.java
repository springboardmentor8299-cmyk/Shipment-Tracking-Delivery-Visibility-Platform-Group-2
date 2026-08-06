package com.shiptrack.customer.support.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shiptrack.auth.entity.User;
import com.shiptrack.customer.support.entity.CustomerSupportRequest;

public interface CustomerSupportRepository
        extends JpaRepository<CustomerSupportRequest, Long> {

    List<CustomerSupportRequest> findByCustomerOrderByCreatedAtDesc(User customer);

    List<CustomerSupportRequest> findAllByOrderByCreatedAtDesc();

}