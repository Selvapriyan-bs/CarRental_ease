import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vehicleAPI, bookingAPI } from '../services/api';
import { Calendar03Icon, CreditCardIcon, UserIcon, QrCode01Icon, SmartPhone01Icon } from 'hugeicons-react';
import './Payment.css';

const Payment = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    days: 0,
    total: 0
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    if (!user || user.role !== 'user') {
      navigate('/login');
      return;
    }
    fetchVehicle();
    
    return () => {
      document.body.removeChild(script);
    };
  }, [id, user, navigate]);

  const fetchVehicle = async () => {
    try {
      const response = await vehicleAPI.getAll();
      const foundVehicle = response.data.find(v => v._id === id);
      setVehicle(foundVehicle);
    } catch (error) {
      console.error('Failed to fetch vehicle:', error);
    }
  };

  const calculateTotal = () => {
    if (bookingData.startDate && bookingData.endDate) {
      const days = Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24));
      const total = days * vehicle.price;
      setBookingData(prev => ({ ...prev, days, total }));
    }
  };

  useEffect(() => {
    if (vehicle && bookingData.startDate && bookingData.endDate) {
      calculateTotal();
    }
  }, [bookingData.startDate, bookingData.endDate, vehicle]);

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!bookingData.startDate || !bookingData.endDate || bookingData.total === 0) {
      alert('Please select valid booking dates');
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: bookingData.total })
      });
      
      const { orderId, key, amount } = await response.json();
      
      // Razorpay payment options
      const options = {
        key: key,
        amount: amount,
        currency: 'INR',
        name: 'Car Rental Service',
        description: `Booking for ${vehicle.name}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // For mock key, skip verification
            if (key === 'rzp_test_mock_key') {
              await bookingAPI.create({
                vehicleId: vehicle._id,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                total: bookingData.total,
                paymentId: `pay_${Date.now()}`
              });
              alert('Payment successful! Booking confirmed.');
              navigate('/dashboard');
              return;
            }
            
            // Real payment verification
            const verifyResponse = await fetch('http://localhost:5000/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success) {
              await bookingAPI.create({
                vehicleId: vehicle._id,
                startDate: bookingData.startDate,
                endDate: bookingData.endDate,
                total: bookingData.total,
                paymentId: response.razorpay_payment_id
              });
              alert('Payment successful! Booking confirmed.');
              navigate('/dashboard');
            } else {
              alert('Payment verification failed!');
            }
          } catch (error) {
            console.error('Verification error:', error);
            alert('Payment verification failed!');
          }
          setLoading(false);
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '9999999999'
        },
        theme: {
          color: '#3498db'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };
      
      if (!window.Razorpay) {
        alert('Razorpay SDK not loaded. Please refresh the page.');
        setLoading(false);
        return;
      }
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        alert('Payment failed: ' + response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!vehicle) return <div className="container">Loading...</div>;

  return (
    <div className="payment-container">
      <div className="payment-content">
        <div className="vehicle-summary">
          <img src={`http://localhost:5000${vehicle.image}`} alt={vehicle.name} />
          <div className="vehicle-info">
            <h2>{vehicle.name}</h2>
            <p>{vehicle.type} • {vehicle.year}</p>
            <p className="price">₹{vehicle.price}/day</p>
          </div>
        </div>

        <form onSubmit={handlePayment} className="payment-form">
          <h3>Booking Details</h3>
          
          <div className="form-group">
            <label><Calendar03Icon size={20} /> Start Date</label>
            <input
              type="date"
              value={bookingData.startDate}
              onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label><Calendar03Icon size={20} /> End Date</label>
            <input
              type="date"
              value={bookingData.endDate}
              onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
              min={bookingData.startDate}
              required
            />
          </div>

          {bookingData.days > 0 && (
            <div className="booking-summary">
              <p>Duration: {bookingData.days} days</p>
              <p className="total">Total Amount: ₹{bookingData.total}</p>
            </div>
          )}

          <h3>Payment Method</h3>
          
          <div className="payment-methods">
            <div className={`payment-option ${paymentMethod === 'upi' ? 'active' : ''}`} 
                 onClick={() => setPaymentMethod('upi')}>
              <SmartPhone01Icon size={24} />
              <span>UPI Payment</span>
            </div>
            <div className={`payment-option ${paymentMethod === 'qr' ? 'active' : ''}`} 
                 onClick={() => setPaymentMethod('qr')}>
              <QrCode01Icon size={24} />
              <span>QR Code</span>
            </div>
            <div className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`} 
                 onClick={() => setPaymentMethod('card')}>
              <CreditCardIcon size={24} />
              <span>Cards & More</span>
            </div>
          </div>

          {paymentMethod === 'upi' && (
            <div className="upi-section">
              <div className="form-group">
                <label><SmartPhone01Icon size={20} /> UPI ID (Optional)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@paytm / yourname@gpay"
                />
              </div>
              <div className="upi-apps">
                <p>Or pay using your favorite UPI app:</p>
                <div className="upi-icons">
                  <span>📱 GPay</span>
                  <span>💳 PhonePe</span>
                  <span>🏦 Paytm</span>
                  <span>💰 BHIM</span>
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'qr' && (
            <div className="qr-section">
              <div className="qr-info">
                <QrCode01Icon size={48} />
                <p>Scan QR code with any UPI app to pay</p>
                <p className="qr-note">QR code will be generated after clicking Pay button</p>
              </div>
            </div>
          )}

          <div className="payment-info">
            <p>🔒 Secure payment powered by Razorpay</p>
            <p>💳 UPI • Cards • Net Banking • Wallets</p>
            <p>📱 Instant payment confirmation</p>
          </div>

          <button type="submit" className="btn-pay" disabled={loading || bookingData.total === 0}>
            {loading ? 'Processing...' : 
             paymentMethod === 'upi' ? `Pay ₹${bookingData.total} via UPI` :
             paymentMethod === 'qr' ? `Generate QR & Pay ₹${bookingData.total}` :
             `Pay ₹${bookingData.total} - All Methods`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;