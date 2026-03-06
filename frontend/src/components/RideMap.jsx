import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

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

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center.length === 2 && center[0] && center[1]) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};

const RideMap = ({ pickupLat, pickupLng, dropoffLat, dropoffLng, driverLat, driverLng }) => {
    const defaultCenter = [22.5726, 88.3639]; // Kolkata, India as default

    const center = (pickupLat && pickupLng)
        ? [pickupLat, pickupLng]
        : defaultCenter;

    return (
        <div className="h-64 w-full rounded-lg overflow-hidden border shadow-inner">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={center} zoom={13} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
