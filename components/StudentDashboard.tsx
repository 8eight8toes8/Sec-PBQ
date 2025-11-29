
import React from 'react';
import { PBQModule, DifficultyLevel } from '../types';

interface StudentDashboardProps {
  username: string;
  progress: Record<string, number>; // Map of moduleID -> high score
  modules: PBQModule[];
  onLogout: () => void;
  onExit: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ username, progress, modules, onLogout, onExit }) => {
  const totalModules = modules.length;
  const completedCount = Object.keys(progress).length;
  const completionPercentage = Math.round((completedCount / totalModules) * 100);
  
  // Fix for potential type inference issue with Object.values + reduce
  const scores: number[] = Object.values(progress);
  const totalScore = scores.reduce((acc, score) => acc + score, 0);
  const averageScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;

  // Calculate stats by difficulty
  const getStatsByDifficulty = (level: DifficultyLevel) => {
    const levelModules = modules.filter(m => m.difficulty === level);
    const completedLevel = levelModules.filter(m => progress[m.id] !== undefined);
    return {
        total: levelModules.length,
        completed: completedLevel.length,
        percent: levelModules.length > 0 ? Math.round((completedLevel.length / levelModules.length) * 100) : 0
    };
  };

  const foundStats = getStatsByDifficulty(DifficultyLevel.Foundational);
  const interStats = getStatsByDifficulty(DifficultyLevel.Intermediate);
  const advStats = getStatsByDifficulty(DifficultyLevel.Advanced);

  const getClearanceLevel = () => {
    if (completionPercentage >= 90) return { title: 'CISO', color: 'bg-purple-600', icon: 'fa-chess-king' };
    if (completionPercentage >= 70) return { title: 'Security Architect', color: 'bg-red-600', icon: 'fa-chess-rook' };
    if (completionPercentage >= 50) return { title: 'Security Analyst', color: 'bg-orange-500', icon: 'fa-shield-alt' };
    if (completionPercentage >= 20) return { title: 'Junior Analyst', color: 'bg-blue-500', icon: 'fa-user-shield' };
    return { title: 'Trainee', color: 'bg-gray-500', icon: 'fa-user' };
  };

  const clearance = getClearanceLevel();

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-id-card"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Student Dashboard</h2>
            <p className="text-xs text-gray-500">User: {username}</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={onLogout} className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg font-bold text-sm transition-colors">
                <i className="fas fa-sign-out-alt"></i> Logout
            </button>
            <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
                <i className="fas fa-times text-2xl"></i>
            </button>
        </div>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
         
         {/* Top Card: User Profile & Main Stats */}
         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl shadow-lg mb-3 ${clearance.color}`}>
                    <i className={`fas ${clearance.icon}`}></i>
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800">{username}</h3>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider ${clearance.color}`}>
                        {clearance.title}
                    </div>
                </div>
            </div>

            <div className="flex-grow grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                    <div className="text-3xl font-bold text-gray-800">{completionPercentage}%</div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Overall Progress</div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2">
                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                    </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                    <div className="text-3xl font-bold text-gray-800">{completedCount}</div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Modules Done</div>
                    <div className="text-xs text-gray-400 mt-1">out of {totalModules}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                    <div className={`text-3xl font-bold ${averageScore >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>{averageScore}%</div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Avg Score</div>
                </div>
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center flex flex-col justify-center items-center">
                    <div className="text-2xl font-bold text-gray-400">
                        {totalModules - completedCount}
                    </div>
                    <div className="text-xs text-gray-500 font-bold uppercase">Remaining</div>
                </div>
            </div>
         </div>

         {/* Difficulty Breakdown */}
         <h3 className="text-lg font-bold text-gray-800 mb-4">Domain Mastery</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-green-500">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-700">Foundational</h4>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">{foundStats.percent}%</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{foundStats.completed} / {foundStats.total} Modules</p>
                <div className="w-full bg-gray-100 h-2 rounded-full">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${foundStats.percent}%` }}></div>
                </div>
            </div>

             <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-orange-500">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-700">Intermediate</h4>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">{interStats.percent}%</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{interStats.completed} / {interStats.total} Modules</p>
                <div className="w-full bg-gray-100 h-2 rounded-full">
                    <div className="bg-orange-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${interStats.percent}%` }}></div>
                </div>
            </div>

             <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-red-600">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-700">Advanced</h4>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">{advStats.percent}%</span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{advStats.completed} / {advStats.total} Modules</p>
                <div className="w-full bg-gray-100 h-2 rounded-full">
                    <div className="bg-red-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${advStats.percent}%` }}></div>
                </div>
            </div>
         </div>

         {/* Recent Activity List */}
         <h3 className="text-lg font-bold text-gray-800 mb-4">Completed Modules</h3>
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {completedCount > 0 ? (
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Module Name</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Difficulty</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Score</th>
                            <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {modules.filter(m => progress[m.id] !== undefined).map(module => (
                            <tr key={module.id} className="hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-800">{module.title}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                        ${module.difficulty === 'foundational' ? 'bg-green-100 text-green-700' : 
                                          module.difficulty === 'intermediate' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}
                                    `}>
                                        {module.difficulty}
                                    </span>
                                </td>
                                <td className="p-4 text-right font-mono font-bold">{progress[module.id]}%</td>
                                <td className="p-4 text-right">
                                    <span className="text-green-600 font-bold text-xs flex items-center justify-end gap-1">
                                        <i className="fas fa-check-circle"></i> Completed
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="p-12 text-center text-gray-400">
                    <i className="fas fa-history text-4xl mb-3"></i>
                    <p>No activity yet. Complete a module to see it here.</p>
                </div>
            )}
         </div>

      </div>
    </div>
  );
};

export default StudentDashboard;
