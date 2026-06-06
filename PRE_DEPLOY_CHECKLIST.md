# 🚀 Pre-Deploy Checklist for Harshita AI

**यह file deploy karne se PEHLE check karni hai. Production mein jaane se pehle saare items check kar lo!**

---

## 🔴 Critical — Security & Privacy

### Frontend
- [ ] **Remove demo credentials box** from `frontend/src/pages/Login.jsx` (the yellow circled section)
  - Remove the `<div className="mt-6 p-4 bg-white/10 ...">Demo Credentials...</div>` block
- [ ] **Remove hardcoded URLs** — replace `http://localhost:3001` with `import.meta.env.VITE_API_URL`
- [ ] Set `VITE_API_URL=https://your-backend-domain.com/api` in `frontend/.env.production`

### Backend
- [ ] **Strong JWT_SECRET** — change from `harshita-ai-secret-key-2024` to 32+ random chars
- [ ] **Set `NODE_ENV=production`** in `.env`
- [ ] **CORS_ORIGIN** — change from `http://localhost:5173` to production frontend URL
- [ ] **Remove demo user creation** from `src/api/server.js` (`createDemoUser()` function)
- [ ] **Remove demo user from `prisma/seed.js`** OR ensure seed runs only in dev

### Files & Git
- [ ] Add to `.gitignore`:
  ```
  .env
  .env.grok
  .env.openai
  .env.production
  data/learning/*.json
  uploads/
  processed/
  dev.db
  *.log
  ```
- [ ] **Verify no API keys in git history**: `git log --all -p | grep -i "api_key\|gsk_\|sk-"`
- [ ] If keys leaked: rotate Groq + OpenAI keys

---

## 🟡 Important — Data & Performance

- [ ] **Switch SQLite to PostgreSQL** for multi-user production
  - Update `prisma/schema.prisma` provider from `sqlite` to `postgresql`
  - Set `DATABASE_URL` to Postgres connection string
  - Run `npx prisma migrate deploy`

- [ ] **Setup Redis** (optional but recommended) for BullMQ job queue persistence
  - Free tier: Upstash Redis
  - Update `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` in `.env`

- [ ] **Frontend code-split** — current bundle is 825 KB
  - Use `React.lazy()` for admin pages and rarely-used routes
  - Already configured: see vite warning

- [ ] **Backup strategy**
  - Schedule daily backup of `data/learning/` and database
  - Store backups in S3/Backblaze

---

## 🟢 Nice-to-Have — Polish

- [ ] **Email service configured** (`EMAIL_USER`, `EMAIL_PASS` in `.env`)
- [ ] **WhatsApp** — test QR scan flow end-to-end
- [ ] **Analytics** — add Plausible/Umami for user analytics (privacy-friendly)
- [ ] **Error tracking** — Sentry integration
- [ ] **Rate limiting** — review `RATE_LIMIT_MAX_REQUESTS=1000` per 15 min (may need adjustment)

---

## 📋 Deploy Steps

### Option A: Render.com (Easiest, Free Tier)
1. Push to GitHub
2. Create new Web Service on Render
3. Set environment variables (all from `.env`)
4. Build command: `cd frontend && npm install && npm run build && cd .. && npm install && npx prisma generate && npx prisma migrate deploy`
5. Start command: `node src/api/server.js`
6. Note: SQLite works on Render but data lost on redeploy. Use Render Postgres or Supabase

### Option B: Docker (VPS/Self-host)
1. Use existing `Dockerfile` and `docker-compose.yml`
2. Set environment variables in `docker-compose.override.yml`
3. `docker-compose up -d`
4. Setup Nginx reverse proxy with SSL (Let's Encrypt)

### Option C: Vercel (Frontend) + Render (Backend)
1. Frontend → Vercel: connect GitHub, set `VITE_API_URL`
2. Backend → Render: as above
3. Update CORS to include Vercel domain

---

## ✅ Final Verification

Before going live, test:
- [ ] Real user signup works
- [ ] All 21 skills respond correctly
- [ ] TA-DA Naksha generates correct PDF
- [ ] Admin dashboard shows real data
- [ ] WhatsApp connects (if enabled)
- [ ] Nightly upgrade runs successfully (test by setting hour to current time)
- [ ] Mobile responsive on real phone
- [ ] Lighthouse score >80

---

## 🔐 Security Audit Items

- [ ] All passwords use bcrypt with 12+ rounds (currently 12 ✓)
- [ ] JWT tokens expire (currently 24h ✓)
- [ ] Helmet enabled (✓)
- [ ] Rate limiting active (✓)
- [ ] SQL injection protected via Prisma (✓)
- [ ] File upload size limit (10MB ✓)
- [ ] No `console.log` of sensitive data
- [ ] HTTPS enforced in production

---

## 📞 After Deploy

- Monitor logs for first 24 hours
- Check `/api/learning/stats` daily for first week
- Verify nightly upgrade ran (check `data/learning/upgrade-log.json`)
- Get feedback from 5-10 real VLEs
- Iterate based on failure patterns
