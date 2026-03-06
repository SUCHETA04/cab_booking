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
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/payment")
public class PaymentController {

  @Value("${razorpay.api.key}")
  private String razorpayKey;

  @Value("${razorpay.api.secret}")
  private String razorpaySecret;

  @Autowired
  RideRepository rideRepository;

  @PostMapping("/create-order")
  @PreAuthorize("hasRole('RIDER')")
  public ResponseEntity<?> createOrder(@Valid @RequestBody PaymentRequestPayload payload) {
    Ride ride = rideRepository.findById(payload.getRideId()).orElseThrow();

    if (ride.getFare() == null || ride.getFare() <= 0) {
      return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid fare amount."));
    }

    try {
      RazorpayClient client = new RazorpayClient(razorpayKey, razorpaySecret);

      long amountInPaise = (long) (ride.getFare() * 100);

      JSONObject orderRequest = new JSONObject();
      orderRequest.put("amount", amountInPaise);
      orderRequest.put("currency", "INR");
      orderRequest.put("receipt", ride.getId().toString());

      Order order = client.orders.create(orderRequest);

      Map<String, String> responseData = new HashMap<>();
      responseData.put("orderId", order.get("id"));

      return ResponseEntity.ok(responseData);
      
    } catch (Exception e) {
      return ResponseEntity.badRequest().body(new MessageResponse("Razorpay error: " + e.getMessage()));
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
