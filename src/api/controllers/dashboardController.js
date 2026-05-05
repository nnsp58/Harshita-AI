// src/api/controllers/dashboardController.js
const { prisma } = require('../../models/database');
const { inMemoryUsers } = require('./authController');

const getOverviewStats = async (req, res) => {
  try {
    // In a real app, these would come from DB. Falling back to counts/simulated live data.
    let totalVLEs = inMemoryUsers.size;
    let totalJobs = 0;
    let successRate = 92; // Default logic
    let revenue = 0;

    if (prisma) {
      try {
        totalVLEs = await prisma.user.count();
        totalJobs = await prisma.job.count();
        const completedJobs = await prisma.job.count({ where: { status: 'completed' } });
        successRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
        
        // Simulated revenue: ₹100 per completed job (SaaS fee)
        revenue = completedJobs * 100;
      } catch (e) {
        console.warn('DB counts failed, using in-memory fallback');
      }
    }

    res.json({
      success: true,
      data: {
        activeJobs: 0,
        pendingDocuments: 0,
        successRate: successRate || 0,
        agentsOnline: 8,
        todayJobs: 0,
        revenue: revenue || 0,
        totalVLEs: totalVLEs || 0,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getOverviewStats };
