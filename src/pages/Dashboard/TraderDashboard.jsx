import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import EstimateCard from '../../components/EstimateCard/EstimateCard';
import EstimateForm from '../../components/Forms/EstimateForm/EstimateForm';
import InvoiceForm from '../../components/Forms/InvoiceForm/InvoiceForm';
import Modal from '../../components/UI/Modal/Modal';
import Button from '../../components/UI/Button/Button';
import Input from '../../components/UI/Input/Input';
import Select from '../../components/UI/Select/Select';
import Loading from '../../components/UI/Loading/Loading';
import { useToast } from '../../components/UI/Toast/Toast';
import { 
  LayoutDashboard, 
  Calculator, 
  FileText, 
  Users, 
  Package,
  TrendingUp,
  Settings,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { estimatesAPI, invoicesAPI, usersAPI } from '../../services/api';
import { useApi, useApiMutation } from '../../hooks/useApi';
import './Dashboard.css';

const TraderDashboard = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showEstimateForm, setShowEstimateForm] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [selectedEstimate, setSelectedEstimate] = useState(null);

  const navigationItems = [
    { 
      path: '/trader', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      exact: true
    },
    { 
      path: '/trader/estimates', 
      icon: Calculator, 
      label: 'Estimates' 
    },
    { 
      path: '/trader/invoices', 
      icon: FileText, 
      label: 'Invoices' 
    },
    { 
      path: '/trader/customers', 
      icon: Users, 
      label: 'Customers' 
    },
    { 
      path: '/trader/inventory', 
      icon: Package, 
      label: 'Inventory' 
    },
    { 
      path: '/trader/analytics', 
      icon: TrendingUp, 
      label: 'Analytics' 
    },
    { 
      path: '/trader/settings', 
      icon: Settings, 
      label: 'Settings' 
    }
  ];

  // API hooks
  const { data: estimates, loading: estimatesLoading, refetch: refetchEstimates } = useApi(
    () => estimatesAPI.getAll({ search: searchTerm, status: statusFilter }),
    [searchTerm, statusFilter]
  );

  const { data: invoices, loading: invoicesLoading, refetch: refetchInvoices } = useApi(
    () => invoicesAPI.getAll(),
    []
  );

  const { data: customers, loading: customersLoading } = useApi(
    () => usersAPI.getAll({ role: 'customer' }),
    []
  );

  const { mutate: deleteEstimate, loading: deleteLoading } = useApiMutation(estimatesAPI.delete);
  const { mutate: createEstimate, loading: createLoading } = useApiMutation(estimatesAPI.create);
  const { mutate: updateEstimate, loading: updateLoading } = useApiMutation(estimatesAPI.update);

  // Calculate stats
  const stats = React.useMemo(() => {
    const estimatesList = estimates?.estimates || [];
    const invoicesList = invoices?.invoices || [];
    const customersList = customers?.users || [];

    const totalRevenue = invoicesList
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    const pendingAmount = invoicesList
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0);

    return [
      {
        title: 'Total Estimates',
        value: estimatesList.length.toString(),
        change: `${estimatesList.filter(e => e.status === 'sent').length} pending`,
        icon: Calculator,
        color: 'blue'
      },
      {
        title: 'Active Customers',
        value: customersList.length.toString(),
        change: `${customersList.filter(c => c.status === 'active').length} active`,
        icon: Users,
        color: 'green'
      },
      {
        title: 'Total Revenue',
        value: `₹${totalRevenue.toLocaleString()}`,
        change: `${invoicesList.filter(i => i.status === 'paid').length} paid invoices`,
        icon: TrendingUp,
        color: 'purple'
      },
      {
        title: 'Pending Amount',
        value: `₹${pendingAmount.toLocaleString()}`,
        change: `${invoicesList.filter(i => i.status !== 'paid').length} pending`,
        icon: FileText,
        color: 'amber'
      }
    ];
  }, [estimates, invoices, customers]);

  const handleCreateEstimate = () => {
    setEditingEstimate(null);
    setShowEstimateForm(true);
  };

  const handleEditEstimate = (estimate) => {
    setEditingEstimate(estimate);
    setShowEstimateForm(true);
  };

  const handleDeleteEstimate = async (estimate) => {
    if (window.confirm('Are you sure you want to delete this estimate?')) {
      try {
        await deleteEstimate(estimate._id);
        success('Estimate deleted successfully');
        refetchEstimates();
      } catch (err) {
        error('Failed to delete estimate');
      }
    }
  };

  const handleEstimateSubmit = async (estimateData) => {
    try {
      if (editingEstimate) {
        await updateEstimate(editingEstimate._id, estimateData);
        success('Estimate updated successfully');
      } else {
        await createEstimate(estimateData);
        success('Estimate created successfully');
      }
      setShowEstimateForm(false);
      setEditingEstimate(null);
      refetchEstimates();
    } catch (err) {
      error('Failed to save estimate');
    }
  };

  const handleConvertToInvoice = (estimate) => {
    setSelectedEstimate(estimate);
    setShowInvoiceForm(true);
  };

  const handleInvoiceSubmit = (invoiceData) => {
    setShowInvoiceForm(false);
    setSelectedEstimate(null);
    success('Invoice created successfully');
    refetchInvoices();
    refetchEstimates();
  };

  const DashboardOverview = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Trader Dashboard</h1>
          <p>Manage your estimates, track sales, and grow your business.</p>
        </div>
        <Button onClick={handleCreateEstimate} icon={<Plus />}>
          Create Estimate
        </Button>
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
            <Input
              placeholder="Search estimates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search />}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'sent', label: 'Sent' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'expired', label: 'Expired' },
                { value: 'converted', label: 'Converted' }
              ]}
            />
          </div>
        </div>

        {estimatesLoading ? (
          <Loading text="Loading estimates..." />
        ) : (
          <div className="estimates-grid">
            {estimates?.estimates?.slice(0, 6).map((estimate) => (
              <EstimateCard
                key={estimate._id}
                estimate={estimate}
                userRole="trader"
                onView={(est) => navigate(`/trader/estimates/${est._id}`)}
                onEdit={handleEditEstimate}
                onDelete={handleDeleteEstimate}
                onConvertToInvoice={handleConvertToInvoice}
              />
            ))}
          </div>
        )}

        {estimates?.estimates?.length === 0 && (
          <div className="empty-state">
            <Calculator size={48} />
            <h3>No estimates yet</h3>
            <p>Create your first estimate to get started</p>
            <Button onClick={handleCreateEstimate} icon={<Plus />}>
              Create Estimate
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const EstimatesPage = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Estimates Management</h1>
          <p>Create, edit, and track all your customer estimates.</p>
        </div>
        <Button onClick={handleCreateEstimate} icon={<Plus />}>
          Create New Estimate
        </Button>
      </div>

      <div className="content-section">
        <div className="section-header">
          <div className="search-filters">
            <Input
              placeholder="Search by customer name, phone, or estimate ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search />}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'sent', label: 'Sent' },
                { value: 'accepted', label: 'Accepted' },
                { value: 'rejected', label: 'Rejected' },
                { value: 'expired', label: 'Expired' },
                { value: 'converted', label: 'Converted' }
              ]}
            />
          </div>
        </div>

        {estimatesLoading ? (
          <Loading text="Loading estimates..." />
        ) : (
          <div className="estimates-grid">
            {estimates?.estimates?.map((estimate) => (
              <EstimateCard
                key={estimate._id}
                estimate={estimate}
                userRole="trader"
                onView={(est) => navigate(`/trader/estimates/${est._id}`)}
                onEdit={handleEditEstimate}
                onDelete={handleDeleteEstimate}
                onConvertToInvoice={handleConvertToInvoice}
              />
            ))}
          </div>
        )}

        {estimates?.estimates?.length === 0 && (
          <div className="empty-state">
            <Calculator size={48} />
            <h3>No estimates found</h3>
            <p>Try adjusting your search criteria or create a new estimate</p>
            <Button onClick={handleCreateEstimate} icon={<Plus />}>
              Create Estimate
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout navigationItems={navigationItems} userRole="trader">
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/estimates" element={<EstimatesPage />} />
        <Route path="/invoices" element={<div className="dashboard-content"><h1>Invoices</h1></div>} />
        <Route path="/customers" element={<div className="dashboard-content"><h1>Customers</h1></div>} />
        <Route path="/inventory" element={<div className="dashboard-content"><h1>Inventory</h1></div>} />
        <Route path="/analytics" element={<div className="dashboard-content"><h1>Analytics</h1></div>} />
        <Route path="/settings" element={<div className="dashboard-content"><h1>Settings</h1></div>} />
      </Routes>

      {/* Estimate Form Modal */}
      <Modal
        isOpen={showEstimateForm}
        onClose={() => {
          setShowEstimateForm(false);
          setEditingEstimate(null);
        }}
        title={editingEstimate ? 'Edit Estimate' : 'Create New Estimate'}
        size="xl"
      >
        <EstimateForm
          estimate={editingEstimate}
          onSubmit={handleEstimateSubmit}
          onCancel={() => {
            setShowEstimateForm(false);
            setEditingEstimate(null);
          }}
          isEditing={!!editingEstimate}
        />
      </Modal>

      {/* Invoice Form Modal */}
      <Modal
        isOpen={showInvoiceForm}
        onClose={() => {
          setShowInvoiceForm(false);
          setSelectedEstimate(null);
        }}
        title="Create Invoice"
        size="lg"
      >
        <InvoiceForm
          estimate={selectedEstimate}
          onSubmit={handleInvoiceSubmit}
          onCancel={() => {
            setShowInvoiceForm(false);
            setSelectedEstimate(null);
          }}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default TraderDashboard;