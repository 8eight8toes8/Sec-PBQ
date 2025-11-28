
import React, { useState } from 'react';

interface CloudSecurityPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const SCENARIOS = {
    scenario1: {
        title: "E-Commerce Cloud Infrastructure",
        description: "Audit the following AWS configuration for security misconfigurations.",
        correctIssues: [
            "prod-customer-data bucket has public access enabled",
            "prod-customer-data bucket lacks encryption",
            "SSH (port 22) exposed to internet on web-servers-sg",
            "admin-backup has full admin access (*:*) without MFA"
        ],
        buckets: [
            { name: "prod-customer-data", public: true, encryption: false },
            { name: "prod-logs", public: false, encryption: true }
        ],
        sgs: [
            { name: "web-servers-sg", rules: "Inbound: TCP 80 (0.0.0.0/0), TCP 22 (0.0.0.0/0)" },
            { name: "db-servers-sg", rules: "Inbound: TCP 3306 (10.0.0.0/16)" }
        ],
        iam: [
            { user: "deploy-bot", perms: "s3:*, ec2:*", mfa: false },
            { user: "admin-backup", perms: "*:*", mfa: false }
        ]
    },
    scenario2: {
        title: "SaaS Multi-Cloud Environment",
        description: "Assess security posture for a SaaS app spanning AWS and Azure.",
        correctIssues: [
            "analytics-exports bucket has public access enabled",
            "terraform-state bucket lacks encryption",
            "Redis port 6379 exposed to internet on redis-cache-sg",
            "ci-cd-pipeline has overly broad permissions without MFA",
            "data-scientist has unrestricted S3 access without MFA"
        ],
        buckets: [
            { name: "prod-user-uploads", public: false, encryption: true },
            { name: "analytics-exports", public: true, encryption: false },
            { name: "terraform-state", public: false, encryption: false }
        ],
        sgs: [
            { name: "api-gateway-sg", rules: "Inbound: TCP 443 (0.0.0.0/0)" },
            { name: "redis-cache-sg", rules: "Inbound: TCP 6379 (0.0.0.0/0)" },
            { name: "elasticsearch-sg", rules: "Inbound: TCP 9200 (10.1.0.0/16)" }
        ],
        iam: [
            { user: "ci-cd-pipeline", perms: "ec2:*, s3:*, lambda:*", mfa: false },
            { user: "data-scientist", perms: "s3:*, athena:*", mfa: false },
            { user: "security-auditor", perms: "cloudtrail:*, guardduty:*", mfa: true }
        ]
    }
};

const CloudSecurityPBQ: React.FC<CloudSecurityPBQProps> = ({ onComplete, onExit }) => {
  const [activeScenarioKey, setActiveScenarioKey] = useState<'scenario1' | 'scenario2'>('scenario1');
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const scenario = SCENARIOS[activeScenarioKey];
  
  // Options pool (dynamically filtered based on scenario to ensure relevance)
  const getOptions = (scenarioKey: string) => {
    if (scenarioKey === 'scenario1') {
        return [
            "prod-customer-data bucket has public access enabled",
            "prod-customer-data bucket lacks encryption",
            "prod-logs bucket is secure",
            "SSH (port 22) exposed to internet on web-servers-sg",
            "db-servers-sg is overly permissive",
            "deploy-bot has appropriate permissions",
            "admin-backup has full admin access (*:*) without MFA"
        ];
    } else {
        return [
            "analytics-exports bucket has public access enabled",
            "terraform-state bucket lacks encryption",
            "prod-user-uploads is insecure",
            "Redis port 6379 exposed to internet on redis-cache-sg",
            "ci-cd-pipeline has overly broad permissions without MFA",
            "data-scientist has unrestricted S3 access without MFA",
            "security-auditor needs more permissions"
        ];
    }
  };

  const options = getOptions(activeScenarioKey);

  const toggleIssue = (issue: string) => {
    if (selectedIssues.includes(issue)) {
        setSelectedIssues(selectedIssues.filter(i => i !== issue));
    } else {
        setSelectedIssues([...selectedIssues, issue]);
    }
  };

  const handleSwitchScenario = () => {
    setActiveScenarioKey(prev => prev === 'scenario1' ? 'scenario2' : 'scenario1');
    setSelectedIssues([]);
    setFeedback(null);
    setSuccess(false);
  };

  const handleSubmit = () => {
    const correct = scenario.correctIssues;
    // Score: (Correctly Selected / Total Correct) - Penalty for wrong selections
    const matched = selectedIssues.filter(i => correct.includes(i));
    const wrong = selectedIssues.filter(i => !correct.includes(i));
    
    let score = 0;
    if (matched.length === correct.length && wrong.length === 0) {
        score = 100;
    } else {
        score = Math.max(0, Math.round((matched.length / correct.length) * 100) - (wrong.length * 10));
    }

    setSuccess(score >= 80);
    setFeedback(score >= 80 
        ? "Great job! You identified all critical cloud misconfigurations." 
        : `You found ${matched.length}/${correct.length} issues, but also selected ${wrong.length} incorrect items.`);
    
    if (score >= 80) onComplete(score);
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm"><i className="fas fa-cloud"></i></div>
            <div><h2 className="text-xl font-bold text-gray-900">Cloud Security Assessment</h2><p className="text-xs text-gray-500">Security+ PBQ Simulation</p></div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full"><i className="fas fa-times text-2xl"></i></button>
      </div>

      <div className="flex-grow p-8 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-start mb-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 flex-grow mr-4">
                <h3 className="font-bold text-xl mb-2">{scenario.title}</h3>
                <p className="text-gray-600">{scenario.description}</p>
            </div>
            <button 
                onClick={handleSwitchScenario}
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow-sm transition-all text-sm whitespace-nowrap"
            >
                Switch to {activeScenarioKey === 'scenario1' ? 'Scenario 2' : 'Scenario 1'}
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
                <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><i className="fas fa-cube"></i> S3 Buckets</h4>
                    <div className="space-y-3">
                        {scenario.buckets.map(b => (
                            <div key={b.name} className="text-sm p-3 bg-gray-50 rounded border">
                                <div className="font-mono font-bold">{b.name}</div>
                                <div className="flex gap-2 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-xs ${b.public ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{b.public ? 'Public' : 'Private'}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${b.encryption ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{b.encryption ? 'Encrypted' : 'Unencrypted'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><i className="fas fa-shield-alt"></i> Security Groups</h4>
                    <div className="space-y-3">
                        {scenario.sgs.map(sg => (
                            <div key={sg.name} className="text-sm p-3 bg-gray-50 rounded border">
                                <div className="font-mono font-bold">{sg.name}</div>
                                <div className="text-gray-600 mt-1">{sg.rules}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                 <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><i className="fas fa-users"></i> IAM Policies</h4>
                    <div className="space-y-3">
                        {scenario.iam.map(u => (
                            <div key={u.user} className="text-sm p-3 bg-gray-50 rounded border">
                                <div className="font-mono font-bold">{u.user}</div>
                                <div className="text-gray-600">Perms: {u.perms}</div>
                                <div className={`mt-1 text-xs font-bold ${u.mfa ? 'text-green-600' : 'text-red-600'}`}>MFA: {u.mfa ? 'Enabled' : 'Disabled'}</div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-3">Audit Checklist</h4>
                    <p className="text-xs text-blue-700 mb-3">Select all security violations found above.</p>
                    <div className="space-y-2">
                        {options.map(opt => (
                            <label key={opt} className="flex items-start gap-3 cursor-pointer p-2 hover:bg-blue-100/50 rounded">
                                <input 
                                    type="checkbox" 
                                    checked={selectedIssues.includes(opt)}
                                    onChange={() => toggleIssue(opt)}
                                    className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-800">{opt}</span>
                            </label>
                        ))}
                    </div>
                    <button onClick={handleSubmit} className="w-full mt-4 bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">Submit Audit</button>
                </div>
            </div>
        </div>
      </div>
      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white p-8 rounded-xl max-w-md text-center">
                <h3 className={`text-xl font-bold mb-4 ${success ? 'text-green-600' : 'text-red-600'}`}>{success ? 'Passed' : 'Failed'}</h3>
                <p className="mb-6">{feedback}</p>
                <button onClick={() => success ? onExit() : setFeedback(null)} className="px-6 py-2 bg-gray-800 text-white rounded">OK</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default CloudSecurityPBQ;
