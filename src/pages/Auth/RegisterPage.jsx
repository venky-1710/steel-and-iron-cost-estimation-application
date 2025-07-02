import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/UI/Toast/Toast';
import { Calculator, ArrowLeft } from 'lucide-react';
import Button from '../../components/UI/Button/Button';
import Input from '../../components/UI/Input/Input';
import Select from '../../components/UI/Select/Select';
import Textarea from '../../components/UI/Textarea/Textarea';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    companyName: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const roleOptions = [
    { value: 'customer', label: 'Customer' },
    { value: 'trader', label: 'Trader' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      error('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const result = await register(formData);
    
    if (result.success) {
      success(result.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      error(result.error);
    }
    
    setLoading(false);
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
              <h1>Create Account</h1>
              <p>Join BuildEstimate and streamline your business</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-row">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="Enter your full name"
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-row">
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  placeholder="Enter your phone number"
                />

                <Select
                  label="Account Type"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  options={roleOptions}
                  required
                />
              </div>

              {formData.role === 'trader' && (
                <>
                  <Input
                    label="Company Name"
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    required
                    placeholder="Enter your company name"
                  />

                  <Textarea
                    label="Business Address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    required
                    placeholder="Enter your business address"
                    rows={3}
                  />
                </>
              )}

              <div className="form-row">
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  placeholder="Create a password"
                  showPasswordToggle
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  placeholder="Confirm your password"
                  showPasswordToggle
                />
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" required />
                  <span className="checkmark"></span>
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>

              <Button 
                type="submit" 
                fullWidth
                loading={loading}
              >
                Create Account
              </Button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>

          <div className="auth-visual">
            <div className="visual-content">
              <h2>Join Our Growing Community</h2>
              <p>Connect with thousands of professionals in the building materials industry.</p>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Active Traders</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">10K+</span>
                  <span className="stat-label">Estimates</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">₹50L+</span>
                  <span className="stat-label">Processed</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;