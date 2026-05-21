const MAX_SECTION_SCORES = {
  personalInfo: 15,
  summary: 15,
  skills: 20,
  experience: 25,
  education: 15,
  projects: 10,
  certifications: 5,
  languages: 5,
};

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasQuantifiableAchievements(description) {
  const patterns = [
    /\d+%/, // percentages
    /\$\d+/, // dollar amounts
    /\d+\s*(million|billion|k|thousand)/i, // large numbers
    /increased|decreased|improved|reduced|saved|generated|grew/i, // action verbs with numbers nearby
  ];
  return patterns.some(pattern => pattern.test(description));
}

function countActionBullets(bullets) {
  const actionVerbs = [
    'managed', 'developed', 'created', 'implemented', 'led', 'designed',
    'built', 'launched', 'increased', 'decreased', 'improved', 'optimized',
    'coordinated', 'analyzed', 'achieved', 'delivered', 'established',
    'streamlined', 'enhanced', 'reduced', 'expanded', 'negotiated'
  ];
  return bullets.filter(bullet =>
    actionVerbs.some(verb => bullet.toLowerCase().startsWith(verb))
  ).length;
}

export function calculateResumeScore(resumeData) {
  const sections = [];
  const suggestions = [];

  // Personal Info Score (15 max)
  let personalScore = 0;
  const personalInfoFeedback = [];

  if (resumeData.personalInfo.name) personalScore += 3;
  if (resumeData.personalInfo.email) personalScore += 3;
  if (resumeData.personalInfo.phone) personalScore += 3;
  if (resumeData.personalInfo.location) personalScore += 2;
  if (resumeData.personalInfo.linkedin) personalScore += 2;
  if (resumeData.personalInfo.portfolio) personalScore += 2;

  if (!resumeData.personalInfo.name) personalInfoFeedback.push('Add your full name');
  if (!resumeData.personalInfo.email) personalInfoFeedback.push('Provide a professional email address');
  if (!resumeData.personalInfo.phone) personalInfoFeedback.push('Include your phone number');
  if (!resumeData.personalInfo.linkedin) personalInfoFeedback.push('Add your LinkedIn profile URL');

  if (resumeData.personalInfo.photo) {
    personalScore += 1;
  } else {
    personalInfoFeedback.push('Consider adding a professional photo (optional)');
  }

  sections.push({
    name: 'Personal Information',
    score: personalScore,
    maxScore: MAX_SECTION_SCORES.personalInfo,
    feedback: personalInfoFeedback,
  });

  // Summary Score (15 max)
  let summaryScore = 0;
  const summaryFeedback = [];

  if (resumeData.summary.text) {
    const wordCount = countWords(resumeData.summary.text);
    if (wordCount >= 50) {
      summaryScore += 10;
    } else {
      summaryFeedback.push('Expand your summary to 50+ words');
    }

    const hasKeywords = /\b(senior|junior|lead|manager|engineer|developer|designer|analyst|specialist|professional)\b/i
      .test(resumeData.summary.text);
    if (hasKeywords) {
      summaryScore += 3;
    } else {
      summaryFeedback.push('Include relevant job title or industry keywords in your summary');
    }

    if (wordCount <= 200) {
      summaryScore += 2;
    } else {
      summaryFeedback.push('Keep summary concise (under 200 words recommended)');
    }
  } else {
    summaryFeedback.push('Add a professional summary to highlight your key qualifications');
  }

  sections.push({
    name: 'Professional Summary',
    score: summaryScore,
    maxScore: MAX_SECTION_SCORES.summary,
    feedback: summaryFeedback,
  });

  // Skills Score (20 max)
  let skillsScore = 0;
  const skillsFeedback = [];

  if (resumeData.skills.length >= 5) {
    skillsScore += 10;
  } else {
    skillsFeedback.push('Add at least 5 relevant skills');
  }

  const levels = new Set(resumeData.skills.map(s => s.level).filter(Boolean));
  const levelVariety = levels.size;
  if (levelVariety >= 1) {
    skillsScore += 5;
    if (levelVariety >= 2) {
      skillsScore += 3;
    }
  } else {
    skillsFeedback.push('Specify proficiency levels for your skills');
  }

  const techSkills = resumeData.skills.filter(s =>
    /react|vue|angular|node|python|java|aws|azure|docker|kubernetes|sql|nosql/i.test(s.name)
  ).length;
  if (techSkills >= 3) {
    skillsScore += 2;
  }

  sections.push({
    name: 'Skills',
    score: skillsScore,
    maxScore: MAX_SECTION_SCORES.skills,
    feedback: skillsFeedback,
  });

  // Experience Score (25 max)
  let expScore = 0;
  const expFeedback = [];

  if (resumeData.experience.length >= 1) expScore += 5;
  if (resumeData.experience.length >= 2) expScore += 5;

  let totalBullets = 0;
  let totalActionBullets = 0;
  let bulletWithNumbers = 0;

  resumeData.experience.forEach(exp => {
    totalBullets += exp.description.length;
    totalActionBullets += countActionBullets(exp.description);
    exp.description.forEach(bullet => {
      if (/\d+/.test(bullet)) bulletWithNumbers++;
    });
  });

  if (totalBullets >= 8) expScore += 5;
  else expFeedback.push('Add more bullet points (aim for 8+)');

  if (totalActionBullets >= 4) expScore += 4;
  else expFeedback.push('Start bullet points with strong action verbs');

  if (bulletWithNumbers >= 3) expScore += 4;
  else expFeedback.push('Include quantifiable achievements with numbers/metrics');

  if (totalBullets >= 2 && resumeData.experience[0]?.description.length) {
    expScore += 2;
  }

  sections.push({
    name: 'Work Experience',
    score: expScore,
    maxScore: MAX_SECTION_SCORES.experience,
    feedback: expFeedback,
  });

  // Education Score (15 max)
  let eduScore = 0;
  const eduFeedback = [];

  if (resumeData.education.length >= 1) {
    eduScore += 10;
    if (resumeData.education.length >= 2) {
      eduScore += 3;
    }
    if (resumeData.education[0].grade) {
      eduScore += 2;
    }
  } else {
    eduFeedback.push('Add your educational background');
  }

  sections.push({
    name: 'Education',
    score: eduScore,
    maxScore: MAX_SECTION_SCORES.education,
    feedback: eduFeedback,
  });

  // Projects Score (10 max)
  let projScore = 0;
  const projFeedback = [];

  if (resumeData.projects.length >= 1) projScore += 5;
  if (resumeData.projects.length >= 2) projScore += 3;

  let projBullets = resumeData.projects.reduce((sum, p) => sum + p.description.length, 0);
  if (projBullets >= 4) projScore += 2;
  else projFeedback.push('Add details to your project descriptions');

  sections.push({
    name: 'Projects',
    score: projScore,
    maxScore: MAX_SECTION_SCORES.projects,
    feedback: projFeedback,
  });

  // Certifications Score (5 max)
  let certScore = resumeData.certifications.length * 2.5;
  if (certScore > 5) certScore = 5;

  sections.push({
    name: 'Certifications',
    score: certScore,
    maxScore: MAX_SECTION_SCORES.certifications,
    feedback: certScore > 0 ? [] : ['Consider adding relevant certifications'],
  });

  // Languages Score (5 max)
  let langScore = resumeData.languages.length >= 1 ? 5 : 0;

  sections.push({
    name: 'Languages',
    score: langScore,
    maxScore: MAX_SECTION_SCORES.languages,
    feedback: langScore > 0 ? [] : ['List languages you know'],
  });

  const totalScore = sections.reduce((sum, s) => sum + s.score, 0);
  const maxPossibleScore = Object.values(MAX_SECTION_SCORES).reduce((sum, s) => sum + s, 0);

  // Overall suggestions
  if (resumeData.experience.length === 0) {
    suggestions.push('Add work experience to significantly improve your resume score');
  }
  if (resumeData.skills.length < 8) {
    suggestions.push('Add more skills to showcase your expertise');
  }
  if (totalBullets < 8) {
    suggestions.push('Add more bullet points with quantifiable results');
  }

  return {
    totalScore: Math.round(totalScore),
    maxPossibleScore,
    sections,
    suggestions,
  };
}
