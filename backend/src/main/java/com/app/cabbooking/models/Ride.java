package com.app.cabbooking.models;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "rides")
public class Ride {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "rider_id", nullable = false)
  private User rider;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "driver_id")
  private User driver;

  private String pickupLocation;
  
  private String dropoffLocation;

  private String rideType;

  private Double pickupLat;
  private Double pickupLng;

  private Double dropoffLat;
  private Double dropoffLng;

  private Double fare;

  @Enumerated(EnumType.STRING)
  private ERideStatus status;

  private LocalDateTime requestedAt;
  private LocalDateTime startTime;
  private LocalDateTime endTime;

  private Boolean isPaid = false;
  private Boolean isPaymentFailed = false;

  public Ride() {
  }

  public Ride(User rider, String pickupLocation, String dropoffLocation, Double pickupLat, Double pickupLng, Double dropoffLat, Double dropoffLng, Double fare, String rideType) {
    this.rider = rider;
    this.pickupLocation = pickupLocation;
    this.dropoffLocation = dropoffLocation;
    this.pickupLat = pickupLat;
    this.pickupLng = pickupLng;
    this.dropoffLat = dropoffLat;
    this.dropoffLng = dropoffLng;
    this.fare = fare;
    this.rideType = rideType;
    this.status = ERideStatus.PENDING;
    this.requestedAt = LocalDateTime.now();
    this.isPaid = false;
    this.isPaymentFailed = false;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getRider() {
    return rider;
  }

  public void setRider(User rider) {
    this.rider = rider;
  }

  public User getDriver() {
    return driver;
  }

  public void setDriver(User driver) {
    this.driver = driver;
  }

  public String getPickupLocation() {
    return pickupLocation;
  }

  public void setPickupLocation(String pickupLocation) {
    this.pickupLocation = pickupLocation;
  }

  public String getDropoffLocation() {
    return dropoffLocation;
  }

  public void setDropoffLocation(String dropoffLocation) {
    this.dropoffLocation = dropoffLocation;
  }

  public String getRideType() {
    return rideType;
  }

  public void setRideType(String rideType) {
    this.rideType = rideType;
  }

  public Double getPickupLat() {
    return pickupLat;
  }

  public void setPickupLat(Double pickupLat) {
    this.pickupLat = pickupLat;
  }

  public Double getPickupLng() {
    return pickupLng;
  }

  public void setPickupLng(Double pickupLng) {
    this.pickupLng = pickupLng;
  }

  public Double getDropoffLat() {
    return dropoffLat;
  }

  public void setDropoffLat(Double dropoffLat) {
    this.dropoffLat = dropoffLat;
  }

  public Double getDropoffLng() {
    return dropoffLng;
  }

  public void setDropoffLng(Double dropoffLng) {
    this.dropoffLng = dropoffLng;
  }

  public Double getFare() {
    return fare;
  }

  public void setFare(Double fare) {
    this.fare = fare;
  }

  public ERideStatus getStatus() {
    return status;
  }

  public void setStatus(ERideStatus status) {
    this.status = status;
  }

  public LocalDateTime getRequestedAt() {
    return requestedAt;
  }

  public void setRequestedAt(LocalDateTime requestedAt) {
    this.requestedAt = requestedAt;
  }

  public LocalDateTime getStartTime() {
    return startTime;
  }

  public void setStartTime(LocalDateTime startTime) {
    this.startTime = startTime;
  }

  public LocalDateTime getEndTime() {
    return endTime;
  }

  public void setEndTime(LocalDateTime endTime) {
    this.endTime = endTime;
  }

  public Boolean getIsPaid() {
    return this.isPaid;
  }

  public void setIsPaid(Boolean isPaid) {
    this.isPaid = isPaid;
  }

  public Boolean getIsPaymentFailed() {
    return this.isPaymentFailed;
  }

  public void setIsPaymentFailed(Boolean isPaymentFailed) {
    this.isPaymentFailed = isPaymentFailed;
  }
}
