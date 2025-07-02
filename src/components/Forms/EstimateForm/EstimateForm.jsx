import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import Button from '../../UI/Button/Button';
import Input from '../../UI/Input/Input';
import Select from '../../UI/Select/Select';
import Textarea from '../../UI/Textarea/Textarea';
import Card from '../../UI/Card/Card';
import { useToast } from '../../UI/Toast/Toast';
import { estimatesAPI, usersAPI } from '../../../services/api';
import './EstimateForm.css';

const EstimateForm = ({ estimate, onSubmit, onCancel, isEditing = false }) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer: '',
    customerInfo: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    items: [{
      name: '',
      description: '',
      quantity: 1,
      unit: 'pcs',
      unitPrice: 0,
      discount: 0,
      totalPrice: 0
    }],
    discount: 0,
    loadingCharges: 0,
    tax: 0,
    validTill: '',
    notes: '',
    terms: ''
  });

  const unitOptions = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'tons', label: 'Tons' },
    { value: 'bags', label: 'Bags' },
    { value: 'cubic_meters', label: 'Cubic Meters' },
    { value: 'square_meters', label: 'Square Meters' },
    { value: 'feet', label: 'Feet' },
    { value: 'meters', label: 'Meters' },
    { value: 'liters', label: 'Liters' },
    { value: 'gallons', label: 'Gallons' }
  ];

  useEffect(() => {
    fetchCustomers();
    if (estimate) {
      setFormData({
        ...estimate,
        validTill: estimate.validTill ? new Date(estimate.validTill).toISOString().split('T')[0] : ''
      });
    } else {
      // Set default valid till date (30 days from now)
      const defaultValidTill = new Date();
      defaultValidTill.setDate(defaultValidTill.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        validTill: defaultValidTill.toISOString().split('T')[0]
      }));
    }
  }, [estimate]);

  const fetchCustomers = async () => {
    try {
      const response = await usersAPI.getAll({ role: 'customer' });
      setCustomers(response.users || []);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomerInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      customerInfo: {
        ...prev.customerInfo,
        [field]: value
      }
    }));
  };

  const handleCustomerSelect = (customerId) => {
    const selectedCustomer = customers.find(c => c._id === customerId);
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customer: customerId,
        customerInfo: {
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
          email: selectedCustomer.email,
          address: selectedCustomer.address || ''
        }
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // Calculate total price for the item
    if (field === 'quantity' || field === 'unitPrice' || field === 'discount') {
      const item = updatedItems[index];
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = (subtotal * item.discount) / 100;
      item.totalPrice = subtotal - discountAmount;
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        name: '',
        description: '',
        quantity: 1,
        unit: 'pcs',
        unitPrice: 0,
        discount: 0,
        totalPrice: 0
      }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const taxableAmount = subtotal - discountAmount + formData.loadingCharges;
    const taxAmount = (taxableAmount * formData.tax) / 100;
    const totalAmount = taxableAmount + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      totalAmount
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.customerInfo.name || !formData.customerInfo.phone) {
        throw new Error('Customer name and phone are required');
      }

      if (formData.items.some(item => !item.name || item.quantity <= 0 || item.unitPrice <= 0)) {
        throw new Error('All items must have valid name, quantity, and unit price');
      }

      const submitData = {
        ...formData,
        validTill: new Date(formData.validTill)
      };

      let response;
      if (isEditing) {
        response = await estimatesAPI.update(estimate._id, submitData);
      } else {
        response = await estimatesAPI.create(submitData);
      }

      success(isEditing ? 'Estimate updated successfully' : 'Estimate created successfully');
      onSubmit(response);
    } catch (err) {
      error(err.message || 'Failed to save estimate');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <form onSubmit={handleSubmit} className="estimate-form">
      <div className="form-grid">
        {/* Customer Information */}
        <Card className="customer-section">
          <Card.Header>
            <h3>Customer Information</h3>
          </Card.Header>
          <Card.Content>
            <div className="form-row">
              <Select
                label="Select Existing Customer"
                value={formData.customer}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                options={[
                  { value: '', label: 'Select a customer or enter manually' },
                  ...customers.map(customer => ({
                    value: customer._id,
                    label: `${customer.name} (${customer.phone})`
                  }))
                ]}
              />
            </div>
            
            <div className="form-row">
              <Input
                label="Customer Name"
                value={formData.customerInfo.name}
                onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={formData.customerInfo.phone}
                onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                required
              />
            </div>
            
            <div className="form-row">
              <Input
                label="Email"
                type="email"
                value={formData.customerInfo.email}
                onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
              />
            </div>
            
            <Textarea
              label="Address"
              value={formData.customerInfo.address}
              onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
              rows={3}
            />
          </Card.Content>
        </Card>

        {/* Items Section */}
        <Card className="items-section">
          <Card.Header>
            <h3>Items</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              icon={<Plus />}
            >
              Add Item
            </Button>
          </Card.Header>
          <Card.Content>
            <div className="items-list">
              {formData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-header">
                    <h4>Item {index + 1}</h4>
                    {formData.items.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem(index)}
                        icon={<Trash2 />}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="item-fields">
                    <div className="form-row">
                      <Input
                        label="Item Name"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        required
                      />
                      <Input
                        label="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      />
                    </div>
                    
                    <div className="form-row">
                      <Input
                        label="Quantity"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        required
                      />
                      <Select
                        label="Unit"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        options={unitOptions}
                        required
                      />
                      <Input
                        label="Unit Price (₹)"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </div>
                    
                    <div className="form-row">
                      <Input
                        label="Discount (%)"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                      />
                      <div className="total-price">
                        <label>Total Price</label>
                        <div className="price-display">₹{item.totalPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Calculations Section */}
        <Card className="calculations-section">
          <Card.Header>
            <h3>Calculations</h3>
          </Card.Header>
          <Card.Content>
            <div className="form-row">
              <Input
                label="Overall Discount (%)"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.discount}
                onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Loading Charges (₹)"
                type="number"
                min="0"
                step="0.01"
                value={formData.loadingCharges}
                onChange={(e) => handleInputChange('loadingCharges', parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Tax (%)"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.tax}
                onChange={(e) => handleInputChange('tax', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="totals-summary">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Discount ({formData.discount}%):</span>
                <span>-₹{totals.discountAmount.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Loading Charges:</span>
                <span>₹{formData.loadingCharges.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax ({formData.tax}%):</span>
                <span>₹{totals.taxAmount.toFixed(2)}</span>
              </div>
              <div className="total-row final-total">
                <span>Total Amount:</span>
                <span>₹{totals.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Additional Information */}
        <Card className="additional-section">
          <Card.Header>
            <h3>Additional Information</h3>
          </Card.Header>
          <Card.Content>
            <div className="form-row">
              <Input
                label="Valid Till"
                type="date"
                value={formData.validTill}
                onChange={(e) => handleInputChange('validTill', e.target.value)}
                required
              />
            </div>
            
            <Textarea
              label="Notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any additional notes for the customer..."
              rows={3}
            />
            
            <Textarea
              label="Terms & Conditions"
              value={formData.terms}
              onChange={(e) => handleInputChange('terms', e.target.value)}
              placeholder="Terms and conditions for this estimate..."
              rows={3}
            />
          </Card.Content>
        </Card>
      </div>

      {/* Form Actions */}
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
          icon={<Calculator />}
        >
          {isEditing ? 'Update Estimate' : 'Create Estimate'}
        </Button>
      </div>
    </form>
  );
};

export default EstimateForm;