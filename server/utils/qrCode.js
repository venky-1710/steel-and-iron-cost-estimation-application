import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

// Create QR codes directory if it doesn't exist
const qrDir = path.join(process.env.UPLOAD_PATH || './uploads', 'qr-codes');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

const generatePaymentQR = async (amount, invoiceId, customerName) => {
  try {
    const upiId = process.env.UPI_ID;
    const merchantName = process.env.MERCHANT_NAME || 'BuildEstimate';
    
    if (!upiId) {
      throw new Error('UPI ID not configured in environment variables');
    }

    // UPI payment URL format
    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Payment for Invoice ${invoiceId}`)}&tr=${invoiceId}`;
    
    // Generate QR code
    const qrFileName = `qr-${invoiceId}-${Date.now()}.png`;
    const qrFilePath = path.join(qrDir, qrFileName);
    
    await QRCode.toFile(qrFilePath, upiUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return {
      qrCodeUrl: `/uploads/qr-codes/${qrFileName}`,
      upiUrl,
      filePath: qrFilePath
    };
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw error;
  }
};

const generateQRCodeDataURL = async (data) => {
  try {
    const qrDataURL = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrDataURL;
  } catch (error) {
    console.error('QR Code data URL generation failed:', error);
    throw error;
  }
};

const deleteQRCode = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('QR Code file deleted:', filePath);
    }
  } catch (error) {
    console.error('Error deleting QR Code file:', error);
  }
};

export {
  generatePaymentQR,
  generateQRCodeDataURL,
  deleteQRCode
};