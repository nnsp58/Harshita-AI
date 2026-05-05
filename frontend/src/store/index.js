import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { agentAPI, jobAPI, documentAPI, candidateAPI, dashboardAPI } from '../services/api'

const unwrap = (response) => response?.data?.data ?? response?.data

export const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      token: localStorage.getItem('token') || null,
      user: JSON.parse(localStorage.getItem('user') || 'null'),
      isAuthenticated: !!localStorage.getItem('token'),
      setAuth: (token, user = null) => {
        if (token) {
          localStorage.setItem('token', token)
          if (user) localStorage.setItem('user', JSON.stringify(user))
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
        set({ token, user, isAuthenticated: !!token })
      },
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ token: null, user: null, isAuthenticated: false })
      },

      // Agents
      agents: [],
      selectedAgent: null,
      setSelectedAgent: (agent) => set({ selectedAgent: agent }),

      // Fetch all agents
      fetchAgents: async () => {
        try {
          const response = await agentAPI.getAll()
          // Ensure we get an array from { agents: [...] }
          const payload = unwrap(response)
          const agentsList = Array.isArray(payload) ? payload : (payload?.agents || response.data?.agents || [])
          set({ agents: agentsList })
          console.log('Agents fetched:', agentsList.length)
        } catch (error) {
          console.error('Failed to fetch agents:', error)
          // Keep default agents on error
        }
      },

      // Agent control actions - call backend API
      startAgent: async (agentId) => {
        try {
          await agentAPI.start(agentId)
          // Optimistic update + refetch
          set((state) => ({
            agents: state.agents.map(a => a.id === agentId ? { ...a, status: 'active' } : a)
          }))
          get().fetchAgents()
        } catch (error) {
          console.error('Failed to start agent:', error)
        }
      },

      stopAgent: async (agentId) => {
        try {
          await agentAPI.stop(agentId)
          set((state) => ({
            agents: state.agents.map(a => a.id === agentId ? { ...a, status: 'idle' } : a)
          }))
          get().fetchAgents()
        } catch (error) {
          console.error('Failed to stop agent:', error)
        }
      },

      restartAgent: async (agentId) => {
        try {
          await agentAPI.restart(agentId)
          set((state) => ({
            agents: state.agents.map(a => a.id === agentId ? { ...a, status: 'busy' } : a)
          }))
          get().fetchAgents()
        } catch (error) {
          console.error('Failed to restart agent:', error)
        }
      },

      // Stats - fetched from backend
      stats: {
        activeJobs: 0,
        pendingDocuments: 0,
        successRate: 0,
        agentsOnline: 0,
        todayJobs: 0,
        revenue: 0,
      },
      fetchStats: async () => {
        try {
          const statsRes = await dashboardAPI.getStats()
          set({ stats: unwrap(statsRes) })
          console.log('Stats fetched:', unwrap(statsRes))
        } catch (error) {
          console.error('Failed to fetch stats:', error)
          // Keep default stats on error
        }
      },

      // Jobs Queue - fetched from backend
      jobs: [],
      fetchJobs: async () => {
        try {
          const response = await jobAPI.getAll()
          set({ jobs: unwrap(response) || [] })
        } catch (error) {
          console.error('Failed to fetch jobs:', error)
        }
      },
      createJob: async (data) => {
        const response = await jobAPI.create(data)
        await get().fetchJobs()
        await get().fetchStats()
        return unwrap(response)
      },
      startJob: async (id) => {
        const response = await jobAPI.start(id)
        await get().fetchJobs()
        await get().fetchStats()
        return unwrap(response)
      },

      // Documents - fetched from backend
      documents: [],
      fetchDocuments: async () => {
        try {
          const response = await documentAPI.getAll()
          set({ documents: unwrap(response) || [] })
        } catch (error) {
          console.error('Failed to fetch documents:', error)
        }
      },

      // Candidates (VLEs) - fetched from backend
      candidates: [],
      fetchCandidates: async () => {
        try {
          const response = await candidateAPI.getAll()
          set({ candidates: unwrap(response) || [] })
        } catch (error) {
          console.error('Failed to fetch candidates:', error)
        }
      },
      getCandidateVerification: async (id) => {
        const response = await candidateAPI.getVerification(id)
        return unwrap(response)
      },
      verifyCandidate: async (id, data) => {
        const response = await candidateAPI.verify(id, data)
        await get().fetchCandidates()
        return unwrap(response)
      },

      // Initialize - fetch all data and start polling
      initialize: async () => {
        console.log('Initializing dashboard data from real API...')
        try {
          await Promise.all([
            get().fetchAgents(),
            get().fetchStats(),
            get().fetchJobs(),
            get().fetchDocuments(),
            get().fetchCandidates()
          ])
          console.log('Dashboard data initialized successfully')
          get().startPolling() // Start real-time updates
        } catch (error) {
          console.error('Failed to initialize dashboard data:', error)
        }
      },

      // Polling for real-time updates (5 second interval)
      pollingInterval: null,
      startPolling: () => {
        if (get().pollingInterval) return // Already polling
        const interval = setInterval(() => {
          get().fetchAgents()
          get().fetchStats()
        }, 15000)
        set({ pollingInterval: interval })
      },
      stopPolling: () => {
        if (get().pollingInterval) {
          clearInterval(get().pollingInterval)
          set({ pollingInterval: null })
        }
      },

      // UI State
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      // Agent Market (future)
      marketplaceVisible: false,
      toggleMarketplace: () => set((state) => ({ marketplaceVisible: !state.marketplaceVisible })),

      // Notifications
      notifications: [],
      unreadCount: 0,
      markRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        unreadCount: state.notifications.filter(n => !n.read).length - 1
      })),

      // SaaS Subscription State
      subscribedAgents: [], // Array of agent IDs user has paid for
      trialStartDate: Date.now(), // 1 week trial starts on first login
      subscriptionMode: 'trial', // 'trial', 'active', 'expired'
      
      subscribeAgent: (agentId) => set((state) => ({
        subscribedAgents: [...new Set([...state.subscribedAgents, agentId])],
        subscriptionMode: 'active'
      })),

      checkSubscription: () => {
        const { trialStartDate, subscriptionMode, subscribedAgents } = get()
        const weekInMs = 7 * 24 * 60 * 60 * 1000
        if (subscriptionMode === 'trial' && (Date.now() - trialStartDate) > weekInMs && subscribedAgents.length === 0) {
          set({ subscriptionMode: 'expired' })
        }
      },

      // Operator Management
      operators: [],
      addOperator: (op) => set((state) => ({ operators: [...state.operators, { ...op, id: `op${Date.now()}`, jobs: 0 }] })),
      removeOperator: (id) => set((state) => ({ operators: state.operators.filter(o => o.id !== id) })),

      // Job Finalization (Review & Fee Pay)
      finalizeJob: (id) => set((state) => ({
        jobs: state.jobs.map(j => j.id === id ? { ...j, status: 'completed', paid: true } : j)
      })),
    }),
    {
      name: 'rawan-dashboard-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        darkMode: state.darkMode,
        sidebarOpen: state.sidebarOpen,
        subscribedAgents: state.subscribedAgents,
        trialStartDate: state.trialStartDate,
        subscriptionMode: state.subscriptionMode,
        operators: state.operators,
      }),
      onRehydrateStorage: () => (state) => {
        // Ensure isAuthenticated is set based on token after rehydration
        if (state) {
          state.isAuthenticated = !!state.token;
          state.checkSubscription();
          console.log('Store rehydrated, Mode:', state.subscriptionMode);
        }
      },
    }
   )
 )
