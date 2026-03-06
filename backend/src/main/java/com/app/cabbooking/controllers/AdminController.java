package com.app.cabbooking.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.app.cabbooking.models.Ride;
import com.app.cabbooking.models.User;
import com.app.cabbooking.payload.response.MessageResponse;
import com.app.cabbooking.repository.RideRepository;
import com.app.cabbooking.repository.UserRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

  @Autowired
  UserRepository userRepository;
  
  @Autowired
  RideRepository rideRepository;

  @GetMapping("/users")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<List<User>> getAllUsers() {
    return ResponseEntity.ok(userRepository.findAll());
  }

  @GetMapping("/rides")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<List<Ride>> getAllRides() {
    return ResponseEntity.ok(rideRepository.findAll());
  }

  @DeleteMapping("/users/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> suspendUser(@PathVariable Long id) {
    if (!userRepository.existsById(id)) {
      return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found."));
    }
    
    // For a real app, you might want a 'suspended' flag instead of hard deleting
    userRepository.deleteById(id);
    return ResponseEntity.ok(new MessageResponse("User suspended/deleted successfully."));
  }
}
