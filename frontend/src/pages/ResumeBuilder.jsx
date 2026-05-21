import React, { useState } from 'react';
import { ResumeProvider } from '../context/ResumeContext';
import { FormWizard } from '../components/ResumeBuilder/FormWizard';
import { FileText, Save, History, RotateCcw, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const STEPS = [
  'Personal Info',
  'Summary',
  'Skills',
  'Experience',
  'Education',
  'Projects',
  'Certifications',
  'Languages',
  'Preview',
];

const ResumeBuilderPage = () => {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <ResumeProvider>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="/harshita ai.png" alt="Harshita AI" className="w-12 h-12" />
            <div>
              <h1 className="text-3xl font-heading font-bold text-navy-950 dark:text-white flex items-center gap-3">
                Resume Maker <span className="text-maroon-600">AI</span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Build your professional identity with 20-armed AI precision</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <History className="w-4 h-4" />
              <span>Drafts</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </Button>
            <Button variant="primary" size="sm" className="gap-2">
              <Save className="w-4 h-4" />
              <span>Save</span>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="card p-4 sticky top-24">
              <nav className="space-y-1">
                {STEPS.map((step, index) => (
                  <button
                    key={step}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      currentStep === index
                        ? 'bg-maroon-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] ${
                      currentStep === index ? 'bg-white text-maroon-600' : 'bg-gray-200 dark:bg-slate-700'
                    }`}>
                      {index + 1}
                    </div>
                    {step}
                  </button>
                ))}
              </nav>

              <div className="mt-8 p-4 bg-navy-950 rounded-xl border border-gold-500/30">
                <p className="text-gold-400 text-xs font-bold uppercase tracking-wider mb-2">AI Optimization</p>
                <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gold-500 h-full transition-all duration-1000" 
                    style={{ width: `${(currentStep + 1) * (100 / STEPS.length)}%` }} 
                  />
                </div>
                <p className="text-gray-400 text-[10px] mt-2 italic">Step {currentStep + 1} of {STEPS.length}: Refining your professional profile...</p>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            <div className="card p-6 md:p-8 min-h-[600px] shadow-xl relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-maroon-600/5 blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-500/5 blur-[100px] pointer-events-none" />
              
              <FormWizard currentStep={currentStep} setCurrentStep={setCurrentStep} />
            </div>
          </main>
        </div>
      </div>
    </ResumeProvider>
  );
};

export default ResumeBuilderPage;
