import { useState, useEffect } from 'react';

export default function AgentDashboard() {
  const [agents, setAgents] = useState([]);
  const [skills, setSkills] = useState([]);
  
  // Mock data load since this is a frontend view of the backend registry.
  // In a real scenario, this would fetch from an API route like /api/admin/registries
  useEffect(() => {
    setTimeout(() => {
      setAgents([
        { id: 'documentAIAgent', name: 'Document AI Agent', status: 'Active', duplicate: false },
        { id: 'masterAgent', name: 'Master Agent', status: 'Active', duplicate: false },
        { id: 'legalDraftAgent', name: 'Legal Draft Agent', status: 'Active', duplicate: false },
      ]);
      
      setSkills([
        { id: 'ResumeSkill', mappedAgent: 'documentAIAgent', isWrapper: false },
        { id: 'ApplicationSkill', mappedAgent: 'documentAIAgent', isWrapper: false },
      { id: 'MathSkill', mappedAgent: 'MathSkillWrapperAgent', isWrapper: true },
    ]);
  }, []);

  const totalAgents = agents.length;
  const totalSkills = skills.length;
  const mappedSkills = skills.filter(s => s.mappedAgent).length;
  const unmappedSkills = totalSkills - mappedSkills;
  const duplicateAgents = agents.filter(a => a.duplicate).length;
  const inactiveAgents = agents.filter(a => a.status === 'Inactive').length;

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">Master AI: Agent Registry Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-gray-400 text-sm">Total Agents</h2>
          <p className="text-4xl font-bold text-blue-400">{totalAgents}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-gray-400 text-sm">Total Skills</h2>
          <p className="text-4xl font-bold text-green-400">{totalSkills}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-gray-400 text-sm">Mapped Skills</h2>
          <p className="text-4xl font-bold text-purple-400">{mappedSkills}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-red-900">
          <h2 className="text-gray-400 text-sm">Unmapped Skills</h2>
          <p className="text-4xl font-bold text-red-400">{unmappedSkills}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-orange-900">
          <h2 className="text-gray-400 text-sm">Duplicate Agents</h2>
          <p className="text-4xl font-bold text-orange-400">{duplicateAgents}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2 className="text-gray-400 text-sm">Inactive Agents</h2>
          <p className="text-4xl font-bold text-gray-400">{inactiveAgents}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Active Agents</h2>
          <ul className="space-y-3">
            {agents.map(agent => (
              <li key={agent.id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                <span>{agent.name}</span>
                <span className="text-xs px-2 py-1 bg-green-900 text-green-300 rounded-full">{agent.status}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Skill Mappings</h2>
          <ul className="space-y-3">
            {skills.map(skill => (
              <li key={skill.id} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                <span>{skill.id}</span>
                <span className="text-xs text-gray-300">
                  {skill.isWrapper ? '⚡ Dynamic Wrapper' : '✅ Reused Agent'}
                  {' -> '}
                  <span className="font-bold text-blue-300">{skill.mappedAgent}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
