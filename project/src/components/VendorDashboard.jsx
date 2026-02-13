import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vehicleAPI, bookingAPI } from '../services/api';
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
      const url = editingVehicle ? `http://localhost:5000/api/vehicles/${editingVehicle._id}` : 'http://localhost:5000/api/vehicles';
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
    <div className="dashboard">
      <h1>Vendor Dashboard</h1>
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
          <h3>Revenue</h3>
          <p className="stat-number">₹{vendorBookings.reduce((sum, b) => sum + b.total, 0)}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>My Vehicles</h2>
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn-primary"><Add01Icon size={20} /> Add Vehicle</button>
        </div>

        {showAddForm && !editingVehicle && (
          <form onSubmit={handleAddVehicle} className="add-form">
            <h3>Add New Vehicle</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div><label>Vehicle Name*</label><input type="text" placeholder="Vehicle Name*" value={newVehicle.name} onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})} required /></div>
              <div><label>Type</label><select value={newVehicle.type} onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}>
                <option>Sedan</option><option>SUV</option><option>Hatchback</option><option>Truck</option><option>Electric</option>
              </select></div>
              <div><label>Price per day*</label><input type="number" placeholder="Price per day*" value={newVehicle.price} onChange={(e) => setNewVehicle({...newVehicle, price: e.target.value})} required /></div>
              <div><label>Kilometers</label><input type="number" placeholder="Kilometers" value={newVehicle.kilometers} onChange={(e) => setNewVehicle({...newVehicle, kilometers: e.target.value})} /></div>
              <div><label>Seating Capacity</label><input type="number" placeholder="Seats" value={newVehicle.seats} onChange={(e) => setNewVehicle({...newVehicle, seats: e.target.value})} min="2" max="12" required /></div>
              <div><label>Fuel Type</label><select value={newVehicle.fuelType} onChange={(e) => setNewVehicle({...newVehicle, fuelType: e.target.value})}>
                <option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option><option>Hybrid</option>
              </select></div>
              <div><label>Address/Location*</label><input type="text" placeholder="Full Address" value={newVehicle.location} onChange={(e) => setNewVehicle({...newVehicle, location: e.target.value})} required /></div>
              <div><label>State*</label><select value={newVehicle.state} onChange={(e) => setNewVehicle({...newVehicle, state: e.target.value, city: ''})} required>
                <option value="">Select State</option>
                {states.map(state => <option key={state} value={state}>{state}</option>)}
              </select></div>
              <div><label>City*</label><select value={newVehicle.city} onChange={(e) => setNewVehicle({...newVehicle, city: e.target.value})} required disabled={!newVehicle.state}>
                <option value="">Select City</option>
                {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
              </select></div>
              <div><label>Latitude</label><input type="number" step="any" placeholder="Latitude" value={newVehicle.latitude} onChange={(e) => setNewVehicle({...newVehicle, latitude: e.target.value})} /></div>
              <div><label>Longitude</label><input type="number" step="any" placeholder="Longitude" value={newVehicle.longitude} onChange={(e) => setNewVehicle({...newVehicle, longitude: e.target.value})} /></div>
              <div><label>Manufacturing Year</label><input type="number" placeholder="Manufacturing Year" value={newVehicle.manufacturingYear} onChange={(e) => setNewVehicle({...newVehicle, manufacturingYear: e.target.value})} /></div>
              <div><label>Transmission</label><select value={newVehicle.transmission} onChange={(e) => setNewVehicle({...newVehicle, transmission: e.target.value})}>
                <option>Automatic</option><option>Manual</option><option>CVT</option>
              </select></div>
              <div><label>Color</label><input type="text" placeholder="Color" value={newVehicle.color} onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})} /></div>
              <div><label>Insurance</label><select value={newVehicle.insurance} onChange={(e) => setNewVehicle({...newVehicle, insurance: e.target.value})}>
                <option>Comprehensive</option><option>Third Party</option><option>Expired</option>
              </select></div>
              <div><label>Registration Type</label><select value={newVehicle.registrationType} onChange={(e) => setNewVehicle({...newVehicle, registrationType: e.target.value})}>
                <option>Individual</option><option>Commercial</option>
              </select></div>
            </div>
            <button type="button" onClick={() => setShowLocationPicker(!showLocationPicker)} className="btn-secondary" style={{marginTop: '1rem'}}>
              {showLocationPicker ? 'Hide Map' : 'Select Location on Map'}
            </button>
            {showLocationPicker && <LocationPicker onLocationSelect={handleLocationSelect} initialPosition={newVehicle.latitude && newVehicle.longitude ? [parseFloat(newVehicle.latitude), parseFloat(newVehicle.longitude)] : null} />}
            <div><label>Vehicle Images* (Max 5)</label>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} required />
              {imagePreview.length > 0 && (
                <div className="image-preview-grid">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={preview} alt={`Preview ${index + 1}`} />
                      <button type="button" onClick={() => removeImage(index)} className="remove-image">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit" className="btn-primary">Add</button>
              <button type="button" onClick={() => {setShowAddForm(false); setEditingVehicle(null);}} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle Details</th>
            </tr>
          </thead>
          <tbody>
            {vendorVehicles.map(v => (
              <tr key={v._id}>
                <td colSpan="5">
                  {editingVehicle && editingVehicle._id === v._id ? (
                    <div className="edit-vehicle-form">
                      <form onSubmit={handleAddVehicle}>
                        <h3>Edit Vehicle Details</h3>
                        <div className="form-grid">
                          <div className="form-field"><label>Vehicle Name*</label><input type="text" value={newVehicle.name} onChange={(e) => setNewVehicle({...newVehicle, name: e.target.value})} required /></div>
                          <div className="form-field"><label>Type</label><select value={newVehicle.type} onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}>
                            <option>Sedan</option><option>SUV</option><option>Hatchback</option><option>Truck</option><option>Electric</option>
                          </select></div>
                          <div className="form-field"><label>Price per day*</label><input type="number" value={newVehicle.price} onChange={(e) => setNewVehicle({...newVehicle, price: e.target.value})} required /></div>
                          <div className="form-field"><label>Kilometers</label><input type="number" value={newVehicle.kilometers} onChange={(e) => setNewVehicle({...newVehicle, kilometers: e.target.value})} /></div>
                          <div className="form-field"><label>Seating Capacity</label><input type="number" value={newVehicle.seats} onChange={(e) => setNewVehicle({...newVehicle, seats: e.target.value})} min="2" max="12" /></div>
                          <div className="form-field"><label>Fuel Type</label><select value={newVehicle.fuelType} onChange={(e) => setNewVehicle({...newVehicle, fuelType: e.target.value})}>
                            <option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option><option>Hybrid</option>
                          </select></div>
                          <div className="form-field"><label>Address/Location*</label><input type="text" value={newVehicle.location} onChange={(e) => setNewVehicle({...newVehicle, location: e.target.value})} required /></div>
                          <div className="form-field"><label>State*</label><select value={newVehicle.state} onChange={(e) => setNewVehicle({...newVehicle, state: e.target.value, city: ''})} required>
                            <option value="">Select State</option>
                            {states.map(state => <option key={state} value={state}>{state}</option>)}
                          </select></div>
                          <div className="form-field"><label>City*</label><select value={newVehicle.city} onChange={(e) => setNewVehicle({...newVehicle, city: e.target.value})} required disabled={!newVehicle.state}>
                            <option value="">Select City</option>
                            {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                          </select></div>
                          <div className="form-field"><label>Latitude (GPS)</label><input type="number" step="any" value={newVehicle.latitude} onChange={(e) => setNewVehicle({...newVehicle, latitude: e.target.value})} placeholder="e.g., 13.0827" /></div>
                          <div className="form-field"><label>Longitude (GPS)</label><input type="number" step="any" value={newVehicle.longitude} onChange={(e) => setNewVehicle({...newVehicle, longitude: e.target.value})} placeholder="e.g., 80.2707" /></div>
                          <div className="form-field"><label>Manufacturing Year</label><input type="number" value={newVehicle.manufacturingYear} onChange={(e) => setNewVehicle({...newVehicle, manufacturingYear: e.target.value})} /></div>
                          <div className="form-field"><label>Transmission</label><select value={newVehicle.transmission} onChange={(e) => setNewVehicle({...newVehicle, transmission: e.target.value})}>
                            <option>Automatic</option><option>Manual</option><option>CVT</option>
                          </select></div>
                          <div className="form-field"><label>Color</label><input type="text" value={newVehicle.color} onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})} /></div>
                          <div className="form-field"><label>Insurance</label><select value={newVehicle.insurance} onChange={(e) => setNewVehicle({...newVehicle, insurance: e.target.value})}>
                            <option>Comprehensive</option><option>Third Party</option><option>Expired</option>
                          </select></div>
                          <div className="form-field"><label>Registration Type</label><select value={newVehicle.registrationType} onChange={(e) => setNewVehicle({...newVehicle, registrationType: e.target.value})}>
                            <option>Individual</option><option>Commercial</option>
                          </select></div>
                        </div>
                        <button type="button" onClick={() => setShowLocationPicker(!showLocationPicker)} className="btn-secondary" style={{margin: '1rem 0'}}>
                          {showLocationPicker ? 'Hide Map' : 'Select Location on Map'}
                        </button>
                        {showLocationPicker && <LocationPicker onLocationSelect={handleLocationSelect} initialPosition={newVehicle.latitude && newVehicle.longitude ? [parseFloat(newVehicle.latitude), parseFloat(newVehicle.longitude)] : null} />}
                        <div className="form-field image-field">
                          <label>Vehicle Images* (Max 5)</label>
                          <input type="file" accept="image/*" multiple onChange={handleImageChange} />
                          {imagePreview.length > 0 && (
                            <div className="image-preview-grid">
                              {imagePreview.map((preview, index) => (
                                <div key={index} className="image-preview-item">
                                  <img src={typeof preview === 'string' && preview.startsWith('/uploads') ? `http://localhost:5000${preview}` : preview} alt={`Preview ${index + 1}`} />
                                  <button type="button" onClick={() => removeImage(index)} className="remove-image">×</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="form-buttons">
                          <button type="submit" className="btn-primary">Update</button>
                          <button type="button" onClick={() => setEditingVehicle(null)} className="btn-secondary">Cancel</button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="vehicle-row">
                      <div className="vehicle-info">
                        <div className="vehicle-gallery">
                          <img src={`http://localhost:5000${v.images && v.images[0] ? v.images[0] : '/uploads/default.jpg'}`} alt={v.name} className="vehicle-thumb" />
                          {v.images && v.images.length > 1 && <span className="image-count">+{v.images.length - 1}</span>}
                        </div>
                        <div>
                          <h4>{v.name}</h4>
                          <p>{v.type} • ₹{v.price}/day</p>
                        </div>
                      </div>
                      <div className="vehicle-status">
                        <span className={`badge ${v.available ? 'approved' : 'pending'}`}>{v.available ? 'Available' : 'Unavailable'}</span>
                      </div>
                      <div className="vehicle-actions">
                        <button onClick={() => handleEditVehicle(v)} className="btn-edit"><Edit02Icon size={16} /> Edit</button>
                        <button onClick={() => handleDeleteVehicle(v._id)} className="btn-delete">Delete</button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="dashboard-section">
        <h2>Bookings</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Dates</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendorBookings.map(b => {
              const vehicle = vehicles.find(v => v._id === b.vehicleId);
              return (
                <tr key={b._id}>
                  <td>{vehicle?.name}</td>
                  <td>{b.startDate} to {b.endDate}</td>
                  <td>₹{b.total}</td>
                  <td><span className={`badge ${b.status}`}>{b.status}</span></td>
                  <td>
                    {b.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusUpdate(b._id, 'approved')} className="btn-approve"><CheckmarkCircle02Icon size={18} /> Approve</button>
                        <button onClick={() => handleStatusUpdate(b._id, 'rejected')} className="btn-reject"><CancelCircleIcon size={18} /> Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorDashboard;
