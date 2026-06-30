# PRD 12 — Education Engine

## Overview

The Education Engine helps teachers, students, and institutions with content generation — notes, MCQs, question papers, lesson plans, course creation, and educational material exports.

---

## Education Skills

| Skill | Description | Offline | API |
|-------|-------------|---------|-----|
| Notes Generator | Generate topic-wise study notes | ❌ | LLM |
| MCQ Generator | Multiple choice questions with answers | ❌ | LLM |
| Question Paper | Full exam papers with marking scheme | ❌ | LLM |
| Lesson Plan | Structured lesson plans for teachers | ❌ | LLM |
| Course Creator | Multi-module course outlines | ❌ | LLM |
| PDF Notes | Export notes as formatted PDF | ✅ | PDFKit |
| Presentation | Generate slide decks | ❌ | LLM |
| Explanation | Explain any topic in simple Hindi/English | ❌ | LLM |

---

## Input Schema

```javascript
EducationInputSchema = z.object({
  action: z.enum(['notes', 'mcq', 'question_paper', 'lesson_plan', 'course', 'explain']),
  subject: z.string(),                        // "Mathematics", "Science", etc.
  topic: z.string(),                           // "Pythagorean Theorem"
  class: z.number().min(1).max(12).optional(), // School class/grade
  board: z.enum(['CBSE', 'ICSE', 'UP Board', 'Bihar Board', 'MP Board']).optional(),
  language: z.enum(['hi', 'en', 'bilingual']).default('hi'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  count: z.number().min(1).max(100).optional(), // Number of questions
  marks: z.number().optional(),                 // Total marks for paper
});
```

---

## Example Interactions

### MCQ Generation
```
User: "10th class Science ke 20 MCQ banao — Light chapter"

AI Response:
📝 Class 10 Science — Light (प्रकाश) — 20 MCQs

1. प्रकाश का वेग कितना होता है?
   a) 3 × 10⁶ m/s
   b) 3 × 10⁸ m/s ✅
   c) 3 × 10¹⁰ m/s
   d) 3 × 10⁴ m/s

2. ...

📄 PDF Download | 📋 Copy | ✏️ Edit
```

### Lesson Plan
```
User: "Class 8 Math ke liye Algebra ka lesson plan banao"

AI Response:
📋 Lesson Plan — Class 8 Mathematics — Algebra

⏱ Duration: 45 minutes
📎 Board: CBSE

Objectives:
1. Students will understand basic algebraic expressions
2. ...

Activities:
- Warm-up (5 min): ...
- Introduction (10 min): ...
- Practice (20 min): ...
- Assessment (10 min): ...

Materials Needed: ...
Homework: ...
```
