import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/UI/Toast/Toast';
import { Calculator, ArrowLeft } from 'lucide-react';
import Button from '../../components/UI/Button/Button';
import Input from '../../components/UI/Input/Input';

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
    <div className="flex min-h-screen py-6 bg-gradient-to-br from-gray-50 to-gray-100 sm:py-12">
      <div className="w-full px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-blue-600 transition-colors hover:text-blue-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="flex flex-col overflow-hidden bg-white shadow-xl md:flex-row rounded-2xl">
          <div className="w-full p-8 md:w-1/2 sm:p-12">
            <div className="mb-8 text-center sm:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-blue-600 bg-blue-100 rounded-full">
                <Calculator className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Welcome Back</h1>
              <p className="mt-2 text-gray-600">Sign in to your BuildEstimate account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>

              <div>
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  required
                  placeholder="Enter your password"
                  showPasswordToggle
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-800">
                  Forgot password?
                </Link>
              </div>

              <div>
                <Button 
                  type="submit" 
                  fullWidth
                  loading={loading}
                  className="w-full py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Sign In
                </Button>
              </div>
            </form>

            <div className="mt-6 text-sm text-center text-gray-600">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-blue-600 transition-colors hover:text-blue-800">
                  Create one now
                </Link>
              </p>
            </div>
          </div>

          <div className="hidden w-1/2 p-12 text-white md:block bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="flex flex-col justify-center h-full">
              <h2 className="mb-4 text-3xl font-bold">Start Managing Your Business Better</h2>
              <p className="mb-8 text-blue-100">Join thousands of professionals who trust BuildEstimate for their estimation and invoicing needs.</p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-white bg-blue-500 rounded-full">✓</div>
                  <span className="ml-3 text-blue-50">Quick estimate generation</span>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-white bg-blue-500 rounded-full">✓</div>
                  <span className="ml-3 text-blue-50">Professional invoicing</span>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-white bg-blue-500 rounded-full">✓</div>
                  <span className="ml-3 text-blue-50">Secure payment processing</span>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 text-white bg-blue-500 rounded-full">✓</div>
                  <span className="ml-3 text-blue-50">Real-time analytics</span>
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