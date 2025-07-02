import nodemailer from 'nodemailer';

// Email configuration using environment variables
const createEmailTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Email configuration incomplete. Email features will be disabled.');
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

const sendEmail = async (to, subject, html, text = null) => {
  const transporter = createEmailTransporter();
  
  if (!transporter) {
    throw new Error('Email service not configured');
  }

  const mailOptions = {
    from: {
      name: process.env.EMAIL_FROM_NAME || 'BuildEstimate',
      address: process.env.EMAIL_FROM || process.env.SMTP_USER
    },
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  welcomeEmail: (name, role) => ({
    subject: 'Welcome to BuildEstimate',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Welcome to BuildEstimate!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for registering as a ${role} on our platform.</p>
        ${role === 'trader' ? 
          '<p>Your account is currently pending admin approval. You will be notified once approved.</p>' : 
          '<p>You can now start using all the features available to you.</p>'
        }
        <p>Best regards,<br>BuildEstimate Team</p>
      </div>
    `
  }),

  traderApprovalEmail: (name, approved) => ({
    subject: approved ? 'Account Approved - BuildEstimate' : 'Account Application Update - BuildEstimate',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${approved ? '#10b981' : '#ef4444'};">
          Account ${approved ? 'Approved' : 'Application Update'}
        </h2>
        <p>Dear ${name},</p>
        ${approved ? 
          '<p>Congratulations! Your trader account has been approved. You can now access all trader features.</p>' :
          '<p>We regret to inform you that your trader application could not be approved at this time.</p>'
        }
        <p>Best regards,<br>BuildEstimate Team</p>
      </div>
    `
  }),

  estimateNotificationEmail: (customerName, estimateId, traderName, amount) => ({
    subject: `New Estimate #${estimateId} from ${traderName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">New Estimate Received</h2>
        <p>Dear ${customerName},</p>
        <p>You have received a new estimate from ${traderName}.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Estimate ID:</strong> #${estimateId}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>From:</strong> ${traderName}</p>
        </div>
        <p>Please log in to your account to view the complete estimate details.</p>
        <p>Best regards,<br>BuildEstimate Team</p>
      </div>
    `
  }),

  invoiceNotificationEmail: (customerName, invoiceId, amount, dueDate) => ({
    subject: `Invoice #${invoiceId} - Payment Due`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Invoice Payment Due</h2>
        <p>Dear ${customerName},</p>
        <p>This is a reminder that your invoice payment is due.</p>
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Invoice ID:</strong> #${invoiceId}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p>Please make the payment at your earliest convenience to avoid any late fees.</p>
        <p>Best regards,<br>BuildEstimate Team</p>
      </div>
    `
  })
};

export {
  sendEmail,
  emailTemplates,
  createEmailTransporter
};