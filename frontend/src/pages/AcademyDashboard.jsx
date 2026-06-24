// frontend/src/pages/AcademyDashboard.jsx - Harshita AI Academy & Auto Course Creator
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import api from '../services/api';
import {
  GraduationCap, Play, CheckCircle2, ChevronRight, Award, Clock, BookOpen,
  Send, AlertCircle, FileText, ArrowLeft, Trophy, Printer, ArrowRight,
  Sparkles, Plus, Search, BookOpenCheck, Settings as SettingsIcon, Download,
  Video, Eye, LayoutDashboard, Terminal, Compass, BadgeInfo, Check,
  HelpCircle, ChevronLeft, User, MessageSquare, Briefcase, FileCode
} from 'lucide-react';

export default function AcademyDashboard() {
  const navigate = useNavigate();
  const { user } = useStore();

  const [activeView, setActiveView] = useState('portal'); // portal, viewer, creator, community
  const [activeCommunityTab, setActiveCommunityTab] = useState('discussion'); // discussion, showcase, profile
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // LMS active lesson states
  const [completedLessons, setCompletedLessons] = useState([]);
  const [submittedAssignments, setSubmittedAssignments] = useState({});
  const [activeModule, setActiveModule] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [assignmentInput, setAssignmentInput] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  // Expanded LMS tabs
  const [activeLessonTab, setActiveLessonTab] = useState('lecture'); // lecture, script, slides, quiz
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Quiz States
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState([]); // Array of lessonIds

  // Module Requirements States
  const [submittedMiniProjects, setSubmittedMiniProjects] = useState({}); // { [courseId-modId]: string }
  const [completedModuleQuizzes, setCompletedModuleQuizzes] = useState([]); // [courseId-modId]
  const [modQuizSelectedOption, setModQuizSelectedOption] = useState(null);
  const [modQuizChecked, setModQuizChecked] = useState(false);
  const [modQuizCompleted, setModQuizCompleted] = useState(false);
  const [miniProjectInput, setMiniProjectInput] = useState('');
  const [miniProjectSuccess, setMiniProjectSuccess] = useState(false);

  // Capstone Project States
  const [submittedCapstone, setSubmittedCapstone] = useState({}); // { [courseId]: string }
  const [capstoneInput, setCapstoneInput] = useState('');
  const [capstoneSuccess, setCapstoneSuccess] = useState(false);

  // Community Mock States
  const [discussions, setDiscussions] = useState([
    { id: 1, author: 'Ramesh Kumar', role: 'VLE Operator', text: 'Prompt Engineering Level 2 is amazing! Few shot templates helped my customer document processing significantly.', time: '2 hours ago', likes: 14 },
    { id: 2, author: 'Kavita Singh', role: 'Student', text: 'Is anyone working on Module 5 consistent character generations? I would love to team up.', time: '5 hours ago', likes: 8 },
    { id: 3, author: 'Vikram Aditya', role: 'Developer', text: 'Just completed Level 5 AI agent builder. The self-healing loop instructions are very well written.', time: '1 day ago', likes: 21 }
  ]);
  const [newComment, setNewComment] = useState('');
  const [showcases, setShowcases] = useState([
    { id: 1, title: 'Legal Drafting Auto Prompt Library', author: 'Ramesh Kumar', desc: '15 structured prompts that draft civil suits and summon notice templates.', likes: 42 },
    { id: 2, title: 'Story to Cartoon video - Farmer Guide', author: 'Anita Rao', desc: 'A 60-second video explaining soil nutrients using Flux illustrations and ElevenLabs TTS.', likes: 31 }
  ]);
  const [newShowcaseTitle, setNewShowcaseTitle] = useState('');
  const [newShowcaseDesc, setNewShowcaseDesc] = useState('');
  const [showcaseSuccess, setShowcaseSuccess] = useState(false);

  // Auto Course Creator states
  const [topic, setTopic] = useState('');
  const [durationDays, setDurationDays] = useState('15');
  const [lessonFormat, setLessonFormat] = useState('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorProgress, setGeneratorProgress] = useState(0);
  const [generatorStage, setGeneratorStage] = useState('');
  const [creatorLogs, setCreatorLogs] = useState([]);

  // Fetch courses from server
  const fetchCourses = async () => {
    try {
      const res = await api.get('/academy/list');
      if (res.data && res.data.success) {
        setCourses(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch courses from server:', err);
    }
  };

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem('harshita_academy_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.lessons)) setCompletedLessons(parsed.lessons);
        if (parsed.assignments) setSubmittedAssignments(parsed.assignments);
        if (Array.isArray(parsed.quizzes)) setCompletedQuizzes(parsed.quizzes);
        if (parsed.miniProjects) setSubmittedMiniProjects(parsed.miniProjects);
        if (Array.isArray(parsed.modQuizzes)) setCompletedModuleQuizzes(parsed.modQuizzes);
        if (parsed.capstone) setSubmittedCapstone(parsed.capstone);
      } catch (e) {}
    }
    fetchCourses();
  }, []);

  // Save progress
  const saveProgressState = (lessons, assignments, quizzes, miniProjects, modQuizzes, capstone) => {
    localStorage.setItem(
      'harshita_academy_progress',
      JSON.stringify({
        lessons: lessons || completedLessons,
        assignments: assignments || submittedAssignments,
        quizzes: quizzes || completedQuizzes,
        miniProjects: miniProjects || submittedMiniProjects,
        modQuizzes: modQuizzes || completedModuleQuizzes,
        capstone: capstone || submittedCapstone
      })
    );
  };

  // Safe Fallback Getters for Lesson Structure
  const getObjectives = (lesson) => lesson.learningObjectives || ['Understand the lesson concepts.', 'Review case study examples.', 'Perform daily drills.'];
  const getTheory = (lesson) => lesson.theory || lesson.description || 'Theory content for this unit is being dynamically processed.';
  const getExamples = (lesson) => lesson.examples || 'Example case studies are being drafted for this unit.';
  const getDemonstration = (lesson) => lesson.demonstration || 'Step-by-step terminal and workspace instructions details.';
  const getSummary = (lesson) => lesson.summary || 'Summary points are being compiled.';
  const getPracticeExercises = (lesson) => lesson.practiceExercises || ['Drill 1: Read the documentation.', 'Drill 2: Practice commands.'];
  
  const getVideoScript = (lesson) => lesson.videoScript || {
    hook: `Ever wanted to master ${lesson.title}? In this video, we reveal exactly how to structure it.`,
    introduction: `Welcome to Harshita AI Specialist track. Today we cover ${lesson.title}.`,
    mainTeaching: `The fundamental rule of ${lesson.title} is to separate context instructions from raw input data.`,
    demonstration: `Look at the console: we feed the schema, trigger the action, and verify the outputs.`,
    assignment: `Your assignment is to complete the drill sheet.`,
    summary: `To wrap up, today we learned the theory and live runs. See you in the next lesson!`
  };

  const getSlideContent = (lesson) => lesson.slideContent || [
    { title: `Welcome to ${lesson.title}`, content: [`Definition of core concepts`, `Workflow advantages`], visualPrompt: `Visual showing user inputs connecting to AI services.` },
    { title: `Design Principles`, content: [`Separating parameters`, `Establishing constraints`], visualPrompt: `Flow diagram showing validation constraints.` },
    { title: `Hands-on Demonstration`, content: [`Booting dev server`, `Evaluating outcomes`], visualPrompt: `Screenshot showing compiler console logs.` },
    { title: `Wrap-up & Task Work`, content: [`Complete the quiz`, `Submit the practical sheet`], visualPrompt: `Graduation seal showing completion milestone.` }
  ];

  const getLessonQuiz = (lesson) => lesson.quiz || [
    {
      question: `What is the main goal of learning ${lesson.title}?`,
      options: [`To increase work speed and improve content quality using AI features`, `To configure hardware chips`, `To study assembly code compilers`, `None of the above`],
      correctOption: 0
    },
    {
      question: `Which element is recommended to get good outputs in ${lesson.title}?`,
      options: [`Vague keywords with no structure`, `Clear context, strict instructions, and output style guidelines`, `Leaving settings at blank defaults`, `Running operations offline only`],
      correctOption: 1
    },
    {
      question: `Why do we run verification checks for ${lesson.title}?`,
      options: [`To waste system resources`, `To ensure output reliability and validate parameters`, `Because it is required by the browser`, `None of the above`],
      correctOption: 1
    }
  ];

  // Select lesson helper
  const selectLesson = (module, lesson) => {
    setActiveModule(module);
    setActiveLesson(lesson);
    setActiveLessonTab('lecture');
    setCurrentSlideIndex(0);
    setQuizSelectedOption(null);
    setQuizChecked(false);
    setQuizQuestionIndex(0);
    setQuizCompleted(false);
    
    // Reset module quiz states
    setModQuizSelectedOption(null);
    setModQuizChecked(false);
    setModQuizCompleted(false);
  };

  // Launch course
  const handleLaunchCourse = (course) => {
    setSelectedCourse(course);
    setActiveModule(course.modules[0]);
    setActiveLesson(course.modules[0].lessons[0]);
    setActiveView('viewer');
    setActiveLessonTab('lecture');
    
    // Reset indices
    setCurrentSlideIndex(0);
    setQuizSelectedOption(null);
    setQuizChecked(false);
    setQuizQuestionIndex(0);
    setQuizCompleted(false);
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
    saveProgressState(next, submittedAssignments, completedQuizzes, submittedMiniProjects, completedModuleQuizzes, submittedCapstone);
  };

  // Submit assignment
  const handleAssignmentSubmit = (e) => {
    e.preventDefault();
    if (!assignmentInput.trim()) return;

    const next = {
      ...submittedAssignments,
      [`${selectedCourse.id}-${activeModule.id}`]: assignmentInput
    };
    setSubmittedAssignments(next);
    saveProgressState(completedLessons, next, completedQuizzes, submittedMiniProjects, completedModuleQuizzes, submittedCapstone);

    setAssignmentSuccess(true);
    setTimeout(() => {
      setAssignmentSuccess(false);
      setAssignmentInput('');
    }, 4000);
  };

  // Submit Mini Project
  const handleMiniProjectSubmit = (e) => {
    e.preventDefault();
    if (!miniProjectInput.trim()) return;

    const next = {
      ...submittedMiniProjects,
      [`${selectedCourse.id}-${activeModule.id}`]: miniProjectInput
    };
    setSubmittedMiniProjects(next);
    saveProgressState(completedLessons, submittedAssignments, completedQuizzes, next, completedModuleQuizzes, submittedCapstone);

    setMiniProjectSuccess(true);
    setTimeout(() => {
      setMiniProjectSuccess(false);
      setMiniProjectInput('');
    }, 4000);
  };

  // Submit Capstone
  const handleCapstoneSubmit = (e) => {
    e.preventDefault();
    if (!capstoneInput.trim()) return;

    const next = {
      ...submittedCapstone,
      [selectedCourse.id]: capstoneInput
    };
    setSubmittedCapstone(next);
    saveProgressState(completedLessons, submittedAssignments, completedQuizzes, submittedMiniProjects, completedModuleQuizzes, next);

    setCapstoneSuccess(true);
    setTimeout(() => {
      setCapstoneSuccess(false);
      setCapstoneInput('');
    }, 4000);
  };

  // Lesson Quiz Answer select
  const handleQuizSelect = (optIndex) => {
    if (quizChecked) return;
    setQuizSelectedOption(optIndex);
  };

  const handleQuizCheck = () => {
    if (quizSelectedOption === null) return;
    
    const quizData = getLessonQuiz(activeLesson);
    const currentQ = quizData[quizQuestionIndex];

    if (quizSelectedOption === currentQ.correctOption) {
      setQuizScore(prev => prev + 1);
    }
    setQuizChecked(true);
  };

  const handleQuizNext = () => {
    const quizData = getLessonQuiz(activeLesson);
    
    if (quizQuestionIndex < quizData.length - 1) {
      setQuizQuestionIndex(prev => prev + 1);
      setQuizSelectedOption(null);
      setQuizChecked(false);
    } else {
      setQuizCompleted(true);
      // Mark lesson quiz as completed in state & store
      if (!completedQuizzes.includes(activeLesson.id)) {
        const next = [...completedQuizzes, activeLesson.id];
        setCompletedQuizzes(next);
        saveProgressState(completedLessons, submittedAssignments, next, submittedMiniProjects, completedModuleQuizzes, submittedCapstone);
      }
    }
  };

  // Module Quiz Logic
  const handleModQuizSelect = (optIndex) => {
    if (modQuizChecked) return;
    setModQuizSelectedOption(optIndex);
  };

  const handleModQuizCheck = () => {
    if (modQuizSelectedOption === null) return;
    
    const modQuizData = activeModule.quiz || [];
    const currentQ = modQuizData[modQuizQuestionIndex] || { correctOption: 0 };

    setModQuizChecked(true);
  };

  const handleModQuizNext = () => {
    const modQuizData = activeModule.quiz || [];
    
    if (modQuizQuestionIndex < modQuizData.length - 1) {
      setModQuizQuestionIndex(prev => prev + 1);
      setModQuizSelectedOption(null);
      setModQuizChecked(false);
    } else {
      setModQuizCompleted(true);
      const modQuizKey = `${selectedCourse.id}-${activeModule.id}`;
      if (!completedModuleQuizzes.includes(modQuizKey)) {
        const next = [...completedModuleQuizzes, modQuizKey];
        setCompletedModuleQuizzes(next);
        saveProgressState(completedLessons, submittedAssignments, completedQuizzes, submittedMiniProjects, next, submittedCapstone);
      }
    }
  };

  // Calculate metrics
  const getCourseMetrics = (course) => {
    if (!course) return { progress: 0, isComplete: false };
    
    const totalL = course.modules.reduce((acc, curr) => acc + curr.lessons.length, 0);
    const totalA = course.modules.length;
    
    // Quizzes (each lesson quiz + module quiz)
    const totalQ = totalL + course.modules.filter(m => m.quiz && m.quiz.length > 0).length;
    // Projects (each module miniProject + course capstoneProject if exists)
    const totalP = course.modules.filter(m => m.miniProject).length + (course.capstoneProject ? 1 : 0);

    const doneL = course.modules.reduce((acc, m) => {
      return acc + m.lessons.filter(l => completedLessons.includes(l.id)).length;
    }, 0);

    const doneA = course.modules.filter(m => !!submittedAssignments[`${course.id}-${m.id}`]).length;

    const doneQ = course.modules.reduce((acc, m) => {
      const lessonQuizDone = m.lessons.filter(l => completedQuizzes.includes(l.id)).length;
      const modQuizDone = completedModuleQuizzes.includes(`${course.id}-${m.id}`) ? 1 : 0;
      return acc + lessonQuizDone + modQuizDone;
    }, 0);

    const doneP = course.modules.filter(m => !!submittedMiniProjects[`${course.id}-${m.id}`]).length + (submittedCapstone[course.id] ? 1 : 0);

    const totalWeight = totalL + totalA + totalQ + totalP;
    const doneWeight = doneL + doneA + doneQ + doneP;

    const progress = Math.round((doneWeight / totalWeight) * 100) || 0;
    const isComplete = doneL === totalL && doneA === totalA && doneQ === totalQ && doneP === totalP;

    return { totalL, totalA, totalQ, totalP, doneL, doneA, doneQ, doneP, progress, isComplete };
  };

  // Print certificates
  const handlePrint = () => {
    window.print();
  };

  // Trigger Course Creator Agent on server
  const handleAutoCreateCourse = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGeneratorProgress(5);
    setGeneratorStage('init');
    setCreatorLogs([`[${new Date().toLocaleTimeString()}] AI Course Creator Agent initialized.`]);

    const logStages = [
      'Generating Course Outline & Curriculum...',
      'Planning Chapters & practical assignments...',
      'Writing full teaching scripts and quizzes...',
      'Synthesizing voice narration assets...',
      'Rendering slide templates & thumbnail cards...',
      'Compiling SEO keywords, sitemap, and description...'
    ];
    let logIdx = 0;
    
    const progressInterval = setInterval(() => {
      setGeneratorProgress(prev => {
        const next = prev + Math.floor(Math.random() * 5) + 1;
        return next >= 90 ? 90 : next;
      });
    }, 800);

    const logInterval = setInterval(() => {
      if (logIdx < logStages.length) {
        setGeneratorStage(logStages[logIdx].split(' ')[0].toLowerCase());
        setCreatorLogs(prev => [`[${new Date().toLocaleTimeString()}] ${logStages[logIdx]}`, ...prev]);
        logIdx++;
      }
    }, 2000);

    try {
      const res = await api.post('/academy/generate', {
        topic: topic.trim(),
        durationDays: parseInt(durationDays),
        lessonFormat
      });

      clearInterval(progressInterval);
      clearInterval(logInterval);

      if (res.data && res.data.success) {
        setGeneratorProgress(100);
        setGeneratorStage('publish');
        setCreatorLogs(prev => [
          `[${new Date().toLocaleTimeString()}] Publishing complete course to academy!`,
          `[${new Date().toLocaleTimeString()}] Course successfully published!`,
          ...prev
        ]);
        
        await new Promise(r => setTimeout(r, 1200));
        await fetchCourses();
        
        setIsGenerating(false);
        setTopic('');
        setActiveView('portal');
      }
    } catch (err) {
      clearInterval(progressInterval);
      clearInterval(logInterval);
      console.error('Course generation failed:', err);
      alert('Course generation failed: ' + (err.response?.data?.error || err.message));
      setIsGenerating(false);
    }
  };

  // Add Comment
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setDiscussions([
      { id: Date.now(), author: user?.name || 'Harshita AI User', role: user?.role === 'superadmin' ? 'Administrator' : 'Specialist Candidate', text: newComment.trim(), time: 'Just now', likes: 0 },
      ...discussions
    ]);
    setNewComment('');
  };

  // Add Showcase
  const handleAddShowcase = (e) => {
    e.preventDefault();
    if (!newShowcaseTitle.trim() || !newShowcaseDesc.trim()) return;
    setShowcases([
      { id: Date.now(), title: newShowcaseTitle.trim(), author: user?.name || 'Harshita AI User', desc: newShowcaseDesc.trim(), likes: 0 },
      ...showcases
    ]);
    setNewShowcaseTitle('');
    setNewShowcaseDesc('');
    setShowcaseSuccess(true);
    setTimeout(() => setShowcaseSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col pb-12 select-none">
      
      {/* Academy Portal View */}
      {activeView === 'portal' && (
        <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <GraduationCap className="text-indigo-400" size={28} />
                हर्षिता एआई अकादमी / Harshita AI Academy
              </h1>
              <p className="text-xs text-gray-500 mt-1">Autonomous Course Creation Portal & Educational Center</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView('community')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-white/10 transition-all"
              >
                <MessageSquare size={14}/> Student Community Hub
              </button>
              <button
                onClick={() => setActiveView('creator')}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all"
              >
                <Plus size={14}/> Auto-Create New Course
              </button>
            </div>
          </div>

          {/* Intro Adoption Info */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-start gap-4">
            <Trophy className="text-amber-400 shrink-0" size={24} />
            <div>
              <h3 className="text-sm font-bold text-white">Free AI Training for the Community / निशुल्क शिक्षा</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                Harshita AI Academy is dedicated to providing free structured curriculum programs to transform anyone from an AI User to an AI Specialist.
                Complete the 6 levels program, write prompts, build self-healing tools, pass assessments, and download accredited diploma certificates.
              </p>
            </div>
          </div>

          {/* Courses List Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={16}/> Learning Levels & Specializations ({courses.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => {
                const metrics = getCourseMetrics(course);
                return (
                  <div key={course.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/30 transition-all">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-bold text-white">{course.name}</h3>
                          <span className="text-[10px] text-gray-500 font-medium block mt-0.5">{course.nameHi}</span>
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-indigo-500/20 text-indigo-400">
                          {course.duration}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-4 space-y-3">
                      <div className="flex justify-between text-[10px] text-gray-500">
                        <span>📊 Progress: {metrics.progress}%</span>
                        <span>📚 {metrics.doneL}/{metrics.totalL} Lessons completed</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${metrics.progress}%` }}></div>
                      </div>

                      <button
                        onClick={() => handleLaunchCourse(course)}
                        className="w-full py-2 bg-[#0c0d14] hover:bg-white/5 border border-white/10 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                      >
                        Launch Learning Portal <ArrowRight size={12}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Course LMS Viewer Layout */}
      {activeView === 'viewer' && selectedCourse && (
        <div className="flex-1 flex flex-col">
          {/* Viewer Sub-Header */}
          <div className="bg-[#0f111a] border-b border-white/10 px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveView('portal')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <ArrowLeft size={18} className="text-gray-400" />
              </button>
              <div>
                <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
                  {selectedCourse.name}
                </h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{activeModule?.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] text-gray-500 font-bold uppercase">Course Progress</p>
                <p className="text-xs font-bold text-indigo-400">{getCourseMetrics(selectedCourse).progress}%</p>
              </div>
              <div className="w-20 bg-white/10 h-1.5 rounded-full overflow-hidden hidden sm:block">
                <div className="bg-indigo-500 h-full" style={{ width: `${getCourseMetrics(selectedCourse).progress}%` }}></div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1">
            
            {/* Viewer Player column */}
            {activeLesson && activeModule && (
              <div className="space-y-6">
                
                {/* Mock Video Player */}
                <div className="aspect-video w-full bg-[#0a0b10] border border-white/10 rounded-2xl overflow-hidden relative group flex flex-col items-center justify-center p-6 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/10 to-violet-900/10 opacity-30 pointer-events-none"></div>
                  
                  <div className="z-10 flex flex-col items-center text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform cursor-pointer">
                      <Play size={28} className="fill-current ml-1" />
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        Lesson {activeLesson.id.split('-l').pop()}
                      </span>
                      <h3 className="text-xl font-bold mt-2 text-white">{activeLesson.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">Playtime: {activeLesson.duration}</p>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-white/5 p-3 flex items-center justify-between border-t border-white/5 z-10 text-[10px] text-gray-400">
                    <div className="flex items-center gap-3">
                      <Play size={12} className="text-indigo-400" />
                      <span>0:00 / {activeLesson.duration}</span>
                    </div>
                    <div className="flex-1 mx-4 bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-[20%]"></div>
                    </div>
                    <span className="text-xs font-bold text-indigo-400">{activeLesson.duration} mins</span>
                  </div>
                </div>

                {/* Sub tabs navigation */}
                <div className="flex border-b border-white/10 gap-2">
                  <button
                    onClick={() => setActiveLessonTab('lecture')}
                    className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all ${
                      activeLessonTab === 'lecture' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    📺 Lecture & Notes
                  </button>
                  <button
                    onClick={() => setActiveLessonTab('script')}
                    className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all ${
                      activeLessonTab === 'script' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    📝 Video & Voice Script
                  </button>
                  <button
                    onClick={() => setActiveLessonTab('slides')}
                    className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all ${
                      activeLessonTab === 'slides' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    📊 Slide Deck
                  </button>
                  <button
                    onClick={() => setActiveLessonTab('quiz')}
                    className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all ${
                      activeLessonTab === 'quiz' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    🧩 Interactive Quiz
                  </button>
                  <button
                    onClick={() => setActiveLessonTab('tasks')}
                    className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all ${
                      activeLessonTab === 'tasks' ? 'border-indigo-500 text-indigo-400 font-extrabold' : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    🛠️ Module Requirements
                  </button>
                </div>

                {/* Tab content viewer */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                  
                  {/* TAB 1: Lecture & Notes */}
                  {activeLessonTab === 'lecture' && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                        <div>
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{activeModule.title}</span>
                          <h2 className="text-lg font-bold text-white mt-0.5">{activeLesson.title}</h2>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleComplete(activeLesson.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              completedLessons.includes(activeLesson.id)
                                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg'
                            }`}
                          >
                            <CheckCircle2 size={14} />
                            {completedLessons.includes(activeLesson.id) ? 'Lesson Completed ✓' : 'Mark Completed'}
                          </button>
                          <a
                            href={activeLesson.notesPdfLink || '#'}
                            onClick={(e) => { e.preventDefault(); alert(`Study Notes PDF Mock downloaded for: ${activeLesson.title}`); }}
                            className="p-2 bg-slate-800 border border-white/10 rounded-xl hover:bg-slate-700 transition-all text-xs flex items-center gap-1"
                          >
                            <Download size={14}/> Notes
                          </a>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Learning Objectives</h4>
                          <ul className="list-disc list-inside text-xs text-gray-400 space-y-1 mt-1">
                            {getObjectives(activeLesson).map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-white/5 pt-3">
                          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Lesson Theory</h4>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed bg-black/20 p-3 rounded-xl border border-white/5">
                            {getTheory(activeLesson)}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-3">
                          <div>
                            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Demonstration Script</h4>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed font-mono bg-black/40 p-3 rounded-xl whitespace-pre-line border border-white/5">
                              {getDemonstration(activeLesson)}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Case Studies / Examples</h4>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5 whitespace-pre-line">
                              {getExamples(activeLesson)}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-3">
                          <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Summary</h4>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed whitespace-pre-line">
                            {getSummary(activeLesson)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Video Script */}
                  {activeLessonTab === 'script' && (
                    <div className="space-y-4">
                      <div className="border-b border-white/10 pb-2">
                        <h3 className="text-sm font-bold text-white">Full Video Script & Voiceover Text</h3>
                        <p className="text-[10px] text-gray-500">Auto-generated recording cues for course creators</p>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="grid grid-cols-[80px_1fr] gap-4 bg-indigo-500/5 p-3 border border-indigo-500/10 rounded-xl">
                          <span className="font-bold text-indigo-400 uppercase font-mono">Hook Cues:</span>
                          <p className="text-gray-300 italic">"{getVideoScript(activeLesson).hook}"</p>
                        </div>

                        <div className="grid grid-cols-[80px_1fr] gap-4 bg-slate-800/20 p-3 border border-white/5 rounded-xl">
                          <span className="font-bold text-gray-400 uppercase font-mono">Intro:</span>
                          <p className="text-gray-300">"{getVideoScript(activeLesson).introduction}"</p>
                        </div>

                        <div className="grid grid-cols-[80px_1fr] gap-4 bg-slate-800/20 p-3 border border-white/5 rounded-xl">
                          <span className="font-bold text-gray-400 uppercase font-mono">Lecture:</span>
                          <p className="text-gray-300 whitespace-pre-line">{getVideoScript(activeLesson).mainTeaching}</p>
                        </div>

                        <div className="grid grid-cols-[80px_1fr] gap-4 bg-slate-800/20 p-3 border border-white/5 rounded-xl">
                          <span className="font-bold text-gray-400 uppercase font-mono">Demo:</span>
                          <p className="text-gray-300 whitespace-pre-line">{getVideoScript(activeLesson).demonstration}</p>
                        </div>

                        <div className="grid grid-cols-[80px_1fr] gap-4 bg-slate-800/20 p-3 border border-white/5 rounded-xl">
                          <span className="font-bold text-gray-400 uppercase font-mono">Task Out:</span>
                          <p className="text-gray-300">"{getVideoScript(activeLesson).assignment}"</p>
                        </div>

                        <div className="grid grid-cols-[80px_1fr] gap-4 bg-slate-800/20 p-3 border border-white/5 rounded-xl">
                          <span className="font-bold text-gray-400 uppercase font-mono">Summary:</span>
                          <p className="text-gray-300">"{getVideoScript(activeLesson).summary}"</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Slide Deck */}
                  {activeLessonTab === 'slides' && (
                    <div className="space-y-4">
                      <div className="border-b border-white/10 pb-2 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-white">Lesson Slide Presentation</h3>
                          <p className="text-[10px] text-gray-500">Interactive slideshow presentation layouts</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-indigo-400">
                          Slide {currentSlideIndex + 1} of {getSlideContent(activeLesson).length}
                        </span>
                      </div>

                      {/* Display Slide */}
                      {getSlideContent(activeLesson)[currentSlideIndex] && (
                        <div className="bg-[#0f111a] border border-indigo-500/20 rounded-2xl p-6 min-h-[220px] flex flex-col justify-between shadow-inner">
                          <div className="space-y-3">
                            <h4 className="text-base font-bold text-indigo-400 border-b border-white/5 pb-2">
                              {getSlideContent(activeLesson)[currentSlideIndex].title}
                            </h4>
                            <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-300 font-medium">
                              {getSlideContent(activeLesson)[currentSlideIndex].content.map((bullet, idx) => (
                                <li key={idx}>{bullet}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="mt-4 bg-black/40 border border-white/5 rounded-xl p-2.5 text-[10px] text-slate-400 italic">
                            💡 Visual Graphic Idea: "{getSlideContent(activeLesson)[currentSlideIndex].visualPrompt}"
                          </div>
                        </div>
                      )}

                      {/* Select Slide Cues */}
                      <div className="flex justify-between items-center pt-2">
                        <button
                          disabled={currentSlideIndex === 0}
                          onClick={() => setCurrentSlideIndex(prev => prev - 1)}
                          className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 font-bold rounded-xl text-xs flex items-center gap-1"
                        >
                          <ChevronLeft size={14}/> Prev Slide
                        </button>
                        <button
                          disabled={currentSlideIndex === getSlideContent(activeLesson).length - 1}
                          onClick={() => setCurrentSlideIndex(prev => prev + 1)}
                          className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 hover:bg-slate-700 font-bold rounded-xl text-xs flex items-center gap-1"
                        >
                          Next Slide <ChevronRight size={14}/>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Interactive Quiz */}
                  {activeLessonTab === 'quiz' && (
                    <div className="space-y-4">
                      <div className="border-b border-white/10 pb-2 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-white">Lesson Verification Quiz</h3>
                          <p className="text-[10px] text-gray-500">Answer correct choice selections to score points</p>
                        </div>
                        {quizCompleted ? (
                          <span className="text-xs font-bold text-emerald-400">PASSED ✓</span>
                        ) : (
                          <span className="text-xs font-mono text-indigo-400">
                            Question {quizQuestionIndex + 1} of {getLessonQuiz(activeLesson).length}
                          </span>
                        )}
                      </div>

                      {!quizCompleted ? (
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-gray-200">
                            {getLessonQuiz(activeLesson)[quizQuestionIndex].question}
                          </h4>

                          <div className="space-y-2">
                            {getLessonQuiz(activeLesson)[quizQuestionIndex].options.map((opt, optIdx) => {
                              let optStyle = "bg-[#0a0b10] border-white/10 text-gray-300";
                              if (quizSelectedOption === optIdx) {
                                optStyle = "bg-indigo-600/20 border-indigo-500 text-indigo-400 font-bold";
                              }
                              if (quizChecked) {
                                if (optIdx === getLessonQuiz(activeLesson)[quizQuestionIndex].correctOption) {
                                  optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                                } else if (quizSelectedOption === optIdx) {
                                  optStyle = "bg-red-500/20 border-red-500 text-red-400";
                                }
                              }
                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleQuizSelect(optIdx)}
                                  className={`w-full text-left p-3 border rounded-xl text-xs transition-all ${optStyle}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex justify-between items-center border-t border-white/5 pt-3">
                            <span className="text-[10px] text-gray-500">
                              {quizChecked ? (
                                quizSelectedOption === getLessonQuiz(activeLesson)[quizQuestionIndex].correctOption
                                  ? '🎉 Correct choice selection!'
                                  : '❌ Incorrect answer, check correct option highlight.'
                              ) : 'Select one option and click Check Answer.'}
                            </span>
                            
                            {!quizChecked ? (
                              <button
                                onClick={handleQuizCheck}
                                disabled={quizSelectedOption === null}
                                className="px-5 py-2.5 bg-indigo-600 disabled:opacity-40 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                              >
                                Check Answer
                              </button>
                            ) : (
                              <button
                                onClick={handleQuizNext}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                              >
                                {quizQuestionIndex < getLessonQuiz(activeLesson).length - 1 ? 'Next Question' : 'Finish Quiz'}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 space-y-4">
                          <CheckCircle2 className="text-emerald-500 mx-auto animate-bounce" size={48} />
                          <div>
                            <h3 className="text-base font-bold text-white">Quiz Completed!</h3>
                            <p className="text-xs text-gray-400 mt-1">
                              You scored {quizScore} out of {getLessonQuiz(activeLesson).length} points.
                            </p>
                          </div>
                          
                          <div className="border-t border-white/5 pt-4 max-w-sm mx-auto text-left space-y-2">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase">Lesson Practice Exercises:</span>
                            <ul className="list-decimal list-inside text-[11px] text-gray-400 space-y-1">
                              {getPracticeExercises(activeLesson).map((exe, i) => (
                                <li key={i}>{exe}</li>
                              ))}
                            </ul>
                          </div>

                          <button
                            onClick={() => {
                              setQuizCompleted(false);
                              setQuizQuestionIndex(0);
                              setQuizSelectedOption(null);
                              setQuizChecked(false);
                              setQuizScore(0);
                            }}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 font-bold border border-white/10 rounded-xl text-xs"
                          >
                            Retake Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: Module Requirements */}
                  {activeLessonTab === 'tasks' && (
                    <div className="space-y-6">
                      
                      {/* Sub tab details */}
                      <div className="border-b border-white/10 pb-2">
                        <h3 className="text-sm font-bold text-white">Module Requirements & Projects</h3>
                        <p className="text-[10px] text-gray-500">Submit these requirements to complete {activeModule.title}</p>
                      </div>

                      {/* Requirement A: Assignment */}
                      <div className="space-y-3 bg-black/20 border border-white/5 rounded-2xl p-4">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                          <FileText size={14}/> 1. Practical Assignment Task
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed bg-[#0a0b10] border border-white/5 p-3 rounded-xl italic">
                          "{activeModule.assignment}"
                        </p>

                        <form onSubmit={handleAssignmentSubmit} className="space-y-3">
                          <textarea
                            value={submittedAssignments[`${selectedCourse.id}-${activeModule.id}`] || assignmentInput}
                            onChange={e => setAssignmentInput(e.target.value)}
                            disabled={!!submittedAssignments[`${selectedCourse.id}-${activeModule.id}`]}
                            rows={3}
                            required
                            placeholder={submittedAssignments[`${selectedCourse.id}-${activeModule.id}`] ? "" : "Submit your assignment text content here..."}
                            className="w-full bg-[#0a0b10] border border-white/10 focus:border-indigo-500 focus:outline-none rounded-xl p-3 text-xs text-white placeholder-gray-600 resize-none"
                          />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-gray-500">
                              {submittedAssignments[`${selectedCourse.id}-${activeModule.id}`] ? "✓ Submission verified and saved." : "Submit text answers above."}
                            </span>
                            {!submittedAssignments[`${selectedCourse.id}-${activeModule.id}`] && (
                              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                                <Send size={11}/> Submit Assignment
                              </button>
                            )}
                          </div>
                        </form>

                        <AnimatePresence>
                          {assignmentSuccess && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-[11px] text-emerald-400">
                              Assignment locked in local progress scores!
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Requirement B: Mini Project */}
                      <div className="space-y-3 bg-black/20 border border-white/5 rounded-2xl p-4">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                          <Briefcase size={14}/> 2. Module Mini Project
                        </h4>
                        <p className="text-xs text-gray-400 leading-relaxed bg-[#0a0b10] border border-white/5 p-3 rounded-xl italic">
                          "{activeModule.miniProject || 'Design and audit a working tool setup related to this level.'}"
                        </p>

                        <form onSubmit={handleMiniProjectSubmit} className="space-y-3">
                          <textarea
                            value={submittedMiniProjects[`${selectedCourse.id}-${activeModule.id}`] || miniProjectInput}
                            onChange={e => setMiniProjectInput(e.target.value)}
                            disabled={!!submittedMiniProjects[`${selectedCourse.id}-${activeModule.id}`]}
                            rows={3}
                            required
                            placeholder={submittedMiniProjects[`${selectedCourse.id}-${activeModule.id}`] ? "" : "Submit project documentation notes or code repository URLs..."}
                            className="w-full bg-[#0a0b10] border border-white/10 focus:border-indigo-500 focus:outline-none rounded-xl p-3 text-xs text-white placeholder-gray-600 resize-none"
                          />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-gray-500">
                              {submittedMiniProjects[`${selectedCourse.id}-${activeModule.id}`] ? "✓ Mini Project verified." : "Submit project blueprints details."}
                            </span>
                            {!submittedMiniProjects[`${selectedCourse.id}-${activeModule.id}`] && (
                              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1">
                                <Send size={11}/> Submit Mini Project
                              </button>
                            )}
                          </div>
                        </form>

                        <AnimatePresence>
                          {miniProjectSuccess && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-[11px] text-emerald-400">
                              Mini Project uploaded to progress records!
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Requirement C: Module Quiz */}
                      {activeModule.quiz && activeModule.quiz.length > 0 && (
                        <div className="space-y-3 bg-black/20 border border-white/5 rounded-2xl p-4">
                          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                            <HelpCircle size={14}/> 3. Module Verification Quiz
                          </h4>

                          {completedModuleQuizzes.includes(`${selectedCourse.id}-${activeModule.id}`) || modQuizCompleted ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400 flex items-center gap-2">
                              <CheckCircle2 size={16}/> Module assessment passed successfully!
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {activeModule.quiz[modQuizQuestionIndex] && (
                                <div className="space-y-3">
                                  <p className="text-xs font-bold text-gray-200">
                                    {activeModule.quiz[modQuizQuestionIndex].question}
                                  </p>

                                  <div className="space-y-1.5">
                                    {activeModule.quiz[modQuizQuestionIndex].options.map((opt, optIdx) => {
                                      let optStyle = "bg-[#0a0b10] border-white/10 text-gray-300";
                                      if (modQuizSelectedOption === optIdx) {
                                        optStyle = "bg-indigo-600/20 border-indigo-500 text-indigo-400 font-bold";
                                      }
                                      if (modQuizChecked) {
                                        if (optIdx === activeModule.quiz[modQuizQuestionIndex].correctOption) {
                                          optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold";
                                        } else if (modQuizSelectedOption === optIdx) {
                                          optStyle = "bg-red-500/20 border-red-500 text-red-400";
                                        }
                                      }
                                      return (
                                        <button
                                          key={optIdx}
                                          onClick={() => handleModQuizSelect(optIdx)}
                                          className={`w-full text-left p-2.5 border rounded-xl text-xs transition-all ${optStyle}`}
                                        >
                                          {opt}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  <div className="flex justify-between items-center pt-2">
                                    <span className="text-[10px] text-gray-500">
                                      Question {modQuizQuestionIndex + 1} of {activeModule.quiz.length}
                                    </span>
                                    {!modQuizChecked ? (
                                      <button
                                        onClick={handleModQuizCheck}
                                        disabled={modQuizSelectedOption === null}
                                        className="px-4 py-2 bg-indigo-600 disabled:opacity-40 hover:bg-indigo-500 font-bold rounded-xl text-xs"
                                      >
                                        Check Option
                                      </button>
                                    ) : (
                                      <button
                                        onClick={handleModQuizNext}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-xs"
                                      >
                                        {modQuizQuestionIndex < activeModule.quiz.length - 1 ? 'Next Question' : 'Submit Module Quiz'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Requirement D: Capstone Final Project (Only for Level 6 Module 10) */}
                      {selectedCourse.capstoneProject && activeModule.id === 6 && (
                        <div className="space-y-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <Trophy size={14}/> ★ Capstone Final Program Graduation Project
                          </h4>
                          <h3 className="text-sm font-bold text-white mt-1">{selectedCourse.capstoneProject.title}</h3>
                          <p className="text-xs text-gray-400 leading-relaxed bg-[#0a0b10] border border-white/5 p-3 rounded-xl whitespace-pre-line">
                            {selectedCourse.capstoneProject.description}
                          </p>

                          <div className="text-xs text-slate-400 space-y-1">
                            <span className="font-bold text-slate-300">Capstone Requirements:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-gray-400 pl-1">
                              {selectedCourse.capstoneProject.requirements.map((req, i) => (
                                <li key={i}>{req}</li>
                              ))}
                            </ul>
                          </div>

                          <form onSubmit={handleCapstoneSubmit} className="space-y-3 pt-2">
                            <textarea
                              value={submittedCapstone[selectedCourse.id] || capstoneInput}
                              onChange={e => setCapstoneInput(e.target.value)}
                              disabled={!!submittedCapstone[selectedCourse.id]}
                              rows={4}
                              required
                              placeholder={submittedCapstone[selectedCourse.id] ? "" : "Submit your final Capstone Project codes, flow diagrams URLs, or summary here..."}
                              className="w-full bg-[#0a0b10] border border-white/10 focus:border-amber-500 focus:outline-none rounded-xl p-3 text-xs text-white placeholder-gray-600 resize-none"
                            />
                            
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] text-gray-500">
                                {submittedCapstone[selectedCourse.id] ? "✓ Final Capstone submission locked." : "Submit Capstone to claim graduation eligibility."}
                              </span>
                              {!submittedCapstone[selectedCourse.id] && (
                                <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black rounded-xl text-xs flex items-center gap-1 shadow-lg shadow-amber-500/10">
                                  Submit Final Capstone
                                </button>
                              )}
                            </div>
                          </form>

                          <AnimatePresence>
                            {capstoneSuccess && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5 text-[11px] text-emerald-400">
                                Capstone project saved! Unlocking graduation certificate when all other requirements pass.
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                    </div>
                  )}

                </div>

              </div>
            )}

            {/* Viewer Sidebar Accordion */}
            <aside className="space-y-4">
              
              {/* Graduation Trophy Card */}
              <div className="bg-gradient-to-tr from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5 text-center space-y-4">
                <Trophy className="text-amber-400 mx-auto animate-bounce" size={32} />
                <div>
                  <h4 className="text-sm font-bold text-white">Graduation Accreditation</h4>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                    Once all video lessons and practical assignments are complete, download your certification diploma.
                  </p>
                </div>

                {/* Checklist */}
                <div className="bg-black/20 border border-white/5 rounded-xl p-3 text-left space-y-1.5 text-[10px]">
                  <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Graduation Checklist:</span>
                  
                  <div className="flex items-center gap-2 text-gray-300">
                    {getCourseMetrics(selectedCourse).doneL === getCourseMetrics(selectedCourse).totalL ? (
                      <CheckCircle2 size={12} className="text-emerald-500"/>
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-600"/>
                    )}
                    <span>Lessons: {getCourseMetrics(selectedCourse).doneL} / {getCourseMetrics(selectedCourse).totalL} done</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    {getCourseMetrics(selectedCourse).doneA === getCourseMetrics(selectedCourse).totalA ? (
                      <CheckCircle2 size={12} className="text-emerald-500"/>
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-600"/>
                    )}
                    <span>Assignments: {getCourseMetrics(selectedCourse).doneA} / {getCourseMetrics(selectedCourse).totalA} submitted</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    {getCourseMetrics(selectedCourse).doneQ === getCourseMetrics(selectedCourse).totalQ ? (
                      <CheckCircle2 size={12} className="text-emerald-500"/>
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-600"/>
                    )}
                    <span>Quizzes: {getCourseMetrics(selectedCourse).doneQ} / {getCourseMetrics(selectedCourse).totalQ} passed</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-300">
                    {getCourseMetrics(selectedCourse).doneP === getCourseMetrics(selectedCourse).totalP ? (
                      <CheckCircle2 size={12} className="text-emerald-500"/>
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-gray-600"/>
                    )}
                    <span>Projects: {getCourseMetrics(selectedCourse).doneP} / {getCourseMetrics(selectedCourse).totalP} complete</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <button
                    onClick={() => setShowCertificate(true)}
                    disabled={!getCourseMetrics(selectedCourse).isComplete}
                    className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      getCourseMetrics(selectedCourse).isComplete
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black'
                        : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Award size={14} /> Claim Level Certificate
                  </button>
                </div>
              </div>

              {/* Modules List Accordion */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase px-2 py-1 tracking-wider flex items-center gap-1.5">
                  <BookOpen size={13}/> Course Modules
                </h3>
                
                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 scrollbar-hide">
                  {selectedCourse.modules.map((module) => {
                    const isCurrent = activeModule?.id === module.id;
                    const moduleLessonsCompleted = module.lessons.filter(l => completedLessons.includes(l.id)).length;
                    const assignmentDone = !!submittedAssignments[`${selectedCourse.id}-${module.id}`];
                    
                    return (
                      <div key={module.id} className={`border rounded-xl transition-all ${
                        isCurrent ? 'bg-[#0f111a] border-indigo-500/30' : 'bg-[#0a0b10] border-white/5 hover:border-white/10'
                      }`}>
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
                              <span className="text-[9px] text-gray-500">📚 {moduleLessonsCompleted}/{module.lessons.length}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                assignmentDone ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {assignmentDone ? 'Done' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          <ChevronRight size={14} className={`text-gray-500 transition-transform ${isCurrent ? 'rotate-90 text-indigo-400' : ''}`} />
                        </button>

                        {isCurrent && (
                          <div className="border-t border-white/5 p-2 space-y-1 bg-black/20">
                            {module.lessons.map(lesson => {
                              const isSelected = activeLesson?.id === lesson.id;
                              const isDone = completedLessons.includes(lesson.id);
                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => selectLesson(module, lesson)}
                                  className={`w-full text-left px-2.5 py-2 rounded-lg text-[11px] flex items-center justify-between transition-colors ${
                                    isSelected ? 'bg-indigo-600/20 text-indigo-400 font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                  }`}
                                >
                                  <span className="truncate">{lesson.title}</span>
                                  <div className="flex items-center gap-1 text-gray-500 shrink-0 ml-2">
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
        </div>
      )}

      {/* Auto Course Creator View */}
      {activeView === 'creator' && (
        <div className="max-w-4xl mx-auto w-full p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <button onClick={() => setActiveView('portal')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <ArrowLeft size={18} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="text-indigo-400 animate-pulse" size={22} />
                Auto Course Creator Agent / ऑटो कोर्स मेकर
              </h1>
              <p className="text-xs text-gray-500 mt-1">Provide a topic to automatically write scripts, make slide layouts, and render voice clips</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <form onSubmit={handleAutoCreateCourse} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Course Subject or Topic / कोर्स विषय</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  required
                  disabled={isGenerating}
                  placeholder="e.g. Prompt Engineering logic, Building Multi-Agent coding bots, or No-code AI freelancing"
                  className="bg-[#0f111a] border border-white/10 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Duration Target / समय सीमा</label>
                  <select
                    value={durationDays}
                    onChange={e => setDurationDays(e.target.value)}
                    disabled={isGenerating}
                    className="bg-[#0f111a] border border-white/10 rounded-xl p-3 text-xs text-white"
                  >
                    <option value="5">5 Days Crash Course</option>
                    <option value="15">15 Days Standard Class</option>
                    <option value="30">30 Days Academy Diploma</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Lesson Format style / शैली</label>
                  <select
                    value={lessonFormat}
                    onChange={e => setLessonFormat(e.target.value)}
                    disabled={isGenerating}
                    className="bg-[#0f111a] border border-white/10 rounded-xl p-3 text-xs text-white"
                  >
                    <option value="short">Short Lesson (1-3 min brief)</option>
                    <option value="standard">Standard Lesson (5-10 min tutorial)</option>
                    <option value="detailed">Detailed Lesson (10-20 min masterclass)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all"
              >
                {isGenerating ? 'Auto Course Builder Running...' : 'Generate and Publish Course'}
              </button>
            </form>
          </div>

          {/* Active Generation HUD */}
          {isGenerating && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={12} className="animate-spin text-indigo-400" />
                  Generating Course: {topic}
                </span>
                <span className="text-xs font-bold text-indigo-400">{generatorProgress}%</span>
              </div>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${generatorProgress}%` }}></div>
              </div>

              <p className="text-xs text-gray-300 italic">{generatorStage === 'publish' ? 'Formatting course files and registering paths...' : `Agent processing: ${generatorStage.toUpperCase()}`}</p>

              {/* Logs terminal */}
              <div className="bg-black/50 border border-white/5 rounded-xl p-4 space-y-2">
                <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                  <Terminal size={12}/> Agent Execution Trace
                </span>
                <div className="max-h-[140px] overflow-y-auto font-mono text-[10px] text-green-400/90 space-y-1.5 scrollbar-hide">
                  {creatorLogs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Community Hub View */}
      {activeView === 'community' && (
        <div className="max-w-6xl mx-auto w-full p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <button onClick={() => setActiveView('portal')} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <ArrowLeft size={18} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="text-indigo-400" size={24} />
                Student Community Hub / कम्युनिटी हब
              </h1>
              <p className="text-xs text-gray-500 mt-1">Connect, showcase AI projects, and earn achievement badges</p>
            </div>
          </div>

          {/* Community Navigation Tabs */}
          <div className="flex border-b border-white/10 gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveCommunityTab('discussion')}
              className={`pb-3 border-b-2 transition-all ${
                activeCommunityTab === 'discussion' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400'
              }`}
            >
              💬 Discussions Area
            </button>
            <button
              onClick={() => setActiveCommunityTab('showcase')}
              className={`pb-3 border-b-2 transition-all ${
                activeCommunityTab === 'showcase' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400'
              }`}
            >
              ✨ Project Showcase
            </button>
            <button
              onClick={() => setActiveCommunityTab('profile')}
              className={`pb-3 border-b-2 transition-all ${
                activeCommunityTab === 'profile' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400'
              }`}
            >
              🏅 Student Badge Shelf
            </button>
          </div>

          {/* Discussion */}
          {activeCommunityTab === 'discussion' && (
            <div className="space-y-6">
              <form onSubmit={handleAddComment} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <label className="text-xs font-bold text-gray-300">Ask a Question or Share Progress</label>
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  rows={3}
                  required
                  placeholder="Share what level you are working on or ask for peer support..."
                  className="w-full bg-[#0a0b10] border border-white/10 focus:border-indigo-500 focus:outline-none rounded-xl p-3 text-xs text-white"
                />
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-xs flex items-center gap-1">
                    Post Message <Send size={12}/>
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {discussions.map(disc => (
                  <div key={disc.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <span className="font-bold text-indigo-400">{disc.author}</span>
                        <span className="text-[10px] text-gray-500 ml-2">({disc.role})</span>
                      </div>
                      <span className="text-[10px] text-gray-500">{disc.time}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">{disc.text}</p>
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const updated = discussions.map(d => d.id === disc.id ? { ...d, likes: d.likes + 1 } : d);
                          setDiscussions(updated);
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        👍 Likes ({disc.likes})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Showcase */}
          {activeCommunityTab === 'showcase' && (
            <div className="space-y-6">
              <form onSubmit={handleAddShowcase} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <label className="text-xs font-bold text-gray-300">Submit a New Project / Showcase</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newShowcaseTitle}
                    onChange={e => setNewShowcaseTitle(e.target.value)}
                    required
                    placeholder="Project Title (e.g. Legal Prompt Template)"
                    className="bg-[#0f111a] border border-white/10 focus:outline-none rounded-xl p-3 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={newShowcaseDesc}
                    onChange={e => setNewShowcaseDesc(e.target.value)}
                    required
                    placeholder="Short description of how you build it using AI"
                    className="bg-[#0f111a] border border-white/10 focus:outline-none rounded-xl p-3 text-xs text-white"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">Add your project link so peers can test it.</span>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-xs flex items-center gap-1">
                    Add Showcase <Plus size={12}/>
                  </button>
                </div>
              </form>

              <AnimatePresence>
                {showcaseSuccess && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400">
                    Project published to showcase shelf!
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {showcases.map(show => (
                  <div key={show.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/20 transition-all">
                    <div>
                      <h4 className="text-sm font-bold text-white">{show.title}</h4>
                      <p className="text-[10px] text-gray-500">By {show.author}</p>
                      <p className="text-xs text-gray-300 mt-2 italic">"{show.desc}"</p>
                    </div>
                    <div className="flex justify-end pt-3">
                      <button
                        onClick={() => {
                          const updated = showcases.map(s => s.id === show.id ? { ...s, likes: s.likes + 1 } : s);
                          setShowcases(updated);
                        }}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        🔥 Upvotes ({show.likes})
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profiles and Badges */}
          {activeCommunityTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
              
              {/* User Profile */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500 flex items-center justify-center text-indigo-400 mx-auto">
                  <User size={32}/>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{user?.name || 'Candidate Specialist'}</h3>
                  <span className="text-[10px] text-gray-500 uppercase">{user?.role || 'Operator'}</span>
                </div>
                <div className="border-t border-white/5 pt-3 text-xs text-gray-400 text-left space-y-1">
                  <p>📖 Levels: {courses.filter(c => getCourseMetrics(c).isComplete).length} Unlocked</p>
                  <p>🧩 Quizzes: {completedQuizzes.length} Passed</p>
                  <p>🛠️ Projects: {Object.keys(submittedMiniProjects).length} Submitted</p>
                </div>
              </div>

              {/* Achievement badges */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Accredited Achievement Badges</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  
                  {/* Badge 1 */}
                  <div className={`p-4 rounded-xl border text-center space-y-2 flex flex-col items-center ${
                    completedLessons.length > 0 ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/5 text-gray-600'
                  }`}>
                    <GraduationCap size={24}/>
                    <span className="text-[10px] font-bold block">AI Explorer</span>
                  </div>

                  {/* Badge 2 */}
                  <div className={`p-4 rounded-xl border text-center space-y-2 flex flex-col items-center ${
                    completedQuizzes.length >= 3 ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/5 text-gray-600'
                  }`}>
                    <BookOpenCheck size={24}/>
                    <span className="text-[10px] font-bold block">Prompt Architect</span>
                  </div>

                  {/* Badge 3 */}
                  <div className={`p-4 rounded-xl border text-center space-y-2 flex flex-col items-center ${
                    Object.keys(submittedMiniProjects).length >= 1 ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/5 text-gray-600'
                  }`}>
                    <Briefcase size={24}/>
                    <span className="text-[10px] font-bold block">Agent Constructor</span>
                  </div>

                  {/* Badge 4 */}
                  <div className={`p-4 rounded-xl border text-center space-y-2 flex flex-col items-center ${
                    completedQuizzes.length >= 8 ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-white/5 border-white/5 text-gray-600'
                  }`}>
                    <Trophy size={24}/>
                    <span className="text-[10px] font-bold block">Business Pioneer</span>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* PRINT CERTIFICATE VIEWER MODAL OVERLAY */}
      {showCertificate && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 print:p-0 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#0c0d14] border border-white/10 rounded-2xl p-6 print:p-0 print:border-none flex flex-col items-center max-h-[95vh]">
            
            {/* Controls */}
            <div className="w-full flex items-center justify-between border-b border-white/5 pb-3 mb-4 print:hidden">
              <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                <Award className="text-amber-400" size={14} /> Print Certificate
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

            {/* Certificate */}
            <div className="w-full bg-[#12131b] border-8 border-double border-amber-600/30 p-12 text-center relative rounded-xl shadow-2xl flex flex-col items-center space-y-6 print:border-8 print:shadow-none min-h-[500px]">
              
              <div className="absolute top-4 left-4 border-t-2 border-l-2 border-amber-500/30 w-8 h-8"></div>
              <div className="absolute top-4 right-4 border-t-2 border-r-2 border-amber-500/30 w-8 h-8"></div>
              <div className="absolute bottom-4 left-4 border-b-2 border-l-2 border-amber-500/30 w-8 h-8"></div>
              <div className="absolute bottom-4 right-4 border-b-2 border-r-2 border-amber-500/30 w-8 h-8"></div>

              <img src="/harshita ai.png" alt="Harshita AI" className="w-16 h-16 rounded-xl mx-auto shadow-lg border border-amber-500/20" />
              
              <div className="space-y-1">
                <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Certificate of Achievement</span>
                <h1 className="text-2xl md:text-3xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mt-2">
                  {selectedCourse.certificationTitle || 'Certified AI Specialist'}
                </h1>
              </div>

              <div className="max-w-xl mx-auto space-y-3">
                <p className="text-xs text-gray-500 italic">This is proudly presented to</p>
                <h2 className="text-xl font-bold text-white border-b border-white/10 pb-2 max-w-sm mx-auto uppercase tracking-wide">
                  {user?.name || 'Harshita AI Candidate'}
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed mt-2">
                  For successfully graduating the auto-compiled class requirements under the Harshita AI Academy curriculum levels program. The candidate has mastered the modules, passed all lesson and module quizzes, submitted practical tasks, and completed capstone projects.
                </p>
              </div>

              <div className="w-full max-w-2xl flex items-center justify-between pt-6 border-t border-white/5 text-xs text-gray-500">
                <div className="text-left">
                  <p className="text-[10px] uppercase font-bold text-amber-500/60 tracking-wider">Date of Graduation</p>
                  <p className="font-bold text-white mt-0.5">{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center border border-amber-300 relative shrink-0">
                  <div className="w-12 h-12 rounded-full border border-dashed border-black/20 flex items-center justify-center font-bold text-[8px] text-black uppercase text-center leading-tight">
                    Academy Seal
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-amber-500/60 tracking-wider">Authorized Signature</p>
                  <p className="font-serif italic font-bold text-white text-sm mt-0.5">Harshita AI Academy</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
