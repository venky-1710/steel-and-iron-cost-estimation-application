import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/UI/Toast/Toast';
import { Calculator, ArrowLeft, CheckCircle, User, Mail, Phone, Building, Lock, ChevronRight } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

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

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.role) {
        error('Please fill all required fields');
        return;
      }
      
      // Check if email is valid
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        error('Please enter a valid email address');
        return;
      }
    }

    if (currentStep === 2 && formData.role === 'trader') {
      if (!formData.companyName || !formData.address) {
        error('Please fill all business details');
        return;
      }
    }

    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
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

  // Password strength calculation
  const calculatePasswordStrength = () => {
    const password = formData.password;
    if (!password) return { score: 0, label: 'None' };
    
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthClass = ['weak', 'weak', 'medium', 'strong', 'strong'];
    
    return { 
      score,
      label: strengthLabels[score > 0 ? score - 1 : 0],
      class: strengthClass[score > 0 ? score - 1 : 0],
      percent: Math.min(100, (score / 5) * 100)
    };
  };

  const strength = calculatePasswordStrength();

  return (
    <div className="auth-page register-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="back-link">
            <ArrowLeft className="back-icon" />
            Back to Home
          </Link>
        </div>

        <div className="auth-content">
          <div className="auth-form-container">
            <div className="register-header">
              <div className="logo-container">
                <Calculator className="logo-icon" />
                <h1>BuildEstimate</h1>
              </div>
              
              <div className="steps-progress">
                <div className="steps-container">
                  <div className={`step-item ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                    <div className="step-number">
                      {currentStep > 1 ? <CheckCircle size={16} /> : 1}
                    </div>
                    <div className="step-label">Account</div>
                  </div>
                  
                  <div className="step-line"></div>
                  
                  <div className={`step-item ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                    <div className="step-number">
                      {currentStep > 2 ? <CheckCircle size={16} /> : 2}
                    </div>
                    <div className="step-label">
                      {formData.role === 'trader' ? 'Business' : 'Details'}
                    </div>
                  </div>
                  
                  <div className="step-line"></div>
                  
                  <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
                    <div className="step-number">3</div>
                    <div className="step-label">Security</div>
                  </div>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="register-form">
              {/* Step 1: Basic Information */}
              <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
                <h2 className="step-title">Create your account</h2>
                <p className="step-description">Enter your personal information to get started</p>
                
                <div className="form-fields">
                  <div className="form-field">
                    <Input
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      required
                      placeholder="Enter your full name"
                      icon={<User size={18} />}
                    />
                  </div>
                  
                  <div className="form-field">
                    <Input
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      placeholder="name@example.com"
                      icon={<Mail size={18} />}
                    />
                  </div>
                  
                  <div className="form-field">
                    <Input
                      label="Phone Number"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                      placeholder="Your phone number"
                      icon={<Phone size={18} />}
                    />
                  </div>
                  
                  <div className="form-field">
                    <Select
                      label="Account Type"
                      value={formData.role}
                      onChange={(e) => handleChange('role', e.target.value)}
                      options={roleOptions}
                      required
                    />
                  </div>
                </div>
                
                <div className="step-actions">
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="next-step-button"
                  >
                    Continue <ChevronRight className="button-arrow" size={18} />
                  </Button>
                </div>
              </div>
              
              {/* Step 2: Business Details (for Trader) or Additional Details (for Customer) */}
              <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
                <h2 className="step-title">
                  {formData.role === 'trader' ? 'Business Details' : 'Additional Information'}
                </h2>
                <p className="step-description">
                  {formData.role === 'trader' 
                    ? 'Tell us about your business'
                    : 'Help us customize your experience'
                  }
                </p>
                
                <div className="form-fields">
                  {formData.role === 'trader' ? (
                    <>
                      <div className="form-field">
                        <Input
                          label="Company Name"
                          value={formData.companyName}
                          onChange={(e) => handleChange('companyName', e.target.value)}
                          required
                          placeholder="Enter your company name"
                          icon={<Building size={18} />}
                        />
                      </div>
                      
                      <div className="form-field full-width">
                        <Textarea
                          label="Business Address"
                          value={formData.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          required
                          placeholder="Enter your complete business address"
                          rows={3}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="quick-setup-container">
                      <div className="setup-icon">🚀</div>
                      <h3>Quick Setup</h3>
                      <p>Your basic account will be created with standard settings. You can customize your preferences later.</p>
                    </div>
                  )}
                </div>
                
                <div className="step-actions multi-button">
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="prev-step-button"
                    variant="outline"
                  >
                    Back
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="next-step-button"
                  >
                    Continue <ChevronRight className="button-arrow" size={18} />
                  </Button>
                </div>
              </div>
              
              {/* Step 3: Security */}
              <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
                <h2 className="step-title">Set your password</h2>
                <p className="step-description">Create a strong password to secure your account</p>
                
                <div className="form-fields">
                  <div className="form-field">
                    <Input
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      required
                      placeholder="Create your password"
                      icon={<Lock size={18} />}
                      showPasswordToggle
                    />
                  </div>
                  
                  <div className="form-field">
                    <Input
                      label="Confirm Password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      required
                      placeholder="Confirm your password"
                      icon={<Lock size={18} />}
                      showPasswordToggle
                    />
                  </div>
                  
                  <div className="password-strength-meter">
                    <div className="strength-label">
                      <span>Password Strength:</span>
                      <span className={`strength-value ${strength.class}`}>{strength.label}</span>
                    </div>
                    <div className="strength-bar">
                      <div 
                        className={`strength-indicator ${strength.class}`}
                        style={{ width: `${strength.percent}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {(isPasswordFocused || formData.password) && (
                    <div className="password-requirements compact">
                      <h4>Requirements:</h4>
                      <ul>
                        <li className={formData.password.length >= 6 ? 'met' : ''}>6+ chars</li>
                        <li className={/[A-Z]/.test(formData.password) ? 'met' : ''}>Uppercase</li>
                        <li className={/[0-9]/.test(formData.password) ? 'met' : ''}>Number</li>
                        <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'met' : ''}>Special</li>
                      </ul>
                    </div>
                  )}
                  
                  <div className="terms-agreement">
                    <label className="checkbox-container">
                      <input type="checkbox" required />
                      <span className="checkmark"></span>
                      <span className="terms-text">
                        I agree to <Link to="/terms">Terms</Link> & <Link to="/privacy">Privacy Policy</Link>
                      </span>
                    </label>
                  </div>
                </div>
                
                <div className="step-actions multi-button">
                  <Button
                    type="button"
                    onClick={prevStep}
                    className="prev-step-button"
                    variant="outline"
                  >
                    Back
                  </Button>
                  
                  <Button
                    type="submit"
                    loading={loading}
                    className="submit-button"
                  >
                    Create Account
                  </Button>
                </div>
                
                <div className="form-security-badge">
                  <div className="security-icon">🔒</div>
                  <div className="security-text">Your data is encrypted and secure</div>
                </div>
              </div>
            </form>
            
            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login">Sign in</Link>
              </p>
            </div>
          </div>

          <div className="auth-visual">
            <div className="visual-inner">
              <div className="visual-content">
                <div className="brand-badge">Trusted by 10,000+ professionals</div>
                <h2>Build Smarter, <br />Estimate Faster</h2>
                <p>Join thousands of construction professionals who are streamlining their estimation process.</p>
                
                <div className="features">
                  {[
                    { icon: '⚡', text: 'Get accurate estimates in minutes' },
                    { icon: '🔍', text: 'Compare prices from trusted suppliers' },
                    { icon: '📱', text: 'Manage projects from anywhere' },
                    { icon: '💰', text: 'Reduce costs by optimizing materials' }
                  ].map((feature, index) => (
                    <div key={index} className="feature">
                      <div className="feature-icon">{feature.icon}</div>
                      <div className="feature-text">{feature.text}</div>
                    </div>
                  ))}
                </div>
                
                <div className="testimonial">
                  <div className="quote-mark">"</div>
                  <p className="quote-text">BuildEstimate has revolutionized our construction planning process. What used to take days now takes just hours.</p>
                  <div className="quote-author">
                    <div className="author-avatar">PK</div>
                    <div className="author-details">
                      <div className="author-name">Pradeep Kumar</div>
                      <div className="author-title">Project Manager, Indus Construction</div>
                    </div>
                  </div>
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