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
    <div className="dashboard-container">
      <div className="dashboard">
        <h1><BookmarkCheck01Icon size={48} /> User Dashboard</h1>
        
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
            <p style={{textAlign: 'center', padding: '40px', color: 'var(--text-secondary)'}}>No bookings found. Start your journey today!</p>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Total Price</th>
                    <th>Booking Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userBookings.map(booking => {
                    const vehicle = vehicles.find(v => v._id === booking.vehicleId);
                    return (
                      <tr key={booking._id}>
                        <td>
                          <div className="vehicle-info-cell">
                            <div className="vehicle-thumb-container">
                              <img src={`${BACKEND_URL}${vehicle?.images?.[0] || '/uploads/default.jpg'}`} alt={vehicle?.name} />
                            </div>
                            <div className="vehicle-details-text">
                              <h4>{vehicle?.name || 'Unknown Vehicle'}</h4>
                              <p>{vehicle?.type || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td>{new Date(booking.startDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                        <td>{new Date(booking.endDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</td>
                        <td style={{fontWeight: '700', color: 'white'}}>₹{booking.total}</td>
                        <td>
                          <span className={`badge ${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
