import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import AuthService from './services/auth.service';
import Login from './components/Login';
import Register from './components/Register';
import RiderDashboard from './components/RiderDashboard';
import DriverDashboard from './components/DriverDashboard';
import Checkout from './components/Checkout';
import './App.css';

const Home = () => (
  <div className="h-screen flex flex-col justify-center items-center bg-gray-50">
    <h1 className="text-5xl font-extrabold text-blue-600 mb-4">Cab Booker Pro</h1>
    <p className="text-xl text-gray-600 mb-8">The best way to get around town.</p>
    <div className="space-x-4">
      <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">Log In</Link>
      <Link to="/register" className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition">Sign Up</Link>
    </div>
  </div>
);

const App = () => {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
  };

  return (
    <div>
      {/* Basic Navigation */}
      <nav className="bg-gray-800 p-4 w-full">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to={"/"} className="text-white text-xl font-bold">
            Cab Booking
          </Link>

          <div className="flex space-x-4">
            {currentUser ? (
              <>
                <li className="list-none">
                  {currentUser.roles.includes("ROLE_DRIVER") ? (
                    <Link to={"/driver"} className="text-gray-300 hover:text-white">Dashboard</Link>
                  ) : (
                    <Link to={"/rider"} className="text-gray-300 hover:text-white">Dashboard</Link>
                  )}
                </li>
                <li className="list-none">
                  <a href="/login" className="text-gray-300 hover:text-white" onClick={logOut}>
                    LogOut ({currentUser.username})
                  </a>
                </li>
              </>
            ) : (
              <>
                <li className="list-none">
                  <Link to={"/login"} className="text-gray-300 hover:text-white">
                    Login
                  </Link>
                </li>
                <li className="list-none">
                  <Link to={"/register"} className="text-gray-300 hover:text-white">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Routing */}
      <div className="min-h-[calc(100vh-64px)] w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rider" element={<RiderDashboard />} />
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
