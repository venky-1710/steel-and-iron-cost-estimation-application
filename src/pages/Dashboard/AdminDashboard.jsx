import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  TrendingUp, 
  FileText,
  Settings,
  Shield,
  Activity,
  Search,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react';
import './Dashboard.css';

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const navigationItems = [
    { 
      path: '/admin', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      exact: true
    },
    { 
      path: '/admin/traders', 
      icon: UserCheck, 
      label: 'Trader Approval' 
    },
    { 
      path: '/admin/users', 
      icon: Users, 
      label: 'User Management' 
    },
    { 
      path: '/admin/analytics', 
      icon: TrendingUp, 
      label: 'Analytics' 
    },
    { 
      path: '/admin/reports', 
      icon: FileText, 
      label: 'Reports' 
    },
    { 
      path: '/admin/audit', 
      icon: Activity, 
      label: 'Audit Logs' 
    },
    { 
      path: '/admin/settings', 
      icon: Settings, 
      label: 'System Settings' 
    }
  ];

  // Mock data for admin dashboard
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+52 this month',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Traders',
      value: '156',
      change: '12 pending approval',
      icon: UserCheck,
      color: 'green'
    },
    {
      title: 'Total Revenue',
      value: '₹12,45,000',
      change: '+25% from last month',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: 'All systems operational',
      icon: Shield,
      color: 'emerald'
    }
  ];

  const pendingTraders = [
    {
      id: 'T001',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91 98765 43210',
      company: 'Kumar Building Materials',
      address: '123 Market Street, Mumbai',
      submittedDate: '2024-01-15',
      documents: ['GST Certificate', 'Business License']
    },
    {
      id: 'T002',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '+91 87654 32109',
      company: 'Sharma Construction Supply',
      address: '456 Industrial Area, Delhi',
      submittedDate: '2024-01-14',
      documents: ['GST Certificate', 'Trade License']
    },
    {
      id: 'T003',
      name: 'Amit Patel',
      email: 'amit@example.com',
      phone: '+91 76543 21098',
      company: 'Patel Materials Hub',
      address: '789 Business Park, Pune',
      submittedDate: '2024-01-13',
      documents: ['GST Certificate', 'Shop License']
    }
  ];

  const DashboardOverview = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>System overview and management center for BuildEstimate platform.</p>
        </div>
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

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Pending Trader Approvals</h3>
            <span className="badge">{pendingTraders.length}</span>
          </div>
          <div className="card-content">
            {pendingTraders.slice(0, 3).map((trader) => (
              <div key={trader.id} className="approval-item">
                <div className="trader-info">
                  <h4>{trader.name}</h4>
                  <p>{trader.company}</p>
                  <span className="submission-date">
                    Submitted: {new Date(trader.submittedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="approval-actions">
                  <button className="btn btn-sm btn-success">
                    <CheckCircle className="btn-icon" />
                    Approve
                  </button>
                  <button className="btn btn-sm btn-danger">
                    <XCircle className="btn-icon" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>System Activity</h3>
          </div>
          <div className="card-content">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon green">
                  <UserCheck />
                </div>
                <div className="activity-content">
                  <p>New trader registration</p>
                  <span>2 minutes ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon blue">
                  <FileText />
                </div>
                <div className="activity-content">
                  <p>Invoice generated</p>
                  <span>15 minutes ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon purple">
                  <TrendingUp />
                </div>
                <div className="activity-content">
                  <p>Monthly report generated</p>
                  <span>1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TraderApprovalPage = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Trader Approval</h1>
          <p>Review and approve trader registration requests.</p>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <div className="search-filters">
            <div className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, company, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="filter-select">
              <option value="">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="traders-grid">
          {pendingTraders.map((trader) => (
            <div key={trader.id} className="trader-card">
              <div className="trader-header">
                <div className="trader-basic">
                  <h3>{trader.name}</h3>
                  <p className="company-name">{trader.company}</p>
                  <div className="contact-info">
                    <span>{trader.email}</span>
                    <span>{trader.phone}</span>
                  </div>
                </div>
                <div className="submission-info">
                  <span className="trader-id">#{trader.id}</span>
                  <span className="submission-date">
                    {new Date(trader.submittedDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="trader-details">
                <div className="detail-section">
                  <h4>Business Address</h4>
                  <p>{trader.address}</p>
                </div>
                
                <div className="detail-section">
                  <h4>Documents Submitted</h4>
                  <div className="documents-list">
                    {trader.documents.map((doc, index) => (
                      <span key={index} className="document-badge">{doc}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="trader-actions">
                <button className="btn btn-outline">View Details</button>
                <button className="btn btn-danger">
                  <XCircle className="btn-icon" />
                  Reject
                </button>
                <button className="btn btn-success">
                  <CheckCircle className="btn-icon" />
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout navigationItems={navigationItems} userRole="admin">
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/traders" element={<TraderApprovalPage />} />
        <Route path="/users" element={<div className="dashboard-content"><h1>User Management</h1></div>} />
        <Route path="/analytics" element={<div className="dashboard-content"><h1>Analytics</h1></div>} />
        <Route path="/reports" element={<div className="dashboard-content"><h1>Reports</h1></div>} />
        <Route path="/audit" element={<div className="dashboard-content"><h1>Audit Logs</h1></div>} />
        <Route path="/settings" element={<div className="dashboard-content"><h1>System Settings</h1></div>} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;