import { users, vehicles, bookings } from '../data/mockData';
import { UserMultiple02Icon, UserIcon, Car01Icon, BookmarkCheck01Icon } from 'hugeicons-react';
import './Dashboard.css';

const AdminDashboard = () => {
  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <div className="dashboard-stats">
        <div className="stat-card">
          <UserIcon size={32} />
          <h3>Total Users</h3>
          <p className="stat-number">{users.filter(u => u.role === 'user').length}</p>
        </div>
        <div className="stat-card">
          <UserMultiple02Icon size={32} />
          <h3>Total Vendors</h3>
          <p className="stat-number">{users.filter(u => u.role === 'vendor').length}</p>
        </div>
        <div className="stat-card">
          <Car01Icon size={32} />
          <h3>Total Vehicles</h3>
          <p className="stat-number">{vehicles.length}</p>
        </div>
        <div className="stat-card">
          <BookmarkCheck01Icon size={32} />
          <h3>Total Bookings</h3>
          <p className="stat-number">{bookings.length}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>All Users</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.role}`}>{u.role}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dashboard-section">
        <h2>All Vehicles</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map(v => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.type}</td>
                <td>₹{v.price}/day</td>
                <td><span className={`badge ${v.available ? 'approved' : 'pending'}`}>{v.available ? 'Available' : 'Unavailable'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dashboard-section">
        <h2>All Bookings</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Vehicle</th>
              <th>Dates</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => {
              const user = users.find(u => u.id === b.userId);
              const vehicle = vehicles.find(v => v.id === b.vehicleId);
              return (
                <tr key={b.id}>
                  <td>{user?.name}</td>
                  <td>{vehicle?.name}</td>
                  <td>{b.startDate} to {b.endDate}</td>
                  <td>₹{b.total}</td>
                  <td><span className={`badge ${b.status}`}>{b.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
