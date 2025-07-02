import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { 
  LayoutDashboard, 
  Calculator, 
  FileText, 
  QrCode, 
  Settings, 
  TrendingUp,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import './Dashboard.css';

const CustomerDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const navigationItems = [
    { 
      path: '/customer', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      exact: true
    },
    { 
      path: '/customer/estimates', 
      icon: Calculator, 
      label: 'My Estimates' 
    },
    { 
      path: '/customer/invoices', 
      icon: FileText, 
      label: 'Invoices' 
    },
    { 
      path: '/customer/payments', 
      icon: QrCode, 
      label: 'QR Pay' 
    },
    { 
      path: '/customer/settings', 
      icon: Settings, 
      label: 'Settings' 
    }
  ];

  // Mock data for dashboard
  const stats = [
    {
      title: 'Total Estimates',
      value: '12',
      change: '+2 this month',
      icon: Calculator,
      color: 'blue'
    },
    {
      title: 'Pending Invoices',
      value: '3',
      change: '₹45,000 pending',
      icon: FileText,
      color: 'amber'
    },
    {
      title: 'Paid Invoices',
      value: '8',
      change: '₹1,25,000 paid',
      icon: TrendingUp,
      color: 'green'
    },
    {
      title: 'Saved Amount',
      value: '₹15,000',
      change: 'vs market rate',
      icon: QrCode,
      color: 'purple'
    }
  ];

  const recentEstimates = [
    {
      id: 'EST001',
      trader: 'ABC Building Materials',
      items: 'Cement, Steel Bars, Bricks',
      amount: '₹25,000',
      status: 'Active',
      date: '2024-01-15',
      validTill: '2024-01-30'
    },
    {
      id: 'EST002',
      trader: 'XYZ Construction Supply',
      items: 'Sand, Gravel, Paint',
      amount: '₹18,500',
      status: 'Converted',
      date: '2024-01-12',
      validTill: '2024-01-27'
    },
    {
      id: 'EST003',
      trader: 'PQR Materials Hub',
      items: 'Tiles, Adhesive, Grout',
      amount: '₹32,000',
      status: 'Expired',
      date: '2024-01-08',
      validTill: '2024-01-23'
    }
  ];

  const DashboardOverview = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back!</h1>
          <p>Here's what's happening with your projects today.</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="btn-icon" />
          Request Estimate
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">
              <stat.icon />
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
              <span className="stat-change">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Estimates</h2>
          <div className="section-actions">
            <div className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search estimates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-outline">
              <Filter className="btn-icon" />
              Filter
            </button>
          </div>
        </div>

        <div className="estimates-grid">
          {recentEstimates.map((estimate) => (
            <div key={estimate.id} className="estimate-card">
              <div className="estimate-header">
                <div className="estimate-id">#{estimate.id}</div>
                <div className={`estimate-status ${estimate.status.toLowerCase()}`}>
                  {estimate.status}
                </div>
              </div>
              
              <div className="estimate-content">
                <h3>{estimate.trader}</h3>
                <p className="estimate-items">{estimate.items}</p>
                <div className="estimate-amount">{estimate.amount}</div>
              </div>
              
              <div className="estimate-footer">
                <div className="estimate-dates">
                  <span>Created: {new Date(estimate.date).toLocaleDateString()}</span>
                  <span>Valid till: {new Date(estimate.validTill).toLocaleDateString()}</span>
                </div>
                <div className="estimate-actions">
                  <button className="btn btn-sm btn-outline">View</button>
                  {estimate.status === 'Active' && (
                    <button className="btn btn-sm btn-primary">Accept</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const EstimatesPage = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>My Estimates</h1>
          <p>View and manage all your building material estimates.</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="btn-icon" />
          Request New Estimate
        </button>
      </div>

      <div className="content-section">
        <div className="section-header">
          <div className="search-filters">
            <div className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by trader, items, or estimate ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="filter-select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="converted">Converted</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="estimates-grid">
          {recentEstimates.map((estimate) => (
            <div key={estimate.id} className="estimate-card detailed">
              <div className="estimate-header">
                <div className="estimate-id">#{estimate.id}</div>
                <div className={`estimate-status ${estimate.status.toLowerCase()}`}>
                  {estimate.status}
                </div>
              </div>
              
              <div className="estimate-content">
                <h3>{estimate.trader}</h3>
                <p className="estimate-items">{estimate.items}</p>
                <div className="estimate-amount">{estimate.amount}</div>
                <div className="estimate-details">
                  <div className="detail-row">
                    <span>Created:</span>
                    <span>{new Date(estimate.date).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span>Valid till:</span>
                    <span>{new Date(estimate.validTill).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="estimate-actions">
                <button className="btn btn-outline">
                  <FileText className="btn-icon" />
                  Download PDF
                </button>
                {estimate.status === 'Active' && (
                  <>
                    <button className="btn btn-primary">Accept Quote</button>
                    <button className="btn btn-secondary">Request Changes</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout navigationItems={navigationItems} userRole="customer">
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/estimates" element={<EstimatesPage />} />
        <Route path="/invoices" element={<div className="dashboard-content"><h1>Invoices</h1></div>} />
        <Route path="/payments" element={<div className="dashboard-content"><h1>QR Payments</h1></div>} />
        <Route path="/settings" element={<div className="dashboard-content"><h1>Settings</h1></div>} />
      </Routes>
    </DashboardLayout>
  );
};

export default CustomerDashboard;