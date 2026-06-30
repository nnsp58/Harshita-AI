# PRD 10 — Automation Engine

## Overview

The Automation Engine enables Harshita AI to automate workflows, schedule tasks, send notifications, and integrate with external services — turning repetitive tasks into one-click operations.

---

## Existing Implementation

- `src/agents/whatsAppAgent.js` — WhatsApp Web automation
- `src/agents/telegramAgent.js` — Telegram bot
- `src/agents/notifierAgent.js` — Email/notification delivery
- `src/core/emailService.js` — Email sending via Nodemailer
- `src/core/notificationHub.js` — Multi-channel notification hub
- `node-cron` dependency — Already installed for scheduling

---

## Automation Skills

| Skill | Description | Existing |
|-------|-------------|----------|
| Email Automation | Send/schedule emails | ✅ (emailService.js) |
| WhatsApp Automation | Send messages, media | ✅ (whatsAppAgent.js) |
| Telegram Bot | Commands, notifications | ✅ (telegramAgent.js) |
| Google Drive | Upload, organize files | ❌ New |
| Google Sheets | Read/write spreadsheet data | ❌ New |
| Google Calendar | Create/manage events | ❌ New |
| API Integration | Call external REST APIs | ❌ New |
| Webhook Handler | Receive external triggers | ❌ New |
| Workflow Builder | Multi-step automation chains | ❌ New |
| Task Scheduler | Cron-based recurring tasks | Partial (node-cron) |
| n8n Integration | Visual workflow automation | Partial (npm script) |

---

## Workflow Schema

```javascript
WorkflowSchema = z.object({
  name: z.string(),
  trigger: z.object({
    type: z.enum(['manual', 'schedule', 'webhook', 'event']),
    cron: z.string().optional(),        // For schedule trigger
    webhookPath: z.string().optional(),  // For webhook trigger
    eventName: z.string().optional(),    // For event trigger
  }),
  steps: z.array(z.object({
    id: z.string(),
    skill: z.string(),                  // Skill to execute
    input: z.record(z.any()),           // Input parameters
    condition: z.string().optional(),   // Execute only if condition met
    onError: z.enum(['stop', 'skip', 'retry']).default('stop'),
  })),
  notifications: z.object({
    onSuccess: z.array(z.enum(['email', 'whatsapp', 'telegram'])).optional(),
    onFailure: z.array(z.enum(['email', 'whatsapp', 'telegram'])).optional(),
  }).optional(),
});
```

---

## Example Workflows

### Daily Report Automation
```
Trigger: Cron (8:00 AM daily)
Step 1: AnalyticsEngine → Get daily stats
Step 2: PDFReportService → Generate report PDF
Step 3: EmailService → Send to admin
Step 4: TelegramAgent → Notify on Telegram
```

### Document Processing Pipeline
```
Trigger: Webhook (new file uploaded)
Step 1: FileProcessorSkill → Extract text (OCR)
Step 2: LegalDraftSkill → Generate legal document
Step 3: PDFReportService → Export to PDF
Step 4: WhatsAppAgent → Send to user
```
