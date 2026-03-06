package com.app.cabbooking.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class RideRequestPayload {

  @NotBlank
  private String pickupLocation;

  @NotBlank
  private String dropoffLocation;

  @NotNull
  private Double pickupLat;

  @NotNull
  private Double pickupLng;

  @NotNull
  private Double dropoffLat;

  @NotNull
  private Double dropoffLng;

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
}
