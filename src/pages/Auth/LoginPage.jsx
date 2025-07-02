import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/UI/Toast/Toast';
import { Calculator, ArrowLeft } from 'lucide-react';
import Button from '../../components/UI/Button/Button';
import Input from '../../components/UI/Input/Input';
import './AuthPages.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success && result.user) {
        success('Login successful!');
        // Redirect based on user role
        const { role } = result.user;
        switch (role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'trader':
            navigate('/trader');
            break;
          case 'customer':
            navigate('/customer');
            break;
          default:
            navigate('/');
        }
      } else {
        error(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="back-link">
            <ArrowLeft className="back-icon" />
            Back to Home
          </Link>
        </div>

        <div className="auth-content">
          <div className="auth-form-container">
            <div className="auth-brand">
              <Calculator className="brand-icon" />
              <h1>Welcome Back</h1>
              <p>Sign in to your BuildEstimate account</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                placeholder="Enter your email"
              />

              <Input
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                placeholder="Enter your password"
                showPasswordToggle
              />

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                fullWidth
                loading={loading}
              >
                Sign In
              </Button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Create one now
                </Link>
              </p>
            </div>
          </div>

          <div className="auth-visual">
            <div className="visual-content">
              <h2>Start Managing Your Business Better</h2>
              <p>Join thousands of professionals who trust BuildEstimate for their estimation and invoicing needs.</p>
              
              <div className="feature-list">
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Quick estimate generation</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Professional invoicing</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Secure payment processing</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Real-time analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;