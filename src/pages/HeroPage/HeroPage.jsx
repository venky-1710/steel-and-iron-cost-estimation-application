import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, 
  FileText, 
  QrCode, 
  Users, 
  TrendingUp, 
  Shield,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
  ArrowRight
} from 'lucide-react';
import './HeroPage.css';

const HeroPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="hero-page">
      {/* Header */}
      <header className="hero-header">
        <div className="container">
          <div className="nav-brand">
            <Calculator className="brand-icon" />
            <span className="brand-name">BuildEstimate</span>
          </div>
          
          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a href="#home" onClick={() => setIsMenuOpen(false)}>Home</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
            <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
          </nav>
          
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>
          
          <button className="menu-toggle" onClick={toggleMenu}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Streamline Your Building Material 
                <span className="text-gradient"> Estimations & Invoicing</span>
              </h1>
              <p className="hero-description">
                Professional estimation and invoice management system designed for traders, 
                contractors, and customers. Generate accurate estimates, create professional 
                invoices, and get paid faster with integrated QR payments.
              </p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary btn-large">
                  Start Free Trial
                  <ArrowRight className="btn-icon" />
                </Link>
                <a href="#features" className="btn btn-outline btn-large">
                  Learn More
                </a>
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Active Traders</span>
                </div>
                <div className="stat">
                  <span className="stat-number">10K+</span>
                  <span className="stat-label">Estimates Created</span>
                </div>
                <div className="stat">
                  <span className="stat-number">₹50L+</span>
                  <span className="stat-label">Invoices Processed</span>
                </div>
              </div>
            </div>
            <div className="hero-image">
              <div className="dashboard-preview">
                <div className="preview-header">
                  <div className="preview-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                </div>
                <div className="preview-content">
                  <div className="preview-card">
                    <Calculator className="preview-icon" />
                    <h3>Quick Estimates</h3>
                    <p>Create detailed estimates in minutes</p>
                  </div>
                  <div className="preview-card">
                    <FileText className="preview-icon" />
                    <h3>Professional Invoices</h3>
                    <p>Generate PDF invoices with signatures</p>
                  </div>
                  <div className="preview-card">
                    <QrCode className="preview-icon" />
                    <h3>QR Payments</h3>
                    <p>Accept payments via UPI/PhonePe/Paytm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Powerful Features for Every User</h2>
            <p className="section-description">
              Everything you need to manage estimates, invoices, and payments efficiently
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Calculator />
              </div>
              <h3>Smart Estimation</h3>
              <p>Create detailed estimates with automatic calculations, discounts, and loading charges. Save templates for quick reuse.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FileText />
              </div>
              <h3>Professional Invoicing</h3>
              <p>Generate branded invoices with digital signatures, watermarks, and professional formatting.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <QrCode />
              </div>
              <h3>QR Code Payments</h3>
              <p>Integrated payment system with UPI, PhonePe, and Paytm QR codes for instant payments.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Users />
              </div>
              <h3>Multi-Role Access</h3>
              <p>Separate dashboards for admins, traders, and customers with role-based permissions.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp />
              </div>
              <h3>Analytics & Reports</h3>
              <p>Track performance with detailed analytics, customer insights, and financial reports.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <Shield />
              </div>
              <h3>Secure & Reliable</h3>
              <p>Bank-grade security with encrypted data, secure authentication, and regular backups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">Built for Building Material Professionals</h2>
              <p className="about-description">
                Our platform is specifically designed to address the unique challenges faced by 
                building material traders, contractors, and their customers. We understand the 
                complexity of material estimation, the importance of accurate invoicing, and the 
                need for quick payments in the construction industry.
              </p>
              
              <div className="about-features">
                <div className="about-feature">
                  <h4>For Traders</h4>
                  <p>Streamline your quotation process, manage inventory, and track customer relationships.</p>
                </div>
                <div className="about-feature">
                  <h4>For Customers</h4>
                  <p>Get accurate estimates, compare prices, and make secure payments with ease.</p>
                </div>
                <div className="about-feature">
                  <h4>For Admins</h4>
                  <p>Oversee operations, approve traders, and analyze business performance.</p>
                </div>
              </div>
            </div>
            
            <div className="about-image">
              <div className="about-card">
                <h3>Why Choose BuildEstimate?</h3>
                <ul>
                  <li>✓ Industry-specific features</li>
                  <li>✓ Mobile-responsive design</li>
                  <li>✓ Automated calculations</li>
                  <li>✓ WhatsApp & Email integration</li>
                  <li>✓ Referral management</li>
                  <li>✓ Offline capability</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Get in Touch</h2>
            <p className="section-description">
              Have questions? We're here to help you get started.
            </p>
          </div>
          
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <Mail />
                </div>
                <div className="contact-details">
                  <h4>Email Us</h4>
                  <p>support@buildestimate.com</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <Phone />
                </div>
                <div className="contact-details">
                  <h4>Call Us</h4>
                  <p>+91 98765 43210</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin />
                </div>
                <div className="contact-details">
                  <h4>Visit Us</h4>
                  <p>123 Business Park, Mumbai, India</p>
                </div>
              </div>
            </div>
            
            <div className="contact-form">
              <form>
                <div className="form-group">
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <input type="tel" placeholder="Your Phone" required />
                </div>
                <div className="form-group">
                  <textarea placeholder="Your Message" rows="4" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-large">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hero-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="nav-brand">
                <Calculator className="brand-icon" />
                <span className="brand-name">BuildEstimate</span>
              </div>
              <p>Professional estimation and invoice management for the building materials industry.</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <ul>
                  <li><a href="#features">Features</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#demo">Demo</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4>Support</h4>
                <ul>
                  <li><a href="#help">Help Center</a></li>
                  <li><a href="#contact">Contact</a></li>
                  <li><a href="#status">Status</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4>Company</h4>
                <ul>
                  <li><a href="#about">About</a></li>
                  <li><a href="#careers">Careers</a></li>
                  <li><a href="#privacy">Privacy</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 BuildEstimate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HeroPage;