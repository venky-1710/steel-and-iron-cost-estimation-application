import express from 'express';
import Estimate from '../models/Estimate.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all estimates (with filtering and pagination)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, customerId, traderId } = req.query;
    const { userId, role } = req.user;

    // Build query based on user role
    let query = {};
    
    if (role === 'customer') {
      query.customer = userId;
    } else if (role === 'trader') {
      query.trader = userId;
    }
    // Admin can see all estimates

    // Add filters
    if (status) query.status = status;
    if (customerId) query.customer = customerId;
    if (traderId) query.trader = traderId;

    // Add search functionality
    if (search) {
      query.$or = [
        { estimateId: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } }
      ];
    }

    const estimates = await Estimate.find(query)
      .populate('trader', 'name companyName email phone')
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Estimate.countDocuments(query);

    res.json({
      estimates,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get estimates error:', error);
    res.status(500).json({ message: 'Failed to fetch estimates' });
  }
});

// Get single estimate
router.get('/:id', auth, async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id)
      .populate('trader', 'name companyName email phone address')
      .populate('customer', 'name email phone');

    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found' });
    }

    // Check permissions
    const { userId, role } = req.user;
    if (role !== 'admin' && 
        estimate.trader._id.toString() !== userId && 
        estimate.customer._id.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark as viewed if customer is viewing
    if (role === 'customer' && estimate.customer._id.toString() === userId && !estimate.viewedAt) {
      estimate.viewedAt = new Date();
      estimate.status = 'viewed';
      await estimate.save();
    }

    res.json(estimate);
  } catch (error) {
    console.error('Get estimate error:', error);
    res.status(500).json({ message: 'Failed to fetch estimate' });
  }
});

// Create estimate
router.post('/', auth, async (req, res) => {
  try {
    const { role, userId } = req.user;
    
    // Only traders can create estimates
    if (role !== 'trader') {
      return res.status(403).json({ message: 'Only traders can create estimates' });
    }

    const estimateData = {
      ...req.body,
      trader: userId
    };

    // Calculate item totals
    if (estimateData.items) {
      estimateData.items = estimateData.items.map(item => {
        const discountAmount = (item.unitPrice * item.quantity * item.discount) / 100;
        item.totalPrice = (item.unitPrice * item.quantity) - discountAmount;
        return item;
      });
    }

    const estimate = new Estimate(estimateData);
    await estimate.save();

    await estimate.populate('trader', 'name companyName email phone address');
    await estimate.populate('customer', 'name email phone');

    res.status(201).json(estimate);
  } catch (error) {
    console.error('Create estimate error:', error);
    res.status(500).json({ message: 'Failed to create estimate', error: error.message });
  }
});

// Update estimate
router.put('/:id', auth, async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    
    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found' });
    }

    // Check permissions
    const { userId, role } = req.user;
    if (role !== 'admin' && estimate.trader.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Don't allow editing if already accepted or converted
    if (estimate.status === 'accepted' || estimate.status === 'converted') {
      return res.status(400).json({ message: 'Cannot edit accepted or converted estimates' });
    }

    // Calculate item totals if items are updated
    if (req.body.items) {
      req.body.items = req.body.items.map(item => {
        const discountAmount = (item.unitPrice * item.quantity * item.discount) / 100;
        item.totalPrice = (item.unitPrice * item.quantity) - discountAmount;
        return item;
      });
    }

    Object.assign(estimate, req.body);
    await estimate.save();

    await estimate.populate('trader', 'name companyName email phone address');
    await estimate.populate('customer', 'name email phone');

    res.json(estimate);
  } catch (error) {
    console.error('Update estimate error:', error);
    res.status(500).json({ message: 'Failed to update estimate' });
  }
});

// Delete estimate
router.delete('/:id', auth, async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    
    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found' });
    }

    // Check permissions
    const { userId, role } = req.user;
    if (role !== 'admin' && estimate.trader.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Don't allow deletion if already accepted or converted
    if (estimate.status === 'accepted' || estimate.status === 'converted') {
      return res.status(400).json({ message: 'Cannot delete accepted or converted estimates' });
    }

    await Estimate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Estimate deleted successfully' });
  } catch (error) {
    console.error('Delete estimate error:', error);
    res.status(500).json({ message: 'Failed to delete estimate' });
  }
});

// Accept estimate (customer action)
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    
    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found' });
    }

    // Check permissions - only customer can accept
    const { userId, role } = req.user;
    if (role !== 'customer' || estimate.customer.toString() !== userId) {
      return res.status(403).json({ message: 'Only the customer can accept this estimate' });
    }

    // Check if estimate is still valid
    if (estimate.isExpired()) {
      return res.status(400).json({ message: 'This estimate has expired' });
    }

    if (estimate.status !== 'sent' && estimate.status !== 'viewed') {
      return res.status(400).json({ message: 'This estimate cannot be accepted' });
    }

    estimate.status = 'accepted';
    estimate.acceptedAt = new Date();
    await estimate.save();

    res.json({ message: 'Estimate accepted successfully', estimate });
  } catch (error) {
    console.error('Accept estimate error:', error);
    res.status(500).json({ message: 'Failed to accept estimate' });
  }
});

// Reject estimate (customer action)
router.post('/:id/reject', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const estimate = await Estimate.findById(req.params.id);
    
    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found' });
    }

    // Check permissions - only customer can reject
    const { userId, role } = req.user;
    if (role !== 'customer' || estimate.customer.toString() !== userId) {
      return res.status(403).json({ message: 'Only the customer can reject this estimate' });
    }

    if (estimate.status === 'accepted' || estimate.status === 'converted') {
      return res.status(400).json({ message: 'This estimate cannot be rejected' });
    }

    estimate.status = 'rejected';
    estimate.rejectedAt = new Date();
    estimate.rejectionReason = reason;
    await estimate.save();

    res.json({ message: 'Estimate rejected successfully', estimate });
  } catch (error) {
    console.error('Reject estimate error:', error);
    res.status(500).json({ message: 'Failed to reject estimate' });
  }
});

// Send estimate (trader action)
router.post('/:id/send', auth, async (req, res) => {
  try {
    const estimate = await Estimate.findById(req.params.id);
    
    if (!estimate) {
      return res.status(404).json({ message: 'Estimate not found' });
    }

    // Check permissions - only trader can send
    const { userId, role } = req.user;
    if (role !== 'trader' || estimate.trader.toString() !== userId) {
      return res.status(403).json({ message: 'Only the trader can send this estimate' });
    }

    if (estimate.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft estimates can be sent' });
    }

    estimate.status = 'sent';
    await estimate.save();

    // In production, send email/WhatsApp notification here

    res.json({ message: 'Estimate sent successfully', estimate });
  } catch (error) {
    console.error('Send estimate error:', error);
    res.status(500).json({ message: 'Failed to send estimate' });
  }
});

export default router;