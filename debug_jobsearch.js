// Debug jobSearchAgent
const { JobSearchAgent } = require('./src/agents/jobSearchAgent');

const agent = new JobSearchAgent();
console.log('Agent created');
console.log('jobDatabase type:', typeof agent.jobDatabase);
console.log('jobDatabase length:', agent.jobDatabase?.length);
console.log('First job:', agent.jobDatabase?.[0]);

// Try calling getAllJobs directly
const result = agent.getAllJobs();
console.log('getAllJobs result:', JSON.stringify(result, null, 2).substring(0, 300));
