import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;

    let query = {};
    
    // Add filters
    if (role) query.role = role;
    if (status) query.status = status;

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get pending traders (admin only)
router.get('/pending-traders', auth, adminAuth, async (req, res) => {
  try {
    const pendingTraders = await User.find({
      role: 'trader',
      status: 'pending'
    }).select('-password').sort({ createdAt: -1 });

    res.json(pendingTraders);
  } catch (error) {
    console.error('Get pending traders error:', error);
    res.status(500).json({ message: 'Failed to fetch pending traders' });
  }
});

// Approve trader (admin only)
router.post('/:id/approve', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'trader') {
      return res.status(400).json({ message: 'Only traders can be approved' });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ message: 'User is not pending approval' });
    }

    user.status = 'active';
    await user.save();

    // In production, send approval email/notification here

    res.json({ message: 'Trader approved successfully', user });
  } catch (error) {
    console.error('Approve trader error:', error);
    res.status(500).json({ message: 'Failed to approve trader' });
  }
});

// Reject trader (admin only)
router.post('/:id/reject', auth, adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'trader') {
      return res.status(400).json({ message: 'Only traders can be rejected' });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({ message: 'User is not pending approval' });
    }

    user.status = 'suspended';
    await user.save();

    // In production, send rejection email with reason

    res.json({ message: 'Trader rejected successfully', user });
  } catch (error) {
    console.error('Reject trader error:', error);
    res.status(500).json({ message: 'Failed to reject trader' });
  }
});

// Update user status (admin only)
router.put('/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    user.status = status;
    await user.save();

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, companyName, address, referralTags } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (companyName && user.role === 'trader') user.companyName = companyName;
    if (address && user.role === 'trader') user.address = address;
    if (referralTags) user.referralTags = referralTags;

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

export default router;