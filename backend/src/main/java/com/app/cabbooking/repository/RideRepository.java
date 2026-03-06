package com.app.cabbooking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.app.cabbooking.models.ERideStatus;
import com.app.cabbooking.models.Ride;
import com.app.cabbooking.models.User;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
  List<Ride> findByRider(User rider);
  List<Ride> findByDriver(User driver);
  List<Ride> findByStatus(ERideStatus status);
  List<Ride> findByStatusAndRideType(ERideStatus status, String rideType);
}
