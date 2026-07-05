// frontend/src/pages/SpecialistCourse.jsx - Harshita AI Specialist Course (Video Based)
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import {
  GraduationCap, Play, CheckCircle2, ChevronRight, Award, Clock, BookOpen,
  Send, AlertCircle, FileText, ArrowLeft, HelpCircle, Trophy, Printer, ArrowRight
} from 'lucide-react'

// Course Curriculum Data structure
const CURRICULUM = [
  {
    id: 1,
    title: 'Module 1 – AI Fundamentals',
    description: 'Understand the basic concepts, types, and generative foundations of Artificial Intelligence.',
    assignment: 'Use AI to write a simple article about the impact of AI on rural employment.',
    lessons: [
      { id: '1-1', title: 'What is AI?', duration: '8:45', description: 'Introduction to Artificial Intelligence, its history, and basic definitions.' },
      { id: '1-2', title: 'Types of AI', duration: '12:10', description: 'Exploring Narrow AI, General AI, and Superintelligence differences.' },
      { id: '1-3', title: 'How ChatGPT Works', duration: '15:30', description: 'Deep dive into Large Language Models, Transformers, and training stages.' },
      { id: '1-4', title: 'Generative AI Basics', duration: '10:15', description: 'How Neural Networks generate text, images, and audio from patterns.' }
    ]
  },
  {
    id: 2,
    title: 'Module 2 – Prompt Engineering',
    description: 'Learn professional prompting techniques to unlock the full power of LLMs.',
    assignment: 'Create 10 professional system prompts for legal drafting, image generation, and data validation.',
    lessons: [
      { id: '2-1', title: 'Prompt Basics', duration: '9:20', description: 'Standard prompt structure: Instruction, Context, Input, Output indicator.' },
      { id: '2-2', title: 'Role Prompting', duration: '11:40', description: 'Assigning personas to the model to refine tone and depth of responses.' },
      { id: '2-3', title: 'Chain of Thought', duration: '14:15', description: 'Forcing step-by-step reasoning for logic-heavy, mathematical, or coding tasks.' },
      { id: '2-4', title: 'Few Shot Prompting', duration: '13:05', description: 'Providing sample input-output pairs to guide the format of response.' }
    ]
  },
  {
    id: 3,
    title: 'Module 3 – AI Content Creation',
    description: 'Leverage AI tools to draft high-engagement, SEO-optimized articles and scripts.',
    assignment: 'Create a complete SEO-optimized blog using AI including meta tags, FAQs, and a sitemap entry.',
    lessons: [
      { id: '3-1', title: 'Blog Writing', duration: '11:50', description: 'Developing outlines, engaging intros, and formatting blogs for readability.' },
      { id: '3-2', title: 'YouTube Script Writing', duration: '14:25', description: 'Hook, body, and call-to-action structure for viral video scripting.' },
      { id: '3-3', title: 'Social Media Content', duration: '10:40', description: 'Crafting concise updates for LinkedIn, Instagram reels, and Twitter threads.' },
      { id: '3-4', title: 'SEO Content', duration: '13:10', description: 'Keyphrase research integration, structure heading hierarchy, and meta details.' }
    ]
  },
  {
    id: 4,
    title: 'Module 4 – AI Image Generation',
    description: 'Master text-to-image prompts to generate consistent and cinematic illustrations.',
    assignment: 'Generate 10 professional images using Pollinations AI or Fal AI matching cartoon and realistic styles.',
    lessons: [
      { id: '4-1', title: 'AI Images Explained', duration: '10:15', description: 'Diffusion models, latent space, and seed weights concepts made simple.' },
      { id: '4-2', title: 'Prompt Structure', duration: '12:30', description: 'Lighting, aspect ratios, filters, and rendering engines (Flux, SDXL).' },
      { id: '4-3', title: 'Character Consistency', duration: '16:40', description: 'Using name tagging and details to maintain constant characters across frames.' },
      { id: '4-4', title: 'Commercial Use', duration: '9:50', description: 'Licensing, rights, and selling generated graphics as freelancing services.' }
    ]
  },
  {
    id: 5,
    title: 'Module 5 – AI Video Creation',
    description: 'Convert text stories into short, mobile-first cinematic animations and reels.',
    assignment: 'Create a 60-second AI cartoon/realistic video with narration, background music, and subtitles.',
    lessons: [
      { id: '5-1', title: 'Text To Video', duration: '11:20', description: 'Overview of AI video generator platforms and dynamic motion prompts.' },
      { id: '5-2', title: 'Story To Video', duration: '13:50', description: 'Analyzing plots, scene planning, script translation, and timing calculations.' },
      { id: '5-3', title: 'YouTube Shorts Creation', duration: '12:10', description: 'Designing vertical 1080x1920 layouts, burning subtitles, and overlaying hooks.' },
      { id: '5-4', title: 'Reels Automation', duration: '15:20', description: 'FFmpeg script compilation, audio levels, and background track loops.' }
    ]
  },
  {
    id: 6,
    title: 'Module 6 – AI Agents',
    description: 'Build self-contained, task-oriented agents that operate and self-heal automatically.',
    assignment: 'Design an AI Agent workflow that reads document files, parses candidates, and posts updates.',
    lessons: [
      { id: '6-1', title: 'What is an AI Agent?', duration: '12:30', description: 'Autonomous agents, loop reasoning (ReAct), and tool integration interfaces.' },
      { id: '6-2', title: 'Business AI Agents', duration: '14:40', description: 'Customer service, data scrapers, and document parsing agents.' },
      { id: '6-3', title: 'Self-Healing Agents', duration: '16:15', description: 'How agents detect errors, patch code, and run validation tests automatically.' },
      { id: '6-4', title: 'Multi-Agent Systems', duration: '13:50', description: 'Orchestrator-worker protocols, communication channels, and task handoffs.' }
    ]
  },
  {
    id: 7,
    title: 'Module 7 – AI for Business',
    description: 'Learn freelancing, SaaS product development, and consulting strategies using AI.',
    assignment: 'Create a comprehensive business proposal for launching an AI-powered local services hub.',
    lessons: [
      { id: '7-1', title: 'AI Business Models', duration: '10:55', description: 'Identifying high-margin AI opportunities in standard markets.' },
      { id: '7-2', title: 'AI Freelancing', duration: '13:20', description: 'Selling prompt writing, copy drafting, and image design on Fiverr/Upwork.' },
      { id: '7-3', title: 'AI Consulting', duration: '15:10', description: 'Auditing businesses and helping them implement low-code automation tools.' },
      { id: '7-4', title: 'AI SaaS Products', duration: '14:35', description: 'Wrapping API models in custom React/Node interfaces to charge subscriptions.' }
    ]
  },
  {
    id: 8,
    title: 'Module 8 – Harshita AI Mastery',
    description: 'Deploy skills, manage configurations, and orchestrate E2E pipelines in Harshita AI.',
    assignment: 'Build and audit a working custom skill workflow inside Harshita AI dashboard.',
    lessons: [
      { id: '8-1', title: 'Harshita AI Dashboard', duration: '12:15', description: 'Familiarization with settings, database connections, and logs hub.' },
      { id: '8-2', title: 'Skills Management', duration: '14:50', description: 'Auditing skills registry, loading intent keywords, and mapping custom scripts.' },
      { id: '8-3', title: 'Story Video Generator', duration: '16:20', description: 'Tuning Flux generation, TTS engines, and optimizing FFmpeg zoom layers.' },
      { id: '8-4', title: 'Automation & Deployment', duration: '13:40', description: 'Configuring safe push pipelines, Render hooks, and setting self-healing tasks.' }
    ]
  }
];

export default function SpecialistCourse() {
  const navigate = useNavigate();
  const { user } = useStore();
  
  // Progress states persisted in localStorage
  const [completedLessons, setCompletedLessons] = useState([]);
  const [submittedAssignments, setSubmittedAssignments] = useState({}); // { moduleId: text }
  const [activeLesson, setActiveLesson] = useState(CURRICULUM[0].lessons[0]);
  const [activeModule, setActiveModule] = useState(CURRICULUM[0]);
  const [assignmentInput, setAssignmentInput] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);
  
  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem('harshita_specialist_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.lessons)) setCompletedLessons(() => parsed.lessons);
        if (parsed.assignments) setSubmittedAssignments(() => parsed.assignments);
      } catch (e) {
        console.error('Failed to load progress', e);
      }
    }
  }, []);

  // Save progress
  const saveProgress = (lessons, assignments) => {
    localStorage.setItem(
      'harshita_specialist_progress', 
      JSON.stringify({ lessons, assignments })
    );
  };

  // Toggle complete
  const handleToggleComplete = (lessonId) => {
    let next;
    if (completedLessons.includes(lessonId)) {
      next = completedLessons.filter(id => id !== lessonId);
    } else {
      next = [...completedLessons, lessonId];
    }
    setCompletedLessons(next);
    saveProgress(next, submittedAssignments);
  };

  // Submit assignment
  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    if (!assignmentInput.trim()) return;

    const next = {
      ...submittedAssignments,
      [activeModule.id]: assignmentInput
    };
    setSubmittedAssignments(next);
    saveProgress(completedLessons, next);
    
    setAssignmentSuccess(true);
    setTimeout(() => {
      setAssignmentSuccess(false);
      setAssignmentInput('');
    }, 4000);
  };

  // Calculate totals
  const totalLessons = CURRICULUM.reduce((acc, curr) => acc + curr.lessons.length, 0);
  const totalAssignments = CURRICULUM.length;
  
  const completedLessonsCount = completedLessons.length;
  const completedAssignmentsCount = Object.keys(submittedAssignments).length;
  
  const overallProgress = Math.round(
    ((completedLessonsCount + completedAssignmentsCount) / (totalLessons + totalAssignments)) * 100
  );

  const isCourseComplete = completedLessonsCount === totalLessons && completedAssignmentsCount === totalAssignments;

  const selectLesson = (module, lesson) => {
    setActiveModule(module);
    setActiveLesson(lesson);
  };

  // Trigger Print Certificate
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col pb-12">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f111a] border-b border-white/10 px-6 py-4 flex items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft size={18} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-base font-bold flex items-center gap-2">
              <GraduationCap size={22} className="text-indigo-400" />
              Harshita AI Specialist Course / AI स्पेशलिस्ट कोर्स
            </h1>
            <p className="text-[10px] text-gray-500">Become a certified AI Automation Specialist in 30 Days</p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Overall Progress</p>
            <p className="text-sm font-bold text-indigo-400">{overallProgress}% Complete</p>
          </div>
          <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${overallProgress}%` }}></div>
          </div>
        </div>
      </header>

      {/* Main Course Layout */}
      <div className="max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1">
        
        {/* Left Column: Player & Active Details */}
        <div className="space-y-6">
          
          {/* Mock Video Player */}
          <div className="aspect-video w-full bg-[#0a0b10] border border-white/10 rounded-2xl overflow-hidden relative group flex flex-col items-center justify-center p-6 shadow-2xl">
            {/* Ambient blur background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/10 to-violet-900/10 opacity-30 pointer-events-none"></div>
            
            {/* Play overlay layout */}
            <div className="z-10 flex flex-col items-center text-center space-y-4 max-w-md">
              <div className="w-16 h-16 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform cursor-pointer">
                <Play size={28} className="fill-current ml-1" />
              </div>
              <div>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  {activeModule.title.split(' – ')[0]} • Lesson {activeLesson.id.split('-')[1]}
                </span>
                <h3 className="text-xl font-bold mt-2 text-white">{activeLesson.title}</h3>
                <p className="text-xs text-gray-500 mt-1 italic">Estimated playtime: {activeLesson.duration} mins</p>
              </div>
            </div>

            {/* Bottom playback progress bar representation */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/5 p-3 flex items-center justify-between border-t border-white/5 z-10 text-[10px] text-gray-400">
              <div className="flex items-center gap-3">
                <Play size={12} className="text-indigo-400" />
                <span>0:00 / {activeLesson.duration}</span>
              </div>
              <div className="flex-1 mx-4 bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[15%]"></div>
              </div>
              <span className="text-xs font-bold text-indigo-400">{activeLesson.duration} mins</span>
            </div>
          </div>

          {/* Active Lesson Text Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{activeModule.title}</span>
                <h2 className="text-lg font-bold text-white mt-0.5">{activeLesson.title}</h2>
              </div>
              <button
                onClick={() => handleToggleComplete(activeLesson.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  completedLessons.includes(activeLesson.id)
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                }`}
              >
                <CheckCircle2 size={14} />
                {completedLessons.includes(activeLesson.id) ? 'Lesson Completed ✓' : 'Mark Lesson Complete'}
              </button>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Lesson Description</h4>
              <p className="text-xs text-gray-400 leading-relaxed">{activeLesson.description}</p>
            </div>
          </div>

          {/* Module Assignment Panel */}
          <div className="bg-gradient-to-br from-indigo-950/20 to-slate-950 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="text-indigo-400 shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Module Practical Assignment / कार्यभार</h4>
                <h3 className="text-sm font-bold text-white mt-0.5">Task: {activeModule.title}</h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed bg-[#0a0b10] border border-white/5 p-3 rounded-xl italic">
                  "{activeModule.assignment}"
                </p>
              </div>
            </div>

            {/* Submit assignment input */}
            <form onSubmit={handleAssignmentSubmit} className="space-y-3 pt-2">
              <textarea
                value={submittedAssignments[activeModule.id] ? submittedAssignments[activeModule.id] : assignmentInput}
                onChange={e => setAssignmentInput(e.target.value)}
                disabled={!!submittedAssignments[activeModule.id]}
                rows={4}
                required
                placeholder={submittedAssignments[activeModule.id] ? "" : "Paste your prompt codes, link to work, or submit your written article solution text here..."}
                className="w-full bg-[#0a0b10] border border-white/10 focus:border-indigo-500 focus:outline-none rounded-xl p-3 text-xs text-white placeholder-gray-600 resize-none"
              />
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500">
                  {submittedAssignments[activeModule.id] ? "✓ Assignment submitted successfully" : "📝 Once submitted, progress is saved."}
                </span>
                
                {!submittedAssignments[activeModule.id] && (
                  <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/10">
                    <Send size={12}/> Submit Assignment
                  </button>
                )}
              </div>
            </form>

            <AnimatePresence>
              {assignmentSuccess && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-400">
                  <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                  <span><strong>Submission Received:</strong> Your practical task has been saved and counted in the dashboard score. Complete all 8 assignments to unlock your graduation certificate.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Course Roadmap / Lessons Navigation */}
        <aside className="space-y-4">
          
          {/* Certificate unlock card */}
          <div className="bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 text-center space-y-4">
            <Trophy className="text-amber-400 mx-auto animate-bounce" size={32} />
            <div>
              <h4 className="text-sm font-bold text-white">AI Specialist Graduation</h4>
              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                Complete all 32 lessons and submit 8 module assignments to unlock your official Certified Harshita AI Specialist Diploma.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-y border-white/5 py-3">
              <div className="border-r border-white/5">
                <p className="text-[10px] text-gray-500">Lessons Completed</p>
                <p className="text-base font-bold text-white">{completedLessonsCount} / {totalLessons}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Tasks Submitted</p>
                <p className="text-base font-bold text-white">{completedAssignmentsCount} / {totalAssignments}</p>
              </div>
            </div>

            <button
              onClick={() => setShowCertificate(true)}
              disabled={!isCourseComplete}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                isCourseComplete
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black'
                  : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Award size={14} /> Claim Specialist Certificate
            </button>
          </div>

          {/* Module Navigation accordion */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase px-2 py-1 tracking-wider flex items-center gap-1.5">
              <BookOpen size={13}/> Course Curriculum Roadmap
            </h3>
            
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-hide">
              {CURRICULUM.map((module) => {
                const isCurrent = activeModule.id === module.id;
                const moduleLessonsCompleted = module.lessons.filter(l => completedLessons.includes(l.id)).length;
                const assignmentDone = !!submittedAssignments[module.id];
                
                return (
                  <div key={module.id} className={`border rounded-xl transition-all ${
                    isCurrent ? 'bg-[#0f111a] border-indigo-500/30' : 'bg-[#0a0b10] border-white/5 hover:border-white/10'
                  }`}>
                    {/* Header */}
                    <button
                      onClick={() => {
                        setActiveModule(module);
                        setActiveLesson(module.lessons[0]);
                      }}
                      className="w-full text-left p-3 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{module.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-gray-500">
                            📚 {moduleLessonsCompleted}/{module.lessons.length} lessons
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            assignmentDone ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {assignmentDone ? 'Assignment OK ✓' : 'Assignment Pending'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={14} className={`text-gray-500 transition-transform ${isCurrent ? 'rotate-90 text-indigo-400' : ''}`} />
                    </button>

                    {/* Lesson items */}
                    {isCurrent && (
                      <div className="border-t border-white/5 p-2 space-y-1 bg-black/20">
                        {module.lessons.map(lesson => {
                          const isSelected = activeLesson.id === lesson.id;
                          const isDone = completedLessons.includes(lesson.id);
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => selectLesson(module, lesson)}
                              className={`w-full text-left px-2.5 py-2 rounded-lg text-[11px] flex items-center justify-between transition-colors ${
                                isSelected ? 'bg-indigo-600/20 text-indigo-400 font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <Play size={10} className={isSelected ? 'text-indigo-400' : 'text-gray-500'} />
                                <span className="truncate">{lesson.title}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-500 text-[10px] shrink-0 ml-2">
                                <Clock size={10} />
                                <span>{lesson.duration}</span>
                                {isDone && <CheckCircle2 size={11} className="text-emerald-500 ml-1 shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </aside>
      </div>

      {/* CERTIFICATE VIEW MODAL OVERLAY */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 print:p-0 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#0c0d14] border border-white/10 rounded-2xl p-6 print:p-0 print:border-none flex flex-col items-center max-h-[90vh] overflow-y-auto">
            
            {/* Modal Title and Controls */}
            <div className="w-full flex items-center justify-between border-b border-white/5 pb-3 mb-4 print:hidden">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                <Award size={14} className="text-amber-400" /> Specialist Graduation Certificate
              </span>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors">
                  <Printer size={13}/> Print / Save PDF
                </button>
                <button onClick={() => setShowCertificate(false)} className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-colors">
                  Close
                </button>
              </div>
            </div>

            {/* Certificate Canvas Representation for Print */}
            <div className="w-full bg-[#12131b] border-8 border-double border-amber-600/30 p-12 text-center relative rounded-xl shadow-2xl flex flex-col items-center space-y-6 print:border-8 print:shadow-none min-h-[500px]">
              
              {/* Corner Ornaments */}
              <div className="absolute top-4 left-4 border-t-2 border-l-2 border-amber-500/30 w-8 h-8"></div>
              <div className="absolute top-4 right-4 border-t-2 border-r-2 border-amber-500/30 w-8 h-8"></div>
              <div className="absolute bottom-4 left-4 border-b-2 border-l-2 border-amber-500/30 w-8 h-8"></div>
              <div className="absolute bottom-4 right-4 border-b-2 border-r-2 border-amber-500/30 w-8 h-8"></div>

              {/* Certificate Logo */}
              <img src="/harshita ai.png" alt="Harshita AI" className="w-16 h-16 rounded-xl mx-auto shadow-lg shadow-amber-500/10 border border-amber-500/20" />
              
              <div className="space-y-1">
                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest font-heading">Certificate of Achievement</span>
                <h1 className="text-3xl md:text-4xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mt-2">
                  Certified AI Automation Specialist
                </h1>
              </div>

              <div className="max-w-xl mx-auto space-y-3">
                <p className="text-xs text-gray-500 italic">This is proudly presented to</p>
                <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-2 max-w-sm mx-auto font-heading uppercase tracking-wide">
                  {user?.name || 'Harshita Guest Candidate'}
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed mt-2">
                  For successfully completing the comprehensive 30-day curriculum of **Harshita AI Specialist Course**. By fulfilling all 32 video lessons, completing intermediate evaluations, and submitting all 8 practical projects, the candidate is hereby accredited with expert mastery in AI content generation, prompt engineering logic, multi-agent frameworks, and workspace automation.
                </p>
              </div>

              {/* Certificate seal & signature block */}
              <div className="w-full max-w-2xl flex items-center justify-between pt-6 border-t border-white/5 text-xs text-gray-500">
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-amber-500/60 tracking-wider">Date of Graduation</p>
                  <p className="font-bold text-white mt-0.5">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {/* Golden Seal representation */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 border border-amber-300 relative shrink-0">
                  <div className="w-12 h-12 rounded-full border border-dashed border-black/20 flex items-center justify-center font-bold text-[9px] text-black uppercase text-center leading-tight tracking-tighter font-heading">
                    Harshita AI Seal
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-amber-500/60 tracking-wider">Authorized Signature</p>
                  <p className="font-serif italic font-bold text-white text-sm mt-0.5">Harshita AI Board</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
