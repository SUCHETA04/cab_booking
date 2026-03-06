import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';
import SocketService from '../services/socket.service';
import axios from 'axios';
import RideMap from './RideMap';

const RiderDashboard = () => {
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [rideType, setRideType] = useState('CAR');
    const [rides, setRides] = useState([]);
    const [message, setMessage] = useState('');

    // Add missing tracking state
    const [driverLocation, setDriverLocation] = useState(null);

    const user = AuthService.getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user's previous rides
        if (user) {
            axios.get('http://localhost:8080/api/rides/my-rides', {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            }).then(response => {
                setRides(response.data);
            }).catch(error => console.error("Error fetching rides", error));

            SocketService.connect(user.accessToken);
            SocketService.subscribe('/topic/ride-location', (data) => {
                // Find if this location update applies to our active rides
                const isRelevantRide = rides.some(r => r.id === data.rideId && (r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS'));
                // If we don't strict-check for now, just update the map
                setDriverLocation({ lat: data.lat, lng: data.lng });
            });
        }

        return () => {
            SocketService.disconnect();
        };
    }, [user, rides]);

    const geocode = async (address) => {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            if (response.data && response.data.length > 0) {
                return {
                    lat: parseFloat(response.data[0].lat),
                    lng: parseFloat(response.data[0].lon)
                };
            }
        } catch (error) {
            console.error("Geocoding failed", error);
        }
        return null; // Fallback
    };

    const handleRequestRide = async (e) => {
        e.preventDefault();
        setMessage('');

        // Attempt real geocoding, fallback to dummy coordinates if failed
        const pickupCoords = await geocode(pickup) || { lat: 22.5839, lng: 88.3433 };
        const dropoffCoords = await geocode(dropoff) || { lat: 22.6046, lng: 88.3831 };

        const ridePayload = {
            pickupLocation: pickup,
            dropoffLocation: dropoff,
            pickupLat: pickupCoords.lat,
            pickupLng: pickupCoords.lng,
            dropoffLat: dropoffCoords.lat,
            dropoffLng: dropoffCoords.lng,
            rideType: rideType
        };

        try {
            const response = await axios.post('http://localhost:8080/api/rides/request', ridePayload, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            });
            setMessage(`Ride requested successfully! Estimated Fare: ₹${response.data.fare}`);
            setRides([...rides, response.data]);
            setPickup('');
            setDropoff('');
        } catch (error) {
            setMessage("Error requesting ride.");
        }
    };

    if (!user || !user.roles.includes("ROLE_RIDER")) {
        return <div className="p-8 text-red-500">Access Denied. You must be a logged-in Rider.</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 relative p-8">
            <div className="absolute top-0 left-0 w-full h-80 bg-blue-900 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50"></div>
                {/* Decorative background circles */}
                <div className="absolute top-10 left-10 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex items-center justify-between mb-10 pt-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md">Rider Dashboard</h1>
                        <p className="text-blue-100 mt-2 font-medium">Welcome back, <span className="text-white font-bold">{user.username}</span>!</p>
                    </div>
                    <button
                        onClick={() => { AuthService.logout(); navigate('/login'); }}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md font-semibold py-2 px-6 rounded-full transition-all duration-300 shadow-lg"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Request Ride Form */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-8 col-span-1 lg:col-span-1">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Book exactly where you're going.</h2>
                        </div>

                        <form onSubmit={handleRequestRide} className="space-y-5">
                            <div className="relative">
                                <label className="text-sm font-semibold text-gray-600 mb-1 block">Pickup Location</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    </span>
                                    <input
                                        type="text"
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition duration-200"
                                        placeholder="Enter pickup point"
                                        value={pickup}
                                        onChange={e => setPickup(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <label className="text-sm font-semibold text-gray-600 mb-1 block">Dropoff Location</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                        <div className="w-2 h-2 border-2 border-gray-400 bg-white rounded-none"></div>
                                    </span>
                                    <input
                                        type="text"
                                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl transition duration-200"
                                        placeholder="Where to?"
                                        value={dropoff}
                                        onChange={e => setDropoff(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="relative pb-2">
                                <label className="text-sm font-semibold text-gray-600 mb-2 block">Available Vehicles</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div
                                        onClick={() => setRideType('BIKE')}
                                        className={`cursor-pointer rounded-2xl border-2 p-3 flex flex-col items-center justify-center transition-all ${rideType === 'BIKE' ? 'border-blue-500 bg-blue-50 scale-105 shadow-md' : 'border-gray-100 bg-gray-50 hover:bg-gray-100 opacity-70 hover:opacity-100'}`}
                                    >
                                        <span className="text-3xl mb-1">🏍️</span>
                                        <span className="text-xs font-extrabold text-gray-800">Bike</span>
                                        <span className="text-[10px] font-medium text-gray-500">₹10/km</span>
                                    </div>
                                    <div
                                        onClick={() => setRideType('AUTO')}
                                        className={`cursor-pointer rounded-2xl border-2 p-3 flex flex-col items-center justify-center transition-all ${rideType === 'AUTO' ? 'border-blue-500 bg-blue-50 scale-105 shadow-md' : 'border-gray-100 bg-gray-50 hover:bg-gray-100 opacity-70 hover:opacity-100'}`}
                                    >
                                        <span className="text-3xl mb-1">🛺</span>
                                        <span className="text-xs font-extrabold text-gray-800">Auto</span>
                                        <span className="text-[10px] font-medium text-gray-500">₹25/km</span>
                                    </div>
                                    <div
                                        onClick={() => setRideType('CAR')}
                                        className={`cursor-pointer rounded-2xl border-2 p-3 flex flex-col items-center justify-center transition-all ${rideType === 'CAR' ? 'border-blue-500 bg-blue-50 scale-105 shadow-md' : 'border-gray-100 bg-gray-50 hover:bg-gray-100 opacity-70 hover:opacity-100'}`}
                                    >
                                        <span className="text-3xl mb-1">🚕</span>
                                        <span className="text-xs font-extrabold text-gray-800">Car</span>
                                        <span className="text-[10px] font-medium text-gray-500">₹50/km</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold text-lg py-3.5 rounded-2xl hover:bg-blue-700 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-blue-500/30 transform transition duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Request Ride
                            </button>
                        </form>

                        {message && (
                            <div className="mt-5 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200 text-green-800 rounded-2xl flex items-start shadow-sm">
                                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                <p className="text-sm font-medium">{message}</p>
                            </div>
                        )}
                    </div>

                    {/* Map Interface */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 p-2 col-span-1 lg:col-span-2 overflow-hidden flex flex-col h-96 lg:h-auto relative group">
                        <div className="absolute top-6 left-6 z-10 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg font-semibold text-gray-800 text-sm border border-gray-100 flex items-center">
                            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                            Live Tracking
                        </div>
                        <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner">
                            {(() => {
                                const activeRide = rides.find(r => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS') || rides[rides.length - 1]; // active or most recent ride
                                const mapPickupLat = activeRide ? activeRide.pickupLat : 22.5839;
                                const mapPickupLng = activeRide ? activeRide.pickupLng : 88.3433;
                                const mapDropoffLat = activeRide ? activeRide.dropoffLat : 22.6046;
                                const mapDropoffLng = activeRide ? activeRide.dropoffLng : 88.3831;

                                return (
                                    <RideMap
                                        pickupLat={mapPickupLat} pickupLng={mapPickupLng}
                                        dropoffLat={mapDropoffLat} dropoffLng={mapDropoffLng}
                                        driverLat={driverLocation?.lat}
                                        driverLng={driverLocation?.lng}
                                    />
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* Ride History */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50">
                        <h2 className="text-xl font-bold text-gray-800">My Ride History</h2>
                    </div>

                    <div className="p-0">
                        {rides.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <p>No rides requested yet. Book your first ride above!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Route Details</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 font-semibold">Fare</th>
                                            <th className="px-6 py-4 font-semibold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {rides.map(ride => (
                                            <tr key={ride.id} className="hover:bg-blue-50/30 transition duration-150">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className="flex flex-col items-center mr-3 mt-1.5">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                            <div className="w-0.5 h-3 bg-gray-200 my-1 flex-grow"></div>
                                                            <div className="w-2 h-2 border-2 border-gray-400 bg-white rounded-none"></div>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <p className="text-sm font-semibold text-gray-800">{ride.pickupLocation}</p>
                                                                {ride.rideType && (
                                                                    <span className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-600 rounded text-[10px] font-black uppercase tracking-wider">
                                                                        {ride.rideType}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">{ride.dropoffLocation}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                                    ${ride.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            ride.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                ride.status === 'ACCEPTED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                                    'bg-gray-50 text-gray-700 border-gray-200'}`}
                                                    >
                                                        {ride.status === 'IN_PROGRESS' && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse"></span>}
                                                        {ride.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-900 font-bold">₹{ride.fare}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {ride.status === 'COMPLETED' && ride.isPaid !== true && (
                                                        <button
                                                            onClick={() => navigate('/checkout', { state: { rideId: ride.id, fare: ride.fare } })}
                                                            className="inline-flex items-center bg-gray-900 hover:bg-black text-white font-medium py-1.5 px-4 rounded-lg shadow-sm transition duration-200"
                                                        >
                                                            Pay Now
                                                            <svg className="w-4 h-4 ml-1.5 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                        </button>
                                                    )}
                                                    {ride.isPaid === true && (
                                                        <span className="inline-flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-lg font-bold border border-green-100">
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                            Paid
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderDashboard;
