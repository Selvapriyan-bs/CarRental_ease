import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.data.token);
      login(response.data.user);
      
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMsg);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your premium account</p>
        
        {error && <div className="error">{error}</div>}
        
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
        
        <div className="auth-footer">
          <p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
          <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Login;
