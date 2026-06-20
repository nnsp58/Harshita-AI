// frontend/src/pages/SeoArticle.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, Calendar, Bookmark, FileText, ArrowRight, CheckCircle } from 'lucide-react'
import { ALL_SEO_ARTICLES } from '../data/seoContent'

export default function SeoArticle() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)

  useEffect(() => {
    const data = ALL_SEO_ARTICLES.find(a => a.slug === slug)
    if (data) {
      setArticle(data)
      document.title = `${data.title} | N-Dizi AI`
    } else {
      navigate('/')
    }
  }, [slug, navigate])

  if (!article) return null

  // Programmatic Content Expansion Engine (Tostich 1000+ words)
  const getExpandedContent = () => {
    const sections = [];
    
    // Intro
    sections.push({
      h2: `Comprehensive Analysis on ${article.h1}`,
      content: `Under the administrative and judicial structures of India, dealing with ${article.category.toLowerCase()} requires meticulous attention to detail, proper verification frameworks, and strict adherence to the law. Whether you are drafting a petition for Block Tehsil, filing a lost document affidavit, preparing a legal notice for summary suit recovery, or preparing a registered Will, understanding your legal rights and standard formatting is critical to avoid rejection by authorities. This comprehensive guide covers everything from legal provisions, stamp duties, step-by-step procedures, and common templates.`
    });

    // Code & Act Mappings
    let actMapping = '';
    if (article.category === 'Legal Drafts') {
      actMapping = `The Indian Stamp Act, 1899 and the Registration Act, 1908 govern all covenants under this category. Immovable property transfers must comply with Section 123 of the Transfer of Property Act, 1882, while Wills are governed by Section 63 of the Indian Succession Act, 1925. Standard declarations are notarized under the Notaries Act, 1952.`;
    } else if (article.category === 'Legal Notices') {
      actMapping = `Notices are civil warnings governed by Section 80 of the Civil Procedure Code (CPC), 1908 for government disputes. Money recovery relies on Summary Suits under Order 37 of the CPC. Cheque bounce disputes fall strictly under Section 138 of the Negotiable Instruments (NI) Act, 1881.`;
    } else {
      actMapping = `Administrative applications follow state-level citizen service charters (like e-District programs) and public grievance redressal laws, ensuring public officials are legally bound to acknowledge and process representations within 15–30 days.`;
    }
    
    sections.push({
      h2: 'Statutory Acts & Legal Classifications in India',
      content: `${actMapping} Failure to print agreements or declarations on stamp paper of correct value, or omitting key sections like cause-of-action timelines, makes the document legally inadmissible in civil court and liable to penalty rates under Section 35 of the Stamp Act.`
    });

    // Map outline items
    article.outline.forEach(item => {
      sections.push({
        h2: item.h2,
        content: `${item.text} In practical scenarios, citizens must make sure that all credentials (names, fathers' names, dates, amounts) exactly match government records like Aadhaar or PAN. Minor spelling mismatches are one of the most common reasons for administrative delay, which then requires another name correction affidavit to reconcile.`
      });
    });

    // Common mistakes
    sections.push({
      h2: `Critical Pitfalls & Mistakes to Avoid in ${article.category}`,
      content: `When drafting this category of document, avoid these critical errors:
      1. Using the incorrect non-judicial stamp paper denomination, which makes the document invalid in court.
      2. Leaving raw brackets or empty placeholders like "[CLIENT NAME]" in the final draft.
      3. Forgetting the signature of two independent witnesses in property or succession transfers.
      4. Omitting the exact date on which the cause of action arose, or failing to file within the 3-year limitation period.
      5. Failing to secure an official diary registry stamp or receiving receipt when submitting representations to government departments.`
    });

    // Stamp Duty rates table data
    sections.push({
      h2: 'State-wise Non-Judicial Stamp Duty Denominations',
      isTable: true
    });

    // FAQs Specific to Article
    sections.push({
      h2: `Frequently Asked Questions: ${article.h1}`,
      faqs: [
        { q: `What is the validity period for this ${article.tags[0]} document?`, a: `Affidavits and certificates do not have a standard expiry date, but administrative authorities typically ask for affidavits notarized within the last 6 months. Rent agreements are valid for the lease duration.` },
        { q: `Do I need to visit court to get this notarized?`, a: `No. You can get documents notarized by visiting any notary public sitting outside block tehsil offices, sub-registrar offices, or civil courts, who will enter the record in their register and apply the notary stamp.` }
      ]
    });

    return sections;
  };

  const expandedContent = getExpandedContent();

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-amber-500/20 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f111a]/95 border-b border-white/10 px-4 py-3 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-white/10">
          <ArrowLeft size={18} className="text-gray-400" />
        </button>
        <span className="text-sm font-bold tracking-wider uppercase text-amber-500 flex items-center gap-1">
          <BookOpen size={16}/> N-Dizi Knowledge Base
        </span>
      </header>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 py-10">
        {/* Main Article Container */}
        <article className="bg-[#0f111a] border border-white/10 rounded-2xl p-6 sm:p-10 space-y-8 shadow-xl">
          {/* Header */}
          <div className="space-y-4 border-b border-white/10 pb-6">
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-amber-400 text-[10px] font-bold uppercase tracking-wider">
                {article.category}
              </span>
              {article.tags.map(t => (
                <span key={t} className="px-2 py-1 bg-white/5 rounded text-gray-400 text-[10px]">
                  #{t}
                </span>
              ))}
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {article.h1}
            </h1>

            <div className="flex items-center gap-6 text-xs text-gray-500 pt-2">
              <span className="flex items-center gap-1.5"><Clock size={14}/> {article.readTime}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14}/> Published June 20, 2026</span>
              <span className="flex items-center gap-1.5"><Bookmark size={14}/> Verified Legal Drafts</span>
            </div>
          </div>

          {/* Expanded Rich Text Content */}
          <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
            {expandedContent.map((sec, idx) => {
              if (sec.isTable) {
                return (
                  <div key={idx} className="space-y-3 pt-4">
                    <h3 className="text-base font-bold text-white">{sec.h2}</h3>
                    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#07080d]">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-gray-400 font-bold uppercase tracking-wider">
                            <th className="p-3">State Name</th>
                            <th className="p-3">Affidavit Stamp</th>
                            <th className="p-3">Rent Agreement Stamp</th>
                            <th className="p-3">Notary Fees</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/5">
                            <td className="p-3 font-medium text-white">Uttar Pradesh</td>
                            <td className="p-3">₹10 / ₹100</td>
                            <td className="p-3">₹100 / 2% annual rent</td>
                            <td className="p-3">₹50 - ₹100</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="p-3 font-medium text-white">Bihar</td>
                            <td className="p-3">₹100</td>
                            <td className="p-3">₹1,000 flat rate</td>
                            <td className="p-3">₹100</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="p-3 font-medium text-white">Delhi NCR</td>
                            <td className="p-3">₹10 (e-Stamp)</td>
                            <td className="p-3">₹50 / ₹100</td>
                            <td className="p-3">₹50</td>
                          </tr>
                          <tr className="border-b border-white/5">
                            <td className="p-3 font-medium text-white">Rajasthan</td>
                            <td className="p-3">₹50</td>
                            <td className="p-3">₹500 / 1% annual rent</td>
                            <td className="p-3">₹100</td>
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
                            <CheckCircle size={14} className="text-emerald-500"/> {faq.q}
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
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-300">{sec.content}</p>
                </div>
              );
            })}
          </div>

          {/* Internal Linking Footer */}
          <div className="pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/" className="p-4 bg-white/[0.02] border border-white/5 hover:border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-gray-400 hover:text-white transition-all">
              <span>Return to Homepage</span> <ArrowRight size={14}/>
            </Link>
            <Link to="/contact" className="p-4 bg-white/[0.02] border border-white/5 hover:border-amber-500/20 rounded-xl flex items-center justify-between text-xs text-gray-400 hover:text-white transition-all">
              <span>Contact Support Desk</span> <ArrowRight size={14}/>
            </Link>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Related Tools */}
          <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider border-b border-white/10 pb-2">
              Related AI Tools
            </h3>
            <div className="space-y-2">
              {article.relatedTools.map(t => (
                <Link key={t} to={`/tools/${t}-generator`} className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-xl text-xs text-gray-300 hover:text-white transition-all">
                  <span className="capitalize">{t.replace('-', ' ')} Tool</span>
                  <FileText size={14} className="text-amber-500"/>
                </Link>
              ))}
            </div>
          </div>

          {/* Related Articles */}
          <div className="bg-[#0f111a] border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider border-b border-white/10 pb-2">
              Related Guides
            </h3>
            <div className="space-y-2.5">
              {article.relatedArticles.map(artSlug => {
                const art = ALL_SEO_ARTICLES.find(a => a.slug === artSlug);
                if (!art) return null;
                return (
                  <Link key={artSlug} to={`/seo/${artSlug}`} className="block space-y-1 text-left">
                    <span className="text-xs text-gray-300 hover:text-amber-400 transition-colors font-medium line-clamp-2 leading-snug">
                      {art.title}
                    </span>
                    <span className="text-[9px] text-gray-500 block">Published June 2026</span>
                  </Link>
                );
              })}
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
