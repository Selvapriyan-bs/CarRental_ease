import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { UserAdd01Icon, Mail01Icon, LockPasswordIcon, UserIcon, Building01Icon, CheckmarkCircle02Icon } from 'hugeicons-react';
import './Auth.css';

const VerifiedRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    verificationCode: '',
    gstNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSendVerification = async (e) => {
    e.preventDefault();
    if (!formData.email) return setError('Email is required');
    
    setLoading(true);
    try {
      await authAPI.sendVerification(formData.email);
      setStep(2);
      setError('');
    } catch (error) {
      setError('Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!formData.verificationCode) return setError('Verification code is required');
    
    setLoading(true);
    try {
      await authAPI.verifyEmail(formData.email, formData.verificationCode);
      setStep(3);
      setError('');
    } catch (error) {
      setError('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'vendor' && !formData.gstNumber) {
      setError('GST number is required for vendors');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        gstNumber: formData.gstNumber
      });
      
      localStorage.setItem('token', response.data.token);
      login(response.data.user);
      
      // Check for redirect URL
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {step === 1 && (
        <form className="auth-form enhanced" onSubmit={handleSendVerification}>
          <div className="form-header">
            <Mail01Icon size={48} />
            <h2>Verify Email</h2>
            <p>Enter your email to receive verification code</p>
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <div className="form-group">
            <Mail01Icon size={20} />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form className="auth-form enhanced" onSubmit={handleVerifyEmail}>
          <div className="form-header">
            <CheckmarkCircle02Icon size={48} />
            <h2>Enter Code</h2>
            <p>Check your email for the 6-digit code</p>
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <div className="form-group">
            <CheckmarkCircle02Icon size={20} />
            <input
              type="text"
              placeholder="6-digit verification code"
              value={formData.verificationCode}
              onChange={(e) => setFormData({...formData, verificationCode: e.target.value})}
              maxLength="6"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          
          <div className="form-footer">
            <button type="button" onClick={() => setStep(1)}>Back to Email</button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form className="auth-form enhanced" onSubmit={handleRegister}>
          <div className="form-header">
            <UserAdd01Icon size={48} />
            <h2>Complete Registration</h2>
            <p>Fill in your details to create account</p>
          </div>
          
          {error && <div className="error">{error}</div>}
          
          <div className="form-group">
            <UserIcon size={20} />
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <LockPasswordIcon size={20} />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <LockPasswordIcon size={20} />
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <Building01Icon size={20} />
            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
              <option value="user">Customer - Rent Vehicles</option>
              <option value="vendor">Vendor - List Vehicles</option>
            </select>
          </div>

          {formData.role === 'vendor' && (
            <div className="form-group">
              <Building01Icon size={20} />
              <input
                type="text"
                placeholder="GST Number (15 digits)"
                value={formData.gstNumber}
                onChange={(e) => setFormData({...formData, gstNumber: e.target.value.toUpperCase()})}
                maxLength="15"
                required
              />
              <small className="form-help">Format: 22AAAAA0000A1Z5</small>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="form-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </form>
      )}
    </div>
  );
};

export default VerifiedRegister;