package com.shiptrack.activity.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shiptrack.activity.entity.Activity;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findTop20ByOrderByCreatedAtDesc();

}
