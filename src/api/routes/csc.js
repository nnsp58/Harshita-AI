const express = require('express');
const { CSCController } = require('../controllers/cscController');
const { authenticate, authorize } = require('../middleware/auth');
const { prisma } = require('../../models/database');

const router = express.Router();
const cscController = new CSCController();

// CSC Signup (public)
router.post('/signup', cscController.signup);

// CSC Dashboard (authenticated)
router.get('/dashboard', authenticate, cscController.getDashboard);

// Reports and analytics
router.get('/reports', authenticate, async (req, res) => {
  try {
    const cscId = req.user.cscId;
    const { startDate, endDate } = req.query;

    const dateFilter = startDate && endDate ? {
      created_at: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } : {};

    const [candidatesCount, jobsCount, completedJobs, failedJobs] = await Promise.all([
      prisma.candidate.count({ where: { csc_id: cscId, ...dateFilter } }),
      prisma.job.count({ where: { csc_id: cscId, ...dateFilter } }),
      prisma.job.count({ where: { csc_id: cscId, status: 'completed', ...dateFilter } }),
      prisma.job.count({ where: { csc_id: cscId, status: 'failed', ...dateFilter } })
    ]);

    res.json({
      success: true,
      reports: {
        totalCandidates: candidatesCount,
        totalJobs: jobsCount,
        completedJobs,
        failedJobs,
        successRate: jobsCount > 0 ? (completedJobs / jobsCount * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Reports error' });
  }
});

// Subscription management
router.post('/upgrade', authenticate, authorize('csc_admin'), cscController.upgradePlan);
router.get('/subscription', authenticate, cscController.getSubscription);

// Operators management
router.post('/operators', authenticate, authorize('csc_admin'), cscController.addOperator);
router.get('/operators', authenticate, authorize('csc_admin'), cscController.getOperators);
router.delete('/operators/:id', authenticate, authorize('csc_admin'), cscController.deleteOperator);

module.exports = router;
