package com.app.cabbooking.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.app.cabbooking.models.ERideStatus;
import com.app.cabbooking.models.Ride;
import com.app.cabbooking.models.User;
import com.app.cabbooking.payload.response.MessageResponse;
import com.app.cabbooking.repository.RideRepository;
import com.app.cabbooking.repository.UserRepository;
import com.app.cabbooking.security.services.UserDetailsImpl;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/driver")
public class DriverController {

  @Autowired
  RideRepository rideRepository;

  @Autowired
  UserRepository userRepository;

  @GetMapping("/available-rides")
  @PreAuthorize("hasRole('DRIVER')")
  public ResponseEntity<?> getAvailableRides(Authentication authentication) {
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    User driver = userRepository.findById(userDetails.getId()).orElseThrow();

    String vehicleType = driver.getVehicleType();
    
    // If the driver doesn't have a vehicle type set, they shouldn't see any rides securely.
    if (vehicleType == null || vehicleType.trim().isEmpty()) {
       return ResponseEntity.ok(java.util.Collections.emptyList());
    }

    // Return only PENDING rides that match the driver's registered vehicle type
    return ResponseEntity.ok(rideRepository.findByStatusAndRideType(ERideStatus.PENDING, vehicleType));
  }

  @PutMapping("/rides/{id}/accept")
  @PreAuthorize("hasRole('DRIVER')")
  public ResponseEntity<?> acceptRide(@PathVariable Long id, Authentication authentication) {
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    User driver = userRepository.findById(userDetails.getId()).orElseThrow();

    Ride ride = rideRepository.findById(id).orElseThrow(() -> new RuntimeException("Ride not found"));
    
    if (ride.getStatus() != ERideStatus.PENDING) {
      return ResponseEntity.badRequest().body(new MessageResponse("Error: Ride is no longer available."));
    }

    ride.setDriver(driver);
    ride.setStatus(ERideStatus.ACCEPTED);
    rideRepository.save(ride);

    // TODO: Phase 5 - Broadcast WebSocket message that driver accepted the ride
    
    return ResponseEntity.ok(new MessageResponse("Ride accepted successfully!"));
  }

  @PutMapping("/rides/{id}/arrive")
  @PreAuthorize("hasRole('DRIVER')")
  public ResponseEntity<?> arriveAtPickup(@PathVariable Long id, Authentication authentication) {
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    
    Ride ride = rideRepository.findById(id).orElseThrow();
    
    if (ride.getDriver() == null || !ride.getDriver().getId().equals(userDetails.getId())) {
      return ResponseEntity.badRequest().body(new MessageResponse("Error: You are not assigned to this ride."));
    }

    if (ride.getStatus() != ERideStatus.ACCEPTED) {
       return ResponseEntity.badRequest().body(new MessageResponse("Error: Ride must be in ACCEPTED state to arrive."));
    }

    ride.setStatus(ERideStatus.ARRIVED);
    rideRepository.save(ride);

    return ResponseEntity.ok(new MessageResponse("Driver arrived at pickup location."));
  }

  @PutMapping("/rides/{id}/start")
  @PreAuthorize("hasRole('DRIVER')")
  public ResponseEntity<?> startRide(@PathVariable Long id, @RequestParam String otp, Authentication authentication) {
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    
    Ride ride = rideRepository.findById(id).orElseThrow();
    
    if (ride.getDriver() == null || !ride.getDriver().getId().equals(userDetails.getId())) {
      return ResponseEntity.badRequest().body(new MessageResponse("Error: You are not assigned to this ride."));
    }

    if (ride.getStatus() != ERideStatus.ARRIVED) {
       return ResponseEntity.badRequest().body(new MessageResponse("Error: Ride must be in ARRIVED state to start."));
    }

    if (!ride.getOtp().equals(otp)) {
       return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid OTP."));
    }

    ride.setStatus(ERideStatus.IN_PROGRESS);
    ride.setStartTime(java.time.LocalDateTime.now());
    rideRepository.save(ride);

    return ResponseEntity.ok(new MessageResponse("Ride started!"));
  }

  @PutMapping("/rides/{id}/complete")
  @PreAuthorize("hasRole('DRIVER')")
  public ResponseEntity<?> completeRide(@PathVariable Long id, Authentication authentication) {
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    
    Ride ride = rideRepository.findById(id).orElseThrow();
    
    if (ride.getDriver() == null || !ride.getDriver().getId().equals(userDetails.getId())) {
       return ResponseEntity.badRequest().body(new MessageResponse("Error: You are not assigned to this ride."));
    }
    
    if (ride.getStatus() != ERideStatus.IN_PROGRESS) {
       return ResponseEntity.badRequest().body(new MessageResponse("Error: Ride must be IN_PROGRESS to complete."));
    }

    ride.setStatus(ERideStatus.COMPLETED);
    ride.setEndTime(java.time.LocalDateTime.now());
    rideRepository.save(ride);

    // TODO: Trigger Payment process in Phase 7
    
    return ResponseEntity.ok(new MessageResponse("Ride completed successfully!"));
  }
}
