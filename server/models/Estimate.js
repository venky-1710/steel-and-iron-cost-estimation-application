import mongoose from 'mongoose';

const estimateItemSchema = new mongoose.Schema({
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

const estimateSchema = new mongoose.Schema({
  estimateId: {
    type: String,
    unique: true,
    required: true
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
  items: [estimateItemSchema],
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
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'],
    default: 'draft'
  },
  validTill: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  terms: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewedAt: Date,
  acceptedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  convertedToInvoice: {
    type: Boolean,
    default: false
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
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

// Generate estimate ID
estimateSchema.pre('save', async function(next) {
  if (!this.estimateId) {
    const count = await this.constructor.countDocuments();
    this.estimateId = `EST${String(count + 1).padStart(6, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Calculate totals before saving
estimateSchema.pre('save', function(next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Calculate total amount
  const discountAmount = (this.subtotal * this.discount) / 100;
  const taxableAmount = this.subtotal - discountAmount + this.loadingCharges;
  const taxAmount = (taxableAmount * this.tax) / 100;
  this.totalAmount = taxableAmount + taxAmount;
  
  next();
});

// Check if estimate is expired
estimateSchema.methods.isExpired = function() {
  return new Date() > this.validTill;
};

// Auto-expire estimates
estimateSchema.methods.checkAndUpdateExpiry = function() {
  if (this.isExpired() && this.status === 'sent') {
    this.status = 'expired';
    return this.save();
  }
  return Promise.resolve(this);
};

export default mongoose.model('Estimate', estimateSchema);