package com.app.cabbooking.payload.request;

public class LocationUpdatePayload {
  private Long rideId;
  private Long driverId;
  private Double lat;
  private Double lng;

  public Long getRideId() {
    return rideId;
  }

  public void setRideId(Long rideId) {
    this.rideId = rideId;
  }

  public Long getDriverId() {
    return driverId;
  }

  public void setDriverId(Long driverId) {
    this.driverId = driverId;
  }

  public Double getLat() {
    return lat;
  }

  public void setLat(Double lat) {
    this.lat = lat;
  }

  public Double getLng() {
    return lng;
  }

  public void setLng(Double lng) {
    this.lng = lng;
  }
}
