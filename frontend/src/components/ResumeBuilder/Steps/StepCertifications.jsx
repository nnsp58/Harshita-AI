import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Plus, Trash2, Award } from 'lucide-react';

export function StepCertifications({ onNext, onBack }) {
  const { resumeData, addCertification, updateCertification, removeCertification } = useResume();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-heading font-bold text-navy-950 dark:text-white">Certifications</h2>
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">Step 07</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resumeData.certifications.map((cert, index) => (
          <div key={cert.id} className="relative bg-gray-50 dark:bg-slate-900 p-5 rounded-xl border border-gray-100 dark:border-slate-800 transition-all hover:border-maroon-500/30">
            <div className="flex justify-between items-start mb-4">
              <div className="p-1.5 bg-maroon-600/10 text-maroon-600 rounded">
                <Award className="w-4 h-4" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCertification(cert.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-3">
              <Input
                label="Certification Name *"
                placeholder="AWS Cloud Practitioner, etc."
                value={cert.name}
                onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
              />
              <Input
                label="Issuer *"
                placeholder="Amazon Web Services"
                value={cert.issuer}
                onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
              />
              <Input
                label="Year *"
                placeholder="2023"
                value={cert.year}
                onChange={(e) => updateCertification(cert.id, { year: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addCertification}
        className="w-full py-6 border-dashed border-2 hover:border-maroon-500 hover:text-maroon-600 transition-all gap-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add Certification</span>
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
