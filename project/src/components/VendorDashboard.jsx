import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vehicleAPI, bookingAPI, BACKEND_URL } from '../services/api';
import { Car01Icon, BookmarkCheck01Icon, DollarCircleIcon, Add01Icon, CheckmarkCircle02Icon, CancelCircleIcon, Edit02Icon } from 'hugeicons-react';
import LocationPicker from './LocationPicker';
import { states, getCitiesByState } from '../data/indianLocations';
import './Dashboard.css';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newVehicle, setNewVehicle] = useState({
    name: '', type: 'Sedan', price: '', seats: 5, transmission: 'Automatic', year: 2024,
    kilometers: 0, fuelType: 'Petrol', registrationYear: 2024, manufacturingYear: 2024,
    owners: 'First', color: 'White', location: '', city: '', state: '', latitude: '', longitude: '',
    insurance: 'Comprehensive', registrationType: 'Individual', images: []
  });
  const [imagePreview, setImagePreview] = useState([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);

  const handleLocationSelect = (locationData) => {
    setNewVehicle({
      ...newVehicle,
      location: locationData.location,
      city: locationData.city,
      state: locationData.state,
      latitude: locationData.latitude,
      longitude: locationData.longitude
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (newVehicle.state) {
      setAvailableCities(getCitiesByState(newVehicle.state));
    } else {
      setAvailableCities([]);
    }
  }, [newVehicle.state]);

  const fetchData = async () => {
    try {
      const [vehiclesRes, bookingsRes] = await Promise.all([
        vehicleAPI.getAll(),
        bookingAPI.getAll()
      ]);
      setVehicles(vehiclesRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const vendorVehicles = vehicles.filter(v => v.vendorId === user.id || v.vendorId._id === user.id);
  const vendorBookings = bookings.filter(b => vendorVehicles.some(v => v._id === b.vehicleId));

  const filteredVehicles = vendorVehicles.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVehicleStatusChange = async (vehicleId, newStatus) => {
    try {
      await vehicleAPI.update(vehicleId, { 
        available: newStatus === 'available',
        onService: newStatus === 'service'
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update vehicle status:', error);
      alert('Failed to update vehicle status');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setNewVehicle({...newVehicle, images: files});
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index) => {
    const newImages = newVehicle.images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setNewVehicle({...newVehicle, images: newImages});
    setImagePreview(newPreviews);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setNewVehicle({
      name: vehicle.name, type: vehicle.type, price: vehicle.price, seats: vehicle.seats,
      transmission: vehicle.transmission, year: vehicle.year, kilometers: vehicle.kilometers || 0,
      fuelType: vehicle.fuelType || 'Petrol', registrationYear: vehicle.registrationYear || vehicle.year,
      manufacturingYear: vehicle.manufacturingYear || vehicle.year, owners: vehicle.owners || 'First',
      color: vehicle.color || 'White', location: vehicle.location || '', city: vehicle.city || '', state: vehicle.state || '',
      latitude: vehicle.latitude || '', longitude: vehicle.longitude || '', insurance: vehicle.insurance || 'Comprehensive',
      registrationType: vehicle.registrationType || 'Individual', images: []
    });
    setImagePreview(vehicle.images || []);
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.price || !newVehicle.location || (newVehicle.images.length === 0 && !editingVehicle)) {
      alert('Please fill all required fields');
      return;
    }
    try {
      const formData = new FormData();
      Object.keys(newVehicle).forEach(key => {
        if (key !== 'images' && newVehicle[key] !== null) formData.append(key, newVehicle[key]);
      });
      newVehicle.images.forEach(image => formData.append('images', image));
      const token = localStorage.getItem('token');
      const url = editingVehicle ? `${BACKEND_URL}/api/vehicles/${editingVehicle._id}` : `${BACKEND_URL}/api/vehicles`;
      const method = editingVehicle ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      if (response.ok) {
        alert(editingVehicle ? 'Vehicle updated!' : 'Vehicle added!');
        setShowAddForm(false); setEditingVehicle(null); setImagePreview([]);
        setNewVehicle({ name: '', type: 'Sedan', price: '', seats: 5, transmission: 'Automatic', year: 2024, kilometers: 0, fuelType: 'Petrol', registrationYear: 2024, manufacturingYear: 2024, owners: 'First', color: 'White', location: '', city: '', state: '', latitude: '', longitude: '', insurance: 'Comprehensive', registrationType: 'Individual', images: [] });
        fetchData();
      } else { const result = await response.json(); alert('Failed: ' + result.message); }
    } catch (error) { alert('Error: ' + error.message); }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleAPI.delete(vehicleId);
        alert('Vehicle deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Failed to delete vehicle:', error);
        alert('Failed to delete vehicle');
      }
    }
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await bookingAPI.update(bookingId, { status });
      fetchData();
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard">
        <h1><Car01Icon size={48} /> Vendor Dashboard</h1>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <Car01Icon size={32} />
            <h3>Total Vehicles</h3>
            <p className="stat-number">{vendorVehicles.length}</p>
          </div>
          <div className="stat-card">
            <BookmarkCheck01Icon size={32} />
            <h3>Total Bookings</h3>
            <p className="stat-number">{vendorBookings.length}</p>
          </div>
          <div className="stat-card">
            <DollarCircleIcon size={32} />
            <h3>Total Revenue</h3>
            <p className="stat-number">₹{vendorBookings.reduce((sum, b) => sum + b.total, 0)}</p>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px'}}>
            <h2>My Fleet</h2>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary">
              <Add01Icon size={20} /> Add New Vehicle
            </button>
          </div>

          <div className="vendor-search-bar">
            <input
              type="text"
              placeholder="Search by vehicle name, type, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {(showAddForm || editingVehicle) && (
            <div className={editingVehicle ? 'edit-vehicle-form' : 'add-form'}>
              <h3>{editingVehicle ? 'Edit Vehicle Details' : 'Register New Vehicle'}</h3>
              <form onSubmit={handleAddVehicle}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Vehicle Name*</label>
                    <input type="text" placeholder="e.g. BMW M4" value={newVehicle.name} onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Vehicle Type</label>
                    <select value={newVehicle.type} onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}>
                      <option>Sedan</option><option>SUV</option><option>Hatchback</option><option>Truck</option><option>Electric</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price Per Day (₹)*</label>
                    <input type="number" placeholder="0.00" value={newVehicle.price} onChange={(e) => setNewVehicle({...newVehicle, price: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Kilometers Driven</label>
                    <input type="number" placeholder="0" value={newVehicle.kilometers} onChange={(e) => setNewVehicle({...newVehicle, kilometers: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Seating Capacity</label>
                    <input type="number" value={newVehicle.seats} onChange={(e) => setNewVehicle({...newVehicle, seats: e.target.value})} min="2" max="12" required />
                  </div>
                  <div className="form-group">
                    <label>Fuel Type</label>
                    <select value={newVehicle.fuelType} onChange={(e) => setNewVehicle({...newVehicle, fuelType: e.target.value})}>
                      <option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option><option>Hybrid</option>
                    </select>
                  </div>
                  <div className="form-group" style={{gridColumn: 'span 2'}}>
                    <label>Pick-up Location Address*</label>
                    <input type="text" placeholder="Full address for the customer" value={newVehicle.location} onChange={(e) => setNewVehicle({...newVehicle, location: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>State*</label>
                    <select value={newVehicle.state} onChange={(e) => setNewVehicle({...newVehicle, state: e.target.value, city: ''})} required>
                      <option value="">Select State</option>
                      {states.map(state => <option key={state} value={state}>{state}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>City*</label>
                    <select value={newVehicle.city} onChange={(e) => setNewVehicle({...newVehicle, city: e.target.value})} required disabled={!newVehicle.state}>
                      <option value="">Select City</option>
                      {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Transmission</label>
                    <select value={newVehicle.transmission} onChange={(e) => setNewVehicle({...newVehicle, transmission: e.target.value})}>
                      <option>Automatic</option><option>Manual</option><option>CVT</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Insurance Type</label>
                    <select value={newVehicle.insurance} onChange={(e) => setNewVehicle({...newVehicle, insurance: e.target.value})}>
                      <option>Comprehensive</option><option>Third Party</option><option>Expired</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions" style={{marginTop: '32px', display: 'flex', gap: '16px'}}>
                  <button type="button" onClick={() => setShowLocationPicker(!showLocationPicker)} className="btn-secondary">
                    {showLocationPicker ? 'Close Map' : 'Pin on Map'}
                  </button>
                </div>

                {showLocationPicker && (
                  <div style={{marginTop: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)'}}>
                    <LocationPicker 
                      onLocationSelect={handleLocationSelect} 
                      initialPosition={newVehicle.latitude && newVehicle.longitude ? [parseFloat(newVehicle.latitude), parseFloat(newVehicle.longitude)] : null} 
                    />
                  </div>
                )}

                <div className="form-group" style={{marginTop: '32px'}}>
                  <label>Vehicle Gallery (Max 5 Images)*</label>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{marginTop: '8px'}} />
                  {imagePreview.length > 0 && (
                    <div className="image-preview-grid">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="image-preview-item">
                          <img src={typeof preview === 'string' && preview.startsWith('/uploads') ? `${BACKEND_URL}${preview}` : preview} alt="Preview" />
                          <button type="button" onClick={() => removeImage(index)} className="remove-image">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-buttons" style={{marginTop: '48px', display: 'flex', gap: '16px'}}>
                  <button type="submit" className="btn-primary" style={{padding: '16px 40px'}}>
                    {editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
                  </button>
                  <button type="button" onClick={() => {setShowAddForm(false); setEditingVehicle(null); setImagePreview([]);}} className="btn-secondary" style={{padding: '16px 40px'}}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle Details</th>
                  <th>Status Control</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map(v => (
                  <tr key={v._id}>
                    <td>
                      <div className="vehicle-info-cell">
                        <div className="vehicle-thumb-container" style={{width: '100px', height: '65px'}}>
                          <img src={`${BACKEND_URL}${v.images?.[0] || '/uploads/default.jpg'}`} alt={v.name} />
                        </div>
                        <div className="vehicle-details-text">
                          <h4>{v.name}</h4>
                          <p>{v.type} • ₹{v.price}/day</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select 
                        className="status-dropdown"
                        value={v.onService ? 'service' : (v.available ? 'available' : 'rented')}
                        onChange={(e) => handleVehicleStatusChange(v._id, e.target.value)}
                        style={{background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--glass-border)', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer'}}
                      >
                        <option value="available">Available</option>
                        <option value="service">On Service</option>
                        <option value="rented">Rented</option>
                      </select>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button onClick={() => handleEditVehicle(v)} className="btn-action btn-edit">
                          <Edit02Icon size={16} /> Edit
                        </button>
                        <button onClick={() => handleDeleteVehicle(v._id)} className="btn-action btn-delete">
                          <CancelCircleIcon size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recent Bookings</h2>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Booking Period</th>
                  <th>Earnings</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vendorBookings.map(b => {
                  const vehicle = vehicles.find(v => v._id === b.vehicleId);
                  return (
                    <tr key={b._id}>
                      <td><div style={{fontWeight: '600'}}>{vehicle?.name || 'Unknown'}</div></td>
                      <td style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>
                        {new Date(b.startDate).toLocaleDateString()} to {new Date(b.endDate).toLocaleDateString()}
                      </td>
                      <td style={{fontWeight: '700', color: 'white'}}>₹{b.total}</td>
                      <td><span className={`badge ${b.status}`}>{b.status}</span></td>
                      <td>
                        {b.status === 'pending' && (
                          <div className="btn-group">
                            <button onClick={() => handleStatusUpdate(b._id, 'approved')} className="btn-action btn-approve">Approve</button>
                            <button onClick={() => handleStatusUpdate(b._id, 'rejected')} className="btn-action btn-reject">Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
