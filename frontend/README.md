# Rawan Dashboard - Frontend

Multi-Agent CSC Automation Platform for VLEs (Village Level Entrepreneurs) built with React + Vite + Tailwind.

## 🎯 Features

- **Rawan - 20-armed Dashboard**: Interactive visualization of all agents working in parallel
- **Real-time Monitoring**: Track agent status, success rates, and costs
- **Job Management**: View and filter job queue across all agents
- **Document Processing**: Upload, extract, and approve document data
- **Legal Draft Studio**: AI-powered affidavit/NOC generation
- **Candidate Management**: VLE accounts and subscription tracking
- **Agent Marketplace**: (Upcoming) Install new specialized agents
- **PWA Ready**: Installable on mobile devices, works offline

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running at `http://localhost:3001` (or configure `VITE_API_URL`)

### Install Dependencies
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
```
Opens at http://localhost:5173

### Build for Production
```bash
npm run build
npm run preview  # Preview production build
```

## 📁 Project Structure

```
frontend/
├── public/
│   ├── manifest.json      # PWA manifest
│   └── icons/             # PWA icons (add pwa-192x192.png, pwa-512x512.png)
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   ├── Header.jsx       # Top header with notifications
│   │   │   └── DashboardLayout.jsx
│   │   ├── Common/
│   │   │   └── StatsCard.jsx    # Reusable stat card
│   │   ├── Agent/
│   │   │   └── AgentCard.jsx    # Agent status card with controls
│   │   └── Rawan/
│   │       └── RawanModel.jsx   # 20-arm Rawan visualization
│   ├── pages/
│   │   ├── Home.jsx       # Dashboard with Rawan hero + stats
│   │   ├── Agents.jsx    # Agent monitoring + marketplace
│   │   ├── Jobs.jsx      # Job queue table
│   │   ├── Documents.jsx # Document processing queue
│   │   ├── LegalDraft.jsx # AI legal document creation
│   │   ├── Candidates.jsx # VLE management
│   │   ├── Settings.jsx  # API keys, preferences
│   │   └── Login.jsx     # VLE login page
│   ├── services/
│   │   └── api.js        # Axios API client
│   ├── store/
│   │   └── index.js      # Zustand global state
│   ├── utils/
│   │   └── constants.js  # App constants
│   ├── App.jsx           # Router setup
│   ├── main.jsx          # Entry point
│   └── index.css         # Tailwind + custom styles
├── package.json
├── vite.config.js
├── tailwind.config.js    # (not used with v4, kept for reference)
└── postcss.config.js
```

## 🎨 Design System

**Colors** (Mythological + SaaS theme)
- Primary: Maroon `#800020` (Ravan's traditional color)
- Secondary: Gold `#FFD700` (Royal accent)
- Accent: Blue `#0066FF` (Modern SaaS)
- Background: Navy `#0F172A` (Premium dark mode)

**Typography**
- Headings: Poppins
- Body: Inter
- Code: JetBrains Mono

**Key Components**
- Cards with subtle shadows and hover lift
- Gradient buttons with glow effects
- Custom scrollbars (maroon colored)
- Status badges (success, warning, error, info)
- Responsive sidebar (collapsible)

## 🔌 API Integration

The frontend expects these backend endpoints:

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Agents
- `GET /api/agents/status` - All agents health
- `POST /api/agents/:id/start` - Start agent
- `POST /api/agents/:id/stop` - Stop agent
- `POST /api/agents/:id/restart` - Restart agent

### Jobs
- `GET /api/jobs` - List jobs (query: status, agent)
- `GET /api/jobs/:id` - Job details
- `POST /api/jobs/:id/cancel` - Cancel job

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents/upload` - Upload file
- `POST /api/documents/:id/approve` - Approve extraction
- `POST /api/documents/:id/reject` - Reject with reason

### Dashboard
- `GET /api/stats/dashboard` - Aggregated stats
- `GET /api/activity?limit=10` - Recent activity

All requests include JWT token from localStorage.

## 🎮 State Management

Zustand store (`src/store/index.js`) with persistence:
- Auth (token, user, isAuthenticated)
- Agents list & selected agent
- Jobs queue
- Documents
- UI state (sidebar, dark mode)
- Notifications
- Agent control actions (start/stop/restart)
- Marketplace visibility

Persisted to localStorage for offline session recovery.

## 📱 PWA Setup (Manual)

1. Add PWA icons to `public/icons/`:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `maskable-icon.png` (optional)

2. The `public/manifest.json` is already configured.

3. For service worker, we'll add Workbox later once PWA plugin is compatible.

## 🧪 Testing

### Run dev server
```bash
npm run dev
```

### Build check
```bash
npm run build
```

### Preview production
```bash
npm run preview
```

## 🚢 Deployment

### Docker
```dockerfile
# frontend/Dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
```

Then in main `docker-compose.yml`:
```yaml
frontend:
  build: ./frontend
  ports:
    - "80:80"
  depends_on:
    - backend
```

### Static Hosting
- **Vercel**: `vercel` (easiest)
- **Netlify**: Drag & drop `dist/` folder
- **GitHub Pages**: Push to gh-pages branch

## 🐛 Known Issues

1. **vite-plugin-pwa** - Currently disabled due to dependency conflicts with Vite 8. Will be re-enabled when compatible version released.
2. **Icons** - Need to generate PWA icon assets (PNG files in `public/`)
3. **Marketplace** - Mock data only; real agent installation not yet connected to backend
4. **Rawan 3D Animation** - Currently using CSS-based circle of agent icons; Lottie/Three.js integration pending

## 📈 Roadmap

- [x] Core dashboard layout & navigation
- [x] Agent monitoring with control buttons
- [x] Job queue table with filters
- [x] Document processing UI
- [x] Legal draft studio
- [x] Candidates/VLE management
- [x] Settings page with API key config
- [x] Login page
- [x] Build succeeds
- [ ] Connect to real backend API (replace mock data)
- [ ] Implement polling for live data (5s interval)
- [ ] Add Rawan Lottie animation with arm glows
- [ ] PWA service worker registration
- [ ] Push notifications
- [ ] Dark mode theme toggle functional
- [ ] Agent Marketplace with install flow
- [ ] Mobile bottom navigation bar
- [ ] Accessibility improvements (ARIA labels)
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] i18n: Hindi language support

## 📞 Support

For issues, contact the development team or open an issue in the repository.

---

**Built with ❤️ for n-dizi CSC Automation**
