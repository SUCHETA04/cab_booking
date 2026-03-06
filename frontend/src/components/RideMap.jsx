import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet icon paths in React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

const ChangeView = ({ center, zoom, bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (center && center.length === 2 && center[0] && center[1]) {
            map.setView(center, zoom);
        }
    }, [center, zoom, bounds, map]);
    return null;
};

const RoutingControl = ({ pickupLat, pickupLng, dropoffLat, dropoffLng }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !pickupLat || !pickupLng || !dropoffLat || !dropoffLng) return;

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(pickupLat, pickupLng),
                L.latLng(dropoffLat, dropoffLng)
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            show: false, // Hide the turn-by-turn itinerary panel
            lineOptions: {
                styles: [{ color: '#3b82f6', weight: 4 }]
            },
            createMarker: function () { return null; } // Re-use the React-Leaflet markers instead
        }).addTo(map);

        // Completely hide the generic routing control container from the UI
        try {
            const container = routingControl.getContainer();
            if (container) {
                container.style.display = 'none';
            }
        } catch (e) { }

        return () => {
            try {
                if (map && routingControl) {
                    map.removeControl(routingControl);
                }
            } catch (e) {
                console.error("Error removing routing control", e);
            }
        };
    }, [map, pickupLat, pickupLng, dropoffLat, dropoffLng]);

    return null;
};

const RideMap = ({ pickupLat, pickupLng, dropoffLat, dropoffLng, driverLat, driverLng }) => {
    const defaultCenter = [22.5726, 88.3639]; // Kolkata, India as default

    let center = defaultCenter;
    let bounds = null;

    if (pickupLat && pickupLng) {
        center = [pickupLat, pickupLng];
        if (dropoffLat && dropoffLng) {
            // Let ChangeView fit everything so we aren't "restricted" to just pickup
            bounds = [
                [pickupLat, pickupLng],
                [dropoffLat, dropoffLng]
            ];
            // If the driver is also around, include him in bounds
            if (driverLat && driverLng) {
                bounds.push([driverLat, driverLng]);
            }
        }
    }

    return (
        <div className="h-full min-h-[300px] w-full rounded-lg overflow-hidden border shadow-inner">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={center} zoom={13} bounds={bounds} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <RoutingControl
                    pickupLat={pickupLat} pickupLng={pickupLng}
                    dropoffLat={dropoffLat} dropoffLng={dropoffLng}
                />

                {pickupLat && pickupLng && (
                    <Marker position={[pickupLat, pickupLng]}>
                        <Popup>Pickup Location</Popup>
                    </Marker>
                )}

                {dropoffLat && dropoffLng && (
                    <Marker position={[dropoffLat, dropoffLng]}>
                        <Popup>Dropoff Location</Popup>
                    </Marker>
                )}

                {driverLat && driverLng && (
                    <Marker position={[driverLat, driverLng]}>
                        <Popup>Driver Location</Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    );
};

export default RideMap;
