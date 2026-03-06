package com.app.cabbooking.services;

import org.springframework.stereotype.Service;

@Service
public class FareService {
    
    // Base fare: ₹0.00
    private static final double BASE_FARE = 0.0;
    
    // Per KM rate: ₹10.00
    private static final double PER_KM_RATE = 10.0;
    
    // Per Minute rate: ₹0.00
    private static final double PER_MINUTE_RATE = 0.0;

    // Surge multiplier (1.0 for normal, potentially > 1.0 for high demand)
    private static final double SURGE_MULTIPLIER = 1.0;

    /**
     * Calculates the estimated fare based on distance and duration.
     * @param distanceInKm Distance in kilometers.
     * @param durationInMins Duration in minutes.
     * @return Estimated fare.
     */
    public double calculateFare(double distanceInKm, double durationInMins) {
        double distanceFare = distanceInKm * PER_KM_RATE;
        double timeFare = durationInMins * PER_MINUTE_RATE;
        
        double totalFare = BASE_FARE + distanceFare + timeFare;
        
        return Math.round(totalFare * SURGE_MULTIPLIER * 100.0) / 100.0;
    }

    /**
     * Haversine formula to approximate distance between two lat/lng coordinates.
     * Note: In a real production app, use Google Maps Distance Matrix API.
     */
    public double calculateDistance(double startLat, double startLng, double endLat, double endLng) {
        int earthRadiusKm = 6371;

        double dLat = Math.toRadians(endLat - startLat);
        double dLng = Math.toRadians(endLng - startLng);

        startLat = Math.toRadians(startLat);
        endLat = Math.toRadians(endLat);

        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(startLat) * Math.cos(endLat);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        
        return earthRadiusKm * c;
    }
}
