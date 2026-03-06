package com.app.cabbooking.controllers;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.app.cabbooking.models.Ride;
import com.app.cabbooking.models.User;
import com.app.cabbooking.payload.request.RideRequestPayload;
import com.app.cabbooking.payload.response.MessageResponse;
import com.app.cabbooking.repository.RideRepository;
import com.app.cabbooking.repository.UserRepository;
import com.app.cabbooking.security.services.UserDetailsImpl;
import com.app.cabbooking.services.FareService;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/rides")
public class RideController {
  
  @Autowired
  RideRepository rideRepository;

  @Autowired
  UserRepository userRepository;

  @Autowired
  FareService fareService;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @PostMapping("/request")
  @PreAuthorize("hasRole('RIDER')")
  public ResponseEntity<?> requestRide(Authentication authentication, @Valid @RequestBody RideRequestPayload payload) {
    
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

    User rider = userRepository.findById(userDetails.getId())
        .orElseThrow(() -> new RuntimeException("Error: Rider not found."));

    double distance = fareService.calculateDistance(
        payload.getPickupLat(), payload.getPickupLng(), 
        payload.getDropoffLat(), payload.getDropoffLng());
    
    // Estimate speed as 40 km/h for the duration (in mins) -> distance / 40 * 60 = distance * 1.5
    double durationMins = distance * 1.5; 
    
    double estimatedFare = fareService.calculateFare(distance, durationMins);

    Ride ride = new Ride(
        rider,
        payload.getPickupLocation(),
        payload.getDropoffLocation(),
        payload.getPickupLat(),
        payload.getPickupLng(),
        payload.getDropoffLat(),
        payload.getDropoffLng(),
        estimatedFare
    );

    rideRepository.save(ride);

    // Notify drivers on topic /topic/rides
    messagingTemplate.convertAndSend("/topic/rides", ride);
    
    return ResponseEntity.ok(ride);
  }

  @GetMapping("/my-rides")
  @PreAuthorize("hasRole('RIDER') or hasRole('DRIVER')")
  public ResponseEntity<?> getMyRides(Authentication authentication) {
    UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
    User user = userRepository.findById(userDetails.getId()).get();

    List<Ride> rides;
    if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_RIDER"))) {
      rides = rideRepository.findByRider(user);
    } else {
      rides = rideRepository.findByDriver(user);
    }

    return ResponseEntity.ok(rides);
  }
}
