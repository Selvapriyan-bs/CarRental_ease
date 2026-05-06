import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehicleAPI, bookingAPI } from '../services/api';
import { Search01Icon, Car01Icon, DollarCircleIcon, Calendar03Icon, ChartLineData01Icon, Location01Icon } from 'hugeicons-react';
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
  const [managedVehicleId, setManagedVehicleId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
    if (user && user.role === 'vendor') {
      fetchBookings();
    }
  }, [user]);

  const handleVehicleStatusChange = async (vehicleId, newStatus) => {
    try {
      await vehicleAPI.update(vehicleId, { 
        available: newStatus === 'available',
        onService: newStatus === 'service'
      });
      fetchVehicles();
    } catch (error) {
      console.error('Failed to update vehicle status:', error);
      alert('Failed to update vehicle status');
    }
  };

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

  // Vendor analytics - Synchronized with status fields
  const vendorVehicles = user && user.role === 'vendor' ? vehicles.filter(v => v.vendorId === user.id || (v.vendorId._id && v.vendorId._id === user.id)) : [];
  const vendorBookings = user && user.role === 'vendor' ? bookings.filter(b => vendorVehicles.some(v => v._id === b.vehicleId)) : [];
  
  const availableVehicles = vendorVehicles.filter(v => v.available && !v.onService);
  const onServiceVehicles = vendorVehicles.filter(v => v.onService);
  const rentedVehicles = vendorVehicles.filter(v => !v.available && !v.onService);
  
  // Expected returns today
  const today = new Date().toISOString().split('T')[0];
  const expectedReturnsToday = vendorBookings.filter(b => {
    if (b.status === 'approved' && b.endDate) {
      const endDate = new Date(b.endDate).toISOString().split('T')[0];
      return endDate === today;
    }
    return false;
  });
  
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
        <section className="hero-modern" style={{padding: '140px 24px 60px'}}>
          <h1>Fleet Analytics</h1>
          <p>Real-time performance overview of your rental business</p>
        </section>

        <div className="vendor-tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`tab ${activeTab === 'available' ? 'active' : ''}`} onClick={() => setActiveTab('available')}>Available</button>
          <button className={`tab ${activeTab === 'rented' ? 'active' : ''}`} onClick={() => setActiveTab('rented')}>Rented</button>
          <button className={`tab ${activeTab === 'service' ? 'active' : ''}`} onClick={() => setActiveTab('service')}>On Service</button>
          <button className={`tab ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => setActiveTab('returns')}>Returns</button>
        </div>

        <div className="vendor-overview" style={{maxWidth: '1400px', margin: '0 auto', padding: '0 24px'}}>
          {activeTab === 'overview' && (
            <>
              <div className="stats-grid" style={{marginBottom: '64px'}}>
                <div className="stat-card" onClick={() => setActiveTab('available')} style={{cursor: 'pointer'}}>
                  <Car01Icon size={40} />
                  <h3>Available</h3>
                  <p className="stat-number">{availableVehicles.length}</p>
                  <span className="stat-label">Units Ready</span>
                </div>
                <div className="stat-card" onClick={() => setActiveTab('rented')} style={{cursor: 'pointer'}}>
                  <ChartLineData01Icon size={40} />
                  <h3>Currently Rented</h3>
                  <p className="stat-number">{rentedVehicles.length}</p>
                  <span className="stat-label">Active Bookings</span>
                </div>
                <div className="stat-card" onClick={() => setActiveTab('service')} style={{cursor: 'pointer'}}>
                  <Calendar03Icon size={40} />
                  <h3>Maintenance</h3>
                  <p className="stat-number">{onServiceVehicles.length}</p>
                  <span className="stat-label">On Service</span>
                </div>
                <div className="stat-card" onClick={() => setActiveTab('returns')} style={{cursor: 'pointer'}}>
                  <DollarCircleIcon size={40} />
                  <h3>Returns Today</h3>
                  <p className="stat-number">{expectedReturnsToday.length}</p>
                  <span className="stat-label">Due Today</span>
                </div>
              </div>

              <div className="vendor-section">
                <div className="section-header">
                  <h2>All Managed Vehicles ({vendorVehicles.length})</h2>
                </div>
                <div className="vehicles-grid">
                  {vendorVehicles.map(vehicle => (
                    <div key={vehicle._id} className="vehicle-card-modern">
                      <div className="vehicle-image-container">
                        <img src={`http://localhost:5000${vehicle.images?.[0] || '/uploads/default.jpg'}`} alt={vehicle.name} />
                        <span className="status-badge" style={{
                          background: vehicle.onService ? '#f59e0b' : (vehicle.available ? '#22c55e' : '#3b82f6')
                        }}>
                          {vehicle.onService ? 'SERVICE' : (vehicle.available ? 'AVAILABLE' : 'RENTED')}
                        </span>
                      </div>
                      <div className="vehicle-info">
                        <div className="vehicle-header">
                          <span className="vehicle-type-badge">{vehicle.type}</span>
                          <h3>{vehicle.name}</h3>
                        </div>
                        <div className="vehicle-specs-row">
                          <span>{vehicle.seats} Seats</span>
                          <span className="spec-divider">•</span>
                          <span>{vehicle.transmission}</span>
                          <span className="spec-divider">•</span>
                          <span>{vehicle.year}</span>
                        </div>
                        <div className="vehicle-footer">
                          <span className="vehicle-price">₹{vehicle.price}<span>/day</span></span>
                          {managedVehicleId === vehicle._id ? (
                            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                              <select 
                                className="status-dropdown"
                                value={vehicle.onService ? 'service' : (vehicle.available ? 'available' : 'rented')}
                                onChange={(e) => handleVehicleStatusChange(vehicle._id, e.target.value)}
                                style={{
                                  background: 'rgba(255,255,255,0.05)', 
                                  color: 'white', 
                                  border: '1px solid var(--glass-border)', 
                                  padding: '6px 10px', 
                                  borderRadius: '8px',
                                  fontSize: '0.85rem'
                                }}
                              >
                                <option value="available">Available</option>
                                <option value="service">Service</option>
                                <option value="rented">Rented</option>
                              </select>
                              <button onClick={() => navigate('/dashboard')} className="btn-details" style={{padding: '8px 12px'}}>Edit</button>
                              <button onClick={() => setManagedVehicleId(null)} className="btn-details" style={{padding: '8px 12px', opacity: 0.7}}>✕</button>
                            </div>
                          ) : (
                            <button onClick={() => setManagedVehicleId(vehicle._id)} className="btn-details">Manage</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab !== 'overview' && (
            <div className="vendor-section">
              <div className="section-header">
                <h2>
                  {activeTab === 'available' && 'Available Fleet'}
                  {activeTab === 'rented' && 'Active Rentals'}
                  {activeTab === 'service' && 'Service Queue'}
                  {activeTab === 'returns' && 'Expected Today'}
                </h2>
              </div>
              
              <div className="vehicles-grid">
                {(activeTab === 'available' ? availableVehicles : 
                  activeTab === 'rented' ? rentedVehicles : 
                  activeTab === 'service' ? onServiceVehicles : 
                  expectedReturnsToday.map(b => vendorVehicles.find(v => v._id === b.vehicleId)).filter(Boolean)
                ).map(vehicle => (
                  <div key={vehicle._id} className="vehicle-card-modern">
                    <div className="vehicle-image-container">
                      <img src={`http://localhost:5000${vehicle.images?.[0] || '/uploads/default.jpg'}`} alt={vehicle.name} />
                      <span className="status-badge" style={{
                        background: vehicle.onService ? '#f59e0b' : (vehicle.available ? '#22c55e' : '#3b82f6')
                      }}>
                        {vehicle.onService ? 'SERVICE' : (vehicle.available ? 'AVAILABLE' : 'RENTED')}
                      </span>
                    </div>
                    <div className="vehicle-info">
                      <div className="vehicle-header">
                        <span className="vehicle-type-badge">{vehicle.type}</span>
                        <h3>{vehicle.name}</h3>
                      </div>
                      <div className="vehicle-specs-row">
                        <span>{vehicle.seats} Seats</span>
                        <span className="spec-divider">•</span>
                        <span>{vehicle.transmission}</span>
                        <span className="spec-divider">•</span>
                        <span>{vehicle.year}</span>
                      </div>
                      <div className="vehicle-footer">
                        <span className="vehicle-price">₹{vehicle.price}<span>/day</span></span>
                        {managedVehicleId === vehicle._id ? (
                          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                            <select 
                              className="status-dropdown"
                              value={vehicle.onService ? 'service' : (vehicle.available ? 'available' : 'rented')}
                              onChange={(e) => handleVehicleStatusChange(vehicle._id, e.target.value)}
                              style={{
                                background: 'rgba(255,255,255,0.05)', 
                                color: 'white', 
                                border: '1px solid var(--glass-border)', 
                                padding: '6px 10px', 
                                borderRadius: '8px',
                                fontSize: '0.85rem'
                              }}
                            >
                              <option value="available">Available</option>
                              <option value="service">Service</option>
                              <option value="rented">Rented</option>
                            </select>
                            <button onClick={() => navigate('/dashboard')} className="btn-details" style={{padding: '8px 12px'}}>Edit</button>
                            <button onClick={() => setManagedVehicleId(null)} className="btn-details" style={{padding: '8px 12px', opacity: 0.7}}>✕</button>
                          </div>
                        ) : (
                          <button onClick={() => setManagedVehicleId(vehicle._id)} className="btn-details">Manage</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {(activeTab === 'available' ? availableVehicles : 
                activeTab === 'rented' ? rentedVehicles : 
                activeTab === 'service' ? onServiceVehicles : 
                expectedReturnsToday
              ).length === 0 && (
                <div style={{textAlign: 'center', padding: '100px 0'}}>
                  <p style={{fontSize: '1.2rem', color: 'var(--text-secondary)'}}>No records found for this category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      {showLocationModal && (
        <div className="location-modal-overlay">
          <div className="location-modal">
            <div className="modal-header">
              <h2>Select Your Location</h2>
              <button className="close-modal" onClick={() => setShowLocationModal(false)}>✕</button>
            </div>
            <p className="modal-desc">Find premium vehicles in your city</p>
            
            <div className="location-form">
              <div className="input-group">
                <label>State</label>
                <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)} className="location-select">
                  <option value="">Select State</option>
                  {states.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label>City</label>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="location-select" disabled={!selectedState}>
                  <option value="">Select City</option>
                  {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              
              <div className="popular-cities">
                <label>Popular Cities</label>
                <div className="city-chips">
                  {['Mumbai', 'Delhi', 'Bangalore', 'Goa', 'Chennai', 'Hyderabad'].map(city => (
                    <button 
                      key={city} 
                      className={`city-chip ${selectedCity === city ? 'active' : ''}`}
                      onClick={() => {
                        const cityState = states.find(s => getCitiesByState(s).includes(city));
                        if(cityState) {
                          setSelectedState(cityState);
                          setSelectedCity(city);
                        }
                      }}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleSaveLocation} className="btn-save-location">
                Explore Vehicles in {selectedCity || 'Your Area'}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="hero-modern">
        <div className="hero-content">
          <h1>Your journey starts here</h1>
          <p>Discover and book the perfect vehicle for your next adventure</p>
          
          <div className="search-card">
            <div className="search-row">
              <div className="search-field">
                <div className="field-content">
                  <label><Location01Icon size={16} /> State</label>
                  <select value={selectedState} onChange={(e) => handleStateChange(e.target.value)}>
                    <option value="">Select State</option>
                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
              </div>
              <div className="search-field">
                <div className="field-content">
                  <label><ChartLineData01Icon size={16} /> City</label>
                  <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedState}>
                    <option value="">Select City</option>
                    {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
              </div>
              <div className="search-field">
                <div className="field-content">
                  <label><Car01Icon size={16} /> Type</label>
                  <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    {types.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              </div>
              <button className="search-btn">
                <Search01Icon size={20} />
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="quick-search">
        <div className="search-box-inline">
          <Search01Icon size={20} />
          <input
            type="text"
            placeholder="Quick search by name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section className="vehicles-section">
        <div className="section-header">
          <h2>Available Fleet</h2>
          <p>{filteredVehicles.length} premium vehicles near you</p>
        </div>
        <div className="vehicles-grid">
          {filteredVehicles.map(vehicle => (
            <div key={vehicle._id} className="vehicle-card-modern">
              <div className="vehicle-image-container">
                <img src={`http://localhost:5000${vehicle.images && vehicle.images[0] ? vehicle.images[0] : vehicle.image || '/uploads/default.jpg'}`} alt={vehicle.name} />
                {vehicle.images && vehicle.images.length > 1 && (
                  <span className="image-count">{vehicle.images.length} Photos</span>
                )}
                <span className="status-badge" style={{background: 'var(--primary)'}}>Available</span>
              </div>
              <div className="vehicle-info">
                <div className="vehicle-header">
                  <span className="vehicle-type-badge">{vehicle.type}</span>
                  <h3>{vehicle.name}</h3>
                </div>
                <div className="vehicle-specs-row">
                  <span className="spec-item">{vehicle.seats} Seats</span>
                  <span className="spec-divider">•</span>
                  <span className="spec-item">{vehicle.transmission}</span>
                  <span className="spec-divider">•</span>
                  <span className="spec-item">{vehicle.year}</span>
                </div>
                <p className="vehicle-location">
                  <Location01Icon size={16} /> 
                  {vehicle.city}, {vehicle.state}
                </p>
                <div className="vehicle-footer">
                  <span className="vehicle-price">₹{vehicle.price}<span>/day</span></span>
                  <div className="card-actions">
                    <Link to={`/vehicle/${vehicle._id}`} className="btn-details">Details</Link>
                    {user && user.role === 'user' && (
                      <button onClick={() => handleQuickBook(vehicle._id)} className="btn-book-modern">Book</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
