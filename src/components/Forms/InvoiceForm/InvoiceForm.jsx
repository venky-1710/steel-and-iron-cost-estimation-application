import React, { useState, useEffect } from 'react';
import { FileText, Calculator } from 'lucide-react';
import Button from '../../UI/Button/Button';
import Input from '../../UI/Input/Input';
import Textarea from '../../UI/Textarea/Textarea';
import Card from '../../UI/Card/Card';
import { useToast } from '../../UI/Toast/Toast';
import { invoicesAPI } from '../../../services/api';
import './InvoiceForm.css';

const InvoiceForm = ({ estimate, onSubmit, onCancel }) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dueDate: '',
    notes: '',
    terms: ''
  });

  useEffect(() => {
    // Set default due date (30 days from now)
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      dueDate: defaultDueDate.toISOString().split('T')[0],
      notes: estimate?.notes || '',
      terms: estimate?.terms || ''
    }));
  }, [estimate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        dueDate: new Date(formData.dueDate)
      };

      const response = await invoicesAPI.createFromEstimate(estimate._id, submitData);
      success('Invoice created successfully');
      onSubmit(response);
    } catch (err) {
      error(err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  if (!estimate) {
    return (
      <div className="invoice-form-error">
        <p>No estimate data available to create invoice.</p>
        <Button onClick={onCancel}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="invoice-form">
      <Card>
        <Card.Header>
          <h2>Create Invoice from Estimate #{estimate.estimateId}</h2>
        </Card.Header>
        <Card.Content>
          {/* Estimate Summary */}
          <div className="estimate-summary">
            <h3>Estimate Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <label>Customer:</label>
                <span>{estimate.customerInfo?.name}</span>
              </div>
              <div className="summary-item">
                <label>Phone:</label>
                <span>{estimate.customerInfo?.phone}</span>
              </div>
              <div className="summary-item">
                <label>Total Amount:</label>
                <span className="amount">₹{estimate.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <label>Items:</label>
                <span>{estimate.items?.length} items</span>
              </div>
            </div>
          </div>

          {/* Invoice Form */}
          <form onSubmit={handleSubmit} className="invoice-details">
            <h3>Invoice Details</h3>
            
            <div className="form-row">
              <Input
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                required
              />
            </div>
            
            <Textarea
              label="Invoice Notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes for the invoice..."
              rows={3}
            />
            
            <Textarea
              label="Payment Terms"
              value={formData.terms}
              onChange={(e) => handleInputChange('terms', e.target.value)}
              placeholder="Payment terms and conditions..."
              rows={3}
            />

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                icon={<FileText />}
              >
                Create Invoice
              </Button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
};

export default InvoiceForm;