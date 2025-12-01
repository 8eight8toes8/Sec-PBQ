
import React, { useMemo } from 'react';
import { PracticeQuestion } from '../types';

interface QuizSetupModalProps {
  questions: PracticeQuestion[];
  missedQuestionIds: number[];
  onStart: (mode: 'random' | 'review' | 'domain', domain?: string) => void;
  onClose: () => void;
}

const QuizSetupModal: React.FC<QuizSetupModalProps> = ({ questions, missedQuestionIds, onStart, onClose }) => {
  
  // Extract unique domains
  const domains = useMemo(() => {
    const d = new Set(questions.map(q => q.domain));
    return Array.from(d).sort();
  }, [questions]);

  const handleDomainSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
        onStart('domain', e.target.value);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col border border-gray-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
               <i className="fas fa-graduation-cap text-2xl"></i>
            </div>
            <div>
               <h2 className="text-2xl font-bold text-gray-800">Practice Session Setup</h2>
               <p className="text-sm text-gray-500">Customize your learning experience</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Option 1: Quick Shuffle */}
            <button 
                onClick={() => onStart('random')}
                className="group relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all text-center h-full"
            >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                    <i className="fas fa-random"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Quick Shuffle</h3>
                <p className="text-sm text-gray-500">10 random questions from all domains to test general knowledge.</p>
            </button>

            {/* Option 2: Smart Review */}
            <button 
                onClick={() => onStart('review')}
                disabled={missedQuestionIds.length === 0}
                className={`group relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all text-center h-full
                    ${missedQuestionIds.length === 0 
                        ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed' 
                        : 'border-orange-100 hover:border-orange-500 hover:bg-orange-50 cursor-pointer'
                    }
                `}
            >
                {missedQuestionIds.length > 0 && (
                    <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        {missedQuestionIds.length} Queued
                    </span>
                )}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform ${missedQuestionIds.length === 0 ? 'bg-gray-200 text-gray-400' : 'bg-orange-100 text-orange-600'}`}>
                    <i className="fas fa-recycle"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Weakness Review</h3>
                <p className="text-sm text-gray-500">
                    {missedQuestionIds.length === 0 
                        ? "No missed questions yet. Good job!" 
                        : "Focus on the specific questions you answered incorrectly in the past."}
                </p>
            </button>

            {/* Option 3: Domain Focus (Full Width) */}
            <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <i className="fas fa-layer-group text-purple-600 text-xl"></i>
                    <h3 className="text-lg font-bold text-gray-800">Domain Deep Dive</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Select a specific CompTIA Security+ domain to practice.</p>
                
                <div className="relative">
                    <select 
                        onChange={handleDomainSelect}
                        defaultValue=""
                        className="w-full p-3 pl-4 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-700 cursor-pointer hover:border-purple-300 transition-colors"
                    >
                        <option value="" disabled>Select a Domain...</option>
                        {domains.map(domain => {
                            const count = questions.filter(q => q.domain === domain).length;
                            return (
                                <option key={domain} value={domain}>
                                    {domain} ({count} questions)
                                </option>
                            );
                        })}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                        <i className="fas fa-chevron-down"></i>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default QuizSetupModal;
