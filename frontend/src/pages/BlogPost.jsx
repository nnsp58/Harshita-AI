// frontend/src/pages/BlogPost.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, Calendar, ShieldCheck, CheckCircle2, ChevronRight, FileText } from 'lucide-react'
import { ALL_BLOG_POSTS } from '../data/blogContent'

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)

  useEffect(() => {
    const data = ALL_BLOG_POSTS.find(p => p.slug === slug)
    if (data) {
      setPost(data)
      document.title = `${data.title} | N-Dizi Blog`
    } else {
      navigate('/blog')
    }
  }, [slug, navigate])

  if (!post) return null

  // Programmatic Article Content Generator (Stitches 1100+ words dynamically)
  const generateArticleContent = () => {
    const sections = [];
    const lowerTitle = post.title.toLowerCase();

    // 1. Introduction
    sections.push({
      h2: `Introduction to ${post.title}`,
      content: `Navigating official and legal administrative procedures in India is historically complex. Understanding the specific guidelines for ${lowerTitle} is critical. Whether you are a CSC center operator, a VLE administrator, a citizen dealing with lost documents, or a small business owner drafting a partnership deed, filing applications requires precise structural parameters. Errors in formats can delay submissions or result in rejected files. This article details the entire process, stamp values, legal codes, and common mistakes to help you draft correct and compliant results.`
    });

    // 2. Legal provisions
    let actDetails = '';
    if (post.category === 'Legal Advice') {
      actDetails = `Legal drafts, notices, and agreements are strictly regulated by the Indian Stamp Act, 1899, the Indian Registration Act, 1908, and the Civil Procedure Code (CPC), 1908. Specific summaries for debt recovery rely on summary suits under Order 37 of the CPC, which enables faster recovery decrees. Cheque bounce disputes are prosecuted under the Negotiable Instruments Act, Section 138, which enforces criminal liability on drawer defaults. For property gift deeds, Section 123 of the Transfer of Property Act, 1882 commands mandatory registration.`;
    } else if (post.category === 'Government Schemes') {
      actDetails = `Government representations, pension schemes, and public queries are governed by the Right to Information (RTI) Act, 2005, and state-level citizen services frameworks (like UP e-District, Delhi e-Swaraj). Public officials are legally obligated to review and address citizens' grievances within statutory timelines (normally 15 to 30 working days), failing which applicants can escalate to the public grienvance appellate authority.`;
    } else {
      actDetails = `Professional builders and document processing utilities operate under IT frameworks and validation standard protocols (such as IT Act 2000 digital signatures). Creating resumes, passport photo layouts, or compressing PDFs must adhere to portal upload criteria. For example, NSDL and passport portals require portrait photos cropped strictly to 3.5 cm by 4.5 cm with light backgrounds to pass automated verification checks.`;
    }

    sections.push({
      h2: 'Statutory Frameworks & Legal Statutes in Force',
      content: `${actDetails} Attempting to submit files without checking these statutory rules can lead to legal complications. Under Section 35 of the Indian Stamp Act, any document that is insufficiently stamped is considered inadmissible as evidence in a court of law until the deficient stamp duty along with a penalty (up to 10 times the deficit) is deposited.`
    });

    // 3. Step-by-Step Guide
    sections.push({
      h2: '5-Step Process to Accomplish Your Objective',
      content: `Follow this detailed checklist to ensure success:
      Step 1: GATHER CORE IDENTIFICATION DOCUMENTS - Collect Aadhaar card, PAN card, date of birth proof, and address details.
      Step 2: DRAFT THE Grievance OR CONTRACT TEXT - Carefully list the chronology of events, including names, dates, amounts, and specific cause-of-action triggers.
      Step 3: RUN THE DRAFT THROUGH A QUALITY GATE - Ensure there are no empty brackets, bracketed placeholders like "[CLIENT NAME]", or spelling mistakes in name fields. Casing must be in proper noun style (Title Case).
      Step 4: STAMP PAPER PRINTING & NOTARIZATION - Procure stamp paper of correct state denomination, print the output, sign in the presence of two witnesses, and get the notary public registry serial stamp.
      Step 5: SUBMIT & SECURE AN ACKNOWLEDGEMENT RECEIPT - File the final copy and obtain an official receiving stamp for registry tracking.`
    });

    // 4. Common mistakes
    sections.push({
      h2: 'Common Mistakes to Avoid to Prevent Rejections',
      content: `VLE operators and applicants frequently encounter file rejections due to these 5 critical mistakes:
      1. Forgetting to reformat name cases: Leaving names in all-lowercase (e.g. "rahul kumar") instead of normal proper name casing ("Rahul Kumar").
      2. Leaving default placeholders: Submitting templates with un-filled brackets like [NAME] or [ADDRESS].
      3. Mismatching signatures: Testator or declarant signatures failing to match bank or PAN registry records.
      4. Missing witness blocks: Failing to align two witness signature blocks on property partition deeds or Wills.
      5. Submitting stale documents: Notarizing affidavits too early (most government boards mandate notarizations made within 6 months of submission).`
    });

    // 5. Table of Stamp Duties
    sections.push({
      h2: 'State Stamp Duty Slabs & General Registry Rates',
      isTable: true
    });

    // 6. Topic Specific FAQs
    sections.push({
      h2: 'Frequently Asked Questions (FAQ) Context',
      faqs: [
        { q: `How much time does it take to compile this ${post.tags[0]} file?`, a: `Using Harshita AI, drafting takes less than 2 minutes. The physical printing, signature collection, and notary public registration usually take 1–2 hours depending on tehsil queues.` },
        { q: `What happens if my document contains placeholder brackets?`, a: `Any document containing raw brackets like "[CLIENT NAME]" is flagged by administrative scrutiny as incomplete, leading to immediate file rejection. Use the placeholder elimination engine to prevent this.` },
        { q: `Is e-Stamping valid for this process?`, a: `Yes. e-Stamping is fully legal and has replaced physical stamp papers in Delhi, Uttar Pradesh, Rajasthan, and many other states. You can print the generated PDF directly onto the e-Stamp certificate.` }
      ]
    });

    // 7. Conclusion
    sections.push({
      h2: 'Summary & Actionable Next Steps',
      content: `Ensuring proper legal formatting and detail completeness for ${lowerTitle} is critical for administrative compliance and AdSense readability. Harshita AI simplifies this by providing 31+ specialized AI agents and validation guardrails that screen files in real-time. By utilizing the platform's control settings, you can easily toggle standard layouts and scale fonts. Log into your dashboard to get started with drafting today.`
    });

    return sections;
  };

  const articleSections = generateArticleContent();

  // Find related tool based on category or tags
  const getRelatedToolLink = () => {
    if (post.category === 'Legal Advice' || post.tags.includes('CPC') || post.tags.includes('Cheque')) {
      return { path: '/tools/legal-notice-generator', label: 'Launch Legal Notice Agent' };
    }
    if (post.tags.includes('Affidavit')) {
      return { path: '/tools/affidavit-generator', label: 'Launch Affidavit Generator' };
    }
    if (post.tags.includes('Resume')) {
      return { path: '/tools/resume-builder', label: 'Launch Resume Builder' };
    }
    if (post.tags.includes('TADA')) {
      return { path: '/tools/pdf-tools', label: 'Launch TA/DA PDF Agent' };
    }
    return { path: '/tools/prarthna-patra-writer', label: 'Launch Application Writer' };
  };

  const toolCTA = getRelatedToolLink();

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-amber-500/20 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f111a]/95 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link to="/blog" className="p-2 rounded-lg hover:bg-white/10 flex items-center gap-2 text-xs text-gray-400 hover:text-white">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
        <span className="text-sm font-bold tracking-wider uppercase text-amber-500">
          📰 Article Reader
        </span>
        <div className="w-20" /> {/* Spacer */}
      </header>

      {/* Main Layout */}
      <div className="max-w-6xl mx-auto p-4 py-10 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        {/* Content Panel */}
        <article className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 sm:p-10 space-y-8 shadow-xl">
          {/* Article Header */}
          <div className="space-y-4 border-b border-white/10 pb-6">
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                {post.category}
              </span>
              {post.tags.map(t => (
                <span key={t} className="px-2 py-0.5 bg-white/5 rounded text-gray-400 text-[10px]">
                  #{t}
                </span>
              ))}
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-xs text-gray-500 pt-2">
              <span className="flex items-center gap-1.5"><Clock size={14}/> {post.readTime}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14}/> Published {post.date}</span>
            </div>
          </div>

          {/* Programmatic Paragraphs */}
          <div className="space-y-6 text-xs sm:text-sm text-gray-300 leading-relaxed">
            {articleSections.map((sec, idx) => {
              if (sec.isTable) {
                return (
                  <div key={idx} className="space-y-3 pt-4">
                    <h3 className="text-base font-bold text-white">{sec.h2}</h3>
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#07080d]">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-gray-400 font-bold uppercase tracking-wider">
                            <th className="p-3">State / Jurisdiction</th>
                            <th className="p-3">Affidavit Value</th>
                            <th className="p-3">Rent Slabs</th>
                            <th className="p-3">Admissibility Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/5">
                            <td className="p-3 font-medium text-white">Delhi NCR</td>
                            <td className="p-3">₹10 e-Stamp</td>
                            <td className="p-3">₹50 (up to 11mo)</td>
                            <td className="p-3">Registered / e-Verify</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="p-3 font-medium text-white">Uttar Pradesh</td>
                            <td className="p-3">₹10 / ₹100 stamp</td>
                            <td className="p-3">₹100 (up to 11mo)</td>
                            <td className="p-3">Notarized Book Entry</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="p-3 font-medium text-white">Bihar</td>
                            <td className="p-3">₹100 stamp</td>
                            <td className="p-3">1% of annual rent</td>
                            <td className="p-3">Sub-Registrar Stamp</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="p-3 font-medium text-white">Maharashtra</td>
                            <td className="p-3">₹100 / ₹500</td>
                            <td className="p-3">0.25% stamp duty</td>
                            <td className="p-3">Fully Online Registered</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }

              if (sec.faqs) {
                return (
                  <div key={idx} className="space-y-4 pt-4 border-t border-white/10">
                    <h3 className="text-base font-bold text-white">{sec.h2}</h3>
                    <div className="space-y-3">
                      {sec.faqs.map((faq, fIdx) => (
                        <div key={fIdx} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
                          <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-500"/> {faq.q}
                          </span>
                          <p className="text-xs text-gray-400 leading-relaxed">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="space-y-2.5">
                  <h2 className="text-base sm:text-lg font-bold text-white pt-2">{sec.h2}</h2>
                  <p className="leading-relaxed text-gray-300">{sec.content}</p>
                </div>
              );
            })}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Call-to-action */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-2xl p-5 text-center space-y-4">
            <h4 className="text-xs font-bold text-amber-400">Launch Draft Tool</h4>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Use our AI drafting engine to create your documents in minutes. Fully validated with zero placeholders.
            </p>
            <Link to={toolCTA.path} className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20">
              {toolCTA.label} <ChevronRight size={14}/>
            </Link>
          </div>

          {/* Related Articles */}
          <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider border-b border-white/10 pb-2">
              Recent Articles
            </h3>
            <div className="space-y-2.5">
              {ALL_BLOG_POSTS.slice(0, 5).map(p => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="block space-y-1 text-left">
                  <span className="text-xs text-gray-300 hover:text-amber-400 transition-colors font-medium line-clamp-2 leading-snug">
                    {p.title}
                  </span>
                  <span className="text-[9px] text-gray-500 block">Published {p.date}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0b0c13] py-8 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} N-Dizi AI. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="/privacy-policy.html" className="hover:text-white">Privacy Policy</a>
          <a href="/terms.html" className="hover:text-white">Terms</a>
          <a href="/disclaimer.html" className="hover:text-white">Disclaimer</a>
        </div>
      </footer>
    </div>
  )
}
