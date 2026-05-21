import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { summarySchema } from '../../../lib/formValidation';
import { useResume } from '../../../context/ResumeContext';
import { Button } from '../../ui/Button';
import { Sparkles } from 'lucide-react';

export function StepSummary({ onNext, onBack }) {
  const { resumeData, updateSummary } = useResume();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(summarySchema),
    defaultValues: resumeData.summary,
  });

  const onSubmit = (data) => {
    updateSummary(data.text);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-navy-950 dark:text-white">Professional Summary</h2>
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Step 02</span>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <textarea
            {...register('text')}
            className={`w-full h-64 p-4 rounded-xl border-2 transition-all outline-none bg-white dark:bg-slate-900 dark:text-white ${
              errors.text 
                ? 'border-red-500 ring-4 ring-red-500/10' 
                : 'border-gray-100 dark:border-slate-800 focus:border-maroon-600 focus:ring-4 focus:ring-maroon-600/10'
            }`}
            placeholder="A motivated and detail-oriented professional with experience in..."
          />
          <div className="absolute top-4 right-4">
            <Button type="button" variant="ghost" size="sm" className="text-gold-500 hover:text-gold-600 gap-2 bg-navy-950/5 hover:bg-navy-950/10 dark:bg-white/5">
              <Sparkles className="w-4 h-4" />
              <span>AI Rewrite</span>
            </Button>
          </div>
        </div>
        {errors.text && <p className="text-sm text-red-500 font-medium">{errors.text.message}</p>}
        
        <div className="p-4 bg-navy-50 dark:bg-navy-900/30 rounded-xl border border-navy-100 dark:border-navy-800">
          <h4 className="text-xs font-bold text-navy-900 dark:text-navy-100 uppercase tracking-wider mb-2 flex items-center gap-2">
            💡 Pro Tip
          </h4>
          <p className="text-sm text-navy-700 dark:text-navy-300">
            Write 3-5 sentences highlighting your most important achievements, skills, and career goals. Keep it concise and impactful.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button type="submit" size="lg" className="px-12">
          Next Step
        </Button>
      </div>
    </form>
  );
}
