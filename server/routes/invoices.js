import express from 'express';
import Invoice from '../models/Invoice.js';
import Estimate from '../models/Estimate.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all invoices
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const { userId, role } = req.user;

    // Build query based on user role
    let query = {};
    
    if (role === 'customer') {
      query.customer = userId;
    } else if (role === 'trader') {
      query.trader = userId;
    }

    // Add filters
    if (status) query.status = status;

    // Add search functionality
    if (search) {
      query.$or = [
        { invoiceId: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const invoices = await Invoice.find(query)
      .populate('trader', 'name companyName email phone')
      .populate('customer', 'name email phone')
      .populate('estimateId', 'estimateId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Invoice.countDocuments(query);

    res.json({
      invoices,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
});

// Get single invoice
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('trader', 'name companyName email phone address')
      .populate('customer', 'name email phone')
      .populate('estimateId', 'estimateId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check permissions
    const { userId, role } = req.user;
    if (role !== 'admin' && 
        invoice.trader._id.toString() !== userId && 
        invoice.customer._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark as viewed if customer is viewing
    if (role === 'customer' && invoice.customer._id.toString() === userId && !invoice.viewedAt) {
      invoice.viewedAt = new Date();
      await invoice.save();
    }

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Failed to fetch invoice' });
  }
});

// Create invoice from estimate
router.post('/from-estimate/:estimateId', auth, async (req, res) => {
  try {
    const { role, userId } = req.user;
    
    // Only traders can create invoices
    if (role !== 'trader') {
      return res.status(403).json({ message: 'Only traders can create invoices' });
    }

    const estimate = await Estimate.findById(req.params.estimateId);
    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found' });
    }

    // Check if trader owns the estimate
    if (estimate.trader.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if estimate is accepted
    if (estimate.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted estimates can be converted to invoices' });
    }

    // Check if already converted
    if (estimate.convertedToInvoice) {
      return res.status(400).json({ message: 'This estimate has already been converted to an invoice' });
    }

    // Create invoice from estimate
    const invoiceData = {
      estimateId: estimate._id,
      trader: estimate.trader,
      customer: estimate.customer,
      customerInfo: estimate.customerInfo,
      items: estimate.items,
      subtotal: estimate.subtotal,
      discount: estimate.discount,
      loadingCharges: estimate.loadingCharges,
      tax: estimate.tax,
      totalAmount: estimate.totalAmount,
      dueDate: req.body.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      notes: req.body.notes || estimate.notes,
      terms: req.body.terms || estimate.terms
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Update estimate
    estimate.status = 'converted';
    estimate.convertedToInvoice = true;
    estimate.invoiceId = invoice._id;
    await estimate.save();

    await invoice.populate('trader', 'name companyName email phone address');
    await invoice.populate('customer', 'name email phone');

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Failed to create invoice', error: error.message });
  }
});

// Create standalone invoice
router.post('/', auth, async (req, res) => {
  try {
    const { role, userId } = req.user;
    
    // Only traders can create invoices
    if (role !== 'trader') {
      return res.status(403).json({ message: 'Only traders can create invoices' });
    }

    const invoiceData = {
      ...req.body,
      trader: userId
    };

    // Calculate item totals
    if (invoiceData.items) {
      invoiceData.items = invoiceData.items.map(item => {
        const discountAmount = (item.unitPrice * item.quantity * item.discount) / 100;
        item.totalPrice = (item.unitPrice * item.quantity) - discountAmount;
        return item;
      });
    }

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    await invoice.populate('trader', 'name companyName email phone address');
    await invoice.populate('customer', 'name email phone');

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ message: 'Failed to create invoice', error: error.message });
  }
});

// Add payment to invoice
router.post('/:id/payments', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check permissions
    const { userId, role } = req.user;
    if (role !== 'admin' && invoice.trader.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const paymentData = {
      ...req.body,
      paymentDate: req.body.paymentDate || new Date()
    };

    await invoice.addPayment(paymentData);
    await invoice.populate('trader', 'name companyName email phone address');
    await invoice.populate('customer', 'name email phone');

    res.json(invoice);
  } catch (error) {
    console.error('Add payment error:', error);
    res.status(500).json({ message: 'Failed to add payment' });
  }
});

// Update invoice
router.put('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check permissions
    const { userId, role } = req.user;
    if (role !== 'admin' && invoice.trader.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Don't allow editing if already paid
    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Cannot edit paid invoices' });
    }

    // Calculate item totals if items are updated
    if (req.body.items) {
      req.body.items = req.body.items.map(item => {
        const discountAmount = (item.unitPrice * item.quantity * item.discount) / 100;
        item.totalPrice = (item.unitPrice * item.quantity) - discountAmount;
        return item;
      });
    }

    Object.assign(invoice, req.body);
    await invoice.save();

    await invoice.populate('trader', 'name companyName email phone address');
    await invoice.populate('customer', 'name email phone');

    res.json(invoice);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Failed to update invoice' });
  }
});

// Delete invoice
router.delete('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check permissions
    const { userId, role } = req.user;
    if (role !== 'admin' && invoice.trader.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Don't allow deletion if payments have been made
    if (invoice.paidAmount > 0) {
      return res.status(400).json({ message: 'Cannot delete invoices with payments' });
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ message: 'Failed to delete invoice' });
  }
});

export default router;