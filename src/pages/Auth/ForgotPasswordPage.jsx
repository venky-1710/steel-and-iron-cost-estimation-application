import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/UI/Toast/Toast';
import { Calculator, ArrowLeft, Mail } from 'lucide-react';
import Button from '../../components/UI/Button/Button';
import Input from '../../components/UI/Input/Input';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { forgotPassword } = useAuth();
  const { success: showSuccess, error } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await forgotPassword(email);
    
    if (result.success) {
      setSuccess(true);
      showSuccess(result.message);
    } else {
      error(result.error);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-header">
            <Link to="/login" className="back-link">
              <ArrowLeft className="back-icon" />
              Back to Login
            </Link>
          </div>

          <div className="auth-content">
            <div className="auth-form-container">
              <div className="auth-brand">
                <div className="success-icon">
                  <Mail />
                </div>
                <h1>Check Your Email</h1>
                <p>We've sent password reset instructions to <strong>{email}</strong></p>
              </div>

              <div className="success-message">
                <p>If you don't see the email in your inbox, please check your spam folder.</p>
              </div>

              <div className="auth-footer">
                <p>
                  Didn't receive the email?{' '}
                  <button 
                    onClick={() => setSuccess(false)}
                    className="auth-link-button"
                  >
                    Try again
                  </button>
                </p>
                <p>
                  <Link to="/login" className="auth-link">
                    Return to login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/login" className="back-link">
            <ArrowLeft className="back-icon" />
            Back to Login
          </Link>
        </div>

        <div className="auth-content">
          <div className="auth-form-container">
            <div className="auth-brand">
              <Calculator className="brand-icon" />
              <h1>Reset Password</h1>
              <p>Enter your email address and we'll send you instructions to reset your password</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
              />

              <Button 
                type="submit" 
                fullWidth
                loading={loading}
              >
                Send Reset Instructions
              </Button>
            </form>

            <div className="auth-footer">
              <p>
                Remember your password?{' '}
                <Link to="/login" className="auth-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;