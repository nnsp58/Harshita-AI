import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Plus, Trash2, Briefcase, PlusCircle } from 'lucide-react';

export function StepExperience({ onNext, onBack }) {
  const { resumeData, addExperience, updateExperience, removeExperience } = useResume();

  const handleDescriptionChange = (id, index, value) => {
    const exp = resumeData.experience.find(e => e.id === id);
    if (exp) {
      const newDesc = [...exp.description];
      newDesc[index] = value;
      updateExperience(id, { description: newDesc });
    }
  };

  const addBulletPoint = (id) => {
    const exp = resumeData.experience.find(e => e.id === id);
    if (exp) {
      updateExperience(id, { description: [...exp.description, ''] });
    }
  };

  const removeBulletPoint = (id, index) => {
    const exp = resumeData.experience.find(e => e.id === id);
    if (exp && exp.description.length > 1) {
      const newDesc = exp.description.filter((_, i) => i !== index);
      updateExperience(id, { description: newDesc });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-navy-950 dark:text-white">Work Experience</h2>
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Step 04</span>
      </div>

      <div className="space-y-8">
        {resumeData.experience.map((exp, expIndex) => (
          <div key={exp.id} className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="absolute -left-3 top-6 p-2 bg-maroon-600 rounded-lg text-white shadow-lg">
              <Briefcase className="w-4 h-4" />
            </div>
            
            <div className="flex justify-between items-start mb-6 pl-4">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">Experience #{expIndex + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeExperience(exp.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pl-4">
              <Input
                label="Company *"
                placeholder="Google, Microsoft, etc."
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
              />
              <Input
                label="Role / Title *"
                placeholder="Senior Software Engineer"
                value={exp.role}
                onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
              />
              <Input
                label="Duration *"
                placeholder="Jan 2020 - Present"
                value={exp.duration}
                onChange={(e) => updateExperience(exp.id, { duration: e.target.value })}
              />
            </div>

            <div className="space-y-3 pl-4 mt-6">
              <label className="label text-xs uppercase tracking-widest font-bold text-gray-400">Key Responsibilities & Achievements</label>
              {exp.description.map((point, pIndex) => (
                <div key={pIndex} className="flex gap-2">
                  <div className="flex-1">
                    <textarea
                      value={point}
                      onChange={(e) => handleDescriptionChange(exp.id, pIndex, e.target.value)}
                      className="w-full p-3 text-sm rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 focus:border-gold-500 outline-none transition-all min-h-[60px]"
                      placeholder="• Led a team of 5 to deliver..."
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBulletPoint(exp.id, pIndex)}
                    className="text-gray-300 hover:text-red-500"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addBulletPoint(exp.id)}
                className="text-gold-500 hover:text-gold-600 gap-2 text-xs font-bold uppercase"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Bullet Point</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addExperience}
        className="w-full py-6 border-dashed border-2 hover:border-maroon-500 hover:text-maroon-600 transition-all gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add Work Experience</span>
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
