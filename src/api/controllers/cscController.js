const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const prisma = new PrismaClient();

class CSCController {
  // CSC Signup
  async signup(req, res) {
    try {
      const { name, address, contactEmail, contactPhone, vleId, plan } = req.body;

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: contactEmail }
      });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      // Create CSC
      const csc = await prisma.cSC.create({
        data: {
          name,
          address,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          vle_id: vleId,
          plan: plan || 'free',
          expires_at: plan === 'free' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
        }
      });

      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminUser = await prisma.user.create({
        data: {
          email: contactEmail,
          password_hash: hashedPassword,
          name: `${name} Admin`,
          role: 'csc_admin',
          csc_id: csc.id
        }
      });

      res.json({
        success: true,
        message: 'CSC registered successfully. Default login: email/password',
        csc: { id: csc.id, name: csc.name },
        admin: { email: adminUser.email, password: 'admin123' }
      });
    } catch (error) {
      console.error('CSC signup error:', error);
      if (error.code === 'P2002') {
        res.status(400).json({ success: false, message: 'Email or CSC name already exists' });
      } else {
        res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
      }
    }
  }

  // CSC Dashboard
  async getDashboard(req, res) {
    try {
      const cscId = req.user.cscId;

      const [totalCandidates, activeJobs, completedJobs] = await Promise.all([
        prisma.candidate.count({ where: { csc_id: cscId } }),
        prisma.job.count({ where: { csc_id: cscId, status: 'running' } }),
        prisma.job.count({ where: { csc_id: cscId, status: 'completed' } })
      ]);

      const csc = await prisma.cSC.findUnique({ where: { id: cscId } });

      res.json({
        success: true,
        csc,
        stats: { totalCandidates, activeJobs, completedJobs }
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ success: false, message: 'Dashboard load failed' });
    }
  }

  // Add Operator
  async addOperator(req, res) {
    try {
      const { name, email, password } = req.body;
      const cscId = req.user.cscId;

      const hashedPassword = await bcrypt.hash(password, 10);
      const operator = await prisma.user.create({
        data: {
          name,
          email,
          password_hash: hashedPassword,
          role: 'operator',
          csc_id: cscId
        }
      });

      res.json({
        success: true,
        message: 'Operator added successfully',
        operator: { id: operator.id, name: operator.name, email: operator.email, role: operator.role }
      });
    } catch (error) {
      console.error('Add operator error:', error);
      res.status(500).json({ success: false, message: 'Failed to add operator' });
    }
  }

  // Get Operators
  async getOperators(req, res) {
    try {
      const cscId = req.user.cscId;
      const operators = await prisma.user.findMany({
        where: { csc_id: cscId, role: { in: ['csc_admin', 'operator'] } },
        select: { id: true, name: true, email: true, role: true, is_active: true }
      });

      res.json({ success: true, operators });
    } catch (error) {
      console.error('Get operators error:', error);
      res.status(500).json({ success: false, message: 'Failed to load operators' });
    }
  }

  // Delete Operator
  async deleteOperator(req, res) {
    try {
      const { id } = req.params;
      const cscId = req.user.cscId;

      await prisma.user.delete({
        where: { id, csc_id: cscId }
      });

      res.json({ success: true, message: 'Operator deleted successfully' });
    } catch (error) {
      console.error('Delete operator error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete operator' });
    }
  }
}

// Simple subscription management (in production, integrate payment gateway)
CSCController.prototype.upgradePlan = async function(req, res) {
  try {
    const { plan } = req.body;
    const cscId = req.user.cscId;

    const plans = {
      free: { price: 0, duration: 7 },
      basic: { price: 299, duration: 30 },
      standard: { price: 699, duration: 30 },
      pro: { price: 1299, duration: 30 }
    };

    if (!plans[plan]) {
      throw new Error('Invalid plan');
    }

    const expiresAt = new Date(Date.now() + plans[plan].duration * 24 * 60 * 60 * 1000);

    await prisma.cSC.update({
      where: { id: cscId },
      data: { plan, expires_at: expiresAt }
    });

    res.json({
      success: true,
      message: `Plan upgraded to ${plan}`,
      expires_at: expiresAt
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

CSCController.prototype.getSubscription = async function(req, res) {
  try {
    const cscId = req.user.cscId;
    const csc = await prisma.cSC.findUnique({ where: { id: cscId } });

    res.json({
      success: true,
      subscription: {
        plan: csc.plan,
        expires_at: csc.expires_at,
        is_active: csc.is_active
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Notification helpers
CSCController.prototype.sendEmail = async function(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  });
};

CSCController.prototype.sendWhatsApp = async function(phone, message) {
  // Integrate with WhatsApp Business API or Twilio
  // For now, log it
  console.log(`WhatsApp to ${phone}: ${message}`);
};

module.exports = { CSCController };
