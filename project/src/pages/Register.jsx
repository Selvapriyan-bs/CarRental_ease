import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
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
      await authAPI.sendVerification(formData.email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code');
    }
    setLoading(false);
  };

  const verifyEmail = async () => {
    setLoading(true);
    setError('');
    try {
      await authAPI.verifyEmail(formData.email, verificationCode);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.register(formData);
      login(response.data.user);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join us to experience premium rentals</p>
        
        {error && <div className="error">{error}</div>}
        
        {step === 1 && (
          <>
            <div className="form-group">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <select 
                value={formData.role} 
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  appearance: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="user" style={{background: '#0a0a0a'}}>User</option>
                <option value="vendor" style={{background: '#0a0a0a'}}>Vendor</option>
              </select>
            </div>
            {formData.role === 'vendor' && (
              <div className="form-group">
                <input
                  type="text"
                  placeholder="GST Number"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                  required
                />
              </div>
            )}
            <button type="button" className="btn-primary" onClick={sendVerificationCode} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
          </>
        )}
        
        {step === 2 && (
          <>
            <p className="auth-subtitle">Enter the 6-digit code sent to <br/><strong style={{color: 'white'}}>{formData.email}</strong></p>
            <div className="form-group">
              <input
                type="text"
                placeholder="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength="6"
                required
                style={{letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: '700'}}
              />
            </div>
            <button type="button" className="btn-primary" onClick={verifyEmail} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              style={{
                background: 'rgba(255,255,255,0.05)', 
                color: 'white', 
                border: '1px solid rgba(255,255,255,0.1)', 
                padding: '12px', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
            >
              Back to Change Email
            </button>
          </>
        )}
        
        {step === 3 && (
          <>
            <p className="auth-subtitle" style={{color: '#10b981'}}>✓ Email verified successfully!</p>
            <button type="submit" className="btn-primary" onClick={handleRegister} disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </>
        )}
        
        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Register;
