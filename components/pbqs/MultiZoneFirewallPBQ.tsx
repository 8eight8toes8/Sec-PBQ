import React, { useState } from 'react';

interface MultiZoneFirewallPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface Rule {
  id: number;
  from: string;
  to: string;
  traffic: string;
  action: 'ALLOW' | 'DENY';
}

const INITIAL_RULES: Rule[] = [
  { id: 1, from: 'Internet', to: 'DMZ', traffic: 'HTTP/HTTPS', action: 'DENY' },
  { id: 2, from: 'Internet', to: 'Internal', traffic: 'Any', action: 'ALLOW' },
  { id: 3, from: 'DMZ', to: 'Internal', traffic: 'SQL (3306)', action: 'DENY' },
  { id: 4, from: 'Internal', to: 'Internet', traffic: 'HTTP/HTTPS', action: 'ALLOW' }
];

const MultiZoneFirewallPBQ: React.FC<MultiZoneFirewallPBQProps> = ({ onComplete, onExit }) => {
  const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleAction = (id: number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, action: r.action === 'ALLOW' ? 'DENY' : 'ALLOW' } : r));
  };

  const handleSubmit = () => {
    const errors: string[] = [];
    
    // Rule 1: Internet to DMZ Web should be ALLOWED
    const r1 = rules.find(r => r.id === 1);
    if (r1?.action !== 'ALLOW') errors.push("Public web traffic must be allowed into the DMZ.");

    // Rule 2: Internet to Internal should be DENIED
    const r2 = rules.find(r => r.id === 2);
    if (r2?.action !== 'DENY') errors.push("Direct traffic from Internet to Internal network is a critical security risk.");

    // Rule 3: DMZ to Internal SQL should be ALLOWED (Web server talking to DB)
    const r3 = rules.find(r => r.id === 3);
    if (r3?.action !== 'ALLOW') errors.push("The Web Server in DMZ needs to access the SQL Database in Internal network.");

    // Rule 4: Internal to Internet is OK
    const r4 = rules.find(r => r.id === 4);
    if (r4?.action !== 'ALLOW') errors.push("Internal users generally need web access (outbound).");

    if (errors.length === 0) {
      setSuccess(true);
      setFeedback("Configuration Validated! The segmentation correctly isolates the Internal network while allowing necessary business flows.");
      onComplete(100);
    } else {
      setSuccess(false);
      setFeedback(errors.map(e => "• " + e).join("\n"));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-shield-virus"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Multi-Zone Firewall</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-8 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 mb-2">Configure Zone Policies</h3>
                <p className="text-sm text-gray-600">Review the traffic flows between the Internet, DMZ, and Internal network. Set the action to Allow or Deny based on defense-in-depth principles.</p>
            </div>
            
            <div className="p-0">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 text-gray-500 text-xs uppercase font-bold border-b border-gray-200">
                        <tr>
                            <th className="p-4">Source</th>
                            <th className="p-4">Destination</th>
                            <th className="p-4">Traffic Type</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rules.map(rule => (
                            <tr key={rule.id} className="hover:bg-gray-50">
                                <td className="p-4 font-bold text-gray-700">{rule.from}</td>
                                <td className="p-4 font-bold text-gray-700">{rule.to}</td>
                                <td className="p-4 text-gray-600">{rule.traffic}</td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => toggleAction(rule.id)}
                                        className={`w-24 py-2 rounded font-bold text-sm transition-colors shadow-sm ${rule.action === 'ALLOW' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                    >
                                        {rule.action}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end bg-gray-50">
                <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all">
                    Validate Firewall Policy
                </button>
            </div>
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-2xl text-center">
                 <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${success ? 'fa-check' : 'fa-times'} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-4">{success ? 'Policy Correct' : 'Security Risks Found'}</h3>
                <div className="whitespace-pre-line text-sm text-gray-600 mb-6 text-left p-4 bg-gray-50 rounded border">{feedback}</div>
                <button onClick={() => success ? onExit() : setFeedback(null)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">
                    {success ? 'Close' : 'Fix Rules'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default MultiZoneFirewallPBQ;