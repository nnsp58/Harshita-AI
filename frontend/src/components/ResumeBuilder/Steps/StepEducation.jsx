import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Plus, Trash2, GraduationCap } from 'lucide-react';

export function StepEducation({ onNext, onBack }) {
  const { resumeData, addEducation, updateEducation, removeEducation } = useResume();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-navy-950 dark:text-white">Education History</h2>
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Step 05</span>
      </div>

      <div className="space-y-6">
        {resumeData.education.map((edu, index) => (
          <div key={edu.id} className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="absolute -left-3 top-6 p-2 bg-gold-500 rounded-lg text-white shadow-lg">
              <GraduationCap className="w-4 h-4" />
            </div>
            
            <div className="flex justify-between items-start mb-6 pl-4">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">Education #{index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeEducation(edu.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
              <Input
                label="Institution *"
                placeholder="University Name"
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
              />
              <Input
                label="Degree *"
                placeholder="B.Tech, MBA, etc."
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
              />
              <Input
                label="Field of Study *"
                placeholder="Computer Science"
                value={edu.field}
                onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Year *"
                  placeholder="2018 - 2022"
                  value={edu.year}
                  onChange={(e) => updateEducation(edu.id, { year: e.target.value })}
                />
                <Input
                  label="Grade/CGPA"
                  placeholder="8.5 CGPA"
                  value={edu.grade}
                  onChange={(e) => updateEducation(edu.id, { grade: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addEducation}
        className="w-full py-6 border-dashed border-2 hover:border-gold-500 hover:text-gold-600 transition-all gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add Education</span>
      </Button>

      <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-slate-800">
        <Button type="button" variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button onClick={onNext} size="lg" className="px-12">
          Next Step
        </Button>
      </div>
    </div>
  );
}
