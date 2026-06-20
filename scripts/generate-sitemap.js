// scripts/generate-sitemap.js
const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../frontend/public/sitemap.xml');

// 1. Static Pages
const urls = [
  { loc: 'https://n-dizi.in/', priority: '1.0', changefreq: 'daily' },
  { loc: 'https://n-dizi.in/about.html', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://n-dizi.in/privacy-policy.html', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://n-dizi.in/terms.html', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://n-dizi.in/disclaimer.html', priority: '0.8', changefreq: 'monthly' },
  { loc: 'https://n-dizi.in/contact', priority: '0.7', changefreq: 'monthly' },
  { loc: 'https://n-dizi.in/faq', priority: '0.7', changefreq: 'weekly' },
  { loc: 'https://n-dizi.in/blog', priority: '0.7', changefreq: 'daily' }
];

// 2. 12 Tools (T2 and T4)
const toolSlugs = [
  'affidavit-generator',
  'legal-notice-generator',
  'prarthna-patra-writer',
  'rent-agreement-generator',
  'gift-deed-generator',
  'partition-deed-generator',
  'power-of-attorney-generator',
  'will-generator',
  'noc-generator',
  'resume-builder',
  'pdf-tools',
  'image-tools'
];

toolSlugs.forEach(slug => {
  urls.push({ loc: `https://n-dizi.in/tools/${slug}`, priority: '0.9', changefreq: 'weekly' });
  urls.push({ loc: `https://n-dizi.in/${slug}`, priority: '0.9', changefreq: 'weekly' });
});

// 3. 52 SEO Knowledge Articles
const coreSeoSlugs = [
  'how-to-write-affidavit',
  'lost-aadhaar-affidavit',
  'name-correction-affidavit',
  'how-to-write-noc',
  'how-to-write-gift-deed',
  'how-to-write-rent-agreement',
  'how-to-write-power-of-attorney',
  'how-to-write-will',
  'lost-documents-affidavit',
  'duplicate-marksheet-process',
  'how-to-write-legal-notice',
  'cheque-bounce-legal-notice',
  'money-recovery-legal-notice',
  'how-to-write-prarthna-patra',
  'dm-complaint-format',
  'police-complaint-format',
  'income-certificate-application',
  'pension-application-format',
  'rti-application-format'
];

coreSeoSlugs.forEach(slug => {
  urls.push({ loc: `https://n-dizi.in/seo/${slug}`, priority: '0.8', changefreq: 'weekly' });
});

const skillTopics = [
  'bulk-import-procedures', 'render-deployment-guide', 'document-ocr-best-practices',
  'eligibility-checker-tools', 'file-processor-manipulations', 'auto-form-filling-extensions',
  'land-record-khasra-khatauni', 'universal-translator-dictionary', 'media-converter-tools-guide',
  'network-monitoring-systems', 'smart-notepad-management', 'passport-photo-cropping-rules',
  'pmegp-project-report-format', 'ration-card-status-inquiry', 'ssc-result-tracker-merit',
  'professional-resume-format-2026', 'ta-da-allowance-rules-police', 'irctc-ticket-booking-agent',
  'dynamic-ui-builder-templates', 'data-validation-techniques-excel', 'voice-stt-tts-integration',
  'web-scraper-selector-discovery', 'whatsapp-api-business-automation'
];

const extraTopics = [
  'rent-agreement-clauses', 'partition-deed-rules', 'gift-deed-vs-sale-deed',
  'will-registration-benefits', 'eviction-notice-landlord', 'damages-for-defamation',
  'contract-breach-remedies', 'electricity-bill-complaint-sdm', 'jan-sunwai-portal-grievance',
  'police-complaint-format', 'bpl-ration-card-benefits', 'lost-marksheet-newspaper-ad',
  'income-certificate-validity'
];

[...skillTopics, ...extraTopics].forEach(slug => {
  urls.push({ loc: `https://n-dizi.in/seo/${slug}`, priority: '0.8', changefreq: 'monthly' });
});

// 4. 100 Blog Posts
const coreBlogSlugs = [
  'how-to-recover-money-legally',
  'legal-notice-before-court-case',
  'affidavit-for-lost-documents',
  'best-format-for-prarthna-patra',
  'how-to-write-rti',
  'how-to-apply-for-pension'
];

coreBlogSlugs.forEach(slug => {
  urls.push({ loc: `https://n-dizi.in/blog/${slug}`, priority: '0.8', changefreq: 'weekly' });
});

const blogTopics = [
  'cheque-bounce-notice-timeline', 'summary-suit-procedure-order-37', 'gift-deed-stamp-duty-relations',
  'rent-agreement-11-month-lease', 'registered-vs-notarized-agreement', 'eviction-notice-drafting-tenants',
  'defamation-notice-civil-damages', 'consumer-court-complaint-process', 'cpc-section-80-government-notice',
  'lost-marksheet-board-verification', 'lost-rc-duplicate-rto-rules', 'lost-pan-duplicate-uti-nsdl',
  'name-change-newspaper-ads', 'gazette-notification-name-change', 'lost-aadhaar-uidai-retrieval',
  'electricity-bill-complaint-sho', 'jan-sunwai-complaint-tracking', 'police-complaint-theft-assault',
  'income-certificate-validity-tehsil', 'bpl-list-search-ration-card', 'pmegp-subsidy-qualification-mudra',
  'ssc-exams-syllabus-result-tracker', 'professional-resume-builder-tips', 'ta-da-travel-reimbursement-rules',
  'irctc-ticket-booking-agent', 'dynamic-web-scraping-selectors', 'whatsapp-business-api-leads'
];

// Replicate loop from blogContent.js
let count = 1;
const blogUrls = [];
while (blogUrls.length < 94) {
  const baseTopic = blogTopics[blogUrls.length % blogTopics.length];
  blogUrls.push(`${baseTopic}-${count}`);
  if (blogUrls.length % blogTopics.length === 0) {
    count++;
  }
}

blogUrls.forEach(slug => {
  urls.push({ loc: `https://n-dizi.in/blog/${slug}`, priority: '0.7', changefreq: 'monthly' });
});

// Compile XML
const dateStr = new Date().toISOString().split('T')[0];
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

urls.forEach(item => {
  xml += '  <url>\n';
  xml += `    <loc>${item.loc}</loc>\n`;
  xml += `    <lastmod>${dateStr}</lastmod>\n`;
  xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
  xml += `    <priority>${item.priority}</priority>\n`;
  xml += '  </url>\n';
});

xml += '</urlset>\n';

fs.writeFileSync(targetPath, xml);
console.log(`✅ Programmatically generated sitemap with ${urls.length} URLs to: ${targetPath}`);
