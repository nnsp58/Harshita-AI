/**
 * UnifiedActionDispatcher
 * Maps user commands and intents to existing frontend routes and workspaces
 * Preserves all existing routes without breakage.
 */

const WORKSPACE_ROUTES = {
  // Legal
  affidavit: '/workspace/legal/affidavit',
  legal_notice: '/workspace/legal/notice',
  gift_deed: '/workspace/legal/gift-deed',
  rent_agreement: '/workspace/legal/affidavit',
  legal_draft: '/workspace/legal/affidavit',
  complaint: '/documents',
  application: '/documents',

  // Government & Utilities
  tada: '/tada-naksha',
  tada_naksha: '/tada-naksha',
  resume: '/resume-builder',
  resume_maker: '/resume-builder',
  job_search: '/service/job_search',
  ration_card: '/service/ration-card',
  land_record: '/service/land_record',
  eligibility: '/service/eligibility',
  html_to_pdf: '/workspace/utility/html-to-pdf',
  photo_maker: '/workspace/coming-soon?tool=Photo+Maker',

  // Tax & Finance
  itr: '/workspace/tax/itr',
  tax: '/workspace/tax/itr',
  gst: '/workspace/tax/gst',
  refund: '/workspace/tax/refund',

  // Media & Video
  story_video: '/story-video',
  cartoon_video: '/story-video',
  poster: '/workspace/media/poster',
  image: '/workspace/media/image',
  calculator: '/workspace/business/calculator',

  // System & Support
  bulk_import: '/bulk-import',
  settings: '/settings',
  contact: '/contact',
};

class UnifiedActionDispatcher {
  /**
   * Detect if a user message or task intent explicitly requests opening/navigating to a workspace
   */
  detectNavigationRequest(text = '', intent = '') {
    const lower = (text || '').toLowerCase().trim();
    const isNavRequest = /\b(open|kholo|chalao|start|lao|jao|dikhaye|open karo|khol do|khologe|de do)\b/i.test(lower) ||
                         /\b(khola|khologe|kholna|page|workspace|window|tab)\b/i.test(lower) ||
                         /\b(need to create|create my|build my|file my|file itr|make a|create a|banani hai|banao|karna hai)\b/i.test(lower) ||
                         lower.includes('पेज खोलो') || lower.includes('ओपन करो') || lower.includes('खोल दो');

    if (!isNavRequest && !intent) return null;

    // Check specific destinations
    if (lower.includes('affidavit') || lower.includes('शपथ पत्र') || lower.includes('एफिडेविट')) {
      return this.buildAction('/workspace/legal/affidavit', 'Affidavit Workspace');
    }
    if (lower.includes('notice') || lower.includes('नोटिस')) {
      return this.buildAction('/workspace/legal/notice', 'Legal Notice Workspace');
    }
    if (lower.includes('tada') || lower.includes('नक्शा') || lower.includes('naksha') || lower.includes('यात्रा भत्ता')) {
      return this.buildAction('/tada-naksha', 'TA/DA Naksha Workspace');
    }
    if (lower.includes('resume') || lower.includes('cv') || lower.includes('biodata') || lower.includes('रिज्यूमे') || lower.includes('बायोडाटा')) {
      return this.buildAction('/resume-builder', 'Resume Builder');
    }
    if (lower.includes('itr') || lower.includes('income tax') || lower.includes('आयकर')) {
      return this.buildAction('/workspace/tax/itr', 'ITR Tax Workspace');
    }
    if (lower.includes('gst') || lower.includes('जीएसटी')) {
      return this.buildAction('/workspace/tax/gst', 'GST Workspace');
    }
    if (lower.includes('refund') || lower.includes('रिफंड')) {
      return this.buildAction('/workspace/tax/refund', 'Tax Refund Workspace');
    }
    if (lower.includes('cartoon') || lower.includes('story') || lower.includes('video') || lower.includes('कार्टून') || lower.includes('कहानी')) {
      return this.buildAction('/story-video', 'Story Cartoon Video Studio');
    }
    if (lower.includes('job') || lower.includes('vacancy') || lower.includes('नौकरी') || lower.includes('भर्ती')) {
      return this.buildAction('/service/job_search', 'Job Search Portal');
    }
    if (lower.includes('ration') || lower.includes('राशन')) {
      return this.buildAction('/service/ration-card', 'Ration Card Service');
    }
    if (lower.includes('bhulekh') || lower.includes('khasra') || lower.includes('भूलेख') || lower.includes('खतौनी')) {
      return this.buildAction('/service/land_record', 'Land Record / Bhulekh');
    }
    if (lower.includes('eligibility') || lower.includes('पात्रता')) {
      return this.buildAction('/service/eligibility', 'Eligibility Check');
    }
    if (lower.includes('bulk') || lower.includes('बल्क')) {
      return this.buildAction('/bulk-import', 'Bulk Import Dashboard');
    }

    return null;
  }

  buildAction(route, title = 'Workspace', target = null) {
    return {
      type: 'navigate',
      route,
      navigate: route,
      title,
      target: target || '_self',
    };
  }

  getRouteForIntent(intent) {
    return WORKSPACE_ROUTES[intent] || null;
  }
}

const actionDispatcher = new UnifiedActionDispatcher();
module.exports = { actionDispatcher, WORKSPACE_ROUTES };
