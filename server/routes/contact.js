import express from 'express';
import nodemailer from 'nodemailer';
import { emailConfig } from '../config/email.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @route   POST /api/contact
 * @desc    Send contact form submission
 * @access  Public
 */
router.post('/', async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Input validation
  if (!name || !email || !phone || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  try {
    // Create email transporter
    const transporter = nodemailer.createTransport(emailConfig);

    // Email content
    const mailOptions = {
      from: emailConfig.auth.user,
      to: process.env.CONTACT_EMAIL || 'builtestimate@gmail.com',
      subject: `[Contact Form] New inquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    // Log successful contact
    logger.info('Contact form submitted', { name, email, phone });

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent! We will contact you soon.'
    });
  } catch (error) {
    logger.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send your message. Please try again later.'
    });
  }
});

export default router;
