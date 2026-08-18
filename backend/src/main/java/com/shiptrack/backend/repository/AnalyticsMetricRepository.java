package com.shiptrack.backend.repository;

import com.shiptrack.backend.entity.AnalyticsMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnalyticsMetricRepository extends JpaRepository<AnalyticsMetric, Long> {

    List<AnalyticsMetric> findByMetricGroup(String metricGroup);

    List<AnalyticsMetric> findByMetricGroupAndTargetEntityId(String metricGroup, Long targetEntityId);

    Optional<AnalyticsMetric> findByMetricKeyAndMetricGroupAndTargetEntityId(String metricKey, String metricGroup, Long targetEntityId);
}
