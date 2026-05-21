import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Plus, Trash2, FolderGit2, PlusCircle, Tag } from 'lucide-react';

export function StepProjects({ onNext, onBack }) {
  const { resumeData, addProject, updateProject, removeProject } = useResume();

  const handleDescriptionChange = (id, index, value) => {
    const proj = resumeData.projects.find(p => p.id === id);
    if (proj) {
      const newDesc = [...proj.description];
      newDesc[index] = value;
      updateProject(id, { description: newDesc });
    }
  };

  const addBulletPoint = (id) => {
    const proj = resumeData.projects.find(p => p.id === id);
    if (proj) {
      updateProject(id, { description: [...proj.description, ''] });
    }
  };

  const removeBulletPoint = (id, index) => {
    const proj = resumeData.projects.find(p => p.id === id);
    if (proj && proj.description.length > 1) {
      const newDesc = proj.description.filter((_, i) => i !== index);
      updateProject(id, { description: newDesc });
    }
  };

  const toggleTechnology = (id, tech) => {
    const proj = resumeData.projects.find(p => p.id === id);
    if (proj) {
      const techs = proj.technologies.includes(tech)
        ? proj.technologies.filter(t => t !== tech)
        : [...proj.technologies, tech];
      updateProject(id, { technologies: techs });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-navy-950 dark:text-white">Key Projects</h2>
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Step 06</span>
      </div>

      <div className="space-y-8">
        {resumeData.projects.map((proj, index) => (
          <div key={proj.id} className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="absolute -left-3 top-6 p-2 bg-navy-950 rounded-lg text-gold-400 shadow-lg border border-gold-500/30">
              <FolderGit2 className="w-4 h-4" />
            </div>
            
            <div className="flex justify-between items-start mb-6 pl-4">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">Project #{index + 1}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeProject(proj.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="pl-4 space-y-4">
              <Input
                label="Project Name *"
                placeholder="E-commerce App, AI Chatbot, etc."
                value={proj.name}
                onChange={(e) => updateProject(proj.id, { name: e.target.value })}
              />

              <div className="space-y-3 mt-6">
                <label className="label text-xs uppercase tracking-widest font-bold text-gray-400">Project Description</label>
                {proj.description.map((point, pIndex) => (
                  <div key={pIndex} className="flex gap-2">
                    <div className="flex-1">
                      <textarea
                        value={point}
                        onChange={(e) => handleDescriptionChange(proj.id, pIndex, e.target.value)}
                        className="w-full p-3 text-sm rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 focus:border-gold-500 outline-none transition-all min-h-[60px]"
                        placeholder="Describe what you built and how..."
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBulletPoint(proj.id, pIndex)}
                      className="text-gray-300 hover:text-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addBulletPoint(proj.id)}
                  className="text-gold-500 hover:text-gold-600 gap-2 text-xs font-bold uppercase"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Point</span>
                </Button>
              </div>

              <div className="mt-4">
                <label className="label text-xs uppercase tracking-widest font-bold text-gray-400 mb-2 block">Technologies Used</label>
                <div className="flex flex-wrap gap-2">
                  {proj.technologies.map(tech => (
                    <span key={tech} className="bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-gold-500/20">
                      {tech}
                      <button onClick={() => toggleTechnology(proj.id, tech)} className="hover:text-red-500">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="Add tech..."
                      className="text-[10px] px-2 py-1 rounded border border-gray-100 dark:border-slate-800 bg-transparent outline-none focus:border-gold-500 w-24"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          toggleTechnology(proj.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addProject}
        className="w-full py-6 border-dashed border-2 hover:border-navy-500 hover:text-navy-600 transition-all gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add Project</span>
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
