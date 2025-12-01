import React, { useState } from 'react';
import { pbqModules } from '../data';
import { DifficultyLevel } from '../types';

interface SystemDocsProps {
  onExit: () => void;
}

const SystemDocs: React.FC<SystemDocsProps> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'registry' | 'developer'>('architecture');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModules = pbqModules.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 text-white shadow-md p-4 flex justify-between items-center border-b border-slate-700 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-book"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold">System Documentation</h2>
            <p className="text-xs text-slate-400">Enterprise & Developer Reference</p>
          </div>
        </div>
        <button onClick={onExit} className="text-slate-400 hover:text-white hover:bg-slate-800 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex flex-grow overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
            <div className="p-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Navigation</h3>
                <nav className="space-y-1">
                    <button 
                        onClick={() => setActiveTab('architecture')}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'architecture' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <i className="fas fa-sitemap w-5 text-center"></i> Architecture
                    </button>
                    <button 
                        onClick={() => setActiveTab('registry')}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'registry' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <i className="fas fa-cubes w-5 text-center"></i> Module Registry
                    </button>
                    <button 
                        onClick={() => setActiveTab('developer')}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-3 ${activeTab === 'developer' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <i className="fas fa-code w-5 text-center"></i> Developer Guide
                    </button>
                </nav>
            </div>
            
            <div className="mt-auto p-4 border-t border-gray-200">
                <div className="bg-slate-100 rounded p-3 text-xs text-gray-500">
                    <div className="font-bold text-gray-700 mb-1">Build Info</div>
                    <div>Version: v1.2.0</div>
                    <div>Modules: {pbqModules.length}</div>
                    <div>React: 18.x</div>
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow bg-gray-50 overflow-y-auto p-8">
            
            {/* ARCHITECTURE VIEW */}
            {activeTab === 'architecture' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">System Architecture</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="p-4 border rounded-lg bg-blue-50 border-blue-100 text-center">
                                <div className="text-blue-600 text-3xl mb-2"><i className="fab fa-react"></i></div>
                                <h4 className="font-bold text-blue-900">Frontend</h4>
                                <p className="text-xs text-blue-800 mt-1">React 18 + TypeScript</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-teal-50 border-teal-100 text-center">
                                <div className="text-teal-600 text-3xl mb-2"><i className="fab fa-css3-alt"></i></div>
                                <h4 className="font-bold text-teal-900">Styling</h4>
                                <p className="text-xs text-teal-800 mt-1">Tailwind CSS</p>
                            </div>
                            <div className="p-4 border rounded-lg bg-purple-50 border-purple-100 text-center">
                                <div className="text-purple-600 text-3xl mb-2"><i className="fas fa-database"></i></div>
                                <h4 className="font-bold text-purple-900">Persistence</h4>
                                <p className="text-xs text-purple-800 mt-1">LocalStorage / Session</p>
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 mb-4">Application Data Flow</h3>
                        <div className="relative bg-slate-50 border border-gray-300 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-white px-4 py-2 border rounded shadow-sm w-48 text-center font-bold">App.tsx (Router)</div>
                                <div className="h-6 w-0.5 bg-gray-400"></div>
                                <div className="flex gap-4">
                                    <div className="bg-white px-4 py-2 border rounded shadow-sm w-40 text-center text-xs">AuthModal</div>
                                    <div className="bg-white px-4 py-2 border rounded shadow-sm w-40 text-center text-xs">Dashboard</div>
                                    <div className="bg-white px-4 py-2 border rounded shadow-sm w-40 text-center text-xs font-bold border-blue-400 bg-blue-50">PBQ Component</div>
                                </div>
                                <div className="h-6 w-0.5 bg-gray-400"></div>
                                <div className="bg-white px-4 py-2 border rounded shadow-sm w-64 text-center text-xs">
                                    <span className="text-green-600">onComplete(score)</span> Callback
                                </div>
                                <div className="h-6 w-0.5 bg-gray-400"></div>
                                <div className="bg-white px-4 py-2 border rounded shadow-sm w-64 text-center text-xs">
                                    LocalStorage Update (Progress)
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">File Structure</h3>
                        <ul className="space-y-2 text-sm font-mono text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <li><i className="fas fa-folder text-yellow-500 mr-2"></i> src/</li>
                            <li className="ml-4"><i className="fas fa-file-code text-blue-400 mr-2"></i> App.tsx <span className="text-gray-400">// Main Entry & Routing</span></li>
                            <li className="ml-4"><i className="fas fa-file-code text-blue-400 mr-2"></i> data.ts <span className="text-gray-400">// Module Definitions</span></li>
                            <li className="ml-4"><i className="fas fa-file-code text-blue-400 mr-2"></i> types.ts <span className="text-gray-400">// TypeScript Interfaces</span></li>
                            <li className="ml-4"><i className="fas fa-folder text-yellow-500 mr-2"></i> components/</li>
                            <li className="ml-8"><i className="fas fa-folder text-yellow-500 mr-2"></i> pbqs/ <span className="text-gray-400">// Individual Simulation Components</span></li>
                            <li className="ml-8"><i className="fas fa-file-code text-blue-400 mr-2"></i> StudentDashboard.tsx</li>
                            <li className="ml-8"><i className="fas fa-file-code text-blue-400 mr-2"></i> AuthModal.tsx</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* REGISTRY VIEW */}
            {activeTab === 'registry' && (
                <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Module Registry</h2>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Filter modules..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                            />
                            <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Module Name</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Difficulty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredModules.map(m => (
                                    <tr key={m.id} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-500 text-xs">{m.id}</td>
                                        <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-2">
                                            <i className={`fas ${m.icon} text-gray-400 w-5 text-center`}></i> {m.title}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                                                {m.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                ${m.difficulty === DifficultyLevel.Foundational ? 'bg-green-100 text-green-700' :
                                                  m.difficulty === DifficultyLevel.Intermediate ? 'bg-orange-100 text-orange-700' : 
                                                  'bg-red-100 text-red-700'}
                                            `}>
                                                {m.difficulty}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                            Showing {filteredModules.length} modules.
                        </div>
                    </div>
                </div>
            )}

            {/* DEVELOPER GUIDE */}
            {activeTab === 'developer' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">How to Add a New PBQ</h2>
                        
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">Create Component</h4>
                                    <p className="text-sm text-gray-600 mb-2">Create a new React component in <code>components/pbqs/NewModulePBQ.tsx</code>.</p>
                                    <div className="bg-slate-800 text-blue-300 p-3 rounded text-xs font-mono">
                                        interface Props {'{'} onComplete: (score: number) ={'>'} void; onExit: () ={'>'} void; {'}'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">Register Data</h4>
                                    <p className="text-sm text-gray-600 mb-2">Add a new entry to the `pbqModules` array in <code>data.ts</code>.</p>
                                    <div className="bg-slate-800 text-green-300 p-3 rounded text-xs font-mono">
                                        {'{'} id: 'new_module', title: 'New Module', category: 'Network Security', ... {'}'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                                <div>
                                    <h4 className="font-bold text-gray-800 mb-1">Map Route</h4>
                                    <p className="text-sm text-gray-600 mb-2">Import the component in <code>App.tsx</code> and add it to the `PBQ_COMPONENTS` map.</p>
                                    <div className="bg-slate-800 text-purple-300 p-3 rounded text-xs font-mono">
                                        'new_module': NewModulePBQ,
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md">
                        <h3 className="font-bold text-lg mb-2"><i className="fas fa-rocket"></i> Future Expansion: Modular JSON Engine</h3>
                        <p className="text-blue-100 text-sm leading-relaxed">
                            To support "broader enterprise use" without custom coding, the next major architectural shift will be the <strong>GenericPBQRunner</strong>. 
                            This component will read a JSON schema defining drag-and-drop zones, CLI expectations, or form inputs, allowing instructors to build scenarios via a UI editor rather than React code.
                        </p>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default SystemDocs;