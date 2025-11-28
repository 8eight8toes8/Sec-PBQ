import React, { useState, useEffect, useMemo } from 'react';
import { DifficultyLevel, PracticeQuestion } from './types';
import { pbqModules } from './data';
import { practiceQuestions } from './questions';
import FilterTabs from './components/FilterTabs';
import PBQCard from './components/PBQCard';
import QuizInterface from './components/QuizInterface';
import QuickReference from './components/QuickReference';
import AuthModal from './components/AuthModal';
import StudentDashboard from './components/StudentDashboard';
import PasswordPolicyPBQ from './components/pbqs/PasswordPolicyPBQ';
import CommonPortsPBQ from './components/pbqs/CommonPortsPBQ';
import BasicAccessControlPBQ from './components/pbqs/BasicAccessControlPBQ';
import SIEMLogAnalysisPBQ from './components/pbqs/SIEMLogAnalysisPBQ';
import NetworkLabelingPBQ from './components/pbqs/NetworkLabelingPBQ';
import IncidentResponsePBQ from './components/pbqs/IncidentResponsePBQ';
import FirewallPBQ from './components/pbqs/FirewallPBQ';
import RiskAssessmentPBQ from './components/pbqs/RiskAssessmentPBQ';
import CloudSecurityPBQ from './components/pbqs/CloudSecurityPBQ';
import VulnerabilityManagementPBQ from './components/pbqs/VulnerabilityManagementPBQ';
import WirelessConfigPBQ from './components/pbqs/WirelessConfigPBQ';
import AccessControlMatrixPBQ from './components/pbqs/AccessControlMatrixPBQ';
import CryptographyBasicsPBQ from './components/pbqs/CryptographyBasicsPBQ';
import SecureProtocolsPBQ from './components/pbqs/SecureProtocolsPBQ';
import PKICertificatePBQ from './components/pbqs/PKICertificatePBQ';
import MultiZoneFirewallPBQ from './components/pbqs/MultiZoneFirewallPBQ';
import DDoSProtectionPBQ from './components/pbqs/DDoSProtectionPBQ';
import DigitalForensicsPBQ from './components/pbqs/DigitalForensicsPBQ';

// Map of ID to Component for dynamic rendering
const PBQ_COMPONENTS: Record<string, React.FC<any>> = {
  'password_policy': PasswordPolicyPBQ,
  'common_ports': CommonPortsPBQ,
  'basic_access_control': BasicAccessControlPBQ,
  'siem': SIEMLogAnalysisPBQ,
  'network_labeling': NetworkLabelingPBQ,
  'basic_ir_steps': IncidentResponsePBQ,
  'firewall': FirewallPBQ,
  'risk': RiskAssessmentPBQ,
  'cloud': CloudSecurityPBQ,
  'vuln': VulnerabilityManagementPBQ,
  'wireless_config': WirelessConfigPBQ,
  'access': AccessControlMatrixPBQ,
  'crypto_basics': CryptographyBasicsPBQ,
  'secure_protocols': SecureProtocolsPBQ,
  'pki_certs': PKICertificatePBQ,
  'multi_zone_firewall': MultiZoneFirewallPBQ,
  'ddos_mitigation': DDoSProtectionPBQ,
  'forensic_investigation': DigitalForensicsPBQ,
};

const App: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<DifficultyLevel>(DifficultyLevel.All);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isQuickRefActive, setIsQuickRefActive] = useState(false);
  const [activePBQ, setActivePBQ] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<PracticeQuestion[]>([]);
  
  // Auth & Dashboard State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});

  // Session Persistence: Load filter & user on mount
  useEffect(() => {
    // Load Filter
    const savedFilter = sessionStorage.getItem('pbqDifficultyFilter');
    if (savedFilter && Object.values(DifficultyLevel).includes(savedFilter as DifficultyLevel)) {
      setActiveFilter(savedFilter as DifficultyLevel);
    }
    
    // Load User
    const savedUser = localStorage.getItem('pbq_current_user');
    if (savedUser) {
        setCurrentUser(savedUser);
        loadUserProgress(savedUser);
    }
  }, []);

  // Helper to load progress for specific user
  const loadUserProgress = (username: string) => {
    const allProgress = JSON.parse(localStorage.getItem('pbq_all_progress') || '{}');
    if (allProgress[username]) {
        setUserProgress(allProgress[username]);
    } else {
        setUserProgress({});
    }
  };

  // Session Persistence: Save filter on change
  useEffect(() => {
    sessionStorage.setItem('pbqDifficultyFilter', activeFilter);
  }, [activeFilter]);

  const filteredModules = useMemo(() => {
    if (activeFilter === DifficultyLevel.All) {
      return pbqModules;
    }
    return pbqModules.filter(m => m.difficulty === activeFilter);
  }, [activeFilter]);

  const counts = useMemo(() => {
    return {
      [DifficultyLevel.All]: pbqModules.length,
      [DifficultyLevel.Foundational]: pbqModules.filter(m => m.difficulty === DifficultyLevel.Foundational).length,
      [DifficultyLevel.Intermediate]: pbqModules.filter(m => m.difficulty === DifficultyLevel.Intermediate).length,
      [DifficultyLevel.Advanced]: pbqModules.filter(m => m.difficulty === DifficultyLevel.Advanced).length,
    };
  }, []);

  const startQuiz = () => {
    // Select random questions from the pool of 100
    const shuffled = [...practiceQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10); // Give them a 10-question quiz
    
    setQuizQuestions(selected);
    setIsQuizActive(true);
  };

  const handleLaunchPBQ = (id: string) => {
    setActivePBQ(id);
  };

  const closePBQ = () => {
    setActivePBQ(null);
  };

  const handlePBQComplete = (score: number) => {
    // If user is logged in, save progress
    if (currentUser && activePBQ) {
        const newProgress = { ...userProgress, [activePBQ]: score };
        setUserProgress(newProgress);

        // Persist to local storage
        const allProgress = JSON.parse(localStorage.getItem('pbq_all_progress') || '{}');
        allProgress[currentUser] = newProgress;
        localStorage.setItem('pbq_all_progress', JSON.stringify(allProgress));
    }
    console.log(`PBQ Completed with score: ${score}`);
  };

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem('pbq_current_user', username);
    loadUserProgress(username);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('pbq_current_user');
    setUserProgress({});
    setIsDashboardOpen(false);
  };

  const handleDashboardClick = () => {
    if (currentUser) {
        setIsDashboardOpen(true);
    } else {
        setIsAuthModalOpen(true);
    }
  };

  // Determine which component to render
  const ActivePBQComponent = activePBQ ? PBQ_COMPONENTS[activePBQ] : null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      {/* Quiz Overlay */}
      {isQuizActive && (
        <QuizInterface 
          questions={quizQuestions} 
          onExit={() => setIsQuizActive(false)} 
        />
      )}

      {/* Quick Reference Overlay */}
      {isQuickRefActive && (
        <QuickReference onExit={() => setIsQuickRefActive(false)} />
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal 
            onLogin={handleLogin}
            onCancel={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* Student Dashboard */}
      {isDashboardOpen && currentUser && (
        <StudentDashboard 
            username={currentUser}
            progress={userProgress}
            modules={pbqModules}
            onLogout={handleLogout}
            onExit={() => setIsDashboardOpen(false)}
        />
      )}

      {/* PBQ Simulator Overlay */}
      {ActivePBQComponent ? (
        <ActivePBQComponent 
            onComplete={handlePBQComplete}
            onExit={closePBQ}
        />
      ) : activePBQ && (
        /* Fallback for implemented PBQs not yet fully built */
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl p-8 text-center max-w-md shadow-2xl">
                 <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-hard-hat text-2xl"></i>
                 </div>
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">Under Construction</h2>
                 <p className="text-gray-600 mb-6">This PBQ simulator module is currently being built. Please check back later.</p>
                 <button onClick={closePBQ} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors">
                    Close
                 </button>
             </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2 rounded-lg shadow-md">
              <i className="fas fa-shield-alt text-xl"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
              SecPro <span className="text-blue-600">Security+ PBQ Labs</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setIsQuickRefActive(true)}
                className="hidden md:flex text-gray-600 hover:text-blue-600 font-medium py-1.5 px-3 rounded-lg transition-all items-center gap-2 text-sm"
             >
                <i className="fas fa-terminal"></i> Quick Ref
             </button>
             <button 
                onClick={startQuiz}
                className="hidden md:flex bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-lg transition-all shadow-sm hover:shadow items-center gap-2 text-sm"
              >
                <i className="fas fa-bolt"></i> Quick Quiz
              </button>
            <button 
                onClick={handleDashboardClick}
                className="text-sm font-medium border-l pl-4 border-gray-200 flex items-center hover:text-blue-600 transition-colors"
            >
              {currentUser ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2">
                    <i className="fas fa-user-check"></i>
                  </div>
                  <span className="hidden sm:inline">{currentUser}</span>
                </>
              ) : (
                <>
                  <i className="fas fa-user-circle mr-2 text-gray-400 text-xl"></i>
                  <span className="hidden sm:inline text-gray-500">Student Login</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Overview - Cleaned Up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Modules</p>
                    <p className="text-2xl font-bold text-gray-800">{pbqModules.length} <span className="text-sm font-normal text-gray-400">Total</span></p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <i className="fas fa-cubes text-xl"></i>
                </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Question Bank</p>
                    <p className="text-2xl font-bold text-gray-800">{practiceQuestions.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                    <i className="fas fa-check-double text-xl"></i>
                </div>
            </div>
        </div>

        {/* Filter Tabs Section */}
        <FilterTabs 
          currentFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
          counts={counts}
        />

        {/* Controls Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-gray-600 font-medium px-2 flex items-center gap-2">
            <i className="fas fa-list text-gray-400"></i>
            Showing <span className="text-gray-900 font-bold">{filteredModules.length}</span> scenarios
          </p>
          
          <button 
            onClick={startQuiz}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <i className="fas fa-play-circle text-lg"></i> Start Practice Quiz
          </button>
        </div>

        {/* PBQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModules.map(module => (
            <div key={module.id} className="animate-fadeIn">
              <PBQCard 
                module={module} 
                onLaunch={handleLaunchPBQ}
              />
            </div>
          ))}
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <i className="fas fa-search text-3xl"></i>
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No modules found</h3>
            <p className="text-gray-500">Try selecting a different difficulty filter above.</p>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;