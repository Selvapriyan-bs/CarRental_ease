import { useAuth } from '../context/AuthContext';
import UserDashboard from '../components/UserDashboard';
import VendorDashboard from '../components/VendorDashboard';
import AdminDashboard from '../components/AdminDashboard';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  return (
    <div>
      {user.role === 'user' && <UserDashboard />}
      {user.role === 'vendor' && <VendorDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </div>
  );
};

export default Dashboard;
