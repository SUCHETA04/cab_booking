package com.app.cabbooking.payload.request;

import jakarta.validation.constraints.NotNull;

public class PaymentRequestPayload {

  @NotNull
  private Long rideId;

  public Long getRideId() {
    return rideId;
  }

  public void setRideId(Long rideId) {
    this.rideId = rideId;
  }
}
