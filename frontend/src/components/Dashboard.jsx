import { useState } from 'react'
import { BarChart3, Users, MessageSquare, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import PassportPhotoMaker from './tools/PassportPhotoMaker'
import FileCompressor from './tools/FileCompressor'
import TranslatorTool from './tools/TranslatorTool'
import UtilityTools from './tools/UtilityTools'
import DocumentConverter from './tools/DocumentConverter'
import MediaConverter from './tools/MediaConverter'

export default function Dashboard() {
  const [activeView, setActiveView] = useState('analytics')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const menuItems = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'operators', label: 'Operators', icon: Users },
    { id: 'team-chat', label: 'Team Chat', icon: MessageSquare },
    { id: 'logs', label: 'Logs', icon: FileText },
    { id: 'tools', label: 'Tools Hub', icon: FileText }
  ]

  const renderContent = () => {
    switch (activeView) {
      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">125</p>
                <div className="mt-2 text-xs text-green-500 font-medium">↑ 12% from last week</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">98</p>
                <div className="mt-2 text-xs text-gray-400">78.4% completion rate</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">12</p>
                <div className="mt-2 text-xs text-gray-400">Active sessions</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">92%</p>
                <div className="mt-2 text-xs text-purple-400 font-medium">High performance</div>
              </div>
            </div>
          </div>
        )
      case 'operators':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Operators Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(id => (
                <div key={id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                      O{id}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Operator {id}</h3>
                      <p className="text-xs text-gray-500">{id % 2 === 0 ? 'Senior VLE' : 'Junior Staff'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className="text-green-500 font-bold">Active</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Daily Tasks:</span>
                      <span className="font-bold text-gray-700">{15 * id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'team-chat':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Team Communication</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[500px] flex flex-col overflow-hidden">
              <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-gray-50/50">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">O1</div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-sm">
                    Task completed! Waiting for next batch.
                  </div>
                </div>
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 bg-maroon-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">AD</div>
                  <div className="bg-maroon-600 p-3 rounded-2xl rounded-tr-none shadow-sm text-white text-sm">
                    Great work! Initializing new documents now.
                  </div>
                </div>
              </div>
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message to the team..."
                    className="flex-1 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-maroon-500 transition-all text-sm"
                  />
                  <button className="bg-maroon-600 text-white px-6 rounded-xl text-sm font-bold">SEND</button>
                </div>
              </div>
            </div>
          </div>
        )
      case 'logs':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">System Telemetry</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Real-time Event Stream
              </div>
              <div className="p-6 space-y-3 font-mono text-xs">
                <div className="flex gap-4">
                  <span className="text-gray-400">[2024-01-10 10:30:15]</span>
                  <span className="text-green-600 font-bold">SUCCESS</span>
                  <span className="text-gray-700">Task started: Process application VLE-201</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-400">[2024-01-10 10:35:22]</span>
                  <span className="text-green-600 font-bold">SUCCESS</span>
                  <span className="text-gray-700">Task completed: Process application VLE-201</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-400">[2024-01-10 11:00:45]</span>
                  <span className="text-blue-600 font-bold">INFO</span>
                  <span className="text-gray-700">Agent: ITR-Filer started on port 3001</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-gray-400">[2024-01-10 11:15:33]</span>
                  <span className="text-green-600 font-bold">SUCCESS</span>
                  <span className="text-gray-700">Task completed: Generate report - Business Plan</span>
                </div>
              </div>
            </div>
          </div>
        )
      case 'tools':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Tools Hub</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start mb-8">
              <PassportPhotoMaker />
              <FileCompressor />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start mb-8">
              <TranslatorTool />
              <UtilityTools />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
              <DocumentConverter />
              <MediaConverter />
            </div>
          </div>
        )
      default:
        return <div className="p-6">Select a menu item</div>
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-4 flex items-center justify-between">
          {!sidebarCollapsed && <h1 className="text-xl font-bold">Dashboard</h1>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors ${activeView === item.id ? 'bg-blue-100 text-blue-600' : ''
                }`}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  )
}