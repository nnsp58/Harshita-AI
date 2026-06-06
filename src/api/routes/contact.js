const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !phone || !subject || !message) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const targetEmail = process.env.CREATOR_EMAIL || 'nnsp58@gmail.com';

    // If EMAIL_USER is not set in env, we just log it and simulate success for now
    // until the user sets up their app password
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`[Contact Form Simulation] Email would be sent to: ${targetEmail}`);
      console.log(`From: ${name} (${phone}, ${email})`);
      console.log(`Subject: ${subject}`);
      console.log(`Message: ${message}`);
      return res.json({ success: true, simulated: true });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      replyTo: email || undefined,
      to: targetEmail,
      subject: `New Contact Request: ${subject}`,
      html: `
        <h2>New Contact Request from Harshita AI Portal</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('[Contact API Error]:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
