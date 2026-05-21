import React from 'react';
import { StepPersonalInfo } from './Steps/StepPersonalInfo';
import { StepSummary } from './Steps/StepSummary';
import { StepSkills } from './Steps/StepSkills';
import { StepExperience } from './Steps/StepExperience';
import { StepEducation } from './Steps/StepEducation';
import { StepProjects } from './Steps/StepProjects';
import { StepCertifications } from './Steps/StepCertifications';
import { StepLanguages } from './Steps/StepLanguages';
import { StepPreview } from './Steps/StepPreview';

export function FormWizard({ currentStep, setCurrentStep }) {
  const goToNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 8));
  };

  const goToPrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepPersonalInfo onNext={goToNext} onBack={goToPrevious} />;
      case 1:
        return <StepSummary onNext={goToNext} onBack={goToPrevious} />;
      case 2:
        return <StepSkills onNext={goToNext} onBack={goToPrevious} />;
      case 3:
        return <StepExperience onNext={goToNext} onBack={goToPrevious} />;
      case 4:
        return <StepEducation onNext={goToNext} onBack={goToPrevious} />;
      case 5:
        return <StepProjects onNext={goToNext} onBack={goToPrevious} />;
      case 6:
        return <StepCertifications onNext={goToNext} onBack={goToPrevious} />;
      case 7:
        return <StepLanguages onNext={goToNext} onBack={goToPrevious} />;
      case 8:
        return <StepPreview onBack={goToPrevious} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {renderStep()}
    </div>
  );
}
