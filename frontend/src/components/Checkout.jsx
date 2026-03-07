import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../services/auth.service';
import UpiQrCode from '../assets/upi_qr.png';

const Checkout = () => {
    const [orderId, setOrderId] = useState("");
    const [initError, setInitError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [timeLeft, setTimeLeft] = useState(300);
    const [isExpired, setIsExpired] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const { rideId, fare } = location.state || {};

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (rideId && user) {
            axios.post("http://localhost:8080/api/payment/create-order", { rideId }, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            })
                .then((res) => {
                    if (res.data.orderId) {
                        setOrderId(res.data.orderId);
                    } else {
                        setInitError("Failed to initialize payment gateway.");
                    }
                })
                .catch((err) => {
                    console.log("Failed to init payment", err);
                    setInitError("Error connecting to payment processor. " + (err.response?.data?.message || err.message));
                });
        } else if (!rideId) {
            setInitError("No ride information found. Please start checkout from the dashboard.");
        }
    }, [rideId]);

    useEffect(() => {
        if (timeLeft <= 0) {
            if (!isExpired) {
                setIsExpired(true);
                const user = AuthService.getCurrentUser();
                axios.post(`http://localhost:8080/api/payment/fail/${rideId}`, {}, {
                    headers: { Authorization: `Bearer ${user.accessToken}` }
                }).catch(e => console.log(e));
            }
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        }
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handleRazorpayPayment = async () => {
        if (!orderId) return;
        setIsLoading(true);

        const options = {
            key: "rzp_test_SO4YpaYNVDXVK7",
            amount: fare * 100,
            currency: "INR",
            name: "Aura Premium Rides",
            description: "Ride Fare Payment",
            order_id: orderId,
            handler: async function (response) {
                try {
                    const user = AuthService.getCurrentUser();
                    await axios.post(`http://localhost:8080/api/payment/confirm/${rideId}`, {}, {
                        headers: { Authorization: `Bearer ${user.accessToken}` }
                    });
                    navigate("/rider");
                } catch (error) {
                    console.error("Confirmation error", error);
                    alert("Payment captured but confirmation failed on server.");
                }
            },
            prefill: {
                name: AuthService.getCurrentUser()?.username || "Rider",
                email: AuthService.getCurrentUser()?.email || "rider@example.com",
            },
            theme: {
                color: "#2563eb",
            },
            modal: {
                ondismiss: function () {
                    setIsLoading(false);
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function (response) {
            alert(response.error.description);
            setIsLoading(false);
            const user = AuthService.getCurrentUser();
            await axios.post(`http://localhost:8080/api/payment/fail/${rideId}`, {}, {
                headers: { Authorization: `Bearer ${user.accessToken}` }
            }).catch(e => console.log(e));
        });
        rzp.open();
    };

    const handleUpiSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(async () => {
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
        <div className="min-h-screen bg-slate-50 flex justify-center items-start pt-20 px-4">
            {initError ? (
                <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-red-100 mt-10 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Checkout Unavailable</h3>
                    <p className="text-gray-500 mb-8">{initError}</p>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-black transition duration-200"
                    >
                        Return to Dashboard
                    </button>
                </div>
            ) : orderId ? (
                <div className="bg-white p-8 justify-center w-full max-w-md mx-auto rounded-3xl shadow-2xl shadow-blue-900/10 mt-10 relative overflow-hidden border border-gray-100">
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-transparent pointer-events-none"></div>

                    {isExpired && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-3xl">
                            <div className="text-red-500 mb-4 bg-red-100 p-4 rounded-full shadow-inner">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Expired</h2>
                            <p className="text-gray-500 text-center mb-8 px-6 text-sm">The 5-minute window to complete this payment has closed to ensure fare accuracy.</p>
                            <button
                                onClick={() => navigate('/rider')}
                                className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-8 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    )}

                    <div className="relative z-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-extrabold text-gray-800 tracking-tight">Checkout</h2>
                            <div className={`font-mono text-sm font-bold px-3 py-1.5 rounded-xl shadow-sm border ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 flex items-center justify-between">
                            <span className="text-gray-500 font-medium text-sm">Amount Due</span>
                            <span className="text-3xl font-black text-gray-900">₹{fare}</span>
                        </div>

                        <div className="mb-6 flex bg-gray-100 p-1 rounded-2xl relative">
                            <button
                                onClick={() => setPaymentMethod('razorpay')}
                                className={`flex-1 flex justify-center items-center py-2.5 px-4 text-sm font-bold rounded-xl transition-all duration-300 ${paymentMethod === 'razorpay' ? 'bg-white text-blue-700 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                Cards / NetBanking
                            </button>
                            <button
                                onClick={() => setPaymentMethod('upi')}
                                className={`flex-1 flex justify-center items-center py-2.5 px-4 text-sm font-bold rounded-xl transition-all duration-300 ${paymentMethod === 'upi' ? 'bg-white text-green-700 shadow-sm border border-gray-200/50' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                                UPI Direct
                            </button>
                        </div>

                        {paymentMethod === 'razorpay' ? (
                            <div className="space-y-4">
                                <button
                                    onClick={handleRazorpayPayment}
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-2xl hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center"
                                >
                                    {isLoading ? (
                                        <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Loading...</>
                                    ) : (
                                        <>Pay ₹{fare} with Razorpay</>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleUpiSubmit} className="flex flex-col items-center">
                                <div className="bg-gray-50 w-full p-4 rounded-2xl border border-gray-100 mb-6 flex flex-col items-center">
                                    <p className="text-sm text-gray-500 mb-4 text-center">Scan with any UPI app to pay</p>
                                    <div className="bg-white p-3 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] mb-3">
                                        <img src={UpiQrCode} alt="UPI QR Code" className="w-32 h-32 object-contain" />
                                    </div>
                                    <div className="bg-gray-100 px-4 py-2 rounded-lg w-full">
                                        <p className="font-mono text-xs text-gray-600 text-center flex items-center justify-center">
                                            <span className="font-semibold mr-2 text-gray-500">ID:</span> cab_booking@upi
                                        </p>
                                    </div>
                                </div>
                                <button
                                    disabled={isLoading}
                                    type="submit"
                                    className="w-full bg-green-600 text-white font-bold py-3.5 px-4 rounded-2xl hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500 shadow-lg shadow-green-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex justify-center items-center"
                                >
                                    {isLoading ? (
                                        <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Verifying...</>
                                    ) : "I've paid, verify now"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center mt-20">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <div className="text-lg font-medium text-gray-500">Preparing secure gateway...</div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
