import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/auth.service';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('rider');
    const [drivingLicenseNumber, setDrivingLicenseNumber] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [vehicleType, setVehicleType] = useState('CAR');
    const [successful, setSuccessful] = useState(false);
    const [message, setMessage] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();
        setMessage('');
        setSuccessful(false);

        AuthService.register(
            username,
            email,
            password,
            phone,
            role,
            role === 'driver' ? drivingLicenseNumber : null,
            role === 'driver' ? vehicleNumber : null,
            role === 'driver' ? vehicleType : null
        ).then(
            (response) => {
                setMessage(response.data.message);
                setSuccessful(true);
            },
            (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                setMessage(resMessage);
                setSuccessful(false);
            }
        );
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-12 relative overflow-hidden">
            {/* Background design elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.08]">
                    <img src="/logo.png" className="w-full h-full object-cover scale-150 blur-sm" />
                </div>
                <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-indigo-500 blur-[120px] opacity-20 hidden md:block"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-500 blur-[120px] opacity-20 hidden md:block"></div>
            </div>

            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10 z-10 mx-4">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Create an Account</h2>
                    <p className="text-blue-200 text-sm mt-2">Join us and start moving smarter</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-5">
                    {!successful && (
                        <>
                            <div>
                                <label className="block text-blue-100 text-sm font-semibold mb-2 ml-1">Username</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-blue-300">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </span>
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all duration-300"
                                        placeholder="Choose a username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-blue-100 text-sm font-semibold mb-2 ml-1">Email</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-blue-300">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </span>
                                    <input
                                        type="email"
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all duration-300"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-blue-100 text-sm font-semibold mb-2 ml-1">Phone Number</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-blue-300">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </span>
                                    <input
                                        type="tel"
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all duration-300"
                                        placeholder="Enter your phone number"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-1">
                                <label
                                    className={`relative flex flex-col items-center justify-center p-4 cursor-pointer rounded-2xl border-2 transition-all duration-300 ${role === 'rider' ? 'border-blue-400 bg-blue-500/20 text-white' : 'border-white/10 bg-white/5 text-blue-200 hover:bg-white/10'}`}
                                >
                                    <input type="radio" name="role" value="rider" className="hidden" onChange={(e) => setRole(e.target.value)} checked={role === 'rider'} />
                                    <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <span className="font-bold">Rider</span>
                                </label>

                                <label
                                    className={`relative flex flex-col items-center justify-center p-4 cursor-pointer rounded-2xl border-2 transition-all duration-300 ${role === 'driver' ? 'border-indigo-400 bg-indigo-500/20 text-white' : 'border-white/10 bg-white/5 text-blue-200 hover:bg-white/10'}`}
                                >
                                    <input type="radio" name="role" value="driver" className="hidden" onChange={(e) => setRole(e.target.value)} checked={role === 'driver'} />
                                    <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
                                    <span className="font-bold">Driver</span>
                                </label>
                            </div>

                            {role === 'driver' && (
                                <div className="space-y-4 p-4 mt-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-fade-in">
                                    <h3 className="text-white font-bold text-sm mb-2">Driver Details</h3>
                                    <div>
                                        <label className="block text-indigo-200 text-xs font-semibold mb-1 ml-1">Driving License Number</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/10 transition-all duration-300"
                                            placeholder="e.g. DL-123456789"
                                            value={drivingLicenseNumber}
                                            onChange={(e) => setDrivingLicenseNumber(e.target.value)}
                                            required={role === 'driver'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-indigo-200 text-xs font-semibold mb-1 ml-1">Vehicle License Plate</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white/10 transition-all duration-300"
                                            placeholder="e.g. MH 01 AB 1234"
                                            value={vehicleNumber}
                                            onChange={(e) => setVehicleNumber(e.target.value)}
                                            required={role === 'driver'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-indigo-200 text-xs font-semibold mb-2 ml-1">Vehicle Type</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div
                                                onClick={() => setVehicleType('BIKE')}
                                                className={`cursor-pointer rounded-xl border-2 p-2 flex flex-col items-center justify-center transition-all ${vehicleType === 'BIKE' ? 'border-indigo-400 bg-indigo-500/30' : 'border-white/10 bg-white/5 opacity-50 hover:opacity-100'}`}
                                            >
                                                <span className="text-xl mb-1">🏍️</span>
                                                <span className="text-[10px] font-bold text-white uppercase">Bike</span>
                                            </div>
                                            <div
                                                onClick={() => setVehicleType('AUTO')}
                                                className={`cursor-pointer rounded-xl border-2 p-2 flex flex-col items-center justify-center transition-all ${vehicleType === 'AUTO' ? 'border-indigo-400 bg-indigo-500/30' : 'border-white/10 bg-white/5 opacity-50 hover:opacity-100'}`}
                                            >
                                                <span className="text-xl mb-1">🛺</span>
                                                <span className="text-[10px] font-bold text-white uppercase">Auto</span>
                                            </div>
                                            <div
                                                onClick={() => setVehicleType('CAR')}
                                                className={`cursor-pointer rounded-xl border-2 p-2 flex flex-col items-center justify-center transition-all ${vehicleType === 'CAR' ? 'border-indigo-400 bg-indigo-500/30' : 'border-white/10 bg-white/5 opacity-50 hover:opacity-100'}`}
                                            >
                                                <span className="text-xl mb-1">🚕</span>
                                                <span className="text-[10px] font-bold text-white uppercase">Car</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-blue-100 text-sm font-semibold mb-2 ml-1">Password</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-blue-300">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </span>
                                    <input
                                        type="password"
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/10 transition-all duration-300"
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    className="w-full bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-500/25 transform transition duration-300 active:scale-95 text-lg"
                                    type="submit"
                                >
                                    Sign Up
                                </button>
                            </div>
                        </>
                    )}

                    {message && (
                        <div className={`mt-4 p-4 rounded-2xl border flex items-start text-sm font-medium backdrop-blur-sm shadow-sm
                            ${successful
                                ? 'bg-green-500/20 border-green-500/50 text-green-100'
                                : 'bg-red-500/20 border-red-500/50 text-red-100'}`} role="alert"
                        >
                            <svg className={`w-5 h-5 mr-3 flex-shrink-0 ${successful ? 'text-green-300' : 'text-red-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {successful
                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                }
                            </svg>
                            {message}
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm font-medium text-blue-200">
                        <span>Already have an account? </span>
                        <Link to="/login" className="text-white hover:text-blue-300 underline decoration-blue-400 decoration-2 underline-offset-4 transition-colors">Sign in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
