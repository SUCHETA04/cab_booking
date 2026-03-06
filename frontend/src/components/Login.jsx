import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../services/auth.service';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        AuthService.login(username, password).then(
            () => {
                const user = AuthService.getCurrentUser();
                if (user.roles.includes("ROLE_ADMIN")) {
                    navigate("/admin");
                } else if (user.roles.includes("ROLE_DRIVER")) {
                    navigate("/driver");
                } else {
                    navigate("/rider");
                }
                window.location.reload();
            },
            (error) => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                setLoading(false);
                setMessage(resMessage);
            }
        );
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-center mb-6">Cab Booking App</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                        <input
                            type="text"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                        <button
                            className="bg-blue-500 hover:bg-blue-700 w-full text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex justify-center"
                            type="submit"
                            disabled={loading}
                        >
                            {loading && (
                                <span className="spinner-border spinner-border-sm mr-2 text-white">⟳</span>
                            )}
                            <span>Login</span>
                        </button>
                    </div>

                    {message && (
                        <div className="mt-4 p-3 rounded bg-red-100 text-red-700 text-center" role="alert">
                            {message}
                        </div>
                    )}

                    <div className="mt-4 text-center">
                        <span>Don't have an account? </span>
                        <Link to="/register" className="text-blue-500 hover:text-blue-800">Register</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
