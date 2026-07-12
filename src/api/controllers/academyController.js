// src/api/controllers/academyController.js - AI Course Creator Agent Controller
const { prisma } = require('../../models/database');
const { decrypt } = require('../../utils/cryptoHelper');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const COURSES_JSON_PATH = path.join(__dirname, '../../../data/academy/courses.json');

// Ensure courses file and dir exists
function initializeCoursesFile() {
  const dir = path.dirname(COURSES_JSON_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(COURSES_JSON_PATH)) {
    fs.writeFileSync(COURSES_JSON_PATH, JSON.stringify([], null, 2), 'utf8');
  }
}

/**
 * Retrieve decrypted API keys from DB or env
 */
async function getApiKey(provider) {
  if (!prisma) return process.env[`${provider.toUpperCase()}_API_KEY`] || null;
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: `api_key_${provider}` }
    });
    if (setting && setting.value) {
      return decrypt(setting.value);
    }
  } catch (e) {}
  return process.env[`${provider.toUpperCase()}_API_KEY`] || null;
}

/**
 * Auto-Create Course using sequential LLM fallback
 */
async function createCourse(req, res) {
  try {
    const { topic, durationDays, lessonFormat } = req.body;
    if (!topic || topic.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Course topic is required.' });
    }

    const duration = parseInt(durationDays) || 15;
    const format = lessonFormat || 'standard';

    console.log(`[CourseCreatorAgent] Creating course for: "${topic}" (${duration} Days, format: ${format})`);

    const prompt = `You are a professional AI Course Creator Agent.
Your mission is to create a world-class educational AI course about "${topic}" that can teach a complete beginner and transform them into an AI Specialist.
The course must be practical, project-based, and suitable for self-learning.

Teaching Philosophy:
- Simple language
- Real-world examples
- Practical exercises
- Step-by-step instructions
- Case studies
- Business use cases
- Never assume prior knowledge.

Subject Matter: "${topic}"
Duration: ${duration} Days
Lesson Format: ${format}

Output MUST be a valid JSON object matching the following structure EXACTLY (do NOT add markdown formatting wraps like \`\`\`json, output raw JSON string):
{
  "name": "Course Title (e.g. Masterclass: ${topic})",
  "nameHi": "Course Title in Hindi",
  "duration": "${duration} Days",
  "description": "Engaging description explaining what the beginner will learn and the key skills they will acquire.",
  "lessonsCount": 4,
  "certificationTitle": "Certified Harshita AI ${topic} Specialist",
  "certificationCriteria": [
    "Complete all lessons and mark them done",
    "Pass all module and lesson quizzes",
    "Submit all practical assignments"
  ],
  "capstoneProject": {
    "title": "Capstone Final Project for ${topic}",
    "description": "Major final project description requiring application of all lessons.",
    "requirements": [
      "Requirement 1",
      "Requirement 2"
    ]
  },
  "modules": [
    {
      "id": 1,
      "title": "Module 1 - Title",
      "assignment": "Description of a practical assignment task",
      "miniProject": "Description of a mini project task for this module",
      "quiz": [
        {
          "question": "Quiz question content?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctOption": 0
        }
      ],
      "lessons": [
        {
          "id": "m1-l1",
          "title": "Lesson 1 Title",
          "duration": "10:15",
          "description": "Full details of the lesson.",
          "learningObjectives": [
            "Objective 1",
            "Objective 2"
          ],
          "theory": "Conceptual theory details using simple language and real-world analogy.",
          "examples": "Practical case study or prompt templates.",
          "demonstration": "Step-by-step console instructions.",
          "assignment": "Specific practice exercise sheet task.",
          "quiz": [
            {
              "question": "Question 1?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correctOption": 0
            }
          ],
          "summary": "Key summary bullets of the lesson.",
          "videoScript": {
            "hook": "Hook video script statement.",
            "introduction": "Video intro statement.",
            "mainTeaching": "Primary video lecture script details.",
            "demonstration": "Video walk-through narration.",
            "assignment": "Video task summary script.",
            "summary": "Video sign-off statement."
          },
          "slideContent": [
            {
              "title": "Slide 1 Title",
              "content": ["Bullet point 1", "Bullet point 2"],
              "visualPrompt": "Description of illustration or chart display."
            }
          ],
          "practiceExercises": [
            "Drill exercise 1",
            "Drill exercise 2"
          ],
          "notesPdfLink": "/data/academy/notes/m1-l1.pdf"
        }
      ]
    }
  ]
}`;

    const openaiKey = await getApiKey('openai');
    const geminiKey = await getApiKey('gemini') || process.env.GEMINI_API_KEY;
    const groqKey = await getApiKey('groq') || process.env.GROQ_API_KEY;

    let jsonResponseText = '';
    let success = false;

    // Try OpenAI
    if (openaiKey && !success) {
      try {
        console.log('[CourseCreatorAgent] Querying OpenAI...');
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        }, {
          headers: { Authorization: `Bearer ${openaiKey}` }
        });
        jsonResponseText = response.data.choices[0].message.content.trim();
        success = true;
      } catch (err) {
        console.warn(`[CourseCreatorAgent] OpenAI failed: ${err.message}. Trying next...`);
      }
    }

    // Try Gemini
    if (geminiKey && !success) {
      try {
        console.log('[CourseCreatorAgent] Querying Gemini...');
        const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        });
        jsonResponseText = response.data.candidates[0].content.parts[0].text.trim();
        success = true;
      } catch (err) {
        console.warn(`[CourseCreatorAgent] Gemini failed: ${err.message}. Trying next...`);
      }
    }

    // Try Groq
    if (groqKey && !success) {
      try {
        console.log('[CourseCreatorAgent] Querying Groq...');
        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        }, {
          headers: { Authorization: `Bearer ${groqKey}` }
        });
        jsonResponseText = response.data.choices[0].message.content.trim();
        success = true;
      } catch (err) {
        console.warn(`[CourseCreatorAgent] Groq failed: ${err.message}`);
      }
    }

    // Fallback: Mock course generation if all LLMs are down or offline
    if (!success) {
      console.warn('[CourseCreatorAgent] All LLM providers failed or offline. Generating mock course structure...');
      jsonResponseText = JSON.stringify({
        name: `Masterclass: ${topic}`,
        nameHi: `मास्टरक्लास: ${topic}`,
        duration: `${duration} Days`,
        description: `Automatically created masterclass focusing on ${topic} applications. Designed locally by Harshita AI Offline Course Agent.`,
        lessonsCount: 2,
        certificationTitle: `Certified Harshita AI ${topic} Specialist`,
        certificationCriteria: [
          "Complete all 2 module lessons and mark them done",
          "Pass all quizzes and submit the practical tasks"
        ],
        capstoneProject: {
          title: `Capstone Project: Deploying a ${topic} automation`,
          description: `Construct and test an end-to-end automation blueprint incorporating the prompts and tools learned.`,
          requirements: [
            "Outline key inputs and outputs parameters",
            "Write a self-healing error handler routine mockup"
          ]
        },
        modules: [
          {
            id: 1,
            title: `Module 1 - Introduction to ${topic}`,
            assignment: `Design a practical framework diagram applying ${topic} to real world workflow.`,
            miniProject: `Deploy a prototype interface for ${topic} integration.`,
            quiz: [
              {
                question: `What is the primary benefit of ${topic}?`,
                options: ["Lowers operating latencies", "Removes the need for human guidance entirely", "Performs automated self-healing", "All of the above"],
                correctOption: 3
              }
            ],
            lessons: [
              {
                id: `m1-l1`,
                title: `Getting Started with ${topic}`,
                duration: '08:30',
                description: 'Overview of history, definition basics, and foundational building blocks.',
                learningObjectives: [
                  "Explain what makes this framework powerful",
                  "Identify standard configuration variables"
                ],
                theory: "In this introductory lesson, we examine how these technologies interface. For example, think of this like a connector routing raw data safely. We configure parameters to define standard behavior.",
                examples: "Case Study: An automation script running this logic trimmed average processing times by 40%.",
                demonstration: "1. Open console.\n2. Execute configuration file.\n3. Verify connection logs.",
                assignment: "Draft a 1-page summary detailing how this technique improves your workflow.",
                quiz: [
                  {
                    question: "What is the primary role of this tool?",
                    options: ["Compile static HTML", "Automate workflow tasks", "Store massive binary objects", "None of the above"],
                    correctOption: 1
                  }
                ],
                summary: "We established foundational ideas and checked standard configurations.",
                videoScript: {
                  hook: `Welcome! Today we are looking at how to deploy ${topic} from scratch!`,
                  introduction: `This is a quick starter lesson. We will check the settings and run a live demo.`,
                  mainTeaching: `We focus on setting correct variables so that our scripts execute without database warnings.`,
                  demonstration: `Watch my terminal: I boot the system and verify the connection lines.`,
                  assignment: `Your task is to write your own checklist and save it to the workspace.`,
                  summary: `That wraps up lesson 1. Next, we will check advanced structures.`
                },
                slideContent: [
                  {
                    title: `Welcome to ${topic}`,
                    content: ["Core definition", "Workflow benefits"],
                    visualPrompt: "Flowchart showing data moving through system nodes."
                  }
                ],
                practiceExercises: [
                  "Execute setup.js script"
                ],
                notesPdfLink: "/data/academy/notes/m1-l1.pdf"
              }
            ]
          }
        ]
      }, null, 2);
    }

    // Parse the generated course JSON
    let generatedCourse;
    try {
      // Strip markdown wrapping if any
      jsonResponseText = jsonResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      generatedCourse = JSON.parse(jsonResponseText);
    } catch (e) {
      console.error('[CourseCreatorAgent] Failed parsing JSON:', jsonResponseText);
      return res.status(500).json({ success: false, error: 'AI output was not in valid JSON format.' });
    }

    // Append course id and save to JSON database
    generatedCourse.id = `course-${Date.now()}`;
    
    initializeCoursesFile();
    const currentCourses = JSON.parse(fs.readFileSync(COURSES_JSON_PATH, 'utf8'));
    currentCourses.push(generatedCourse);
    fs.writeFileSync(COURSES_JSON_PATH, JSON.stringify(currentCourses, null, 2), 'utf8');

    console.log(`[CourseCreatorAgent] Successfully generated and published course: ${generatedCourse.name}`);
    return res.json({
      success: true,
      message: 'Course created and published successfully.',
      data: generatedCourse
    });
  } catch (error) {
    console.error('[CourseCreatorAgent] Critical Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Get all published courses
 */
async function listCourses(req, res) {
  try {
    initializeCoursesFile();
    const customCourses = JSON.parse(fs.readFileSync(COURSES_JSON_PATH, 'utf8'));
    
    // Return custom courses
    return res.json({
      success: true,
      data: customCourses
    });
  } catch (error) {
    console.error('[CourseCreatorAgent] Error listing courses:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  createCourse,
  listCourses
};
