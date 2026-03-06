const axios = require('axios');
(async () => {
    try {
        await axios.post('http://localhost:8080/api/auth/signup', {
            username: 'user123',
            email: 'user123@example.com',
            password: 'password123',
            role: ['rider']
        }).catch(e => console.log("Signup likely already done."));

        const loginRes = await axios.post('http://localhost:8080/api/auth/signin', {
            username: 'user123',
            password: 'password123'
        });
        const token = loginRes.data.accessToken;

        const rideRes = await axios.post('http://localhost:8080/api/rides/request', {
            pickupLocation: 'howrah station',
            dropoffLocation: 'kolkata station',
            pickupLat: 40.7128,
            pickupLng: -74.0060,
            dropoffLat: 40.7306,
            dropoffLng: -73.9352
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const rideId = rideRes.data.id;
        console.log("Ride ID:", rideId);

        const paymentRes = await axios.post('http://localhost:8080/api/payment/create-intent', {
            rideId: rideId
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Payment Intent Success:", paymentRes.data);
    } catch (e) {
        console.error("Error Status:", e.response ? e.response.status : 'Network error');
        console.error("Error Data:", e.response ? e.response.data : e.message);
    }
})();
