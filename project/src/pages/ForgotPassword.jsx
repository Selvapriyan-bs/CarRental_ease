import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.sendVerification(email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.verifyEmail(email, verificationCode);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
    setLoading(false);
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.resetPassword(email, newPassword);
      alert('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <form className="auth-form">
        <h2>Forgot Password</h2>
        {error && <div className="error">{error}</div>}
        
        {step === 1 && (
          <>
            <p className="auth-subtitle">Enter your email to receive OTP</p>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" onClick={sendOTP} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </>
        )}
        
        {step === 2 && (
          <>
            <p className="auth-subtitle">Enter the 6-digit OTP sent to <br/><strong style={{color: 'white'}}>{email}</strong></p>
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength="6"
                required
                style={{letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: '700'}}
              />
            </div>
            <button type="submit" className="btn-primary" onClick={verifyOTP} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
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
              Change Email
            </button>
          </>
        )}
        
        {step === 3 && (
          <>
            <p className="auth-subtitle" style={{color: '#10b981'}}>✓ OTP Verified! Set new password</p>
            <div className="form-group">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" onClick={resetPassword} disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}
        
        <div className="auth-footer">
          <p><Link to="/login">Back to Login</Link></p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
