// scripts/seed-prompt-mastery-course.js
const fs = require('fs');
const path = require('path');

const COURSES_JSON_PATH = path.join(__dirname, '../data/academy/courses.json');

// Helper to make directory
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// 6 Levels Program Definition
const LEVELS_DEF = [
  {
    level: 1,
    id: 'level-1',
    name: 'Level 1 – AI Beginner',
    nameHi: 'लेवल 1 – एआई बिगिनर',
    duration: '5 Days',
    certificationTitle: 'Certified AI User',
    description: 'Master the absolute basics of artificial intelligence. Get comfortable with ChatGPT, Google Gemini, and learn how to apply AI to solve daily study, teaching, and administrative problems.',
    assignment: 'Use ChatGPT and Gemini to outline a detailed schedule for learning a new skill in 30 days.',
    miniProject: 'Create a personal learning planner comparing response formats from ChatGPT and Gemini.',
    quiz: [
      {
        question: "What is the primary difference between ChatGPT and Google Gemini?",
        options: [
          "ChatGPT is made by OpenAI; Gemini is made by Google and runs on native multimodal inputs",
          "ChatGPT is only in Hindi; Gemini is only in English",
          "Gemini does not require internet connection",
          "There is no difference"
        ],
        correctOption: 0
      },
      {
        question: "What is an LLM?",
        options: ["Logical List Maker", "Large Language Model", "Lite Logic Mapper", "Local Loop Manager"],
        correctOption: 1
      }
    ],
    lessons: [
      { title: 'What is AI?', duration: '08:45' },
      { title: 'Using ChatGPT', duration: '10:20' },
      { title: 'Using Gemini', duration: '11:15' },
      { title: 'Daily AI Tasks', duration: '09:30' },
      { title: 'AI for Students', duration: '12:05' }
    ]
  },
  {
    level: 2,
    id: 'level-2',
    name: 'Level 2 – Prompt Engineering Specialist',
    nameHi: 'लेवल 2 – प्रॉम्प्ट इंजीनियरिंग स्पेशलिस्ट',
    duration: '5 Days',
    certificationTitle: 'Certified Prompt Engineer',
    description: 'Learn the core principles of prompting. Understand instructions, constraints, context formatting, and master role prompting, few-shot prompting, and Chain of Thought thinking.',
    assignment: 'Write a professional system prompt that turns the model into an experienced legal draft editor.',
    miniProject: 'Develop a template library of 5 reusable system prompts for business analytics.',
    quiz: [
      {
        question: "What does 'Few-Shot Prompting' mean?",
        options: [
          "Providing a few input-output examples in the prompt to demonstrate the desired format",
          "Limiting the model output tokens count",
          "Using very short keywords in the input",
          "Running the prompt only a few times"
        ],
        correctOption: 0
      },
      {
        question: "Why do we use Chain of Thought (CoT) prompting?",
        options: [
          "To force the model to think step-by-step and show its logic for reasoning tasks",
          "To decrease response time",
          "To link multiple accounts together",
          "To translate outputs to other languages"
        ],
        correctOption: 0
      }
    ],
    lessons: [
      { title: 'Prompt Structure', duration: '10:15' },
      { title: 'Context Engineering', duration: '11:30' },
      { title: 'Role Prompting', duration: '12:45' },
      { title: 'Few Shot Prompting', duration: '13:20' },
      { title: 'Chain of Thought', duration: '14:10' }
    ]
  },
  {
    level: 3,
    id: 'level-3',
    name: 'Level 3 – AI Content Creator',
    nameHi: 'लेवल 3 – एआई कंटेंट क्रिएटर',
    duration: '5 Days',
    certificationTitle: 'Certified AI Creator',
    description: 'Transform your content workflow. Learn how to outline SEO articles, script engaging videos, compose social media posts, and optimize search rankings using generative models.',
    assignment: 'Write a full 1200-word blog post about "AI in agriculture" with custom headers and meta details.',
    miniProject: 'Build a week-long multi-channel brand launch content campaign blueprint.',
    quiz: [
      {
        question: "What are the core elements of a viral video script Hook?",
        options: [
          "Identifying a painful problem and promising a clear, immediate outcome in under 5 seconds",
          "A lengthy biography of the speaker",
          "A description of video recording hardware",
          "Background music details only"
        ],
        correctOption: 0
      },
      {
        question: "How should you include keywords for SEO Optimization?",
        options: [
          "Integrate key phrases naturally into headers (H1, H2) and summary descriptions",
          "Write the keyword 1000 times at the bottom of the page in white text",
          "Rename the website title after the keyword",
          "None of the above"
        ],
        correctOption: 0
      }
    ],
    lessons: [
      { title: 'Blog Creation', duration: '11:45' },
      { title: 'Social Media', duration: '10:30' },
      { title: 'YouTube Scripts', duration: '14:15' },
      { title: 'Marketing Content', duration: '12:20' }
    ]
  },
  {
    level: 4,
    id: 'level-4',
    name: 'Level 4 – AI Image & Video Creator',
    nameHi: 'लेवल 4 – एआई इमेज और वीडियो मेकर',
    duration: '5 Days',
    certificationTitle: 'Certified AI Image & Video Creator',
    description: 'Explore the creative bounds of generative media. Master lighting and aspect control in Flux, design persistent characters, plan scenes, and compile story videos using TTS synthesis and FFmpeg.',
    assignment: 'Write 10 specific image prompts utilizing descriptors for lighting, lenses, and textures.',
    miniProject: 'Compile a 3-scene vertical story video with subtitles and background scoring.',
    quiz: [
      {
        question: "What is a Seed in image generators (like Flux / SDXL)?",
        options: [
          "A random number initializer that allows replication of image layouts and styles",
          "The filename extension",
          "The canvas height",
          "An API authorization token"
        ],
        correctOption: 0
      },
      {
        question: "How do you burn subtitles on Windows using FFmpeg?",
        options: [
          "By applying the subtitles filter (`subtitles=file.srt`) alongside proper path escape formatting",
          "By editing the MP4 metadata properties manually",
          "By taking screenshots of each scene",
          "It is done automatically by VLC player"
        ],
        correctOption: 0
      }
    ],
    lessons: [
      { title: 'Image Prompting', duration: '11:10' },
      { title: 'Character Design', duration: '12:50' },
      { title: 'Story Videos', duration: '14:40' },
      { title: 'YouTube Shorts', duration: '13:15' },
      { title: 'Reels Automation', duration: '15:30' }
    ]
  },
  {
    level: 5,
    id: 'level-5',
    name: 'Level 5 – AI Agent Builder',
    nameHi: 'लेवल 5 – एआई एजेंट बिल्डर',
    duration: '5 Days',
    certificationTitle: 'Certified AI Agent Builder',
    description: 'Step into the future of autonomous systems. Configure agents that reason in loops, build multi-agent networks with coordinator structures, and design self-healing recovery actions.',
    assignment: 'Draw a flowchart mapping a document audit workflow coordinated by an orchestrator agent.',
    miniProject: 'Design a self-healing loop script that parses command outputs and rewrites configuration files on error.',
    quiz: [
      {
        question: "What defines an AI Agent?",
        options: [
          "An autonomous process that perceives environment state, reasons in a loop (like ReAct), and calls tools",
          "A simple API link template",
          "A static chat bot script",
          "An antivirus database program"
        ],
        correctOption: 0
      },
      {
        question: "In multi-agent systems, what is the role of the Orchestrator?",
        options: [
          "To coordinate tasks, allocate sub-goals, and aggregate results from worker nodes",
          "To save records to database logs",
          "To serve HTML scripts to browsers",
          "To encrypt API security keys"
        ],
        correctOption: 0
      }
    ],
    lessons: [
      { title: 'AI Agents', duration: '12:35' },
      { title: 'Multi-Agent Systems', duration: '15:10' },
      { title: 'Self-Healing Systems', duration: '16:05' },
      { title: 'Workflow Design', duration: '14:20' }
    ]
  },
  {
    level: 6,
    id: 'level-6',
    name: 'Level 6 – AI Business Professional',
    nameHi: 'लेवल 6 – एआई बिजनेस और फ्रीलांसिंग',
    duration: '5 Days',
    certificationTitle: 'Certified Harshita AI Master',
    description: 'Monetize your AI expertise. Set up freelance profiles, audit business workflows, build subscriber SaaS products, deploy code on Render, and fully understand the Harshita AI ecosystem.',
    assignment: 'Write a professional consulting proposal showing how local agencies can automate record entry.',
    miniProject: 'Build and audit a complete self-healing deployment routine inside the Harshita AI console.',
    quiz: [
      {
        question: "What is the primary strategy behind Phase 1 of the Harshita AI Academy Business Strategy?",
        options: [
          "Prioritize user adoption and trust via free tools and education before charging subscriptions",
          "Charge high prices immediately to recoup setup fees",
          "Target institutional enterprise financing only",
          "Limit system access to administrators"
        ],
        correctOption: 0
      },
      {
        question: "What makes a custom conversational skill audit successful in Harshita AI?",
        options: [
          "Passing all build compiles, path validation, and intent detection test scripts",
          "Updating database fields manually",
          "Publishing code without checking compilation errors",
          "Deleting log records regularly"
        ],
        correctOption: 0
      }
    ],
    lessons: [
      { title: 'Freelancing', duration: '13:10' },
      { title: 'Consulting', duration: '14:50' },
      { title: 'SaaS Building', duration: '16:20' },
      { title: 'Client Projects', duration: '15:15' },
      { title: 'Monetization', duration: '14:40' }
    ]
  }
];

// Generate structured courses JSON content
function generateAcademyProgram() {
  return LEVELS_DEF.map((lvl) => {
    const courseId = lvl.id;
    const totalLessons = lvl.lessons.length;
    
    const modules = [
      {
        id: lvl.level,
        title: `Module ${lvl.level} - Core Mastery`,
        assignment: lvl.assignment,
        miniProject: lvl.miniProject,
        quiz: lvl.quiz,
        lessons: lvl.lessons.map((les, index) => {
          const lessonId = `${courseId}-l${index + 1}`;
          
          return {
            id: lessonId,
            title: les.title,
            duration: les.duration,
            description: `Comprehensive guide to ${les.title}. Learn definitions, study real cases, run terminal demonstrations, and complete drills.`,
            learningObjectives: [
              `Analyze the foundational definition of ${les.title}.`,
              `Apply step-by-step procedures to resolve workflow tasks.`,
              `Master the tools and configurations required for ${les.title}.`
            ],
            theory: `In this lesson on ${les.title}, we break down concepts using simple, plain terms. For example, think of an AI model like a smart library clerk. If you ask for 'a book', the clerk will guess. But if you request 'a 19th-century romance book written by an Indian author', you get exactly what you need. That is the essence of structuring inputs. We explain terms simply so that beginners can build correct habits without needing advanced coding knowledge.`,
            examples: `Case Study: An agency implementing ${les.title} techniques resolved data discrepancies in under 3 minutes, cutting administrative backlogs by over 50% while improving satisfaction ratings.`,
            demonstration: `1. Open your workspace control panel.\n2. Configure the setting: set variables.\n3. Input text: test string.\n4. Execute compilation and observe outputs.\n5. Verify that logs report success.`,
            assignment: `Assignment Sheet: Draft a detailed 1-page report applying ${les.title} to one daily task in your study or professional work. Highlight inputs and constraints.`,
            quiz: [
              {
                question: `What is the main goal of learning ${les.title}?`,
                options: [
                  "To increase work speed and improve content quality using AI features",
                  "To configure hardware chips",
                  "To study assembly code compilers",
                  "None of the above"
                ],
                correctOption: 0
              },
              {
                question: `Which element is recommended to get good outputs in ${les.title}?`,
                options: [
                  "Vague keywords with no structure",
                  "Clear context, strict instructions, and output style guidelines",
                  "Leaving settings at blank defaults",
                  "Running operations offline only"
                ],
                correctOption: 1
              }
            ],
            summary: `Summary of ${les.title}:\n- Studied core terminology and analogical definitions.\n- Reviewed a practical case study showing efficiency benefits.\n- Ran setup instructions to test outcomes.\n- Practice exercises will reinforce retention.`,
            videoScript: {
              hook: `Ever struggled with ${les.title}? Today we look at how to master it step-by-step for absolute beginners!`,
              introduction: `Welcome back. This is Harshita AI Academy. In this video, we cover ${les.title} theory and live demo configurations.`,
              mainTeaching: `The fundamental point behind ${les.title} is layout and constraint design. Setting limits ensures consistency.`,
              demonstration: `Watch my screen: I trigger the workflow and check verification scores. Notice the output format.`,
              assignment: `Your task is to write your own prompts checklist and test them inside the dashboard console.`,
              summary: `Thanks for watching. Complete the lesson quiz and assignment. In the next video, we advance to next level!`
            },
            slideContent: [
              {
                title: `Lesson: ${les.title}`,
                content: ["Topic introduction", "Core goals of this session"],
                visualPrompt: "Flowchart showing user request going to Harshita AI engine."
              },
              {
                title: `Core Theory`,
                content: ["Analogical explanation", "Avoiding mistakes"],
                visualPrompt: "Comparison table showing Bad setup vs Good setup."
              },
              {
                title: `Live Demo`,
                content: ["Workspace setup", "Compiling results"],
                visualPrompt: "Screenshot of terminal logs displaying successful validation status."
              }
            ],
            practiceExercises: [
              `Exercise 1: Write down 3 business use cases for ${les.title}.`,
              `Exercise 2: Set up custom files and verify compilation codes.`
            ],
            notesPdfLink: `/data/academy/notes/${lessonId}.pdf`
          };
        })
      }
    ];

    return {
      id: courseId,
      name: lvl.name,
      nameHi: lvl.nameHi,
      duration: lvl.duration,
      lessonsCount: totalLessons,
      status: 'Active',
      progress: 0,
      description: lvl.description,
      certificationTitle: lvl.certificationTitle,
      certificationCriteria: [
        `Complete all ${totalLessons} Lessons in this level`,
        "Pass all quizzes with correct feedback scores",
        "Submit the practical assignment script text",
        "Complete and submit the level mini-project"
      ],
      capstoneProject: {
        title: `Capstone: Build a complete ${lvl.certificationTitle} project solution`,
        description: `Construct and test an end-to-end workflow applying the topics in this level. Submit your code plan or prompt library notes.`,
        requirements: [
          "List inputs, constraints, and instructions clearly",
          "Provide test outputs showing self-healing checks"
        ]
      },
      modules: modules
    };
  });
}

// Main execution
function seed() {
  console.log('🌱 Starting academy levels seeding...');
  
  ensureDirectoryExistence(COURSES_JSON_PATH);
  
  const levelsCourses = generateAcademyProgram();
  
  // Write to courses.json
  fs.writeFileSync(COURSES_JSON_PATH, JSON.stringify(levelsCourses, null, 2), 'utf8');
  console.log(`✅ Seeded ${levelsCourses.length} academy levels to ${COURSES_JSON_PATH}`);
}

seed();
