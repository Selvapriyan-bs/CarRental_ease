import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifiedRegister from './pages/VerifiedRegister';
import Dashboard from './pages/Dashboard';
import VehicleDetail from './pages/VehicleDetail';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<VerifiedRegister />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/payment/:id" element={<Payment />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
