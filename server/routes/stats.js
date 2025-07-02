import express from 'express';
import User from '../models/User.js';
import Estimate from '../models/Estimate.js';
import Invoice from '../models/Invoice.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route   GET /api/stats/public
 * @desc    Get public stats for homepage
 * @access  Public
 */
router.get('/public', async (req, res) => {
  try {
    // Get active traders count
    const traderCount = await User.countDocuments({ 
      role: 'trader', 
      status: 'active' 
    });
    
    // Get total estimates count
    const estimateCount = await Estimate.countDocuments();
    
    // Calculate total invoice value processed
    const invoices = await Invoice.find({ status: 'paid' });
    const totalInvoiceValue = invoices.reduce((total, invoice) => {
      return total + (invoice.totalAmount || 0);
    }, 0);

    // Calculate stats for dashboard user count
    const customerCount = await User.countDocuments({ role: 'customer' });
    
    // Format invoice amount with appropriate units (L for lakhs, K for thousands)
    let formattedInvoiceValue = '';
    if (totalInvoiceValue >= 100000) {
      formattedInvoiceValue = `₹${(totalInvoiceValue / 100000).toFixed(1)}L+`;
    } else if (totalInvoiceValue >= 1000) {
      formattedInvoiceValue = `₹${(totalInvoiceValue / 1000).toFixed(1)}K+`;
    } else {
      formattedInvoiceValue = `₹${totalInvoiceValue.toFixed(2)}+`;
    }

    res.json({
      success: true,
      stats: {
        activeTraders: `${traderCount}+`,
        estimatesCreated: `${estimateCount}+`,
        invoicesProcessed: formattedInvoiceValue,
        totalUsers: `${traderCount + customerCount}+`
      }
    });
  } catch (error) {
    logger.error('Error fetching public stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching public stats',
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/stats/dashboard
 * @desc    Get more detailed stats for admin dashboard
 * @access  Private (Admin only)
 */
router.get('/dashboard', async (req, res) => {
  try {
    // Get user count by role and status
    const userStats = {
      totalUsers: await User.countDocuments(),
      activeTraders: await User.countDocuments({ role: 'trader', status: 'active' }),
      pendingTraders: await User.countDocuments({ role: 'trader', status: 'pending' }),
      customers: await User.countDocuments({ role: 'customer' }),
    };
    
    // Get estimate stats by status
    const estimateStats = {
      total: await Estimate.countDocuments(),
      draft: await Estimate.countDocuments({ status: 'draft' }),
      sent: await Estimate.countDocuments({ status: 'sent' }),
      accepted: await Estimate.countDocuments({ status: 'accepted' }),
      rejected: await Estimate.countDocuments({ status: 'rejected' }),
      converted: await Estimate.countDocuments({ status: 'converted' }),
    };
    
    // Get invoice stats by status
    const invoiceStats = {
      total: await Invoice.countDocuments(),
      paid: await Invoice.countDocuments({ status: 'paid' }),
      pending: await Invoice.countDocuments({ status: { $in: ['draft', 'sent', 'viewed', 'partial_paid'] } }),
      overdue: await Invoice.countDocuments({ status: 'overdue' }),
    };
    
    // Calculate financial metrics
    const paidInvoices = await Invoice.find({ status: 'paid' });
    const pendingInvoices = await Invoice.find({ status: { $ne: 'paid' } });
    
    const financialStats = {
      totalRevenue: paidInvoices.reduce((total, invoice) => total + (invoice.totalAmount || 0), 0),
      pendingAmount: pendingInvoices.reduce((total, invoice) => total + (invoice.balanceAmount || 0), 0),
    };

    res.json({
      success: true,
      stats: {
        users: userStats,
        estimates: estimateStats,
        invoices: invoiceStats,
        financial: financialStats
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard stats',
      error: error.message 
    });
  }
});

export default router;
