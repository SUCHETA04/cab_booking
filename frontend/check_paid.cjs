const axios = require('axios');

(async () => {
    try {
        await axios.post('http://localhost:8080/api/auth/signup', {
            username: 'testuser_pay',
            email: 'testuser_pay@example.com',
            password: 'password123',
            role: ['rider']
        }).catch(e => console.log("Signup likely already done."));

        const loginRes = await axios.post('http://localhost:8080/api/auth/signin', {
            username: 'testuser_pay',
            password: 'password123'
        });
        const token = loginRes.data.accessToken;

        const rideRes = await axios.post('http://localhost:8080/api/rides/request', {
            pickupLocation: 'A',
            dropoffLocation: 'B',
            pickupLat: 40.7128,
            pickupLng: -74.0060,
            dropoffLat: 40.7306,
            dropoffLng: -73.9352
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const rideId = rideRes.data.id;
        console.log("Ride requested:", rideId);

        // Driver login to accept and complete ride
        await axios.post('http://localhost:8080/api/auth/signup', {
            username: 'driver_pay',
            email: 'driver_pay@example.com',
            password: 'password123',
            role: ['driver']
        }).catch(e => console.log("Driver Signup likely already done."));

        const driverLoginRes = await axios.post('http://localhost:8080/api/auth/signin', {
            username: 'driver_pay',
            password: 'password123'
        });
        const driverToken = driverLoginRes.data.accessToken;

        await axios.put(`http://localhost:8080/api/driver/rides/${rideId}/accept`, {}, { headers: { Authorization: `Bearer ${driverToken}` } });
        await axios.put(`http://localhost:8080/api/driver/rides/${rideId}/start`, {}, { headers: { Authorization: `Bearer ${driverToken}` } });
        await axios.put(`http://localhost:8080/api/driver/rides/${rideId}/complete`, {}, { headers: { Authorization: `Bearer ${driverToken}` } });

        console.log("Ride completed.");

        const confirmRes = await axios.post(`http://localhost:8080/api/payment/confirm/${rideId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Confirm status:", confirmRes.status);
        console.log("Confirm data:", confirmRes.data);

        const myRidesRes = await axios.get('http://localhost:8080/api/rides/my-rides', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("My rides JSON:", JSON.stringify(myRidesRes.data, null, 2));

    } catch (e) {
        console.error("Error:", e.response ? e.response.status + " " + JSON.stringify(e.response.data) : e.message);
    }
})();
