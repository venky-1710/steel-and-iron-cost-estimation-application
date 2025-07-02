import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  }
});

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  method: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'card'],
    required: true
  },
  transactionId: String,
  paymentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  notes: String
});

const invoiceSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    unique: true,
    required: true
  },
  estimateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estimate'
  },
  trader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerInfo: {
    name: String,
    phone: String,
    email: String,
    address: String
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  loadingCharges: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'partial_paid', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  dueDate: {
    type: Date,
    required: true
  },
  payments: [paymentSchema],
  notes: {
    type: String,
    trim: true
  },
  terms: {
    type: String,
    trim: true
  },
  qrCode: {
    upiId: String,
    qrCodeUrl: String,
    generatedAt: Date
  },
  digitalSignature: {
    signatureUrl: String,
    signedAt: Date,
    signedBy: String
  },
  watermark: {
    type: String,
    default: 'ORIGINAL'
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  emailSent: {
    type: Boolean,
    default: false
  },
  whatsappSent: {
    type: Boolean,
    default: false
  },
  viewedAt: Date,
  lastReminderSent: Date,
  reminderCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate invoice ID
invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceId) {
    const count = await this.constructor.countDocuments();
    this.invoiceId = `INV${String(count + 1).padStart(6, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Calculate totals and balance before saving
invoiceSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Calculate total amount
  const discountAmount = (this.subtotal * this.discount) / 100;
  const taxableAmount = this.subtotal - discountAmount + this.loadingCharges;
  const taxAmount = (taxableAmount * this.tax) / 100;
  this.totalAmount = taxableAmount + taxAmount;
  
  // Calculate paid amount from payments
  this.paidAmount = this.payments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate balance amount
  this.balanceAmount = this.totalAmount - this.paidAmount;
  
  // Update status based on payment
  if (this.paidAmount === 0) {
    if (this.status === 'partial_paid' || this.status === 'paid') {
      this.status = 'sent';
    }
  } else if (this.paidAmount >= this.totalAmount) {
    this.status = 'paid';
  } else {
    this.status = 'partial_paid';
  }
  
  // Check if overdue
  if (this.balanceAmount > 0 && new Date() > this.dueDate && this.status !== 'paid') {
    this.status = 'overdue';
  }
  
  next();
});

// Check if invoice is overdue
invoiceSchema.methods.isOverdue = function() {
  return this.balanceAmount > 0 && new Date() > this.dueDate;
};

// Add payment method
invoiceSchema.methods.addPayment = function(paymentData) {
  this.payments.push(paymentData);
  return this.save();
};

export default mongoose.model('Invoice', invoiceSchema);