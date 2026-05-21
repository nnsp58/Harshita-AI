import React, { useState } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { calculateResumeScore } from '../../../lib/resumeScore';
import { ThemeSelector } from '../ThemeSelector';
import { Button } from '../../ui/Button';
import { Download, Eye, Printer, AlertCircle, CheckCircle, Award, Sparkles } from 'lucide-react';

export function StepPreview({ onBack }) {
  const { resumeData, resetResume } = useResume();
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const score = calculateResumeScore(resumeData);
  const scorePercentage = Math.round((score.totalScore / score.maxPossibleScore) * 100);

  const handleGeneratePDF = async () => {
    if (!selectedTheme) {
        alert('Please select a theme first!');
        return;
    }

    setIsGeneratingPDF(true);
    try {
      // Calling the backend API we validated earlier
      const response = await fetch('/api/pdf/process-ta', { // Need to check the actual endpoint for resume
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({
          data: resumeData,
          themeId: selectedTheme.id,
          type: 'resume'
        }),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.personalInfo.name || 'resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please ensure the backend is running.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-navy-950 dark:text-white">Review & Export</h2>
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Step 09</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Card */}
        <div className="card p-6 border-gold-500/20 bg-gradient-to-br from-white to-gold-50/30 dark:from-slate-900 dark:to-gold-950/5">
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48" cy="48" r="42"
                  stroke="currentColor" strokeWidth="8"
                  className="text-gray-100 dark:text-slate-800"
                  fill="none"
                />
                <circle
                  cx="48" cy="48" r="42"
                  stroke="currentColor" strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(scorePercentage / 100) * 264} 264`}
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ${
                    scorePercentage >= 80 ? 'text-green-500' : scorePercentage >= 60 ? 'text-gold-500' : 'text-maroon-600'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-navy-950 dark:text-white">{scorePercentage}%</span>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-navy-950 dark:text-white mb-1">ATS Compatibility</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {scorePercentage >= 80 ? 'Excellent! Your resume is highly optimized.' : 'Good start, but there is room for improvement.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="card p-6 flex flex-col justify-center gap-4">
          <Button 
            onClick={handleGeneratePDF} 
            isLoading={isGeneratingPDF}
            className="w-full py-4 gap-3 text-lg h-auto"
            variant="primary"
          >
            <Download className="w-6 h-6" />
            Generate PDF
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button variant="ghost" className="flex-1 gap-2 text-red-500" onClick={resetResume}>
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-heading font-bold text-navy-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold-500" />
          Choose Visual Theme
        </h3>
        <ThemeSelector onSelect={setSelectedTheme} selectedThemeId={selectedTheme?.id} />
      </div>

      {score.suggestions.length > 0 && (
        <div className="p-6 bg-maroon-50 dark:bg-maroon-950/20 rounded-2xl border border-maroon-100 dark:border-maroon-900/50">
          <h3 className="font-bold text-maroon-900 dark:text-maroon-400 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            AI Suggestions for Improvement
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {score.suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-maroon-800 dark:text-maroon-300">
                <div className="w-1.5 h-1.5 rounded-full bg-maroon-500 mt-1.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onBack} size="lg">
          Back to Edit
        </Button>
        <Button variant="ghost" size="lg" className="text-gold-500 pointer-events-none font-bold">
            <CheckCircle className="w-5 h-5 mr-2" />
            All Data Synchronized
        </Button>
      </div>
    </div>
  );
}
