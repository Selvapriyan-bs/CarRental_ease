import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehicleAPI, bookingAPI } from '../services/api';
import { Search01Icon, FilterIcon, Car01Icon, DollarCircleIcon, Calendar03Icon, ChartLineData01Icon } from 'hugeicons-react';
import { states, getCitiesByState } from '../data/indianLocations';
import './Home.css';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedCity, setSelectedCity] = useState(localStorage.getItem('userCity') || '');
  const [selectedState, setSelectedState] = useState(localStorage.getItem('userState') || '');
  const [showLocationModal, setShowLocationModal] = useState(!localStorage.getItem('userCity'));
  const [availableCities, setAvailableCities] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
    if (user && user.role === 'vendor') {
      fetchBookings();
    }
  }, [user]);

  useEffect(() => {
    if (selectedState) {
      setAvailableCities(getCitiesByState(selectedState));
    } else {
      setAvailableCities([]);
    }
  }, [selectedState]);

  const fetchVehicles = async () => {
    try {
      const response = await vehicleAPI.getAll();
      setVehicles(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAll();
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const handleQuickBook = (vehicleId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'user') {
      alert('Only users can book vehicles');
      return;
    }
    navigate(`/payment/${vehicleId}`);
  };

  // Vendor analytics
  const vendorVehicles = user && user.role === 'vendor' ? vehicles.filter(v => v.vendorId === user.id || (v.vendorId._id && v.vendorId._id === user.id)) : [];
  const vendorBookings = user && user.role === 'vendor' ? bookings.filter(b => vendorVehicles.some(v => v._id === b.vehicleId)) : [];
  const rentedVehicles = vendorVehicles.filter(v => vendorBookings.some(b => b.vehicleId === v._id && b.status === 'approved'));
  const availableVehicles = vendorVehicles.filter(v => !rentedVehicles.some(rv => rv._id === v._id));
  const monthlyRevenue = vendorBookings.reduce((sum, b) => sum + (b.status === 'approved' ? b.total : 0), 0);

  const handleSaveLocation = () => {
    if (selectedCity && selectedState) {
      localStorage.setItem('userCity', selectedCity);
      localStorage.setItem('userState', selectedState);
      setShowLocationModal(false);
    } else {
      alert('Please select both city and state');
    }
  };

  const handleChangeLocation = () => {
    setShowLocationModal(true);
  };

  const handleStateChange = (state) => {
    setSelectedState(state);
    setSelectedCity('');
  };

  const filteredVehicles = vehicles.filter(v => 
    v.available &&
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === '' || v.type === filterType) &&
    (selectedCity === '' || v.city?.toLowerCase() === selectedCity.toLowerCase()) &&
    (selectedState === '' || v.state?.toLowerCase() === selectedState.toLowerCase())
  );

  const types = [...new Set(vehicles.map(v => v.type))];

  if (user && user.role === 'vendor') {
    return (
      <div className="home vendor-home">
        <section className="hero">
          <h1>Vendor Dashboard</h1>
          <p>Manage your fleet and track performance</p>
        </section>

        <div className="vendor-tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab ${activeTab === 'rented' ? 'active' : ''}`} onClick={() => setActiveTab('rented')}>Rented Vehicles</button>
          <button className={`tab ${activeTab === 'available' ? 'active' : ''}`} onClick={() => setActiveTab('available')}>Available Vehicles</button>
          <button className={`tab ${activeTab === 'revenue' ? 'active' : ''}`} onClick={() => setActiveTab('revenue')}>Revenue</button>
        </div>

        {activeTab === 'overview' && (
          <div className="vendor-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <Car01Icon size={32} />
                <h3>Total Vehicles</h3>
                <p className="stat-number">{vendorVehicles.length}</p>
              </div>
              <div className="stat-card">
                <ChartLineData01Icon size={32} />
                <h3>Currently Rented</h3>
                <p className="stat-number">{rentedVehicles.length}</p>
              </div>
              <div className="stat-card">
                <Calendar03Icon size={32} />
                <h3>Available</h3>
                <p className="stat-number">{availableVehicles.length}</p>
              </div>
              <div className="stat-card">
                <DollarCircleIcon size={32} />
                <h3>Monthly Revenue</h3>
                <p className="stat-number">₹{monthlyRevenue}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rented' && (
          <div className="vendor-section">
            <h2>Currently Rented Vehicles ({rentedVehicles.length})</h2>
            {rentedVehicles.length === 0 ? (
              <p>No vehicles currently rented</p>
            ) : (
              <div className="vehicles-grid">
                {rentedVehicles.map(vehicle => (
                  <div key={vehicle._id} className="vehicle-card rented">
                    <div className="vehicle-image-container">
                      <img src={`http://localhost:5000${vehicle.images && vehicle.images[0] ? vehicle.images[0] : vehicle.image || '/uploads/default.jpg'}`} alt={vehicle.name} />
                      <span className="status-badge rented">Rented</span>
                    </div>
                    <h3>{vehicle.name}</h3>
                    <p className="vehicle-type">{vehicle.type} • {vehicle.year}</p>
                    <p className="vehicle-price">₹{vehicle.price}/day</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'available' && (
          <div className="vendor-section">
            <h2>Available Vehicles ({availableVehicles.length})</h2>
            {availableVehicles.length === 0 ? (
              <p>No vehicles available</p>
            ) : (
              <div className="vehicles-grid">
                {availableVehicles.map(vehicle => (
                  <div key={vehicle._id} className="vehicle-card available">
                    <div className="vehicle-image-container">
                      <img src={`http://localhost:5000${vehicle.images && vehicle.images[0] ? vehicle.images[0] : vehicle.image || '/uploads/default.jpg'}`} alt={vehicle.name} />
                      <span className="status-badge available">Available</span>
                    </div>
                    <h3>{vehicle.name}</h3>
                    <p className="vehicle-type">{vehicle.type} • {vehicle.year}</p>
                    <p className="vehicle-price">₹{vehicle.price}/day</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="vendor-section">
            <h2>Revenue Details</h2>
            <div className="revenue-summary">
              <div className="revenue-card">
                <h3>Total Bookings</h3>
                <p>{vendorBookings.length}</p>
              </div>
              <div className="revenue-card">
                <h3>Approved Bookings</h3>
                <p>{vendorBookings.filter(b => b.status === 'approved').length}</p>
              </div>
              <div className="revenue-card">
                <h3>Monthly Revenue</h3>
                <p>₹{monthlyRevenue}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="home">
      {showLocationModal && (
        <div className="location-modal-overlay">
          <div className="location-modal">
            <h2>Select Your Location</h2>
            <p>Choose your city and state to find vehicles near you</p>
            <div className="location-form">
              <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)} className="location-select">
                <option value="">Select State</option>
                {states.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="location-select" disabled={!selectedState}>
                <option value="">Select City</option>
                {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
              <button onClick={handleSaveLocation} className="btn-save-location">Save Location</button>
            </div>
          </div>
        </div>
      )}

      <section className="hero">
        <h1>Find Your Perfect Ride</h1>
        <p>Book quality vehicles at affordable prices</p>
        {selectedCity && selectedState && (
          <div className="current-location">
            <span>📍 {selectedCity}, {selectedState}</span>
            <button onClick={handleChangeLocation} className="btn-change-location">Change Location</button>
          </div>
        )}
      </section>

      <section className="search-section">
        <div className="search-box">
          <Search01Icon size={20} />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-box">
          <FilterIcon size={20} />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
            <option value="">All Types</option>
            {types.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
      </section>

      <section className="vehicles-grid">
        {filteredVehicles.map(vehicle => (
          <div key={vehicle._id} className="vehicle-card">
            <div className="vehicle-image-container">
              <img src={`http://localhost:5000${vehicle.images && vehicle.images[0] ? vehicle.images[0] : vehicle.image || '/uploads/default.jpg'}`} alt={vehicle.name} />
              {vehicle.images && vehicle.images.length > 1 && (
                <span className="image-count">+{vehicle.images.length - 1}</span>
              )}
            </div>
            <h3>{vehicle.name}</h3>
            <p className="vehicle-type">{vehicle.type} • {vehicle.year}</p>
            <p className="vehicle-details">{vehicle.seats} Seats • {vehicle.transmission}</p>
            <p className="vehicle-location">📍 {vehicle.location}</p>
            <p className="vehicle-price">₹{vehicle.price}/day</p>
            <div className="card-buttons">
              <Link to={`/vehicle/${vehicle._id}`} className="btn-view">View Details</Link>
              {user && user.role === 'user' && (
                <button onClick={() => handleQuickBook(vehicle._id)} className="btn-book">Book Now</button>
              )}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
