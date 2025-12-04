import React, { useState, useEffect, useMemo } from 'react';
import { DifficultyLevel, PracticeQuestion } from './types';
import { pbqModules } from './data';
import { practiceQuestions } from './questions';
import FilterTabs from './components/FilterTabs';
import PBQCard from './components/PBQCard';
import QuizInterface from './components/QuizInterface';
import QuizSetupModal from './components/QuizSetupModal';
import QuickReference from './components/QuickReference';
import AuthModal from './components/AuthModal';
import StudentDashboard from './components/StudentDashboard';
import SystemDocs from './components/SystemDocs';
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
import APTDetectionPBQ from './components/pbqs/APTDetectionPBQ';
import SecureNetworkArchitecturePBQ from './components/pbqs/SecureNetworkArchitecturePBQ';
import PrivilegeEscalationPBQ from './components/pbqs/PrivilegeEscalationPBQ';
import CloudIAMPolicyAuditingPBQ from './components/pbqs/CloudIAMPolicyAuditingPBQ';
import SecureConfigReq1PBQ from './components/pbqs/SecureConfigReq1PBQ';
import SecureConfigReq2PBQ from './components/pbqs/SecureConfigReq2PBQ';
import SecureConfigReq3PBQ from './components/pbqs/SecureConfigReq3PBQ';
import SnortFirewallPBQ from './components/pbqs/SnortFirewallPBQ';
import WindowsSystemResourcesPBQ from './components/pbqs/WindowsSystemResourcesPBQ';
import SqlInjectionWiresharkPBQ from './components/pbqs/SqlInjectionWiresharkPBQ';

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
  'apt_detection': APTDetectionPBQ,
  'network_architecture': SecureNetworkArchitecturePBQ,
  'privilege_escalation': PrivilegeEscalationPBQ,
  'cloud_iam_policies': CloudIAMPolicyAuditingPBQ,
  'req_1': SecureConfigReq1PBQ,
  'req_2': SecureConfigReq2PBQ,
  'req_3': SecureConfigReq3PBQ,
  'snort_firewall': SnortFirewallPBQ,
  'win_sys_res': WindowsSystemResourcesPBQ,
  'sql_injection_pcap': SqlInjectionWiresharkPBQ,
};

const App: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<DifficultyLevel>(DifficultyLevel.All);
  
  // Quiz State
  const [isQuizSetupOpen, setIsQuizSetupOpen] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<PracticeQuestion[]>([]);
  const [missedQuestionIds, setMissedQuestionIds] = useState<number[]>([]);

  const [isQuickRefActive, setIsQuickRefActive] = useState(false);
  const [isDocsActive, setIsDocsActive] = useState(false);
  const [activePBQ, setActivePBQ] = useState<string | null>(null);
  
  // Auth & Dashboard State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userProgress, setUserProgress] = useState<Record<string, number>>({});

  // Session Persistence
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

    // Load Missed Questions
    const savedMissed = localStorage.getItem('pbq_missed_questions');
    if (savedMissed) {
        try {
            setMissedQuestionIds(JSON.parse(savedMissed));
        } catch (e) {
            console.error("Failed to load missed questions", e);
        }
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

  // Persist Missed Questions
  useEffect(() => {
    localStorage.setItem('pbq_missed_questions', JSON.stringify(missedQuestionIds));
  }, [missedQuestionIds]);

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
      [DifficultyLevel.PerformanceBasedLab]: pbqModules.filter(m => m.difficulty === DifficultyLevel.PerformanceBasedLab).length,
    };
  }, []);

  const handleStartQuiz = (mode: 'random' | 'review' | 'domain', domain?: string) => {
    let selected: PracticeQuestion[] = [];

    if (mode === 'review') {
        // Review specific questions
        selected = practiceQuestions.filter(q => missedQuestionIds.includes(q.id));
    } else if (mode === 'domain' && domain) {
        // Domain specific, random shuffle within domain
        const domainQuestions = practiceQuestions.filter(q => q.domain === domain);
        selected = domainQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
    } else {
        // Default random shuffle
        const shuffled = [...practiceQuestions].sort(() => 0.5 - Math.random());
        selected = shuffled.slice(0, 10);
    }

    if (selected.length === 0) {
        alert("No questions available for this selection.");
        return;
    }

    setQuizQuestions(selected);
    setIsQuizSetupOpen(false);
    setIsQuizActive(true);
  };

  const handleQuizComplete = (results?: { questionId: number; correct: boolean }[]) => {
    setIsQuizActive(false);
    
    if (results) {
        // 1. Identify Correct and Incorrect IDs from this session
        const correctIds = results.filter(r => r.correct).map(r => r.questionId);
        const incorrectIds = results.filter(r => !r.correct).map(r => r.questionId);

        // 2. Update Missed Questions State
        setMissedQuestionIds(prev => {
            // Remove newly corrected questions from the list
            const stillMissed = prev.filter(id => !correctIds.includes(id));
            // Add newly missed questions (ensure uniqueness)
            const updated = Array.from(new Set([...stillMissed, ...incorrectIds]));
            return updated;
        });
    }
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
      {/* Quiz Setup Modal */}
      {isQuizSetupOpen && (
        <QuizSetupModal 
            questions={practiceQuestions}
            missedQuestionIds={missedQuestionIds}
            onStart={handleStartQuiz}
            onClose={() => setIsQuizSetupOpen(false)}
        />
      )}

      {/* Quiz Overlay */}
      {isQuizActive && (
        <QuizInterface 
          questions={quizQuestions} 
          onExit={handleQuizComplete} 
        />
      )}

      {/* Quick Reference Overlay */}
      {isQuickRefActive && (
        <QuickReference onExit={() => setIsQuickRefActive(false)} />
      )}

      {/* System Docs Overlay */}
      {isDocsActive && (
        <SystemDocs onExit={() => setIsDocsActive(false)} />
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
                onClick={() => setIsDocsActive(true)}
                className="hidden md:flex text-gray-600 hover:text-blue-600 font-medium py-1.5 px-3 rounded-lg transition-all items-center gap-2 text-sm"
             >
                <i className="fas fa-book"></i> System Docs
             </button>
             <button 
                onClick={() => setIsQuickRefActive(true)}
                className="hidden md:flex text-gray-600 hover:text-blue-600 font-medium py-1.5 px-3 rounded-lg transition-all items-center gap-2 text-sm"
             >
                <i className="fas fa-terminal"></i> Quick Ref
             </button>
             <button 
                onClick={handleDashboardClick}
                className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold py-2 px-4 rounded-lg transition-all border border-blue-200"
             >
                <i className={`fas ${currentUser ? 'fa-user-graduate' : 'fa-sign-in-alt'}`}></i>
                <span className="hidden sm:inline">{currentUser || 'Login'}</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-3 tracking-tight">
            Master Performance-Based Questions
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Interactive simulations designed to prepare you for the CompTIA Security+ (SY0-701) exam. 
            Practice configuration, analysis, and remediation in a realistic environment.
          </p>
          <div className="mt-6 flex justify-center gap-4">
             <button 
                onClick={() => setIsQuizSetupOpen(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
             >
                <i className="fas fa-tasks"></i> Start Practice Quiz
             </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <FilterTabs 
          currentFilter={activeFilter} 
          onFilterChange={setActiveFilter}
          counts={counts}
        />

        {/* Modules Grid */}
        {filteredModules.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {filteredModules.map(module => (
              <PBQCard 
                key={module.id} 
                module={module} 
                onLaunch={handleLaunchPBQ}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            <i className="fas fa-search text-4xl mb-4 text-gray-300"></i>
            <p className="text-lg font-medium">No modules found for this difficulty level.</p>
            <button 
                onClick={() => setActiveFilter(DifficultyLevel.All)}
                className="mt-4 text-blue-600 hover:text-blue-800 font-bold"
            >
                Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;