/**
 * ResultGeneratorAgent (PRD: Result Generator)
 * 
 * Generates human-readable submission reports for VLEs after job completion.
 * Cost: ₹0 — uses built-in string formatting (no paid PDF library)
 * 
 * Output: HTML report saved as file, downloadable via existing /api/download endpoint
 */

const fs = require('fs');
const path = require('path');

class ResultGeneratorAgent {
  constructor() {
    this.outputDir = path.join(process.cwd(), 'output');
  }

  /**
   * Generate a submission result report for a completed job
   * @param {Object} job - Job record from DB/memory
   * @param {Object} candidate - Candidate profile
   * @param {Object} botResult - Result from StatefulBotRunner
   * @returns {string} - Path to generated HTML report
   */
  async generateReport(job, candidate, botResult) {
    const jobId = job.id || job.jobId;
    const outputPath = path.join(this.outputDir, jobId);

    // Ensure output directory exists
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    const status = botResult?.status || 'completed';
    const isSuccess = status === 'completed';
    const timestamp = new Date().toLocaleString('hi-IN', { timeZone: 'Asia/Kolkata' });
    const screenshots = botResult?.screenshots || [];

    // Build screenshot HTML
    const screenshotHtml = screenshots.length > 0
      ? screenshots.map(s => `
        <div class="screenshot">
          <p class="step-label">${s.step || 'Screenshot'}</p>
          <img src="${path.relative(outputPath, s.path)}" alt="${s.step}" />
        </div>`).join('')
      : '<p class="muted">No screenshots captured</p>';

    // Build field summary
    const fields = candidate?.personal || {};
    const fieldRows = Object.entries(fields)
      .filter(([, v]) => v)
      .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
      .join('');

    const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <title>Rawan Result — ${jobId}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; background: #f5f5f5; color: #1a1a2e; }
    .header { background: linear-gradient(135deg, #7c0a02, #c0392b); color: white; padding: 30px 40px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 6px 0 0; opacity: 0.85; font-size: 13px; }
    .badge { display:inline-block; padding: 6px 16px; border-radius:20px; font-weight:bold; font-size:13px; margin-top:12px; }
    .badge.success { background:#27ae60; color:white; }
    .badge.failed  { background:#c0392b; color:white; }
    .badge.paused  { background:#f39c12; color:white; }
    .container { max-width: 900px; margin: 30px auto; padding: 0 20px; }
    .card { background:white; border-radius:12px; padding:28px; margin-bottom:20px; box-shadow:0 2px 8px rgba(0,0,0,.08); }
    h2 { font-size:16px; color:#7c0a02; border-bottom:2px solid #f0e0de; padding-bottom:8px; margin-top:0; }
    table { width:100%; border-collapse:collapse; }
    td { padding:10px 12px; border-bottom:1px solid #f0f0f0; font-size:14px; }
    td:first-child { font-weight:600; color:#555; width:35%; }
    .screenshot img { width:100%; border-radius:8px; margin-top:8px; border:1px solid #ddd; }
    .step-label { font-size:11px; font-weight:bold; color:#888; text-transform:uppercase; letter-spacing:0.5px; }
    .muted { color:#aaa; font-size:13px; }
    .footer { text-align:center; color:#aaa; font-size:12px; margin:30px 0; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🤖 Rawan AI — Submission Report</h1>
    <p>Job ID: ${jobId} &nbsp;|&nbsp; ${timestamp}</p>
    <span class="badge ${isSuccess ? 'success' : status === 'paused' ? 'paused' : 'failed'}">
      ${isSuccess ? '✅ Submitted Successfully' : status === 'paused' ? '⏸ Awaiting Review' : '❌ Failed'}
    </span>
  </div>

  <div class="container">
    <!-- Job Details -->
    <div class="card">
      <h2>Job Details</h2>
      <table>
        <tr><td>Service</td><td>${job.serviceType || 'N/A'}</td></tr>
        <tr><td>Candidate</td><td>${candidate?.personal?.fullName || 'N/A'}</td></tr>
        <tr><td>Status</td><td>${status}</td></tr>
        <tr><td>Portal</td><td>${job.formUrl || job.serviceType || 'N/A'}</td></tr>
        ${botResult?.reference ? `<tr><td>Reference No.</td><td><strong>${botResult.reference}</strong></td></tr>` : ''}
      </table>
    </div>

    <!-- Candidate Fields Used -->
    <div class="card">
      <h2>Candidate Data Used</h2>
      <table>${fieldRows || '<tr><td colspan=2 class="muted">No data available</td></tr>'}</table>
    </div>

    <!-- Screenshots -->
    <div class="card">
      <h2>Screenshots (${screenshots.length})</h2>
      <div class="grid">${screenshotHtml}</div>
    </div>

    ${botResult?.logs?.length ? `
    <div class="card">
      <h2>Execution Log</h2>
      <table>
        ${botResult.logs.map(l => `<tr><td style="width:180px;color:#888">${new Date(l.timestamp).toLocaleTimeString()}</td><td>${l.message}</td></tr>`).join('')}
      </table>
    </div>` : ''}
  </div>

  <div class="footer">Generated by Rawan AI Platform &copy; ${new Date().getFullYear()} &mdash; ₹0 cost</div>
</body>
</html>`;

    const reportPath = path.join(outputPath, 'result_report.html');
    fs.writeFileSync(reportPath, html, 'utf8');

    // Also write manifest.json for the downloader
    const manifest = {
      jobId,
      status,
      serviceType: job.serviceType,
      candidateName: candidate?.personal?.fullName,
      reference: botResult?.reference || null,
      generatedAt: new Date().toISOString(),
      reportFile: 'result_report.html',
      screenshots: screenshots.map(s => path.basename(s.path || s))
    };
    fs.writeFileSync(path.join(outputPath, 'manifest.json'), JSON.stringify(manifest, null, 2));

    console.log(`📄 Result report generated: ${reportPath}`);
    return reportPath;
  }
}

module.exports = { ResultGeneratorAgent };
