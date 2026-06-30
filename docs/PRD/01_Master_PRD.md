# Harshita AI — Master PRD v2.0

## Vision

Build **Harshita AI** as India's most powerful AI platform for coding, legal documents, automation, education, business management, website development, image generation, video generation, and government services.

Harshita AI must behave like a **complete AI Operating System** — not a chatbot.

---

## Core Principles

| # | Principle | Description |
|---|-----------|-------------|
| 1 | **AI First** | Every decision is driven by AI reasoning |
| 2 | **India First** | Built for Indian users, Indian context |
| 3 | **Hindi First** | Default language is Hindi, supports 10+ languages |
| 4 | **Modular Architecture** | Every capability = one Skill |
| 5 | **Multi-Agent System** | Specialized agents for specialized tasks |
| 6 | **Self-Healing** | Auto-detect, auto-repair, auto-retry |
| 7 | **Self-Learning** | Learn from every interaction |
| 8 | **Secure by Design** | Authentication, encryption, audit |
| 9 | **Mobile First** | Responsive, PWA, offline-ready |
| 10 | **Offline Friendly** | Math, geometry, unit conversion work offline |

---

## AI Brain

The central intelligence layer orchestrating all systems.

**Responsibilities:**
- Intent Detection (IntentDetector v2)
- Planning (multi-step task decomposition)
- Reasoning (ReasoningEngine — Thought → Action → Observation)
- Memory (MemoryEngine — persistent user context)
- Context Management (conversation history + project context)
- Skill Selection (SkillRegistry + confidence scoring)
- Agent Selection (primary → fallback agent)
- Tool Selection (ToolEngine — external APIs)
- Response Validation (VerificationEngine)

---

## Universal Skill Engine

Every capability must be implemented as a Skill.

Every Skill contains:

| Field | Required | Description |
|-------|----------|-------------|
| Skill Name | ✅ | Unique identifier |
| Category | ✅ | Skill category (math, legal, coding, etc.) |
| Description | ✅ | What the skill does (Hindi + English) |
| Keywords | ✅ | Hindi / English / Hinglish trigger words |
| Input Schema | ✅ | Zod-validated input structure |
| Output Schema | ✅ | Zod-validated output structure |
| Validation Rules | ✅ | Post-execution verification checks |
| Agent Mapping | ✅ | Primary + fallback agent |
| Tool Mapping | ⬚ | External tools required |
| Test Cases | ✅ | Built-in test inputs/expected outputs |
| Confidence Score | ✅ | Minimum confidence for auto-execution |

---

## Mandatory Skill Categories

### 1. Mathematics
- Basic Math, Percentage, Ratio
- Geometry, Land Measurement, Area Calculation, Volume
- Unit Conversion, Scientific Calculator

**Core Example:**
```
User Input:
  Front 22 ft
  Back 43 ft
  Length 90 ft

AI Behavior:
  ↓ Detect Trapezium shape
  ↓ Calculate Area = ½ × (22 + 43) × 90 = 2,925 sq.ft
  ↓ Convert to Sq.m (271.75), Sq.yard (325.0), Bigha, Acre
  ↓ Offer PDF Report
```

---

### 2. Legal Document Engine

**Generate:** Affidavit, Notice, Agreement, Rent Agreement, Sale Agreement, Lease, Undertaking, Declaration, Complaint, Representation, RTI, Court Documents

**Export:** PDF, DOCX, Print Ready, Hindi, English

---

### 3. Application Writing Engine

**Harshita AI should become India's best Application Writer.**

**Supported Departments:**
SDM, DM, Tehsildar, BDO, Gram Panchayat, Police, Electricity Department, Jal Nigam, PWD, Bank, School, College, Court, Passport, Aadhaar, Railway, RTO, Municipal Corporation

**Supported Applications:**
Electricity Complaint, New Electricity Connection, Meter Change, Line Shifting, Low Voltage Complaint, Transformer Installation, Road Construction, Drain Construction, Water Supply, Pension, Scholarship, Leave Application, FIR, Complaint Letter, Bank Request, Character Certificate, Income Certificate, Caste Certificate, Residence Certificate, PM Awas, Farmer Application

> AI should ask **only missing information**.

---

### 4. Coding Agent

**Capabilities:** Repository Analysis, Read Entire Codebase, Understand Project Structure, Detect Errors, Auto Fix Errors, Refactor, Run Build, Run Tests, Generate Documentation, Git Commit, Git Push, Pull Request, Rollback Failed Changes

**Supported:** React, TypeScript, Node, Express, Next.js, Flutter, Python, Docker, GitHub, Render, Firebase, Supabase

---

### 5. Website Builder

**Generate:** Landing Page, Portfolio, Business Website, Government Portal, School Website, Hospital Website, NGO Website, PWA, SEO, Responsive Design, Accessibility

---

### 6. Video AI

**Generate:** Instagram Reels, YouTube Shorts, Educational Videos, Kids Stories, Avatar Videos, Subtitles, Voice Over, Background Music

---

### 7. Image AI

**Generate:** Logo, Poster, Banner, Passport Photo, Product Image, Background Removal, OCR, Image Enhancement

---

### 8. Voice AI

Speech To Text, Text To Speech, Voice Translation, Voice Clone, Phone Agent

---

### 9. Automation Engine

Email, WhatsApp, Telegram, Google Drive, Google Sheets, Calendar, API, Webhook, Workflow, Task Scheduler

---

### 10. Business Engine

Billing, Invoice, GST, Inventory, CRM, Attendance, Payroll, Expenses, Reports, Analytics

---

### 11. Rural Help Engine

Village Services, Farmer Help, Government Schemes, Electricity, Road, Water, Pension, Agriculture, Certificates, Application Writing, Complaint Writing

---

### 12. Education Engine

Notes, MCQ, Question Papers, Lesson Plans, Course Creation, PDF, Presentation

---

### 13. Translation Engine

Hindi, English, Urdu, Punjabi, Gujarati, Marathi, Tamil, Telugu, Bengali

---

### 14. Deployment Engine

**Deploy To:** Render, Vercel, Firebase, Netlify, Docker, Railway, GitHub Pages

---

## Supporting Engines

### Memory Engine
Remember: User Preferences, Project Structure, Coding Style, Previous Fixes, Frequently Used Skills, Successful Solutions

### Self-Healing Engine
Automatically: Detect Errors, Repair Errors, Retry Failed Tasks, Restart Services, Rollback Failed Changes, Optimize Build, Clean Cache

### Security Engine
Authentication, Authorization, Encryption, Secret Management, API Keys, Permission Control, Audit Logs, Rate Limiting

### Analytics Dashboard
Monitor: Users, Traffic, Errors, Performance, Revenue, Build Status, Agent Usage, Skill Usage

### Admin Dashboard
Manage: Users, Agents, Skills, Documents, Templates, Subscriptions, Analytics, Settings, Logs

---

## AI Rules

Every task must follow this sequence:

1. ✅ Understand user intent
2. ✅ Select correct skill automatically
3. ✅ Select correct AI agent
4. ✅ Execute task
5. ✅ Validate result
6. ✅ Fix detected errors
7. ✅ Recheck output
8. ✅ Save learning
9. ✅ Never modify unrelated files
10. ✅ Keep the project stable

---

## Development Workflow

For every feature:

```
Analyze → Plan → Implement → Build → Test → Fix Errors → Re-Test → Document → Commit → Verify → Complete
```

> **No feature is considered complete until all tests pass.**

---

## Final Objective

Harshita AI must become a **complete AI Operating System** capable of:
- Coding software
- Creating legal documents
- Writing government applications
- Generating videos and images
- Building websites
- Automating workflows
- Managing businesses
- Assisting rural users
- Learning from experience
- Continuously improving

While maintaining **reliability and security**.
