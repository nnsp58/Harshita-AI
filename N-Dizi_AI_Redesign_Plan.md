# N-Dizi AI — Modern SaaS Platform Redesign

## Phase 0 — Discovery Findings

### Stack
- Frontend: Vite + React 19 + Tailwind 4
- Backend: Express (server.js not yet populated)
- State: Zustand + localStorage persistence
- Real-time: Socket.io client
- Routing: react-router-dom v7
- Auth: JWT + Google OAuth (via @react-oauth/google)
- PDF: @react-pdf/renderer
- Data: Prisma + Redis + BullMQ

### Current Branding
- Brand: Harshita AI
- Colors: maroon/gold (amber)/navy
- DOM title: Harshita AI Ultimate Command Center
- Logo on dashboard: harshita ai.png

### Current Auth
- Login email/password at /login
- Google OAuth via GoogleLogin component
- GoogleOAuthProvider wraps the whole app using VITE_GOOGLE_CLIENT_ID
- isAuthenticated state stored in zustand and mirrored in localStorage

### Current UX Pain Points
- Dashboard 3-panel layout feels dense and task-centric, not SaaS
- Chat panel leaks operational language (printing commands)
- Services list mixes purposes (forms, city tools, HR, analytics)
- Dark mode branding colors are warm amber, not a modern SaaS purple/cyan system
- No global search/command palette/notifications shell consistent with Notion/Linear/Stripe
- Google OAuth likely needs proper redirect/origin alignment

---

## Redesign Target

### Brand
- Name: N-Dizi AI
- Tagline: One Platform. Unlimited AI Services.
- Primary: #6366F1
- Secondary: #8B5CF6
- Accent: #06B6D4
- Success: #10B981
- Dark mode remains default with glassmorphism surfaces

### Layout Model
- Global shell: top command bar + collapsible sidebar + main area + notifications panel (desktop)
- Mobile: bottom nav + full-screen pages
- Sidebar sections: Dashboard, AI Assistant, Legal Tools, Career Tools, Business Tools, Government Services, Documents, Settings, Support, Admin

### Top "Command Center" Rows
- Row 1: Welcome User | Live clock | AI assistant status pill | Subscription status pill | Notifications
- Row 2: 6 stat cards (Total Jobs, Total Candidates, Total Documents, Total AI Requests, Today Activity, Success Rate)

### AI Chat Surface
- ChatGPT-style panel with conversation history
- Quick actions and suggested prompts
- Voice input button with language toggle (EN/HI)
- File upload with preview state
- Consistent "N-Dizi AI" bot persona

### New Color Tokens (Tailwind theme)
- primary: #6366F1
- secondary: #8B5CF6
- accent: #06B6D4
- success: #10B981
- warning: #F59E0B
- danger: #EF4444
- surface: glass panels (white/10 + border white/10 + backdrop blur)

---

## Implementation Plan

1. Update `index.html` -> title, meta tags
2. Add `public/robots.txt` and `public/sitemap.xml`
3. Update Tailwind theme in `tailwind.config.js` and `index.css`
4. Create shared UI primitives: ShellLayout, TopCommandCenter, StatCard, CommandPalette
5. Build new Sidebar component
6. Redesign Dashboard (`SimpleDashboard.jsx`) to consume new shell
7. Redesign AI Chat panel into `AICommandCenter`
8. Update `Login.jsx` branding + OAuth alignment
9. Update store namespace keys
10. Update assets and service catalog mapping
