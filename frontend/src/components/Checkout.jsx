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
    const navigate = useNavigate();

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
        <div className="bg-white p-6 justify-center max-w-md mx-auto rounded shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-4 text-center">Complete Payment</h2>

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
                    <CheckoutForm clientSecret={clientSecret} fare={fare} />
                </Elements>
            ) : (
                <div className="text-xl">Loading payment gateway...</div>
            )}
        </div>
    );
};

export default Checkout;
