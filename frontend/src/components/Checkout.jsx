import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../services/auth.service';
import UpiQrCode from '../assets/upi_qr.png';

// Use a placeholder Stripe Publishable Key. 
// For production, this should come from environment variables.
const stripePromise = loadStripe('pk_test_6pRNASCoBOKtIshFeQd4XMUh');

const CheckoutForm = ({ clientSecret, fare, rideId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'upi'
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [isExpired, setIsExpired] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (timeLeft <= 0) {
            setIsExpired(true);
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handleCardSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsLoading(true);

        try {
            const cardElement = elements.getElement(CardElement);
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                }
            });

            if (error) {
                setMessage(error.message);
            } else {
                setMessage("Payment successful!");
                const user = AuthService.getCurrentUser();
                await axios.post(`http://localhost:8080/api/payment/confirm/${rideId}`, {}, {
                    headers: { Authorization: `Bearer ${user.accessToken}` }
                });
                setTimeout(() => {
                    navigate("/rider");
                }, 2000);
            }
        } catch (err) {
            setMessage("An error occurred: " + err.message);
            console.error("Stripe confirmPayment error:", err);
        }

        setIsLoading(false);
    };

    const handleUpiSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate a delay for verifying UPI payment
        setTimeout(async () => {
            setMessage("UPI Payment Verified & Successful!");
            const user = AuthService.getCurrentUser();
            await axios.post(`http://localhost:8080/api/payment/confirm/${rideId}`, {}, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            }).catch(e => console.log(e));

            setTimeout(() => {
                navigate("/rider");
            }, 2000);
            setIsLoading(false);
        }, 3000);
    };

    return (
        <div className="bg-white p-6 justify-center max-w-md mx-auto rounded shadow-md mt-10 relative">
            {isExpired && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded">
                    <div className="text-red-600 mb-2">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Expired</h2>
                    <p className="text-gray-600 text-center mb-6 px-4">The 5-minute window to complete this payment has closed.</p>
                    <button
                        onClick={() => navigate('/rider')}
                        className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                    >
                        Return to Dashboard
                    </button>
                </div>
            )}

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Complete Payment</h2>
                <div className={`font-mono text-lg font-bold px-3 py-1 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-700'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="mb-6 flex justify-center space-x-4 border-b pb-4">
                <button
                    onClick={() => setPaymentMethod('card')}
                    className={`px-4 py-2 font-semibold rounded ${paymentMethod === 'card' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    Credit Card
                </button>
                <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`px-4 py-2 font-semibold rounded ${paymentMethod === 'upi' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    UPI / QR Code
                </button>
            </div>

            <div className="mb-4 text-center text-lg">
                Total Due: <strong>₹{fare}</strong>
            </div>

            {paymentMethod === 'card' ? (
                <form onSubmit={handleCardSubmit}>
                    <div className="mb-6 p-4 border rounded shadow-sm bg-gray-50">
                        <CardElement id="card-element" options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': { color: '#aab7c4' },
                                },
                                invalid: { color: '#9e2146' },
                            },
                        }} />
                    </div>
                    <button
                        disabled={isLoading || !stripe || !elements}
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4 hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isLoading ? "Processing..." : "Pay with Card"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleUpiSubmit} className="flex flex-col items-center">
                    <p className="text-sm text-gray-600 mb-4">Scan the QR code below with any UPI app (GPay, PhonePe, Paytm) to pay.</p>
                    <div className="border p-4 rounded bg-gray-50 mb-4 w-48 h-48 flex items-center justify-center">
                        <img src={UpiQrCode} alt="UPI QR Code" className="max-w-full max-h-full" />
                    </div>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded mb-4 w-full text-center">UPI ID: cab_booking@upi</p>
                    <button
                        disabled={isLoading}
                        type="submit"
                        className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {isLoading ? "Verifying Payment..." : "I have completed the payment"}
                    </button>
                </form>
            )}

            {message && <div className={`mt-4 text-center font-semibold ${message.includes('successful') || message.includes('Verified') ? 'text-green-600' : 'text-red-500'}`}>{message}</div>}
        </div>
    );
};

const Checkout = () => {
    const [clientSecret, setClientSecret] = useState("");
    const location = useLocation();
    const { rideId, fare } = location.state || {}; // Passed from RiderDashboard

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        // Create PaymentIntent as soon as the page loads
        if (rideId && user) {
            axios.post("http://localhost:8080/api/payment/create-intent", { rideId }, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            })
                .then((res) => setClientSecret(res.data.clientSecret))
                .catch((err) => console.log("Failed to init payment", err));
        }
    }, [rideId]);

    const appearance = { theme: 'stripe' };
    const options = { clientSecret, appearance };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-20">
            {clientSecret ? (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm clientSecret={clientSecret} fare={fare} rideId={rideId} />
                </Elements>
            ) : (
                <div className="text-xl">Loading payment gateway...</div>
            )}
        </div>
    );
};

export default Checkout;
