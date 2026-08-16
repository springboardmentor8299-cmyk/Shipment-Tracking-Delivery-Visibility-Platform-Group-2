package com.shiptrackpro.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "route_waypoints")
public class RouteWaypoint {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_plan_id")
    @JsonIgnore
    private RoutePlan routePlan;

    private String name;
    private String city;
    private String address;
    private Double lat;
    private Double lng;
    private String stopType; // Pickup, Waypoint Hub, Delivery Dropoff
    private String estimatedArrival;
    private Boolean completed = false;
    private Integer packageCount = 0;

    public RouteWaypoint() {}

    public RouteWaypoint(String id, String name, String city, String address, Double lat, Double lng, String stopType, String estimatedArrival, Boolean completed) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.address = address;
        this.lat = lat;
        this.lng = lng;
        this.stopType = stopType;
        this.estimatedArrival = estimatedArrival;
        this.completed = completed;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public RoutePlan getRoutePlan() { return routePlan; }
    public void setRoutePlan(RoutePlan routePlan) { this.routePlan = routePlan; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public String getStopType() { return stopType; }
    public void setStopType(String stopType) { this.stopType = stopType; }

    public String getEstimatedArrival() { return estimatedArrival; }
    public void setEstimatedArrival(String estimatedArrival) { this.estimatedArrival = estimatedArrival; }

    public Boolean getCompleted() { return completed; }
    public void setCompleted(Boolean completed) { this.completed = completed; }

    public Integer getPackageCount() { return packageCount; }
    public void setPackageCount(Integer packageCount) { this.packageCount = packageCount; }
}
