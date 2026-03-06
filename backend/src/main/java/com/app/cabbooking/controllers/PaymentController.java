package com.app.cabbooking.controllers;

import java.util.HashMap;
import java.util.Map;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.app.cabbooking.models.Ride;
import com.app.cabbooking.payload.request.PaymentRequestPayload;
import com.app.cabbooking.payload.response.MessageResponse;
import com.app.cabbooking.repository.RideRepository;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

  @Value("${stripe.api.key}")
  private String stripeApiKey;

  @Autowired
  RideRepository rideRepository;

  @PostMapping("/create-intent")
  @PreAuthorize("hasRole('RIDER')")
  public ResponseEntity<?> createPaymentIntent(@Valid @RequestBody PaymentRequestPayload payload) {
    Stripe.apiKey = stripeApiKey;

    Ride ride = rideRepository.findById(payload.getRideId()).orElseThrow();

    if (ride.getFare() == null || ride.getFare() <= 0) {
      return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid fare amount."));
    }

    try {
      // Stripe requires amount in cents
      long amountInCents = (long) (ride.getFare() * 100);

      PaymentIntentCreateParams params =
          PaymentIntentCreateParams.builder()
              .setAmount(amountInCents)
              .setCurrency("inr")
              .setAutomaticPaymentMethods(
                  PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                      .setEnabled(true)
                      .build()
              )
              .putMetadata("ride_id", ride.getId().toString())
              .build();

      PaymentIntent intent = PaymentIntent.create(params);

      Map<String, String> responseData = new HashMap<>();
      responseData.put("clientSecret", intent.getClientSecret());

      return ResponseEntity.ok(responseData);
      
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(new MessageResponse("Stripe error: " + e.getMessage()));
    }
  }

  @PostMapping("/confirm/{rideId}")
  @PreAuthorize("hasRole('RIDER')")
  public ResponseEntity<?> confirmPayment(@PathVariable Long rideId) {
    Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));
    ride.setIsPaid(true);
    // If it succeeds, ensure failed is false
    ride.setIsPaymentFailed(false);
    rideRepository.save(ride);
    return ResponseEntity.ok(new MessageResponse("Payment confirmed successfully"));
  }

  @PostMapping("/fail/{rideId}")
  @PreAuthorize("hasRole('RIDER')")
  public ResponseEntity<?> failPayment(@PathVariable Long rideId) {
    Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));
    ride.setIsPaymentFailed(true);
    rideRepository.save(ride);
    return ResponseEntity.ok(new MessageResponse("Payment marked as failed"));
  }
}
