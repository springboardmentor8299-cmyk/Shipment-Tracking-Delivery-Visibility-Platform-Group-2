package com.shiptrackpro.entity;

import jakarta.persistence.Embeddable;

@Embeddable
public class LocationPoint {

    private String city;
    private String state;
    private String country;
    private Double lat;
    private Double lng;
    private String address;
    private String street;
    private String zipCode;

    public LocationPoint() {}

    public LocationPoint(String city, String state, String country, Double lat, Double lng, String address) {
        this.city = city;
        this.state = state;
        this.country = country;
        this.lat = lat;
        this.lng = lng;
        this.address = address;
        this.street = address;
    }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }
}
