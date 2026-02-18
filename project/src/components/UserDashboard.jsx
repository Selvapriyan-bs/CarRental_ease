import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI, vehicleAPI, BACKEND_URL } from '../services/api';
import { BookmarkCheck01Icon, HourglassIcon, Calendar03Icon, DollarCircleIcon } from 'hugeicons-react';
import './Dashboard.css';

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, vehiclesRes] = await Promise.all([
        bookingAPI.getAll(),
        vehicleAPI.getAll()
      ]);
      setBookings(bookingsRes.data);
      setVehicles(vehiclesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const userBookings = bookings.filter(b => b.userId === user.id);

  return (
    <div className="dashboard">
      <h1>User Dashboard</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <BookmarkCheck01Icon size={32} />
          <h3>Total Bookings</h3>
          <p className="stat-number">{userBookings.length}</p>
        </div>
        <div className="stat-card">
          <Calendar03Icon size={32} />
          <h3>Active Bookings</h3>
          <p className="stat-number">{userBookings.filter(b => b.status === 'approved').length}</p>
        </div>
        <div className="stat-card">
          <HourglassIcon size={32} />
          <h3>Pending</h3>
          <p className="stat-number">{userBookings.filter(b => b.status === 'pending').length}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>My Bookings</h2>
        {userBookings.length === 0 ? (
          <p>No bookings yet</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {userBookings.map(booking => {
                const vehicle = vehicles.find(v => v._id === booking.vehicleId);
                return (
                  <tr key={booking._id}>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        {vehicle?.images && vehicle.images[0] && (
                          <img src={`${BACKEND_URL}${vehicle.images[0]}`} alt={vehicle.name} style={{width: '40px', height: '25px', objectFit: 'cover', borderRadius: '4px'}} />
                        )}
                        {vehicle?.name}
                      </div>
                    </td>
                    <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                    <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                    <td>₹{booking.total}</td>
                    <td><span className={`badge ${booking.status}`}>{booking.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
