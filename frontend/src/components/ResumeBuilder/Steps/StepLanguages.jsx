import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Plus, Trash2, Languages } from 'lucide-react';

export function StepLanguages({ onNext, onBack }) {
  const { resumeData, addLanguage, updateLanguage, removeLanguage } = useResume();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-navy-950 dark:text-white">Languages</h2>
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Step 08</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resumeData.languages.map((lang, index) => (
          <div key={lang.id} className="relative bg-navy-50 dark:bg-navy-900/20 p-5 rounded-xl border border-navy-100 dark:border-navy-800 transition-all hover:border-navy-500/30">
            <div className="flex justify-between items-start mb-4">
              <div className="p-1.5 bg-navy-600 text-white rounded">
                <Languages className="w-4 h-4" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeLanguage(lang.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-3">
              <Input
                label="Language *"
                placeholder="English, Hindi, etc."
                value={lang.name}
                onChange={(e) => updateLanguage(lang.id, { name: e.target.value })}
              />
              <Input
                label="Proficiency *"
                placeholder="Fluent, Native, Professional..."
                value={lang.proficiency}
                onChange={(e) => updateLanguage(lang.id, { proficiency: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addLanguage}
        className="w-full py-6 border-dashed border-2 hover:border-navy-500 hover:text-navy-600 transition-all gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add Language</span>
      </Button>

      <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button onClick={onNext} size="lg" className="px-12">
          Preview Resume
        </Button>
      </div>
    </div>
  );
}
