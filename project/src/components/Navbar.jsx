import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car01Icon, Home01Icon, Login01Icon, UserAdd01Icon, DashboardSquare01Icon, Logout01Icon, UserIcon } from 'hugeicons-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo"><Car01Icon size={24} /> CarRental</Link>
        <ul className="nav-menu">
          <li><Link to="/home"><Home01Icon size={20} /> Home</Link></li>
          {user ? (
            <>
              <li><Link to="/dashboard"><DashboardSquare01Icon size={20} /> Dashboard</Link></li>
              <li><Link to="/profile"><UserIcon size={20} /> Profile</Link></li>
              <li><span className="user-name">{user.name}</span></li>
              <li><button onClick={handleLogout} className="btn-logout"><Logout01Icon size={20} /> Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login"><Login01Icon size={20} /> Login</Link></li>
              <li><Link to="/register"><UserAdd01Icon size={20} /> Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
