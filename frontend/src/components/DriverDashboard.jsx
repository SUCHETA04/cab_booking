import React, { useState, useEffect } from 'react';
import AuthService from '../services/auth.service';
import SocketService from '../services/socket.service';
import axios from 'axios';
import RideMap from './RideMap';

const DriverDashboard = () => {
    const [availableRides, setAvailableRides] = useState([]);
    const [myRides, setMyRides] = useState([]);
    const [message, setMessage] = useState('');
    const [currentLocation, setCurrentLocation] = useState({ lat: 22.5839, lng: 88.3433 });

    const user = AuthService.getCurrentUser();

    const fetchRides = () => {
        if (user) {
            const config = { headers: { Authorization: `Bearer ${user.accessToken}` } };

            axios.get('http://localhost:8080/api/driver/available-rides', config)
                .then(res => setAvailableRides(res.data))
                .catch(err => console.error("Error fetching available", err));

            axios.get('http://localhost:8080/api/rides/my-rides', config)
                .then(res => setMyRides(res.data))
                .catch(err => console.error("Error fetching my rides", err));
        }
    };

    useEffect(() => {
        fetchRides();

        if (user) {
            SocketService.connect(user.accessToken);
        }

        return () => {
            SocketService.disconnect();
        };
    }, [user]);

    // Simulate GPS movement
    useEffect(() => {
        const interval = setInterval(() => {
            const activeRide = myRides.find(r => r.status === 'IN_PROGRESS');
            if (activeRide && SocketService.client && SocketService.client.connected) {
                // Simulate moving
                const newLat = currentLocation.lat + 0.0001;
                const newLng = currentLocation.lng + 0.0001;
                setCurrentLocation({ lat: newLat, lng: newLng });

                SocketService.sendLocation(user.id, activeRide.id, newLat, newLng);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [myRides, currentLocation, user]);

    const handleAction = (rideId, action) => {
        setMessage('');
        axios.put(`http://localhost:8080/api/driver/rides/${rideId}/${action}`, {}, {
            headers: { Authorization: `Bearer ${user.accessToken}` }
        }).then(response => {
            setMessage(response.data.message);
            fetchRides(); // Refresh lists
        }).catch(error => {
            setMessage("Error performing action.");
        });
    };

    if (!user || !user.roles.includes("ROLE_DRIVER")) {
        return <div className="p-8 text-red-500">Access Denied. You must be a logged-in Driver.</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Driver Dashboard</h1>
                    <p className="text-gray-500 mt-1">Ready to drive, <span className="font-semibold">{user.username}</span>?</p>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium text-sm border border-green-200 shadow-sm">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Online & Seeking Rides</span>
                </div>
            </div>

            {message && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl flex items-start shadow-sm">
                    <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <p className="text-sm font-medium">{message}</p>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Available Requests */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden col-span-1 border-t-4 border-t-purple-500 flex flex-col h-full">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                            Available Requests
                        </h2>
                        <span className="bg-purple-100 text-purple-700 font-bold px-2.5 py-0.5 rounded-full text-xs">
                            {availableRides.length}
                        </span>
                    </div>

                    <div className="p-4 flex-grow overflow-y-auto" style={{ maxHeight: '600px' }}>
                        {availableRides.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                                <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4m8 8V4" /></svg>
                                <p className="text-sm font-medium">No pending requests.</p>
                                <p className="text-xs mt-1">Check back later.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {availableRides.map(ride => (
                                    <div key={ride.id} className="border border-gray-100 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col flex-grow pr-4">
                                                <div className="flex items-start mb-2">
                                                    <div className="mt-1 mr-3 flex flex-col items-center">
                                                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                                                        <div className="w-0.5 h-6 bg-gray-200 my-0.5"></div>
                                                        <div className="w-2.5 h-2.5 border-2 border-red-500 bg-white rounded-full"></div>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{ride.pickupLocation}</p>
                                                        <p className="text-sm text-gray-600 mt-2 line-clamp-1">{ride.dropoffLocation}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end flex-shrink-0">
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Est. Fare</span>
                                                <span className="text-xl font-bold text-gray-900 bg-green-50 px-2.5 py-1 rounded-lg text-green-700">₹{ride.fare}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAction(ride.id, 'accept')}
                                            className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition active:scale-95 shadow-md shadow-indigo-500/20 flex items-center justify-center"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            Accept Ride
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* My Assigned Rides */}
                <div className="col-span-1 xl:col-span-2 flex flex-col space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800">My Assigned Rides</h2>

                    {myRides.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center h-full">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-700 mb-1">No Active Rides</h3>
                            <p className="text-gray-500">Accept a ride request from the panel to get started.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {myRides.map((ride) => (
                                <div key={ride.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row group transition-all hover:shadow-md">
                                    <div className="p-6 md:w-5/12 lg:w-1/3 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-100 bg-white relative">

                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm
                                                ${ride.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    ride.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        ride.status === 'ACCEPTED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                            'bg-gray-50 text-gray-700 border-gray-200'}`}
                                            >
                                                {ride.status === 'IN_PROGRESS' && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse"></span>}
                                                {ride.status}
                                            </span>
                                        </div>

                                        <div className="pt-2">
                                            <div className="flex items-start mb-6">
                                                <div className="mt-1 mr-4 flex flex-col items-center">
                                                    <div className="w-3 h-3 bg-blue-500 rounded-full ring-4 ring-blue-50"></div>
                                                    <div className="w-0.5 h-10 bg-gray-200 my-1"></div>
                                                    <div className="w-3 h-3 border-[3px] border-red-500 bg-white rounded-full ring-4 ring-red-50"></div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Pickup</p>
                                                        <p className="text-sm font-bold text-gray-900 leading-snug">{ride.pickupLocation}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Dropoff</p>
                                                        <p className="text-sm font-bold text-gray-800 leading-snug">{ride.dropoffLocation}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center mb-6">
                                                <span className="text-sm font-medium text-gray-600">Total Fare</span>
                                                <span className="text-xl font-extrabold text-gray-900">₹{ride.fare}</span>
                                            </div>

                                            {ride.status === 'COMPLETED' && (
                                                <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center mb-4 mt-[-1rem]">
                                                    <span className="text-sm font-medium text-gray-600">Payment Status</span>
                                                    {ride.isPaid ? (
                                                        <span className="inline-flex items-center text-green-700 bg-green-100 px-3 py-1 rounded-lg font-bold border border-green-200 text-sm">
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                            Paid
                                                        </span>
                                                    ) : ride.isPaymentFailed ? (
                                                        <span className="inline-flex items-center text-red-700 bg-red-100 px-3 py-1 rounded-lg font-bold border border-red-200 text-sm">
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                                            Failed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-yellow-700 bg-yellow-100 px-3 py-1 rounded-lg font-bold border border-yellow-200 text-sm">
                                                            <svg className="w-4 h-4 mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col space-y-2 mt-auto">
                                            {ride.status === 'ACCEPTED' && (
                                                <button onClick={() => handleAction(ride.id, 'start')} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 flex items-center justify-center group-hover:bg-blue-700">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Start Ride
                                                </button>
                                            )}
                                            {ride.status === 'IN_PROGRESS' && (
                                                <button onClick={() => handleAction(ride.id, 'complete')} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-700 animate-pulse-slow">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    Complete Ride
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:w-7/12 lg:w-2/3 h-64 md:h-auto min-h-[300px] relative p-1.5 bg-gray-50">
                                        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm font-semibold text-gray-700 text-xs flex items-center">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                            Active Map
                                        </div>
                                        <div className="h-full w-full rounded-xl overflow-hidden border border-gray-200">
                                            <RideMap
                                                pickupLat={22.5839} pickupLng={88.3433}
                                                dropoffLat={22.6046} dropoffLng={88.3831}
                                                driverLat={ride.status === 'IN_PROGRESS' ? currentLocation.lat : null}
                                                driverLng={ride.status === 'IN_PROGRESS' ? currentLocation.lng : null}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
