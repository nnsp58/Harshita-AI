import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_RESUME_DATA } from '../lib/types';

const ResumeContext = createContext(undefined);

export function ResumeProvider({ children }) {
  const [resumeData, setResumeData] = useLocalStorage(
    'resume-data',
    DEFAULT_RESUME_DATA
  );

  const updateResumeData = useCallback((data) => {
    setResumeData(prev => ({ ...prev, ...data }));
  }, [setResumeData]);

  const updatePersonalInfo = useCallback((data) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...data },
    }));
  }, [setResumeData]);

  const updateSummary = useCallback((text) => {
    setResumeData(prev => ({
      ...prev,
      summary: { text },
    }));
  }, [setResumeData]);

  const addSkill = useCallback(() => {
    const newSkill = {
      id: `skill-${Date.now()}`,
      name: '',
      level: 'beginner',
    };
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
  }, [setResumeData]);

  const updateSkill = useCallback((id, data) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(skill =>
        skill.id === id ? { ...skill, ...data } : skill
      ),
    }));
  }, [setResumeData]);

  const removeSkill = useCallback((id) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id),
    }));
  }, [setResumeData]);

  const addExperience = useCallback(() => {
    const newExp = {
      id: `exp-${Date.now()}`,
      company: '',
      role: '',
      duration: '',
      description: [''],
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }));
  }, [setResumeData]);

  const updateExperience = useCallback((id, data) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, ...data } : exp
      ),
    }));
  }, [setResumeData]);

  const removeExperience = useCallback((id) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  }, [setResumeData]);

  const addEducation = useCallback(() => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      field: '',
      year: '',
      grade: '',
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  }, [setResumeData]);

  const updateEducation = useCallback((id, data) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, ...data } : edu
      ),
    }));
  }, [setResumeData]);

  const removeEducation = useCallback((id) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  }, [setResumeData]);

  const addProject = useCallback(() => {
    const newProject = {
      id: `proj-${Date.now()}`,
      name: '',
      description: [''],
      technologies: [],
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  }, [setResumeData]);

  const updateProject = useCallback((id, data) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, ...data } : proj
      ),
    }));
  }, [setResumeData]);

  const removeProject = useCallback((id) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id),
    }));
  }, [setResumeData]);

  const addCertification = useCallback(() => {
    const newCert = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      year: '',
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert],
    }));
  }, [setResumeData]);

  const updateCertification = useCallback((id, data) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert =>
        cert.id === id ? { ...cert, ...data } : cert
      ),
    }));
  }, [setResumeData]);

  const removeCertification = useCallback((id) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id),
    }));
  }, [setResumeData]);

  const addLanguage = useCallback(() => {
    const newLang = {
      id: `lang-${Date.now()}`,
      name: '',
      proficiency: '',
    };
    setResumeData(prev => ({
      ...prev,
      languages: [...prev.languages, newLang],
    }));
  }, [setResumeData]);

  const updateLanguage = useCallback((id, data) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.map(lang =>
        lang.id === id ? { ...lang, ...data } : lang
      ),
    }));
  }, [setResumeData]);

  const removeLanguage = useCallback((id) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id),
    }));
  }, [setResumeData]);

  const resetResume = useCallback(() => {
    setResumeData(DEFAULT_RESUME_DATA);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('resume-data');
    }
  }, [setResumeData]);

  const saveDraft = useCallback((name) => {
    const draftName = name || `Draft ${new Date().toLocaleDateString()}`;
    const draftKey = `resume-draft-${draftName}`;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(draftKey, JSON.stringify(resumeData));
    }
  }, [resumeData]);

  const loadDraft = useCallback((draftKey) => {
    if (typeof window !== 'undefined') {
      const draft = window.localStorage.getItem(draftKey);
      if (draft) {
        setResumeData(JSON.parse(draft));
      }
    }
  }, [setResumeData]);

  const getSavedDrafts = useCallback(() => {
    if (typeof window === 'undefined') return [];
    const keys = Object.keys(window.localStorage).filter(key =>
      key.startsWith('resume-draft-')
    );
    return keys;
  }, []);

  const clearDrafts = useCallback(() => {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(window.localStorage).filter(key =>
        key.startsWith('resume-draft-')
      );
      keys.forEach(key => window.localStorage.removeItem(key));
    }
  }, []);

  const value = {
    resumeData,
    updatePersonalInfo,
    updateSummary,
    addSkill,
    updateSkill,
    removeSkill,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addProject,
    updateProject,
    removeProject,
    addCertification,
    updateCertification,
    removeCertification,
    addLanguage,
    updateLanguage,
    removeLanguage,
    resetResume,
    saveDraft,
    loadDraft,
    getSavedDrafts,
    clearDrafts,
    updateResumeData,
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
