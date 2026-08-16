package com.shiptrackpro.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "route_plans")
public class RoutePlan {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String routeName;

    private String corridor;
    private String origin;
    private String destination;
    private Double totalDistanceKm = 0.0;
    private Double estimatedDurationHours = 0.0;
    private String trafficLevel = "Moderate"; // Low, Moderate, Heavy, Severe Congestion
    private Double fuelEstimateLiters = 0.0;
    private Double co2SavingsKg = 0.0;
    private String status = "Planned"; // Planned, In Progress, Optimized, Completed
    private String createdAt;
    private String completedAt;
    private Integer efficiencyScorePct = 88;

    @OneToMany(mappedBy = "routePlan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<RouteWaypoint> waypoints = new ArrayList<>();

    public RoutePlan() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRouteName() { return routeName; }
    public void setRouteName(String routeName) { this.routeName = routeName; }

    public String getCorridor() { return corridor; }
    public void setCorridor(String corridor) { this.corridor = corridor; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public Double getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(Double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }

    public Double getEstimatedDurationHours() { return estimatedDurationHours; }
    public void setEstimatedDurationHours(Double estimatedDurationHours) { this.estimatedDurationHours = estimatedDurationHours; }

    public String getTrafficLevel() { return trafficLevel; }
    public void setTrafficLevel(String trafficLevel) { this.trafficLevel = trafficLevel; }

    public Double getFuelEstimateLiters() { return fuelEstimateLiters; }
    public void setFuelEstimateLiters(Double fuelEstimateLiters) { this.fuelEstimateLiters = fuelEstimateLiters; }

    public Double getCo2SavingsKg() { return co2SavingsKg; }
    public void setCo2SavingsKg(Double co2SavingsKg) { this.co2SavingsKg = co2SavingsKg; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public Integer getEfficiencyScorePct() { return efficiencyScorePct; }
    public void setEfficiencyScorePct(Integer efficiencyScorePct) { this.efficiencyScorePct = efficiencyScorePct; }

    public List<RouteWaypoint> getWaypoints() { return waypoints; }
    public void setWaypoints(List<RouteWaypoint> waypoints) { this.waypoints = waypoints; }

    public void addWaypoint(RouteWaypoint waypoint) {
        waypoints.add(waypoint);
        waypoint.setRoutePlan(this);
    }
}
