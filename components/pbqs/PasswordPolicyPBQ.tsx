
import React, { useState } from 'react';

interface PasswordPolicyPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const PasswordPolicyPBQ: React.FC<PasswordPolicyPBQProps> = ({ onComplete, onExit }) => {
  // State for form values
  const [config, setConfig] = useState({
    minLength: 8,
    complexity: false,
    maxAge: 180,
    history: 0,
    lockoutThreshold: 0, // 0 means disabled
    lockoutDuration: 0
  });

  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const errors = [];
    
    // Grading Logic based on Security+ Best Practices for High Security / Financial
    if (config.minLength < 14) errors.push("Minimum password length is too short. For high security, aim for at least 14 characters.");
    if (!config.complexity) errors.push("Complexity requirements must be enabled (Upper, Lower, Number, Symbol).");
    if (config.maxAge > 90) errors.push("Maximum password age is too long. Industry standard is often 90 days or less to limit exposure.");
    if (config.history < 5) errors.push("Password history should remember at least the last 5-10 passwords to prevent reuse.");
    if (config.lockoutThreshold === 0) errors.push("Account lockout threshold must be enabled to prevent brute force attacks.");
    if (config.lockoutThreshold > 5) errors.push("Account lockout threshold is too high. 3-5 attempts is standard practice.");
    if (config.lockoutThreshold > 0 && config.lockoutDuration < 15) errors.push("Lockout duration is too short. Should be at least 15 minutes to deter automated attacks.");

    if (errors.length === 0) {
      setSuccess(true);
      setFeedback("Excellent! This policy meets strict security standards for a high-value environment. You have effectively mitigated Brute Force and Dictionary attacks.");
      onComplete(100);
    } else {
      setSuccess(false);
      setFeedback(errors.map(e => "• " + e).join("\n"));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
       {/* Header */}
       <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
                <i className="fas fa-key"></i>
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">Password Policy Configuration</h2>
                <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
            </div>
          </div>
          <button 
            onClick={onExit} 
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all"
            title="Exit Lab"
          >
            <i className="fas fa-times text-2xl"></i>
          </button>
       </div>

       <div className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Scenario Header */}
            <div className="bg-blue-50/50 p-6 md:p-8 border-b border-blue-100">
                <div className="flex items-start gap-4">
                    <div className="hidden md:block w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className="fas fa-info text-lg"></i>
                    </div>
                    <div>
                        <p className="text-blue-900 text-lg leading-relaxed mb-4">
                            You are the Security Administrator for a financial institution. You have been tasked with configuring the domain password policy to meet <strong>PCI-DSS</strong> and general high-security compliance standards.
                        </p>
                        <p className="text-blue-800 font-medium bg-blue-100/50 p-4 rounded-lg border border-blue-100">
                            <strong>Objective:</strong> Configure settings to prevent brute-force attacks, credential stuffing, and unauthorized access via weak credentials.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 md:p-8 grid gap-12 lg:grid-cols-2">
                {/* Left Column: Password Complexity */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                            <i className="fas fa-lock text-xl"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">Password Complexity</h3>
                    </div>
                    
                    {/* Slider */}
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <label className="text-lg font-bold text-gray-700">Minimum Password Length</label>
                            <span className="text-2xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg min-w-[3rem] text-center">
                                {config.minLength}
                            </span>
                        </div>
                        <input 
                            type="range" 
                            min="6" 
                            max="20" 
                            value={config.minLength} 
                            onChange={(e) => handleChange('minLength', parseInt(e.target.value))} 
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                            <span>6 chars</span>
                            <span>20 chars</span>
                        </div>
                    </div>

                    {/* Checkbox Card */}
                    <div 
                        className={`flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${config.complexity ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-200 hover:border-gray-300'}`}
                        onClick={() => handleChange('complexity', !config.complexity)}
                    >
                        <div className={`flex items-center justify-center w-6 h-6 rounded border-2 mr-4 mt-0.5 transition-colors ${config.complexity ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                            {config.complexity && <i className="fas fa-check text-white text-sm"></i>}
                        </div>
                        <div>
                            <label className="block text-lg font-bold text-gray-800 cursor-pointer select-none mb-1">Enforce Complexity Requirements</label>
                            <p className="text-gray-500 text-sm leading-relaxed">Requires usage of uppercase letters, lowercase letters, numbers, and special characters.</p>
                        </div>
                    </div>

                    {/* Dark Inputs Section */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-lg font-bold text-gray-700 mb-3">Maximum Password Age</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={config.maxAge} 
                                    onChange={(e) => handleChange('maxAge', parseInt(e.target.value))} 
                                    className="block w-full rounded-xl border-0 py-4 pl-5 pr-16 text-white bg-gray-800 shadow-sm placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-xl font-mono"
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5">
                                    <span className="text-gray-400 font-medium">Days</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-lg font-bold text-gray-700 mb-3">Enforce Password History</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={config.history} 
                                    onChange={(e) => handleChange('history', parseInt(e.target.value))} 
                                    className="block w-full rounded-xl border-0 py-4 pl-5 pr-48 text-white bg-gray-800 shadow-sm placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 text-xl font-mono"
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5">
                                    <span className="text-gray-400 font-medium">Passwords remembered</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Account Lockout */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                            <i className="fas fa-user-shield text-xl"></i>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">Account Lockout Policy</h3>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-5 flex gap-4 items-start">
                        <div className="text-orange-500 mt-1">
                            <i className="fas fa-exclamation-triangle text-xl"></i>
                        </div>
                        <div>
                             <h4 className="font-bold text-orange-800 mb-1">Warning</h4>
                             <p className="text-orange-700 text-sm leading-relaxed">
                                Improper lockout settings can lead to Denial of Service (DoS) conditions if an attacker intentionally locks out valid users.
                             </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-lg font-bold text-gray-700 mb-3">Account Lockout Threshold</label>
                        <div className="relative">
                            <select 
                                value={config.lockoutThreshold} 
                                onChange={(e) => handleChange('lockoutThreshold', parseInt(e.target.value))}
                                className="block w-full rounded-xl border-0 py-4 pl-5 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 text-lg bg-white shadow-sm"
                            >
                                <option value="0">Disabled (0)</option>
                                <option value="3">3 Invalid Attempts</option>
                                <option value="5">5 Invalid Attempts</option>
                                <option value="10">10 Invalid Attempts</option>
                                <option value="20">20 Invalid Attempts</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500">
                                <i className="fas fa-chevron-down"></i>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 ml-1">Number of failed logins before user is locked out.</p>
                    </div>

                    <div className={`transition-all duration-500 ${config.lockoutThreshold === 0 ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                         <label className="block text-lg font-bold text-gray-700 mb-3">Lockout Duration</label>
                         <div className="relative">
                            <input 
                                type="number" 
                                value={config.lockoutDuration} 
                                onChange={(e) => handleChange('lockoutDuration', parseInt(e.target.value))} 
                                className={`block w-full rounded-xl border-0 py-4 pl-5 pr-24 shadow-sm text-xl font-mono ${config.lockoutThreshold === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-800 text-white focus:ring-2 focus:ring-blue-600'}`}
                                disabled={config.lockoutThreshold === 0}
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-5">
                                <span className={config.lockoutThreshold === 0 ? 'text-gray-400' : 'text-gray-400'}>Minutes</span>
                            </div>
                         </div>
                         <p className="text-sm text-gray-500 mt-2 ml-1">How long the account remains locked automatically.</p>
                    </div>
                </div>
            </div>

            {/* Footer / Actions */}
            <div className="bg-gray-50 p-6 md:p-8 border-t border-gray-200 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                <button 
                    onClick={() => setConfig({
                        minLength: 8,
                        complexity: false,
                        maxAge: 180,
                        history: 0,
                        lockoutThreshold: 0,
                        lockoutDuration: 0
                    })} 
                    className="text-gray-500 font-semibold hover:text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors w-full md:w-auto"
                >
                    Reset Defaults
                </button>
                
                <button 
                    onClick={handleSubmit} 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-12 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all w-full md:w-auto flex items-center justify-center gap-2"
                >
                    <i className="fas fa-check-circle"></i> Apply Policy
                </button>
            </div>

            {/* Feedback Modal */}
            {feedback && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
                    <div className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all scale-100`}>
                        <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <i className={`fas ${success ? 'fa-shield-check' : 'fa-exclamation-circle'} text-3xl`}></i>
                            </div>
                            <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                                {success ? 'Policy Compliant!' : 'Audit Failed'}
                            </h3>
                        </div>
                        
                        <div className="p-8">
                            <div className={`whitespace-pre-line text-lg leading-relaxed ${success ? 'text-gray-700' : 'text-gray-700'}`}>
                                {feedback}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 flex justify-center">
                            {success ? (
                                <button onClick={onExit} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                                    Return to Dashboard
                                </button>
                            ) : (
                                <button onClick={() => setFeedback(null)} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                                    Modify Settings
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
         </div>
       </div>
    </div>
  );
};

export default PasswordPolicyPBQ;
