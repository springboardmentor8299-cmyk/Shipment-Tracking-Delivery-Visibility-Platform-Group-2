package com.shiptrack.activity.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.shiptrack.activity.entity.Activity;
import com.shiptrack.activity.repository.ActivityRepository;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public Activity save(String username, String action, String details) {
        Activity a = Activity.builder()
                .username(username)
                .action(action)
                .details(details)
                .build();
        return activityRepository.save(a);
    }

    public List<Activity> recent() {
        return activityRepository.findTop20ByOrderByCreatedAtDesc();
    }

}
