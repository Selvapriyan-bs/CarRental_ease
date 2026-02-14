import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    gstNumber: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const sendVerificationCode = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      if (response.ok) {
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to send verification code');
    }
    setLoading(false);
  };

  const verifyEmail = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: verificationCode })
      });
      const data = await response.json();
      if (response.ok) {
        setStep(3);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Verification failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
        <h2>Register</h2>
        {error && <div className="error">{error}</div>}
        
        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
            </select>
            {formData.role === 'vendor' && (
              <input
                type="text"
                placeholder="GST Number"
                value={formData.gstNumber}
                onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                required
              />
            )}
            <button type="button" className="btn-primary" onClick={sendVerificationCode} disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </>
        )}
        
        {step === 2 && (
          <>
            <p style={{textAlign: 'center', color: '#666'}}>Enter the 6-digit code sent to {formData.email}</p>
            <input
              type="text"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength="6"
              required
            />
            <button type="button" className="btn-primary" onClick={verifyEmail} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{marginTop: '10px'}}>Back</button>
          </>
        )}
        
        {step === 3 && (
          <>
            <p style={{textAlign: 'center', color: 'green'}}>✓ Email verified successfully!</p>
            <button type="submit" className="btn-primary" onClick={handleRegister} disabled={loading}>
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </>
        )}
        
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;
