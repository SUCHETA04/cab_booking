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
  <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center items-center bg-slate-50 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
    </div>

    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto backdrop-blur-sm bg-white/30 p-12 rounded-3xl border border-white/50 shadow-2xl">
      <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-800 mb-6 drop-shadow-sm tracking-tight">Aura Rides</h1>
      <p className="text-xl md:text-2xl text-slate-700 mb-10 font-medium max-w-2xl mx-auto leading-relaxed">The most elegant, transparent, and seamless way to explore your city.</p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center items-center">
        <Link to="/register" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-1 active:scale-95">Get Started</Link>
        <Link to="/login" className="w-full sm:w-auto bg-white/80 backdrop-blur-md text-slate-800 border-[1.5px] border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md hover:-translate-y-1 active:scale-95">Sign In</Link>
      </div>
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
      {/* Modern Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center h-16">
          <Link to={"/"} className="flex items-center justify-center group" style={{ perspective: '1000px' }}>
            <img
              src="/logo.png"
              alt="Aura Logo"
              className="w-20 h-auto max-h-14 object-contain filter drop-shadow-xl transition-transform duration-500 ease-out group-hover:scale-110"
              style={{ animation: 'float3d 8s ease-in-out infinite' }}
            />
            <style>{`
              @keyframes float3d {
                0% { transform: translateY(0px) rotateX(0deg) rotateY(0deg); }
                25% { transform: translateY(-4px) rotateX(8deg) rotateY(4deg); }
                50% { transform: translateY(0px) rotateX(0deg) rotateY(8deg); }
                75% { transform: translateY(3px) rotateX(-6deg) rotateY(3deg); }
                100% { transform: translateY(0px) rotateX(0deg) rotateY(0deg); }
              }
            `}</style>
          </Link>

          <div className="flex items-center space-x-6">
            {currentUser ? (
              <>
                <li className="list-none">
                  <Link to={currentUser.roles.includes("ROLE_DRIVER") ? "/driver" : "/rider"} className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li className="list-none">
                  <button onClick={logOut} className="text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl transition-colors hidden sm:block">
                    Log Out
                  </button>
                  <button onClick={logOut} className="text-sm font-semibold text-gray-600 hover:text-red-500 sm:hidden">
                    Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="list-none">
                  <Link to={"/login"} className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
                    Sign In
                  </Link>
                </li>
                <li className="list-none">
                  <Link to={"/register"} className="text-sm font-bold bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl transition-transform hover:scale-105 shadow-sm active:scale-95">
                    Register
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
