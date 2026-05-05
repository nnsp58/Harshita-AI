/**
 * JobSearchAgent - Searches suitable government jobs based on user qualifications
 *
 * Uses:
 *   - DocumentAIAgent to extract qualification data from documents
 *   - Groq AI to match qualifications with job requirements
 *   - Filters jobs from configured portals (SSC, Railway, Banking, etc.)
 *
 * Supported job categories:
 *   - SSC (CGL, CHSL, MTS, GD)
 *   - Railways (RRB NTPC, Group D)
 *   - Banking (IBPS, SBI)
 *   - Defence (Army, Navy, Agniveer)
 *   - State Police
 *   - State SSC
 *
 * Qualification mapping:
 *   - 10th Pass: MTS, GD, Constable, GDS, Group D
 *   - 12th Pass: CHSL, NTPC, Clerk, Postal
 *   - Graduate: CGL, PO, SO, Assistant, Inspector
 *   - Post-Graduate: Specialist Officer, Higher posts
 */

const { DocumentAIAgent } = require('./documentAIAgent');
const { aiProviderManager } = require('../utils/aiProviderManager');

// Map high-level agency categories to keywords present in job.agency strings
const AGENCY_ALIASES = {
  ssc: ['ssc'],
  railway: ['railway', 'rrb', 'rail'],
  banking: ['ibps', 'sbi', 'bank', 'banking', 'bank po'],
  defence: ['army', 'navy', 'air force', 'coast guard', 'defence'],
  police: ['police', 'bsf', 'crpf', 'itbp', 'ssb', 'constable'],
  postal: ['postal', 'india post', 'post office', 'gds', 'post']
};

class JobSearchAgent {
  constructor() {
    this.name = 'JobSearchAgent';
    this.docAI = new DocumentAIAgent();
    this.aiProvider = 'auto'; // Will auto-select based on preferences
    this.jobDatabase = this._initializeJobDatabase();
    
    // Log available providers
    const available = aiProviderManager.getAvailableProviders();
    console.log(`[JobSearchAgent] Available AI providers: ${available.join(', ') || 'none'}`);
    const preferred = aiProviderManager.getEffectiveProvider(this.name);
    console.log(`[JobSearchAgent] Preferred provider: ${preferred}`);
  }

  _initAI() {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    
    // Prefer Groq (free, fast) if available
    if (groqKey) {
      const OpenAI = require('openai');
      this.openai = new OpenAI({
        apiKey: groqKey,
        baseURL: 'https://api.groq.com/openai/v1'
      });
      this.provider = 'groq';
      console.log('🤖 JobSearchAgent: Groq AI connected (free tier)');
    } 
    // Fallback to Gemini
    else if (geminiKey) {
      const OpenAI = require('openai');
      this.openai = new OpenAI({
        apiKey: geminiKey,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
      });
      this.provider = 'gemini';
      console.log('🤖 JobSearchAgent: Gemini Flash connected');
    } else {
      console.warn('⚠️ JobSearchAgent: No AI provider configured - using rule-based matching only');
      console.warn('💡 Set GROQ_API_KEY (free) or GEMINI_API_KEY (paid) in .env');
    }
  }

  _initializeJobDatabase() {
    return [
      // SSC
      {
        id: 'ssc_cgl_2026',
        title: 'Combined Graduate Level (CGL)',
        agency: 'Staff Selection Commission (SSC)',
        qualification: 'Graduation',
        minAge: 18,
        maxAge: 32,
        salary: '₹25,500 - ₹1,31,500 (Level-7)',
        posts: ['Assistant Section Officer', 'Inspector', 'Auditor', 'TA', 'JSA'],
        link: 'https://ssc.nic.in',
        lastDate: 'To be announced'
      },
      {
        id: 'ssc_chsl_2026',
        title: 'Combined Higher Secondary Level (CHSL)',
        agency: 'Staff Selection Commission (SSC)',
        qualification: '12th Pass',
        minAge: 18,
        maxAge: 27,
        salary: '₹25,500 - ₹81,100 (Level-2 & 3)',
        posts: ['Lower Division Clerk', 'Data Entry Operator', 'Postal Assistant', 'Sorting Assistant'],
        link: 'https://ssc.nic.in',
        lastDate: 'To be announced'
      },
      {
        id: 'ssc_mts_2026',
        title: 'Multi Tasking Staff (MTS)',
        agency: 'Staff Selection Commission (SSC)',
        qualification: '10th Pass',
        minAge: 18,
        maxAge: 25,
        salary: '₹18,000 - ₹56,900 (Level-1)',
        posts: ['Peon', 'Daftari', 'Chowkidar', 'Junior Gestetner Operator'],
        link: 'https://ssc.nic.in',
        lastDate: 'To be announced'
      },
      {
        id: 'ssc_gd_2026',
        title: 'General Duty (GD) Constable',
        agency: 'Staff Selection Commission (SSC)',
        qualification: '10th Pass',
        minAge: 18,
        maxAge: 23,
        salary: '₹21,700 - ₹69,100 (Level-3)',
        posts: ['Constable (GD) in CAPF & SSF', 'Constable (GD) in Assam Rifles'],
        link: 'https://ssc.nic.in',
        lastDate: 'To be announced'
      },
      // Railways
      {
        id: 'rrb_ntpc_2026',
        title: 'Non-Technical Popular Categories (NTPC)',
        agency: 'Railway Recruitment Board (RRB)',
        qualification: 'Graduation / 12th Pass',
        minAge: 18,
        maxAge: 33,
        salary: '₹19,900 - ₹1,31,500 (Level-2 to 6)',
        posts: ['Junior Clerk', 'Trains Clerk', 'Commercial Clerk', 'Account Clerk', 'Ticket Collector', 'Station Master'],
        link: 'https://rrb.gov.in',
        lastDate: 'To be announced'
      },
      {
        id: 'rrb_groupd_2026',
        title: 'Group D (Railway Helper, Porter, etc.)',
        agency: 'Railway Recruitment Board (RRB)',
        qualification: '10th Pass / ITI',
        minAge: 18,
        maxAge: 33,
        salary: '₹18,000 - ₹56,900 (Level-1)',
        posts: ['Track Maintainer', 'Helper', 'Porter', 'Cleaner', 'Gate Man'],
        link: 'https://rrb.gov.in',
        lastDate: 'To be announced'
      },
      // Banking
      {
        id: 'ibps_clerk_2026',
        title: 'IBPS Clerk',
        agency: 'Institute of Banking Personnel Selection',
        qualification: 'Graduation',
        minAge: 20,
        maxAge: 28,
        salary: '₹19,900 - ₹47,920 (Scale I)',
        posts: ['Clerk in Public Sector Banks'],
        link: 'https://ibps.in',
        lastDate: 'To be announced'
      },
      {
        id: 'ibps_po_2026',
        title: 'IBPS Probationary Officer (PO)',
        agency: 'Institute of Banking Personnel Selection',
        qualification: 'Graduation',
        minAge: 20,
        maxAge: 30,
        salary: '₹23,700 - ₹42,020 (Scale I)',
        posts: ['Probationary Officer in Public Sector Banks'],
        link: 'https://ibps.in',
        lastDate: 'To be announced'
      },
      {
        id: 'sbi_clerk_2026',
        title: 'SBI Clerk',
        agency: 'State Bank of India',
        qualification: 'Graduation',
        minAge: 20,
        maxAge: 28,
        salary: '₹19,900 - ₹47,920 (Scale I)',
        posts: ['Junior Associate (Customer Support & Sales)'],
        link: 'https://sbi.co.in',
        lastDate: 'To be announced'
      },
      // Defence
      {
        id: 'army_gd_2026',
        title: 'Indian Army General Duty (GD)',
        agency: 'Indian Army',
        qualification: '10th Pass',
        minAge: 17.5,
        maxAge: 23,
        salary: '₹21,700 - ₹69,100 (Level-3) + allowances',
        posts: ['Soldier GD', 'Soldier Tradesman'],
        link: 'https://joinindianarmy.nic.in',
        lastDate: 'Ongoing (check portal)'
      },
      {
        id: 'army_clerk_2026',
        title: 'Indian Army Clerk / Store Keeper',
        agency: 'Indian Army',
        qualification: '12th Pass',
        minAge: 17.5,
        maxAge: 23,
        salary: '₹21,700 - ₹69,100 (Level-3) + allowances',
        posts: ['Soldier Clerk / SKT'],
        link: 'https://joinindianarmy.nic.in',
        lastDate: 'Ongoing (check portal)'
      },
      {
        id: 'navy_ssr_2026',
        title: 'Navy Senior Secondary Recruit (SSR)',
        agency: 'Indian Navy',
        qualification: '12th Pass (Science stream)',
        minAge: 17,
        maxAge: 22,
        salary: '₹21,700 - ₹69,100 (Level-3) + allowances',
        posts: ['Sailor'],
        link: 'https://joinindiannavy.gov.in',
        lastDate: 'Check portal'
      },
      {
        id: 'agniveer_2026',
        title: 'Agniveer (Army, Navy, Air Force)',
        agency: 'Tri-Services (Indian Armed Forces)',
        qualification: '10th/12th Pass (varies by trade)',
        minAge: 17,
        maxAge: 23,
        salary: '₹30,000 - ₹40,000 (during training) + ₹30,000-₹50,000 (post)',
        posts: ['Agniveer in Army/Navy/Air Force'],
        link: 'https://agniveer.cdac.in',
        lastDate: 'Check portal'
      },
      // State Police
      {
        id: 'up_police_2026',
        title: 'Uttar Pradesh Police Constable',
        agency: 'Uttar Pradesh Police Recruitment Board',
        qualification: '12th Pass',
        minAge: 18,
        maxAge: 22,
        salary: '₹25,500 - ₹81,100 (Pay Matrix Level 2)',
        posts: ['Constable Civil Police', 'Constable PAC'],
        link: 'https://uppbpb.gov.in',
        lastDate: 'Expected: 2026'
      },
      {
        id: 'bihar_police_2026',
        title: 'Bihar Police Constable',
        agency: 'Bihar Police Subordinate Services Commission',
        qualification: '12th Pass',
        minAge: 18,
        maxAge: 25,
        salary: '₹21,700 - ₹69,100',
        posts: ['Constable'],
        link: 'https://bpsc.bih.nic.in',
        lastDate: 'Expected: 2026'
      },
      // Postal
      {
        id: 'india_post_gds_2026',
        title: 'India Post GDS (Gramin Dak Sevak)',
        agency: 'India Post (Department of Post)',
        qualification: '10th Pass / 12th Pass',
        minAge: 18,
        maxAge: 40, // varies by state
        salary: '₹18,000 - ₹31,000 (consolidated)',
        posts: ['GDS Branch Postmaster', 'GDS Mail Deliverer', 'GDS Packer'],
        link: 'https://indiapost.gov.in',
        lastDate: 'State-wise notifications'
      },
      // Apprenticeship
      {
        id: 'apprenticeship_2026',
        title: 'Apprenticeship Positions',
        agency: 'Ministry of Skill Development',
        qualification: '8th Pass / 10th Pass / ITI',
        minAge: 14,
        maxAge: 30,
        salary: 'Stipend ₹5,000 - ₹15,000',
        posts: ['Apprentice in various trades'],
        link: 'https://apprenticeship.gov.in',
        lastDate: 'Ongoing'
      }
    ];
  }

  /**
   * Main entry point for MasterAgent
   */
  async execute(taskData) {
    const { action, userDocuments, userQualification, agency } = taskData;

    switch (action) {
      case 'search_jobs':
        return await this.searchJobsByQualification(userQualification || null, agency);
      
      case 'search_by_documents':
        // Will extract from documents
        return await this.searchJobsFromDocuments(userDocuments);
      
      case 'get_all_jobs':
        return this.getAllJobs();
      
      case 'filter_by_agency':
        return this.filterByAgency(agency);
      
      default:
        return {
          success: false,
          message: `Unknown action: ${action}. Use: search_jobs, search_by_documents, get_all_jobs, filter_by_agency`
        };
    }
  }

  /**
   * Search jobs based on qualification string (e.g., "12th pass", "graduate")
   * Optional agencyFilter to further narrow results by agency
   */
  async searchJobsByQualification(qualification, agencyFilter = null) {
    if (!qualification) {
      return {
        success: false,
        message: 'Please provide your qualification (e.g., "10th pass", "12th pass", "graduate")',
        requiresManualInput: true,
        fieldName: 'qualification'
      };
    }

    const qual = qualification.toLowerCase();
    let matchingJobs = [];

    if (/\b10th\b|\btenth\b|\bmatric\b/.test(qual)) {
      matchingJobs = this.jobDatabase.filter(job => 
        job.qualification.includes('10th') || job.qualification.includes('ITI')
      );
    } else if (/\b12th\b|\btwelfth\b|\bintermediate\b/.test(qual)) {
      matchingJobs = this.jobDatabase.filter(job => 
        job.qualification.includes('12th')
      );
    } else if (/\bgraduate\b|\bgraduation\b|\bb\.?a\.?\b|\bb\.?sc\.?\b|\bcom\.?\b/.test(qual)) {
      matchingJobs = this.jobDatabase.filter(job => 
        job.qualification.includes('Graduation')
      );
    } else if (/\bpost\b.*\bgraduate|\bpg\b|\bma\.?\b|\bmsc\.?\b|\bm\.?com\.?\b|\bmba\b/.test(qual)) {
      matchingJobs = this.jobDatabase.filter(job => 
        job.qualification.includes('Graduation') // PG eligible for all grad-level
      );
    } else {
      // Unknown qualification - try AI matching
      if (this.openai) {
        return await this._aiJobMatch(qualification);
      }
      return {
        success: false,
        message: `Could not understand qualification: "${qualification}". Please specify: 10th pass, 12th pass, graduate, etc.`
      };
    }

     // Apply agency filter if provided (using alias matching)
     if (agencyFilter) {
       matchingJobs = matchingJobs.filter(job => this._agencyMatches(job, agencyFilter));
     }

    return this._formatResults(matchingJobs, `Jobs for ${qualification}${agencyFilter ? ` in ${agencyFilter}` : ''}`);
  }

  /**
   * Extract qualification from documents and search jobs
   */
  async searchJobsFromDocuments(documents) {
    if (!documents || Object.keys(documents).length === 0) {
      return {
        success: false,
        message: 'No documents provided. Please upload your Aadhaar and marksheets first.',
        requiresManualInput: true,
        fieldName: 'documents'
      };
    }

    console.log('[JobSearchAgent] Extracting qualification from documents...');
    
    // Use DocumentAIAgent to parse documents
    const agent = new DocumentAIAgent();
    let extractedQualification = null;

    try {
      // Process marksheets first (they contain education info)
      for (const [type, filePath] of Object.entries(documents)) {
        if (type.includes('marksheet') || type.includes('certificate')) {
          console.log(`[JobSearchAgent] Processing ${type}: ${filePath}`);
          const result = await agent.processDocument(filePath, type);
          
          // Look for education info in extracted data
          const data = result.structuredData || {};
          if (data.education || data.qualification) {
            extractedQualification = data.education + ' ' + (data.degree || data.board || '');
            console.log(`[JobSearchAgent] Extracted qualification: ${extractedQualification}`);
            break;
          }
          
          // Also check raw text
          if (result.extractedText) {
            const text = result.extractedText.toLowerCase();
            if (text.includes('10th') || text.includes('tenth') || text.includes('matric')) {
              extractedQualification = '10th Pass';
              break;
            } else if (text.includes('12th') || text.includes('twelfth') || text.includes('intermediate')) {
              extractedQualification = '12th Pass';
              break;
            } else if (text.includes('b.a') || text.includes('b.sc') || text.includes('b.com') || text.includes('b.tech')) {
              extractedQualification = 'Graduate';
              break;
            }
          }
        }
      }

      if (!extractedQualification) {
        return {
          success: false,
          message: 'Could not extract qualification from documents. Please ensure marksheets are clear and readable.',
          requiresManualInput: true,
          fieldName: 'qualification'
        };
      }

      // Now search jobs
      return await this.searchJobsByQualification(extractedQualification);

    } catch (error) {
      console.error('[JobSearchAgent] Error:', error);
      return {
        success: false,
        message: `Error processing documents: ${error.message}`
      };
    }
  }

  /**
   * Use AI to match qualification to jobs (smart matching)
   */
  async _aiJobMatch(qualification) {
    try {
      const client = aiProviderManager.getClient(this.name);
      if (!client) {
        return { success: false, message: 'No AI provider available. Use simple terms: 10th/12th/graduate.' };
      }

      const allJobs = this.jobDatabase.map(job => ({
        id: job.id,
        title: job.title,
        agency: job.agency,
        qualification: job.qualification,
        posts: job.posts.join(', ')
      }));

      const prompt = `
User qualification: "${qualification}"
Available jobs: ${JSON.stringify(allJobs, null, 2)}

Return matching job IDs ONLY as JSON array. Example: ["ssc_cgl_2026"]
If none match, return [].

MAPPING:
- "10th" or "tenth" or "matric" → 10th Pass jobs
- "12th" or "twelfth" or "intermediate" → 12th Pass jobs  
- "graduate" or "B.A./B.Sc/B.Com" → Graduate jobs
- "postgraduate" or "M.A./M.Sc" → Graduate jobs (eligible for all)

Return: ["job_id1", "job_id2"] OR [] only. No text.
      `;

      const model = aiProviderManager.getModel(this.name);
      
      console.log(`[JobSearchAgent] Using ${aiProviderManager.getEffectiveProvider(this.name)} (model: ${model})`);
      
      const completion = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 200
      });

      const content = completion.choices[0].message.content.trim();
      console.log(`[JobSearchAgent] AI raw: ${content.substring(0, 80)}`);
      
      // Extract JSON array
      const jsonMatch = content.match(/\[[\d\s,"'_a-z]+\]/i);
      const jobIds = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
      const matchedJobs = this.jobDatabase.filter(job => jobIds.includes(job.id));
      
      return this._formatResults(matchedJobs, `AI-matched for: ${qualification}`);

    } catch (error) {
      console.error('[JobSearchAgent] AI error:', error.message);
      return {
        success: false,
        message: `AI failed: ${error.message}. Use simpler terms like "10th pass", "graduate".`
      };
    }
   }

  /**
   * Get all available jobs
   */
  getAllJobs() {
    return {
      success: true,
      count: this.jobDatabase.length,
      jobs: this.jobDatabase,
      message: `Found ${this.jobDatabase.length} active government job notifications`
    };
  }

  /**
   * Filter jobs by agency name
   */
  filterByAgency(agencyName) {
    const filtered = this.jobDatabase.filter(job => this._agencyMatches(job, agencyName));
    return this._formatResults(filtered, `Jobs in ${agencyName}`);
  }

  /**
   * Format results nicely
   */
  _formatResults(jobs, title) {
    if (jobs.length === 0) {
      return {
        success: false,
        message: `${title}: No matching jobs found.`
      };
    }

    return {
      success: true,
      count: jobs.length,
      title,
      jobs: jobs.map(job => ({
        id: job.id,
        title: job.title,
        agency: job.agency,
        qualification: job.qualification,
        ageLimit: `${job.minAge}-${job.maxAge} years`,
        salary: job.salary,
        posts: job.posts,
        lastDate: job.lastDate,
        link: job.link
      }))
    };
  }

  /**
   * Cleanup
   */
   /**
    * Check if a job's agency matches the given agency key (with alias expansion)
    */
  _agencyMatches(job, agencyKey) {
    const aliases = AGENCY_ALIASES[agencyKey] || [agencyKey];
    const agencyLower = job.agency.toLowerCase();
    return aliases.some(alias => agencyLower.includes(alias.toLowerCase()));
  }

  async cleanup() {
    if (this.docAI) {
      await this.docAI.cleanup();
    }
  }
}

module.exports = { JobSearchAgent };
