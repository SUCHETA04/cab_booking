package com.app.cabbooking.controllers;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.app.cabbooking.payload.request.LocationUpdatePayload;

@Controller
public class WebSocketController {

  @MessageMapping("/driver/location")
  @SendTo("/topic/ride-location")
  public LocationUpdatePayload broadcastLocation(LocationUpdatePayload location) {
    // In a real app, you might want to save this to Redis or log it
    // For now, it simply receives the location from the driver's phone
    // and broadcasts it to anyone subscribed to "/topic/ride-location"
    return location;
  }
}
