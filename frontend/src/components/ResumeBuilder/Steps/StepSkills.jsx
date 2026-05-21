import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Plus, Trash2, Award } from 'lucide-react';

export function StepSkills({ onNext, onBack }) {
  const { resumeData, addSkill, updateSkill, removeSkill } = useResume();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-navy-950 dark:text-white">Technical Skills</h2>
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Step 03</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resumeData.skills.map((skill, index) => (
          <div key={skill.id} className="group relative bg-gray-50 dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 transition-all hover:border-gold-500/30">
            <div className="flex gap-4 items-end">
              <div className="flex-1 space-y-3">
                <Input
                  label={`Skill #${index + 1}`}
                  placeholder="e.g. JavaScript, AWS, Marketing"
                  value={skill.name}
                  onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                />
                
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Level:</label>
                  <div className="flex gap-1">
                    {['beginner', 'intermediate', 'expert'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => updateSkill(skill.id, { level: lvl })}
                        className={`px-2 py-1 text-[10px] rounded uppercase font-bold transition-all ${
                          skill.level === lvl
                            ? 'bg-gold-500 text-white'
                            : 'bg-gray-200 dark:bg-slate-800 text-gray-500 hover:bg-gray-300'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSkill(skill.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addSkill}
        className="w-full py-6 border-dashed border-2 hover:border-gold-500 hover:text-gold-600 transition-all gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add Another Skill</span>
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
