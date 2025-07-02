import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/UI/Toast/Toast';
import HeroPage from './pages/HeroPage/HeroPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import TraderDashboard from './pages/Dashboard/TraderDashboard';
import CustomerDashboard from './pages/Dashboard/CustomerDashboard';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
          <Router>
            <div className="app">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HeroPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                
                {/* Protected Routes */}
                <Route path="/admin/*" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/trader/*" element={
                  <ProtectedRoute allowedRoles={['trader']}>
                    <TraderDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/customer/*" element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
  );
}

export default App;