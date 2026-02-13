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
      const response = await vehicleAPI.getAll();
      const foundVehicle = response.data.find(v => v._id === id);
      setVehicle(foundVehicle);
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!vehicle) return <div className="container">Vehicle not found</div>;

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
        <div className="vehicle-gallery">
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
          {vehicle.images && vehicle.images.length > 1 && (
            <div className="thumbnail-gallery">
              {vehicle.images.map((img, index) => (
                <img 
                  key={index} 
                  src={`http://localhost:5000${img}`} 
                  alt={`${vehicle.name} ${index + 1}`}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
          
          <div className="vehicle-highlights">
            <h3>Key Features</h3>
            <div className="highlights-grid">
              <div className="highlight-item">
                <Car01Icon size={24} />
                <div>
                  <strong>{vehicle.type}</strong>
                  <p>Vehicle Type</p>
                </div>
              </div>
              <div className="highlight-item">
                <UserIcon size={24} />
                <div>
                  <strong>{vehicle.seats} Seater</strong>
                  <p>Capacity</p>
                </div>
              </div>
              <div className="highlight-item">
                <Settings02Icon size={24} />
                <div>
                  <strong>{vehicle.transmission}</strong>
                  <p>Transmission</p>
                </div>
              </div>
              <div className="highlight-item">
                <FuelIcon size={24} />
                <div>
                  <strong>{vehicle.fuelType || 'Petrol'}</strong>
                  <p>Fuel Type</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="detail-info">
          <div className="vehicle-header">
            <h1>{vehicle.name}</h1>
            <p className={`status-badge ${vehicle.available ? 'available' : 'unavailable'}`}>
              {vehicle.available ? <><CheckmarkCircle02Icon size={20} /> Available</> : <><CancelCircleIcon size={20} /> Not Available</>}
            </p>
          </div>
          <p className="detail-type">{vehicle.type} • {vehicle.year}</p>
          <p className="detail-price">₹{vehicle.price} <span className="per-day">/day</span></p>
          
          <div className="info-section">
            <h3><Shield01Icon size={20} /> Vehicle Specifications</h3>
            <div className="specs-list">
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
                <span className="spec-label">Insurance</span>
                <span className="spec-value">{vehicle.insurance || 'Comprehensive'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Registration</span>
                <span className="spec-value">{vehicle.registrationType || 'Individual'}</span>
              </div>
            </div>
          </div>

          {vehicle.available && (
            <div className="booking-section">
              <button onClick={handleBooking} className="btn-book-now">
                {user ? 'Book Now' : 'Sign In to Book'}
              </button>
              {!user && (
                <p className="auth-note">Please sign in to book this vehicle</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
