import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vehicleAPI, bookingAPI } from '../services/api';
import { 
  ChartBarLineIcon, 
  DollarCircleIcon, 
  Car01Icon, 
  ChartLineData01Icon, 
  Sorting05Icon, 
  Analytics01Icon,
  Calendar03Icon,
  ArrowUp01Icon
} from 'hugeicons-react';
import './VendorAnalytics.css';

const VendorAnalytics = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vRes, bRes] = await Promise.all([
        vehicleAPI.getAll(),
        bookingAPI.getAll()
      ]);
      
      const myVehicles = vRes.data.filter(v => v.vendorId === user.id || (v.vendorId._id && v.vendorId._id === user.id));
      const myBookings = bRes.data.filter(b => myVehicles.some(v => v._id === b.vehicleId));
      
      setVehicles(myVehicles);
      setBookings(myBookings);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="analytics-loading">Calculating insights...</div>;

  // Analysis Logic
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.status === 'approved' ? b.total : 0), 0);
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const avgOrderValue = approvedBookings.length > 0 ? totalRevenue / approvedBookings.length : 0;
  
  // Utilization Rate
  const rentedCount = vehicles.filter(v => !v.available && !v.onService).length;
  const utilizationRate = vehicles.length > 0 ? (rentedCount / vehicles.length) * 100 : 0;

  // Top Performing Vehicles
  const vehicleStats = vehicles.map(v => {
    const vBookings = approvedBookings.filter(b => b.vehicleId === v._id);
    const revenue = vBookings.reduce((sum, b) => sum + b.total, 0);
    return {
      ...v,
      orderCount: vBookings.length,
      revenue
    };
  }).sort((a, b) => b.orderCount - a.orderCount);

  const topVehicle = vehicleStats[0];

  // Revenue by Type
  const typeRevenue = vehicles.reduce((acc, v) => {
    const revenue = approvedBookings.filter(b => b.vehicleId === v._id).reduce((sum, b) => sum + b.total, 0);
    acc[v.type] = (acc[v.type] || 0) + revenue;
    return acc;
  }, {});

  return (
    <div className="vendor-analytics-page">
      <div className="analytics-container">
        <header className="analytics-header">
          <div className="header-text">
            <h1><Analytics01Icon size={32} /> Business Insights</h1>
            <p>Comprehensive analysis of your fleet's performance and revenue.</p>
          </div>
          <div className="period-selector">
            <span>Last 30 Days</span>
          </div>
        </header>

        <div className="analytics-grid">
          {/* Main Revenue Card */}
          <div className="main-stat-card revenue-gradient">
            <div className="stat-content">
              <label>Total Revenue</label>
              <h2>₹{totalRevenue.toLocaleString()}</h2>
              <div className="stat-footer">
                <ArrowUp01Icon size={16} />
                <span>+12.5% from last month</span>
              </div>
            </div>
            <DollarCircleIcon size={80} className="bg-icon" />
          </div>

          <div className="stats-row">
            <div className="stat-mini-card">
              <div className="mini-icon"><ChartLineData01Icon size={24} /></div>
              <div className="mini-content">
                <label>Avg. Order Value</label>
                <h3>₹{Math.round(avgOrderValue).toLocaleString()}</h3>
              </div>
            </div>
            <div className="stat-mini-card">
              <div className="mini-icon"><Car01Icon size={24} /></div>
              <div className="mini-content">
                <label>Fleet Utilization</label>
                <h3>{Math.round(utilizationRate)}%</h3>
              </div>
            </div>
            <div className="stat-mini-card">
              <div className="mini-icon"><Calendar03Icon size={24} /></div>
              <div className="mini-content">
                <label>Total Orders</label>
                <h3>{approvedBookings.length}</h3>
              </div>
            </div>
          </div>

          {/* Top Vehicle Section */}
          <div className="analysis-section">
            <div className="section-title">
              <Sorting05Icon size={20} />
              <h2>Top Performing Fleet</h2>
            </div>
            <div className="top-vehicles-list">
              {vehicleStats.slice(0, 5).map((v, index) => (
                <div key={v._id} className="top-vehicle-item">
                  <div className="rank">#{index + 1}</div>
                  <img src={`http://localhost:5000${v.images?.[0] || '/uploads/default.jpg'}`} alt={v.name} />
                  <div className="v-info">
                    <h4>{v.name}</h4>
                    <span>{v.type} • {v.orderCount} Orders</span>
                  </div>
                  <div className="v-revenue">
                    <label>Revenue</label>
                    <p>₹{v.revenue.toLocaleString()}</p>
                  </div>
                  <div className="performance-bar-container">
                    <div 
                      className="performance-bar" 
                      style={{width: `${(v.revenue / (topVehicle?.revenue || 1)) * 100}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="breakdown-grid">
            <div className="analysis-section">
              <div className="section-title">
                <ChartBarLineIcon size={20} />
                <h2>Revenue by Category</h2>
              </div>
              <div className="type-breakdown">
                {Object.entries(typeRevenue).map(([type, revenue]) => (
                  <div key={type} className="type-item">
                    <div className="type-header">
                      <span>{type}</span>
                      <span>₹{revenue.toLocaleString()}</span>
                    </div>
                    <div className="progress-bg">
                      <div className="progress-fill" style={{width: `${(revenue / totalRevenue) * 100}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="analysis-section summary-card">
              <h2>Performance Summary</h2>
              <p>Your <strong>{topVehicle?.name}</strong> is currently your most productive asset, contributing <strong>{Math.round((topVehicle?.revenue / (totalRevenue || 1)) * 100)}%</strong> of your total revenue.</p>
              <div className="insight-badge">
                💡 Tip: Consider adding more <strong>{Object.keys(typeRevenue).sort((a,b) => typeRevenue[b] - typeRevenue[a])[0]}</strong> vehicles as they are high-performing.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
