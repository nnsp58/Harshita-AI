import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Zap, Shield, Crown, Search, ShoppingCart, Info, Clock, AlertTriangle } from 'lucide-react'
import { useStore } from '../store'

export default function Subscription() {
  const { agents, subscribedAgents, subscribeAgent, subscriptionMode, trialStartDate } = useStore()
  const [selectedIds, setSelectedIds] = useState([])
  const [showPlanDetails, setShowPlanDetails] = useState(false)

  const PRICE_PER_AGENT = 99
  const FULLY_LOADED_PRICE = 1999
  const FULL_PACK_DISCOUNT = 0.5 // 50% discount for full pack

  const trialDaysLeft = Math.max(0, 7 - Math.floor((Date.now() - trialStartDate) / (24 * 60 * 60 * 1000)))

  const toggleAgent = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const calculateTotal = () => {
    if (selectedIds.length === agents.length) return FULLY_LOADED_PRICE
    let total = selectedIds.length * PRICE_PER_AGENT
    // Apply bulk discount: 10% for 3+, 20% for 5+, etc.
    if (selectedIds.length >= 5) total *= 0.8
    else if (selectedIds.length >= 3) total *= 0.9
    return Math.round(total)
  }

  const handleSubscribe = () => {
    selectedIds.forEach(id => subscribeAgent(id))
    alert(`Successfully subscribed to ${selectedIds.length} agents!`)
    setSelectedIds([])
  }

  return (
    <div className="space-y-8">
      {/* Header & Trial Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">Subscription & Billing</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Prepaid plans tailored for your CSC VLE needs</p>
        </div>
        {subscriptionMode === 'trial' && (
          <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 p-3 rounded-xl flex items-center gap-3">
            <Clock className="text-amber-600" size={20} />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">{trialDaysLeft} Days Left in Free Trial</p>
              <p className="text-xs text-amber-600">No credit card required</p>
            </div>
          </div>
        )}
        {subscriptionMode === 'expired' && (
          <div className="bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700 p-3 rounded-xl flex items-center gap-3">
            <AlertTriangle className="text-rose-600" size={20} />
            <div>
              <p className="text-sm font-bold text-rose-800 dark:text-rose-200">Trial Expired</p>
              <p className="text-xs text-rose-600">Subscribe now to keep using Rawan</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Selection List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-bold">Select Agents to Subscribe</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Search agents..." className="input pl-10 h-10 w-48 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {agents.map((agent) => {
                const isSubscribed = subscribedAgents.includes(agent.id)
                const isSelected = selectedIds.includes(agent.id)
                return (
                  <div
                    key={agent.id}
                    onClick={() => !isSubscribed && toggleAgent(agent.id)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSubscribed
                        ? 'border-emerald-100 bg-emerald-50/30 opacity-70'
                        : isSelected
                        ? 'border-maroon-500 bg-maroon-50 dark:bg-maroon-900/20 shadow-md'
                        : 'border-gray-100 dark:border-navy-700 hover:border-maroon-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSubscribed ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-navy-800'}`}>
                        {isSubscribed ? <Shield size={18} /> : <Zap size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{agent.name}</p>
                        <p className="text-xs text-gray-500">{isSubscribed ? 'Subscribed' : `₹${PRICE_PER_AGENT}/month`}</p>
                      </div>
                    </div>
                    {!isSubscribed && (
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-maroon-600 border-maroon-600 text-white' : 'border-gray-200'}`}>
                        {isSelected && <Check size={14} />}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Plan Overview & Checkout */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 border-gold-300 bg-gradient-to-br from-white to-gold-50 dark:from-navy-900 dark:to-gold-950/10">
            <h2 className="text-xl font-heading font-bold mb-6 flex items-center gap-2">
              <Crown className="text-gold-500" size={24} />
              Your Selection
            </h2>

            <div className="space-y-4 mb-6">
              {selectedIds.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 italic">No agents selected</p>
                </div>
              ) : (
                <>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {selectedIds.map(id => {
                      const agent = agents.find(a => a.id === id)
                      return (
                        <div key={id} className="flex items-center justify-between text-sm">
                          <span>{agent.name}</span>
                          <span className="font-semibold text-gray-600">₹{PRICE_PER_AGENT}</span>
                        </div>
                      )
                    })}
                  </div>
                  <hr className="border-gold-200" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Base Price</span>
                      <span className="text-gray-500">₹{selectedIds.length * PRICE_PER_AGENT}</span>
                    </div>
                    {selectedIds.length >= 3 && (
                      <div className="flex items-center justify-between text-sm text-emerald-600">
                        <span>Bulk Discount</span>
                        <span>-{selectedIds.length >= 5 ? '20%' : '10%'}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-lg font-bold mt-4">
                      <span>Total Price</span>
                      <span className="text-maroon-600">₹{calculateTotal()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              disabled={selectedIds.length === 0}
              onClick={handleSubscribe}
              className="w-full btn-primary py-4 text-lg shadow-xl disabled:opacity-50"
            >
              Confirm Subscription
            </button>
            <p className="text-[10px] text-center text-gray-400 mt-4">
              * Prepaid plan. GST extra if applicable. One-week free trial applied automatically.
            </p>
          </div>

          {/* Value Packs */}
          <div className="card p-6 overflow-hidden relative">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gold-400 rotate-45 opacity-20" />
            <h3 className="font-heading font-bold mb-4 flex items-center gap-2">
              <Zap className="text-gold-500" size={18} /> Recommended Packs
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border-2 border-gold-400 bg-gold-50/30 dark:bg-gold-900/10">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold">Full Agent Pack</p>
                  <span className="text-xs bg-gold-400 text-maroon-900 px-2 py-0.5 rounded font-bold">50% OFF</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">All 20 agents included for bulk work</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-gold-400">₹1,999</span>
                  <span className="text-sm text-gray-400 line-through mb-1">₹3,980</span>
                  <span className="text-xs text-gray-500 mb-1">/month</span>
                </div>
                <button
                  onClick={() => setSelectedIds(agents.map(a => a.id))}
                  className="w-full mt-4 btn-secondary text-sm"
                >
                  Select Pack
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
