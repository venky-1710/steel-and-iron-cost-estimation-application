import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/UI/Toast/Toast';
import { Calculator, ArrowLeft, Mail, CheckCircle, LockKeyhole, Sparkles } from 'lucide-react';
import Button from '../../components/UI/Button/Button';
import Input from '../../components/UI/Input/Input';
import './AuthPages.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [animate, setAnimate] = useState(false);

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

  useEffect(() => {
    setAnimate(true);
    return () => setAnimate(false);
  }, []);

  if (success) {
    return (
      <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden" 
           style={{ background: 'linear-gradient(135deg, #4338ca 0%, #7e22ce 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute w-32 h-32 bg-white rounded-full top-10 left-10 blur-3xl"></div>
          <div className="absolute w-40 h-40 bg-white rounded-full bottom-10 right-20 blur-3xl"></div>
          <div className="absolute bg-white rounded-full top-1/2 right-10 w-28 h-28 blur-3xl"></div>
        </div>

        <div className={`w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-medium text-indigo-600">Secure Form</span>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-indigo-100 rounded-full shadow-md animate-pulse">
                <Mail className="w-10 h-10 text-indigo-600" />
              </div>
              <h1 className="mb-3 text-2xl font-bold text-gray-800">Check Your Email</h1>
              <p className="px-4 text-gray-600">We've sent password reset instructions to <strong className="font-semibold text-indigo-700">{email}</strong></p>
            </div>

            <div className="p-5 mb-6 border border-indigo-100 rounded-lg bg-indigo-50">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-indigo-700">
                    If you don't see the email in your inbox, please check your spam folder.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-center">
              <button 
                onClick={() => setSuccess(false)}
                className="w-full px-4 py-3 font-medium text-indigo-600 transition-colors bg-white border border-indigo-200 rounded-lg shadow-sm hover:bg-indigo-50"
              >
                Try again with a different email
              </button>
              <Link to="/login" className="block w-full px-4 py-3 font-medium text-gray-500 transition-colors border border-transparent rounded-lg hover:text-gray-700">
                Return to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #4338ca 0%, #7e22ce 100%)' }}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
        <div className="absolute w-32 h-32 bg-white rounded-full top-10 left-10 blur-3xl"></div>
        <div className="absolute w-40 h-40 bg-white rounded-full bottom-10 right-20 blur-3xl"></div>
        <div className="absolute bg-white rounded-full top-1/2 right-10 w-28 h-28 blur-3xl"></div>
      </div>

      <div className={`w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-500 ${animate ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          <div className="flex items-center space-x-1">
            <LockKeyhole className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-medium text-indigo-600">Secure Form</span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-indigo-100 rounded-full shadow-md">
              <Calculator className="w-10 h-10 text-indigo-600" />
            </div>
            <h1 className="mb-3 text-2xl font-bold text-gray-800">Reset Password</h1>
            <p className="px-4 text-sm text-gray-600">Enter your email address and we'll send you instructions to reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm p-0.5" style={{ background: 'linear-gradient(to right, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))' }}>
                <div className="relative flex items-center bg-white rounded-md">
                  <div className="absolute text-indigo-500 left-3">
                    <Mail className="w-5 h-5" />
                  </div>
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full px-4 py-3.5 border-0 focus:ring-0 outline-none transition-all pl-11 bg-transparent"
                  />
                </div>
              </div>
              <p className="flex items-center ml-1 text-xs text-gray-500">
                <LockKeyhole className="w-3.5 h-3.5 inline mr-1.5 text-indigo-400" />
                We'll never share your email with anyone else.
              </p>
            </div>

            <Button 
              type="submit" 
              fullWidth
              loading={loading}
              className="w-full py-3 font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 hover:shadow-indigo-200/50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                "Send Reset Instructions"
              )}
            </Button>
          </form>

          <div className="pt-6 mt-8 text-center border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-indigo-600 transition-colors hover:text-indigo-800">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;