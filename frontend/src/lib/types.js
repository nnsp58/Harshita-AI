export const THEMES = [
  {
    id: 'modern',
    name: 'Modern',
    primaryColor: '#2563eb',
    accentColor: '#3b82f6',
    fontFamily: 'Inter',
    description: 'Sleek design with gradient accents and bold headers',
  },
  {
    id: 'clean',
    name: 'Clean',
    primaryColor: '#000000',
    accentColor: '#666666',
    fontFamily: 'Arial',
    description: 'High contrast, minimalist approach',
  },
  {
    id: 'professional',
    name: 'Professional',
    primaryColor: '#1e3a8a',
    accentColor: '#3b82f6',
    fontFamily: 'Georgia',
    description: 'Traditional style with serif headings',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    primaryColor: '#1e40af',
    accentColor: '#3b82f6',
    fontFamily: 'Roboto',
    description: 'Structured, formal business look',
  },
  {
    id: 'creative',
    name: 'Creative',
    primaryColor: '#7c3aed',
    accentColor: '#a78bfa',
    fontFamily: 'Poppins',
    description: 'Unique layout with color blocks',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    primaryColor: '#374151',
    accentColor: '#6b7280',
    fontFamily: 'Helvetica',
    description: 'Ultra-simple, focused on content',
  },
];

export const DEFAULT_RESUME_DATA = {
  personalInfo: {
    name: 'Aryan Sharma',
    email: 'aryan.sharma@example.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    linkedin: 'https://linkedin.com/in/aryansharma-dev',
    portfolio: 'https://aryan-sharma.dev',
    photo: undefined,
  },
  summary: {
    text: 'Innovative Full Stack Developer with over 5 years of experience in designing and developing high-performance web and mobile applications. Expert in React, Next.js, and Node.js with a strong focus on building scalable architectures and seamless user experiences. Proven track record of leading development teams and delivering projects ahead of schedule.',
  },
  skills: [
    { id: '1', name: 'React.js', level: 'expert' },
    { id: '2', name: 'Next.js', level: 'expert' },
    { id: '3', name: 'TypeScript', level: 'expert' },
    { id: '4', name: 'Node.js', level: 'intermediate' },
    { id: '5', name: 'Tailwind CSS', level: 'expert' },
    { id: '6', name: 'PostgreSQL', level: 'intermediate' },
    { id: '7', name: 'AWS', level: 'intermediate' },
    { id: '8', name: 'React Native', level: 'expert' },
  ],
  experience: [
    {
      id: 'e1',
      company: 'TechFlow Solutions',
      role: 'Senior Full Stack Developer',
      duration: 'Jan 2021 - Present',
      description: [
        'Led a team of 5 developers to build a cloud-based SaaS platform using Next.js and AWS, increasing client onboarding by 40%.',
        'Implemented microservices architecture for real-time data processing, reducing latency by 25%.',
        'Optimized frontend performance, achieving a 95+ score on Lighthouse for all core product pages.'
      ],
    },
    {
      id: 'e2',
      company: 'AppInnovate Studio',
      role: 'Frontend Developer',
      duration: 'June 2018 - Dec 2020',
      description: [
        'Developed 10+ responsive web applications for international clients using React and Redux.',
        'Collaborated with designers to implement pixel-perfect UI components and animations.',
        'Integrated RESTful APIs and optimized state management for better data flow.'
      ],
    },
  ],
  education: [
    {
      id: 'edu1',
      institution: 'Indian Institute of Technology (IIT)',
      degree: 'B.Tech',
      field: 'Computer Science & Engineering',
      year: '2014 - 2018',
      grade: '8.5 CGPA',
    },
  ],
  projects: [
    {
      id: 'p1',
      name: 'E-Commerce Mobile App',
      description: [
        'Built a cross-platform mobile app using React Native with features like product search, cart, and payment gateway integration.',
        'Used Firebase for real-time database and push notifications.'
      ],
      technologies: ['React Native', 'Firebase', 'Stripe API'],
    },
    {
      id: 'p2',
      name: 'AI Portfolio Builder',
      description: [
        'Developed a web app that generates professional portfolios using AI-driven templates.',
        'Implemented drag-and-drop features and real-time editing.'
      ],
      technologies: ['Next.js', 'OpenAI API', 'Framer Motion'],
    },
  ],
  certifications: [
    {
      id: 'c1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      year: '2022',
    },
    {
      id: 'c2',
      name: 'Meta Frontend Developer Professional Certificate',
      issuer: 'Coursera',
      year: '2021',
    },
  ],
  languages: [
    { id: 'l1', name: 'English', proficiency: 'Fluent' },
    { id: 'l2', name: 'Hindi', proficiency: 'Native' },
  ],
};
