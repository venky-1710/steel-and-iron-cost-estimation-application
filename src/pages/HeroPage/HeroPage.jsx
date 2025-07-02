import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { statsAPI, contactAPI } from '../../services/api';
import './HeroPage.css';

const HeroPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [stats, setStats] = useState({
    activeTraders: '0+',
    estimatesCreated: '0+',
    invoicesProcessed: '₹0+',
    totalUsers: '0+'
  });
  const [loading, setLoading] = useState(true);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactMessage, setContactMessage] = useState({
    type: '',
    text: ''
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsAPI.getPublicStats();
        if (response.data && response.data.success) {
          setStats(response.data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };
  
  const handleContactChange = (e) => {
    const { id, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactMessage({ type: '', text: '' });
    
    try {
      const response = await contactAPI.submitContactForm(contactForm);
      
      if (response.data.success) {
        setContactMessage({
          type: 'success',
          text: response.data.message || 'Your message has been sent! We will contact you soon.'
        });
        // Reset form
        setContactForm({
          name: '',
          email: '',
          phone: '',
          message: ''
        });
      }
    } catch (error) {
      setContactMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send your message. Please try again later.'
      });
    } finally {
      setContactSubmitting(false);
    }
  };

  const faqs = [
    {
      question: "How does the estimation process work?",
      answer: "Our system uses advanced algorithms to calculate material requirements based on your project specifications. Simply input your measurements, select materials, and our system generates an accurate estimate with quantity, cost, and labor estimates."
    },
    {
      question: "Can I customize invoice templates?",
      answer: "Yes, you can customize your invoice templates with your company logo, colors, and preferred layout. We offer multiple professional templates that you can personalize to match your brand identity."
    },
    {
      question: "How secure are the payment options?",
      answer: "We implement bank-grade security protocols for all payment transactions. Our QR payment system uses encrypted connections and secure authentication to ensure your financial information remains protected."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Yes, our platform is fully responsive and works on all devices. We also offer dedicated mobile apps for iOS and Android with offline capabilities so you can create estimates and invoices even without internet access."
    },
    {
      question: "How can I get started with BuildEstimate?",
      answer: "Getting started is easy! Simply create a free account, set up your company profile, and you can begin creating estimates and invoices immediately. We offer guided tutorials and 24/7 customer support to help you along the way."
    }
  ];

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
            <Link to="/register" className="btn btn-primary">Register</Link>
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
                  Create Account
                  <ArrowRight className="btn-icon" />
                </Link>
                <a href="#features" className="btn btn-outline btn-large">
                  Learn More
                </a>
              </div>
              
              <div className="hero-stats">
                {loading ? (
                  <div className="stats-loading">
                    <Loader size={20} className="animate-spin" /> Loading stats...
                  </div>
                ) : (
                  <>
                    <div className="stat">
                      <span className="stat-number">{stats.activeTraders}</span>
                      <span className="stat-label">Active Traders</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">{stats.estimatesCreated}</span>
                      <span className="stat-label">Estimates Created</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">{stats.invoicesProcessed}</span>
                      <span className="stat-label">Invoices Processed</span>
                    </div>
                  </>
                )}
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

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-description">
              Find answers to the most common questions about our platform.
            </p>
          </div>
          
          <div className="faq-container">
            {faqs.map((faq, index) => (
              <div 
                className={`faq-item ${openFaqIndex === index ? 'active' : ''}`} 
                key={index}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  <h3>{faq.question}</h3>
                  <div className="faq-icon">
                    {openFaqIndex === index ? <ChevronUp /> : <ChevronDown />}
                  </div>
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
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
                  <p>builtestimate@gmail.com</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <Phone />
                </div>
                <div className="contact-details">
                  <h4>Call Us</h4>
                  <p>+91 9010105008</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin />
                </div>
                <div className="contact-details">
                  <h4>Visit Us</h4>
                  <p>BM Nagar Gandhi Nagar, Hyderabad, India</p>
                </div>
              </div>
              
              <div className="contact-cta">
                <h4>Ready to get started?</h4>
                <p>Create your free account today and start using our platform.</p>
                <Link to="/register" className="btn btn-primary btn-large contact-cta-button">
                  Create Free Account
                  <ArrowRight className="btn-icon" />
                </Link>
              </div>
            </div>
            
            <div className="contact-form">
              <h3>Send us a message</h3>
              {contactMessage.type && (
                <div className={`contact-message ${contactMessage.type}`}>
                  {contactMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span>{contactMessage.text}</span>
                </div>
              )}
              <form onSubmit={handleContactSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Your Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    placeholder="Enter your name" 
                    required 
                    value={contactForm.name}
                    onChange={handleContactChange}
                    disabled={contactSubmitting}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Your Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="Enter your email" 
                    required 
                    value={contactForm.email}
                    onChange={handleContactChange}
                    disabled={contactSubmitting}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Your Phone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    placeholder="Enter your phone number" 
                    required 
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    disabled={contactSubmitting}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Your Message</label>
                  <textarea 
                    id="message" 
                    placeholder="How can we help you?" 
                    rows="4" 
                    required
                    value={contactForm.message}
                    onChange={handleContactChange}
                    disabled={contactSubmitting}
                  ></textarea>
                </div>
                <button type="submit" className="form-submit" disabled={contactSubmitting}>
                  {contactSubmitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hero-footer">
        <div className="footer-top">
          <div className="container">
            <div className="footer-content">
              <div className="footer-brand">
                <div className="nav-brand">
                  <Calculator className="brand-icon" />
                  <span style={{ color: "white" }} className="brand-name">BuildEstimate</span>
                </div>
                <p>Professional estimation and invoice management for the building materials industry.</p>
                <div className="social-links">
                  <a href="#facebook" className="social-link" aria-label="Facebook">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </a>
                  <a href="#twitter" className="social-link" aria-label="Twitter">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  </a>
                  <a href="#linkedin" className="social-link" aria-label="LinkedIn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </a>
                  <a href="#instagram" className="social-link" aria-label="Instagram">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                </div>
              </div>
              
              <div className="footer-links-container">
                <div className="footer-column">
                  <h4>Product</h4>
                  <ul>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#pricing">Pricing</a></li>
                    <li><a href="#demo">Demo</a></li>
                    <li><a href="#documentation">Documentation</a></li>
                  </ul>
                </div>
                
                <div className="footer-column">
                  <h4>Support</h4>
                  <ul>
                    <li><a href="#help">Help Center</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li><a href="#status">Status</a></li>
                    <li><a href="#faq">FAQ</a></li>
                  </ul>
                </div>
                
                <div className="footer-column">
                  <h4>Company</h4>
                  <ul>
                    <li><a href="#about">About</a></li>
                    <li><a href="#careers">Careers</a></li>
                    <li><a href="#privacy">Privacy</a></li>
                    <li><a href="#terms">Terms</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} BuildEstimate. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#privacy">Privacy Policy</a>
              <span className="footer-divider">•</span>
              <a href="#terms">Terms of Service</a>
              <span className="footer-divider">•</span>
              <a href="#cookies">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HeroPage;