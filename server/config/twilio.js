import twilio from 'twilio';

// Twilio configuration using environment variables
const createTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('Twilio configuration incomplete. SMS/WhatsApp features will be disabled.');
    return null;
  }

  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

const sendSMS = async (to, message) => {
  const client = createTwilioClient();
  
  if (!client) {
    throw new Error('Twilio service not configured');
  }

  if (!process.env.TWILIO_PHONE_NUMBER) {
    throw new Error('Twilio phone number not configured');
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    console.log('SMS sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

const sendWhatsApp = async (to, message) => {
  const client = createTwilioClient();
  
  if (!client) {
    throw new Error('Twilio service not configured');
  }

  if (!process.env.TWILIO_WHATSAPP_NUMBER) {
    throw new Error('Twilio WhatsApp number not configured');
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`
    });
    
    console.log('WhatsApp message sent successfully:', result.sid);
    return result;
  } catch (error) {
    console.error('WhatsApp sending failed:', error);
    throw error;
  }
};

// Message templates
const messageTemplates = {
  estimateNotification: (customerName, estimateId, traderName, amount) => 
    `Hi ${customerName}, you have received a new estimate #${estimateId} from ${traderName} for ₹${amount}. Please check your BuildEstimate account for details.`,

  invoiceReminder: (customerName, invoiceId, amount, dueDate) =>
    `Hi ${customerName}, reminder: Invoice #${invoiceId} for ₹${amount} is due on ${dueDate}. Please make payment to avoid late fees.`,

  paymentConfirmation: (customerName, invoiceId, amount) =>
    `Hi ${customerName}, we have received your payment of ₹${amount} for invoice #${invoiceId}. Thank you!`,

  traderApproval: (traderName, approved) =>
    approved 
      ? `Hi ${traderName}, congratulations! Your BuildEstimate trader account has been approved. You can now access all features.`
      : `Hi ${traderName}, we regret to inform you that your trader application could not be approved at this time.`,

  estimateAccepted: (traderName, estimateId, customerName) =>
    `Hi ${traderName}, great news! ${customerName} has accepted your estimate #${estimateId}. You can now create an invoice.`,

  estimateExpired: (customerName, estimateId) =>
    `Hi ${customerName}, your estimate #${estimateId} has expired. Please contact the trader for a new quote if still interested.`
};

export {
  sendSMS,
  sendWhatsApp,
  messageTemplates,
  createTwilioClient
};