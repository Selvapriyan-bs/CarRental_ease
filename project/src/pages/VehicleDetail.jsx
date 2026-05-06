import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehicleAPI, bookingAPI } from '../services/api';
import { Calendar03Icon, UserIcon, Settings02Icon, CheckmarkCircle02Icon, CancelCircleIcon, Car01Icon, FuelIcon, Shield01Icon, ArrowLeft01Icon, ArrowRight01Icon } from 'hugeicons-react';
import './VehicleDetail.css';

const VehicleDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await vehicleAPI.getAll();
      const foundVehicle = response.data.find(v => v._id === id);
      if (foundVehicle) {
        console.log('Vehicle found:', foundVehicle);
        setVehicle(foundVehicle);
      } else {
        console.error('Vehicle not found with id:', id);
      }
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="vehicle-detail"><div className="detail-container" style={{padding: '3rem', textAlign: 'center', fontSize: '1.2rem'}}>Loading vehicle details...</div></div>;
  if (!vehicle) return <div className="vehicle-detail"><div className="detail-container" style={{padding: '3rem', textAlign: 'center', fontSize: '1.2rem', color: '#e74c3c'}}>Vehicle not found. Please check the vehicle ID.</div></div>;

  const handleBooking = () => {
    if (!user) {
      // Store current location for redirect after login
      localStorage.setItem('redirectAfterLogin', `/payment/${vehicle._id}`);
      navigate('/login');
      return;
    }
    if (user.role !== 'user') {
      alert('Only users can book vehicles');
      return;
    }
    navigate(`/payment/${vehicle._id}`);
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) => 
      prev === 0 ? (vehicle.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => 
      prev === (vehicle.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="vehicle-detail">
      {showLightbox && (
        <div className="lightbox" onClick={() => setShowLightbox(false)}>
          <button className="close-btn" onClick={() => setShowLightbox(false)}>×</button>
          <button className="arrow-btn left" onClick={(e) => {e.stopPropagation(); handlePrevImage();}}>
            <ArrowLeft01Icon size={24} />
          </button>
          <button className="arrow-btn right" onClick={(e) => {e.stopPropagation(); handleNextImage();}}>
            <ArrowRight01Icon size={24} />
          </button>
          <img 
            src={`http://localhost:5000${vehicle.images && vehicle.images[selectedImage] ? vehicle.images[selectedImage] : vehicle.image || '/uploads/default.jpg'}`} 
            alt={vehicle.name}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <div className="detail-container">
        <div className="image-gallery">
          <div className="main-image">
            {vehicle.images && vehicle.images.length > 1 && (
              <>
                <button className="arrow-btn left" onClick={handlePrevImage}>
                  <ArrowLeft01Icon size={24} />
                </button>
                <button className="arrow-btn right" onClick={handleNextImage}>
                  <ArrowRight01Icon size={24} />
                </button>
              </>
            )}
            <img 
              src={`http://localhost:5000${vehicle.images && vehicle.images[selectedImage] ? vehicle.images[selectedImage] : vehicle.image || '/uploads/default.jpg'}`} 
              alt={vehicle.name}
              onClick={() => setShowLightbox(true)}
              style={{cursor: 'pointer'}}
            />
          </div>
          {/* Removed thumbnail-grid to avoid double image look */}
          
          
          <div className="specs-grid">
            <div className="spec-box">
              <Car01Icon size={24} />
              <div className="spec-info">
                <label>Vehicle Type</label>
                <span>{vehicle.type}</span>
              </div>
            </div>
            <div className="spec-box">
              <UserIcon size={24} />
              <div className="spec-info">
                <label>Capacity</label>
                <span>{vehicle.seats} Seater</span>
              </div>
            </div>
            <div className="spec-box">
              <Settings02Icon size={24} />
              <div className="spec-info">
                <label>Transmission</label>
                <span>{vehicle.transmission}</span>
              </div>
            </div>
            <div className="spec-box">
              <FuelIcon size={24} />
              <div className="spec-info">
                <label>Fuel Type</label>
                <span>{vehicle.fuelType || 'Petrol'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="info-content">
          <div className="info-header">
            <h1>{vehicle.name}</h1>
            <p className={`status-badge ${vehicle.onService ? 'service' : (vehicle.available ? 'available' : 'unavailable')}`}>
              {vehicle.onService ? (
                <><Settings02Icon size={20} /> In Service</>
              ) : vehicle.available ? (
                <><CheckmarkCircle02Icon size={20} /> Available</>
              ) : (
                <><CancelCircleIcon size={20} /> Currently Rented</>
              )}
            </p>
          </div>
          <div className="type-year">
            <span>{vehicle.type}</span>
            <span>•</span>
            <span>{vehicle.manufacturingYear || vehicle.year}</span>
          </div>
          
          <div className="info-section">
            <h3><Shield01Icon size={20} /> Vehicle Specifications</h3>
            <div className="specs-list">
              <div className="spec-row">
                <span className="spec-label">Vehicle Name</span>
                <span className="spec-value">{vehicle.name}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Type</span>
                <span className="spec-value">{vehicle.type}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Seats</span>
                <span className="spec-value">{vehicle.seats} Seater</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Transmission</span>
                <span className="spec-value">{vehicle.transmission}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Color</span>
                <span className="spec-value">{vehicle.color || 'Not specified'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Manufacturing Year</span>
                <span className="spec-value">{vehicle.manufacturingYear || vehicle.year}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Kilometers Driven</span>
                <span className="spec-value">{vehicle.kilometers || 0} km</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Fuel Type</span>
                <span className="spec-value">{vehicle.fuelType || 'Petrol'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Insurance</span>
                <span className="spec-value">{vehicle.insurance || 'Comprehensive'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Registration</span>
                <span className="spec-value">{vehicle.registrationType || 'Individual'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Location</span>
                <span className="spec-value">{vehicle.city}, {vehicle.state}</span>
              </div>
            </div>
          </div>

          <div className="price-booking">
            <div className="price-detail">
              <span className="amount">₹{vehicle.price}</span>
              <span className="unit">/day</span>
            </div>
            {vehicle.available && !vehicle.onService && (
              <button onClick={handleBooking} className="btn-book-large">
                {user ? 'Book Now' : 'Sign In to Book'}
              </button>
            )}
            {(vehicle.onService || !vehicle.available) && (
              <button className="btn-book-large disabled" disabled>
                {vehicle.onService ? 'Under Maintenance' : 'Already Rented'}
              </button>
            )}
            {!user && vehicle.available && (
              <p className="auth-note" style={{textAlign: 'center', marginTop: '10px', color: 'var(--text-secondary)'}}>Please sign in to book this vehicle</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
