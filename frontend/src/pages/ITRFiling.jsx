import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileSignature, Upload, Calculator, FileText, CheckCircle, AlertCircle, Download, CreditCard } from 'lucide-react'
import { useStore } from '../store'

const formSteps = [
  { id: 'personal', label: 'Personal Info', icon: FileText },
  { id: 'income', label: 'Income Details', icon: CreditCard },
  { id: 'deductions', label: 'Deductions', icon: Calculator },
  { id: 'preview', label: 'Preview & File', icon: CheckCircle },
]

const incomeTypes = [
  { id: 'salary', label: 'Salary Income', description: 'From employment' },
  { id: 'business', label: 'Business/Profession', description: 'Self-employment income' },
  { id: 'house', label: 'House Property', description: 'Rental income' },
  { id: 'capital', label: 'Capital Gains', description: 'Stocks, property sales' },
  { id: 'other', label: 'Other Sources', description: 'Interest, dividends' },
]

const deductionsList = [
  { id: '80c', label: 'Section 80C', description: 'Life insurance, PPF, ELSS, etc.', limit: '₹1,50,000' },
  { id: '80d', label: 'Section 80D', description: 'Health insurance premium', limit: '₹25,000' },
  { id: '80e', label: 'Section 80E', description: 'Education loan interest', limit: 'No limit' },
  { id: '80g', label: 'Section 80G', description: 'Donations to charities', limit: '50-100%' },
  { id: '80ttb', label: 'Section 80TTB', description: 'Interest income (senior citizens)', limit: '₹50,000' },
  { id: '24b', label: 'Section 24(b)', description: 'Home loan interest', limit: '₹2,00,000' },
]

export default function ITRFiling() {
  const { createJob } = useStore()
  const [currentStep, setCurrentStep] = useState('personal')
  const [formData, setFormData] = useState({
    name: '',
    pan: '',
    aadhaar: '',
    mobile: '',
    email: '',
    dob: '',
    address: '',
    filingType: 'new',
    assessmentYear: '2024-25',
    incomeType: [],
    grossSalary: '',
    exemptions: '',
    otherIncome: '',
    deductions: {},
    tds: '',
    taxPaid: '',
    bankAccount: '',
    ifsc: '',
  })
  const [documents, setDocuments] = useState({
    panCard: null,
    aadhaarCard: null,
    form16: null,
    bankStatement: null,
    investmentProof: null,
  })
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculatedTax, setCalculatedTax] = useState(null)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDeductionChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      deductions: { ...prev.deductions, [id]: value }
    }))
  }

  const handleFileUpload = (docType, file) => {
    setDocuments(prev => ({ ...prev, [docType]: file }))
  }

  const calculateTax = () => {
    setIsCalculating(true)
    const grossSalary = parseFloat(formData.grossSalary) || 0
    const otherIncome = parseFloat(formData.otherIncome) || 0
    const totalIncome = grossSalary + otherIncome
    const exemptions = parseFloat(formData.exemptions) || 0
    const taxableIncome = totalIncome - exemptions

    let tax = 0
    if (taxableIncome <= 250000) {
      tax = 0
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05
    } else if (taxableIncome <= 1000000) {
      tax = 12500 + (taxableIncome - 500000) * 0.20
    } else {
      tax = 112500 + (taxableIncome - 1000000) * 0.30
    }

    const tds = parseFloat(formData.tds) || 0
    const rebate = taxableIncome <= 500000 ? Math.min(tax, 12500) : 0
    tax = tax - rebate
    tax = Math.max(0, tax)
    const cess = tax * 0.04
    const totalTax = tax + cess
    const refund = tds - totalTax

    setTimeout(() => {
      setCalculatedTax({
        grossSalary,
        otherIncome,
        totalIncome,
        taxableIncome,
        tax,
        cess,
        totalTax,
        tds,
        refund,
      })
      setIsCalculating(false)
    }, 1500)
  }

  const handleSubmit = async () => {
    try {
      await createJob({
        type: 'ITR Filing',
        candidate: formData.name,
        data: formData,
        status: 'pending',
      })
      alert('ITR Filing job created successfully!')
    } catch (error) {
      console.error('Failed to create job:', error)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <img src="/harshita ai.png" alt="Harshita AI" className="w-12 h-12" />
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold">ITR Filing - Income Tax Return</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">File your ITR with AI-powered assistance</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          {formSteps.map((step, idx) => {
            const StepIcon = step.icon
            const isActive = currentStep === step.id
            const isPast = formSteps.findIndex(s => s.id === currentStep) > idx

            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-3 ${isActive ? 'text-maroon-600' : isPast ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-maroon-600 text-white' : isPast ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-navy-700'
                  }`}>
                    {isPast ? <CheckCircle size={20} /> : <StepIcon size={20} />}
                  </div>
                  <span className="font-medium hidden md:block">{step.label}</span>
                </div>
                {idx < formSteps.length - 1 && (
                  <div className="w-16 md:w-24 h-0.5 mx-2 bg-gray-200 dark:bg-navy-700" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="card p-6">
        {currentStep === 'personal' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-heading font-bold">Personal Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input"
                  placeholder="As per PAN card"
                />
              </div>
              <div>
                <label className="label">PAN Number *</label>
                <input
                  type="text"
                  value={formData.pan}
                  onChange={(e) => handleInputChange('pan', e.target.value.toUpperCase())}
                  className="input"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
              </div>
              <div>
                <label className="label">Aadhaar Number *</label>
                <input
                  type="text"
                  value={formData.aadhaar}
                  onChange={(e) => handleInputChange('aadhaar', e.target.value)}
                  className="input"
                  placeholder="XXXX XXXX XXXX"
                  maxLength={14}
                />
              </div>
              <div>
                <label className="label">Mobile Number</label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className="input"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <label className="label">Filing Type</label>
                <select
                  value={formData.filingType}
                  onChange={(e) => handleInputChange('filingType', e.target.value)}
                  className="input"
                >
                  <option value="new">New ITR</option>
                  <option value="revised">Revised ITR</option>
                  <option value=" belated">Belated ITR</option>
                </select>
              </div>
              <div>
                <label className="label">Assessment Year</label>
                <select
                  value={formData.assessmentYear}
                  onChange={(e) => handleInputChange('assessmentYear', e.target.value)}
                  className="input"
                >
                  <option value="2024-25">FY 2023-24 / AY 2024-25</option>
                  <option value="2025-26">FY 2024-25 / AY 2025-26</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="input"
                rows={3}
                placeholder="Full address as per records"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep('income')}
                className="btn-primary flex items-center gap-2"
              >
                Next: Income Details
                <FileSignature size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'income' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-heading font-bold">Income Details</h2>

            <div>
              <label className="label mb-3">Select Income Sources</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => {
                      const newTypes = formData.incomeType.includes(type.id)
                        ? formData.incomeType.filter(t => t !== type.id)
                        : [...formData.incomeType, type.id]
                      handleInputChange('incomeType', newTypes)
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.incomeType.includes(type.id)
                        ? 'border-maroon-500 bg-maroon-50 dark:bg-maroon-900/20'
                        : 'border-gray-200 dark:border-navy-700 hover:border-maroon-300'
                    }`}
                  >
                    <h3 className="font-medium">{type.label}</h3>
                    <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {formData.incomeType.includes('salary') && (
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-navy-800 rounded-xl">
                <h3 className="font-semibold">Salary Income</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Gross Salary</label>
                    <input
                      type="number"
                      value={formData.grossSalary}
                      onChange={(e) => handleInputChange('grossSalary', e.target.value)}
                      className="input"
                      placeholder="₹"
                    />
                  </div>
                  <div>
                    <label className="label">Exemptions (HRA, LTA, etc.)</label>
                    <input
                      type="number"
                      value={formData.exemptions}
                      onChange={(e) => handleInputChange('exemptions', e.target.value)}
                      className="input"
                      placeholder="₹"
                    />
                  </div>
                  <div>
                    <label className="label">TDS Deducted</label>
                    <input
                      type="number"
                      value={formData.tds}
                      onChange={(e) => handleInputChange('tds', e.target.value)}
                      className="input"
                      placeholder="₹"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.incomeType.some(t => t !== 'salary') && (
              <div className="space-y-4">
                <h3 className="font-semibold">Other Income</h3>
                <div>
                  <label className="label">Total Other Income</label>
                  <input
                    type="number"
                    value={formData.otherIncome}
                    onChange={(e) => handleInputChange('otherIncome', e.target.value)}
                    className="input"
                    placeholder="₹"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep('personal')}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('deductions')}
                className="btn-primary flex items-center gap-2"
              >
                Next: Deductions
                <Calculator size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'deductions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-heading font-bold">Tax Deductions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deductionsList.map((ded) => (
                <div key={ded.id} className="p-4 bg-gray-50 dark:bg-navy-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{ded.label}</h3>
                    <span className="text-xs text-emerald-600 font-medium">Max: {ded.limit}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{ded.description}</p>
                  <input
                    type="number"
                    value={formData.deductions[ded.id] || ''}
                    onChange={(e) => handleDeductionChange(ded.id, e.target.value)}
                    className="input"
                    placeholder="Amount ₹"
                  />
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <label className="label">Upload Investment Proofs (Optional)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {[
                  { key: 'form16', label: 'Form 16' },
                  { key: 'investmentProof', label: '80C Proof' },
                  { key: 'bankStatement', label: 'Bank Statement' },
                ].map((doc) => (
                  <div key={doc.key} className="text-center">
                    <label className="block p-4 border-2 border-dashed rounded-xl cursor-pointer hover:border-maroon-500 transition-colors">
                      <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                      <span className="text-sm">{doc.label}</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(doc.key, e.target.files[0])}
                        accept=".pdf,.jpg,.png"
                      />
                    </label>
                    {documents[doc.key] && (
                      <p className="text-xs text-emerald-600 mt-1">{documents[doc.key].name}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep('income')}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep('preview')}
                className="btn-primary flex items-center gap-2"
              >
                Next: Preview
                <CheckCircle size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {currentStep === 'preview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-heading font-bold">Preview & Tax Calculation</h2>

            {!calculatedTax ? (
              <div className="text-center py-12">
                <Calculator size={64} className="mx-auto mb-4 text-maroon-600" />
                <p className="text-gray-500 mb-6">Click below to calculate your tax liability</p>
                <button
                  onClick={calculateTax}
                  disabled={isCalculating}
                  className="btn-primary flex items-center gap-2 mx-auto"
                >
                  {isCalculating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator size={18} />
                      Calculate Tax
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tax Summary */}
                <div className="bg-gradient-to-r from-maroon-100 to-gold-100 dark:from-maroon-900/30 dark:to-gold-900/30 p-6 rounded-xl">
                  <h3 className="font-bold text-lg mb-4">Tax Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white dark:bg-navy-800 rounded-lg">
                      <p className="text-xs text-gray-500">Total Income</p>
                      <p className="text-xl font-bold">₹{calculatedTax.totalIncome.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-navy-800 rounded-lg">
                      <p className="text-xs text-gray-500">Taxable Income</p>
                      <p className="text-xl font-bold">₹{calculatedTax.taxableIncome.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-navy-800 rounded-lg">
                      <p className="text-xs text-gray-500">Tax Amount</p>
                      <p className="text-xl font-bold text-maroon-600">₹{calculatedTax.totalTax.toLocaleString()}</p>
                    </div>
                    <div className={`text-center p-3 bg-white dark:bg-navy-800 rounded-lg ${calculatedTax.refund > 0 ? 'text-emerald-600' : ''}`}>
                      <p className="text-xs text-gray-500">{calculatedTax.refund >= 0 ? 'Refund Due' : 'Tax Payable'}</p>
                      <p className="text-xl font-bold">{calculatedTax.refund >= 0 ? '+' : ''}₹{Math.abs(calculatedTax.refund).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Form 16 / Documents */}
                <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle size={24} className="text-emerald-600" />
                  <div className="flex-1">
                    <p className="font-medium">Form 16 & Documents Uploaded</p>
                    <p className="text-sm text-gray-500">Ready for e-filing verification</p>
                  </div>
                  <button className="btn-secondary flex items-center gap-2">
                    <Download size={16} />
                    Download ITR Form
                  </button>
                </div>

                {/* Bank Details */}
                <div className="p-4 bg-gray-50 dark:bg-navy-800 rounded-xl">
                  <h3 className="font-semibold mb-4">Refund Bank Account</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Bank Account Number</label>
                      <input
                        type="text"
                        value={formData.bankAccount}
                        onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                        className="input"
                        placeholder="Account number"
                      />
                    </div>
                    <div>
                      <label className="label">IFSC Code</label>
                      <input
                        type="text"
                        value={formData.ifsc}
                        onChange={(e) => handleInputChange('ifsc', e.target.value.toUpperCase())}
                        className="input"
                        placeholder="SBIN0001234"
                        maxLength={11}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200">
                  <AlertCircle size={20} className="text-amber-600" />
                  <p className="text-sm">Please verify all details before submitting. Once verified, your ITR will be filed electronically.</p>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentStep('deductions')}
                    className="btn-secondary"
                  >
                    Back to Deductions
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FileSignature size={18} />
                    File ITR Now
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}