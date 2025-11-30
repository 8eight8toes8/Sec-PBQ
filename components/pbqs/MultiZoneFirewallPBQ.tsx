
import React, { useState } from 'react';

interface MultiZoneFirewallPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface Rule {
  id: number;
  source: string;
  destination: string;
  service: string;
  action: 'ALLOW' | 'DENY';
}

const NETWORK_OBJECTS = [
  { id: 'any', label: 'Any (Internet)', ip: '0.0.0.0/0' },
  { id: 'dmz_web', label: 'DMZ Web Server', ip: '10.0.1.5' },
  { id: 'internal_lan', label: 'Internal LAN', ip: '192.168.1.0/24' },
  { id: 'internal_db', label: 'Internal DB', ip: '192.168.20.5' },
  { id: 'mgmt_pc', label: 'Mgmt Workstation', ip: '192.168.10.100' }
];

const SERVICES = [
  { id: 'http', label: 'HTTP (80)' },
  { id: 'https', label: 'HTTPS (443)' },
  { id: 'ssh', label: 'SSH (22)' },
  { id: 'mysql', label: 'MySQL (3306)' },
  { id: 'dns', label: 'DNS (53)' },
  { id: 'any', label: 'ANY' }
];

const MultiZoneFirewallPBQ: React.FC<MultiZoneFirewallPBQProps> = ({ onComplete, onExit }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState<Omit<Rule, 'id'>>({
    source: 'any',
    destination: 'dmz_web',
    service: 'https',
    action: 'ALLOW'
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddRule = () => {
    setRules([...rules, { ...newRule, id: Date.now() }]);
  };

  const handleDeleteRule = (id: number) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const moveRule = (index: number, direction: 'up' | 'down') => {
    const newRules = [...rules];
    if (direction === 'up' && index > 0) {
      [newRules[index], newRules[index - 1]] = [newRules[index - 1], newRules[index]];
    } else if (direction === 'down' && index < newRules.length - 1) {
      [newRules[index], newRules[index + 1]] = [newRules[index + 1], newRules[index]];
    }
    setRules(newRules);
  };

  const handleSubmit = () => {
    let score = 0;
    const feedbackList: string[] = [];

    // 1. Check Public Access (Any -> DMZ Web : HTTP/HTTPS)
    const publicAccess = rules.some(r => 
        r.source === 'any' && 
        r.destination === 'dmz_web' && 
        (r.service === 'http' || r.service === 'https') && 
        r.action === 'ALLOW'
    );
    if (publicAccess) {
        score += 25;
        feedbackList.push("✓ Public web access correctly configured.");
    } else {
        feedbackList.push("✗ Missing rule: Allow Internet to DMZ Web Server (HTTP/HTTPS).");
    }

    // 2. Check DB Connection (DMZ Web -> Internal DB : MySQL)
    const dbAccess = rules.some(r => 
        r.source === 'dmz_web' && 
        r.destination === 'internal_db' && 
        r.service === 'mysql' && 
        r.action === 'ALLOW'
    );
    if (dbAccess) {
        score += 25;
        feedbackList.push("✓ Web Server database connection allowed.");
    } else {
        feedbackList.push("✗ Missing rule: Allow DMZ Web Server to Internal DB (MySQL).");
    }

    // 3. Check Management (Mgmt PC -> DMZ Web : SSH)
    const mgmtAccess = rules.some(r => 
        r.source === 'mgmt_pc' && 
        r.destination === 'dmz_web' && 
        r.service === 'ssh' && 
        r.action === 'ALLOW'
    );
    if (mgmtAccess) {
        score += 25;
        feedbackList.push("✓ Secure management access configured.");
    } else {
        feedbackList.push("✗ Missing rule: Allow Management Workstation to DMZ Web (SSH).");
    }

    // 4. Critical Safety Check: Prevent Any -> Internal
    const unsafeRule = rules.find(r => 
        r.source === 'any' && 
        (r.destination === 'internal_lan' || r.destination === 'internal_db' || r.destination === 'mgmt_pc') && 
        r.action === 'ALLOW'
    );
    
    // Check for "Any -> Any" Allow
    const anyAny = rules.find(r => r.source === 'any' && r.destination === 'any' && r.action === 'ALLOW');

    if (unsafeRule || anyAny) {
        score = 0; // Immediate fail for critical exposure
        feedbackList.push("CRITICAL FAIL: You created a rule allowing 'Any' (Internet) directly to the Internal Network or 'Any' destination. This completely bypasses the DMZ security model.");
    } else {
        // Bonus for having Explicit Deny (though implicit usually exists, explicit is good practice)
        score += 25;
        feedbackList.push("✓ No unsafe inbound rules detected.");
    }

    setSuccess(score === 100);
    setFeedback(feedbackList.join("\n"));
    if (score === 100) onComplete(100);
  };

  const getLabel = (id: string, list: {id: string, label: string}[]) => list.find(i => i.id === id)?.label || id;

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-fadeIn overflow-y-auto font-sans text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-shield-virus"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Advanced Multi-Zone Firewall</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col xl:flex-row gap-6">
        
        {/* Left: Topology & Scenario */}
        <div className="xl:w-1/3 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-project-diagram text-blue-600"></i> Network Topology
                </h3>
                
                <div className="relative bg-white border border-gray-200 rounded-lg p-4 h-[400px] flex flex-col items-center justify-between text-xs shadow-inner">
                    {/* Internet */}
                    <div className="bg-gray-100 p-2 rounded-full w-16 h-16 flex items-center justify-center border border-gray-200 relative z-10 shadow-sm">
                        <i className="fas fa-globe text-3xl text-gray-400"></i>
                    </div>
                    
                    {/* Perimeter FW */}
                    <div className="bg-red-600 text-white px-3 py-1 rounded shadow-md z-10 font-bold border-2 border-white">Perimeter FW</div>
                    
                    {/* DMZ Zone */}
                    <div className="w-full border-2 border-dashed border-orange-200 bg-orange-50/30 rounded-lg p-2 relative">
                        <span className="absolute top-1 left-2 text-orange-600 font-bold">DMZ</span>
                        <div className="flex justify-center mt-4">
                            <div className="bg-white border border-orange-200 p-2 rounded text-center shadow-sm">
                                <i className="fas fa-server text-orange-500 text-xl"></i>
                                <div className="font-bold mt-1 text-gray-700">Web Server</div>
                                <div className="font-mono text-[10px] text-gray-400">10.0.1.5</div>
                            </div>
                        </div>
                    </div>

                    {/* Internal FW */}
                    <div className="bg-red-600 text-white px-3 py-1 rounded shadow-md z-10 font-bold border-2 border-white">Internal FW</div>

                    {/* Internal Zone */}
                    <div className="w-full border-2 border-dashed border-green-200 bg-green-50/30 rounded-lg p-2 relative flex justify-around">
                        <span className="absolute top-1 left-2 text-green-600 font-bold">Internal LAN</span>
                        
                         <div className="bg-white border border-green-200 p-2 rounded text-center shadow-sm mt-4">
                            <i className="fas fa-database text-green-500 text-xl"></i>
                            <div className="font-bold mt-1 text-gray-700">DB Server</div>
                            <div className="font-mono text-[10px] text-gray-400">192.168.20.5</div>
                        </div>

                         <div className="bg-white border border-green-200 p-2 rounded text-center shadow-sm mt-4">
                            <i className="fas fa-laptop text-blue-500 text-xl"></i>
                            <div className="font-bold mt-1 text-gray-700">Mgmt PC</div>
                            <div className="font-mono text-[10px] text-gray-400">192.168.10.100</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                <h3 className="font-bold text-blue-900 mb-2">Policy Requirements</h3>
                <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
                    <li>Allow <strong>Public</strong> access to the <strong>DMZ Web Server</strong> (HTTP/S).</li>
                    <li>Allow <strong>DMZ Web Server</strong> to access <strong>Internal DB</strong> (MySQL) only.</li>
                    <li>Allow <strong>Mgmt Workstation</strong> to manage <strong>DMZ Web Server</strong> (SSH).</li>
                    <li>Block all direct Internet traffic to Internal Network.</li>
                    <li>Deny all other traffic (Implicit Deny).</li>
                </ul>
            </div>
        </div>

        {/* Right: Rule Builder */}
        <div className="xl:w-2/3 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Access Control List (ACL)</h3>
                    <div className="text-xs text-gray-500 font-mono">Policy ID: FW-MZ-001</div>
                </div>

                {/* Rule Table */}
                <div className="flex-grow overflow-auto p-0 min-h-[300px]">
                    <table className="w-full text-left text-sm">
                        <thead className="text-gray-500 font-bold uppercase text-xs border-b border-gray-200 bg-gray-50/50">
                            <tr>
                                <th className="py-3 pl-4 w-12">ID</th>
                                <th className="py-3 w-1/5">Source</th>
                                <th className="py-3 w-1/5">Destination</th>
                                <th className="py-3 w-1/5">Service</th>
                                <th className="py-3 w-1/6">Action</th>
                                <th className="py-3 text-right pr-4">Manage</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rules.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400 italic">
                                        <div className="mb-2"><i className="fas fa-list-ul text-3xl opacity-20"></i></div>
                                        No rules defined. Add rules below to build the policy.
                                    </td>
                                </tr>
                            )}
                            {rules.map((rule, idx) => (
                                <tr key={rule.id} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="py-3 pl-4 font-mono text-gray-400">{idx + 1}</td>
                                    <td className="py-3 font-medium text-gray-800">{getLabel(rule.source, NETWORK_OBJECTS)}</td>
                                    <td className="py-3 font-medium text-gray-800">{getLabel(rule.destination, NETWORK_OBJECTS)}</td>
                                    <td className="py-3 text-blue-600 font-mono">{getLabel(rule.service, SERVICES)}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${rule.action === 'ALLOW' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {rule.action}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right flex justify-end gap-2 pr-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => moveRule(idx, 'up')} disabled={idx === 0} className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent"><i className="fas fa-arrow-up"></i></button>
                                        <button onClick={() => moveRule(idx, 'down')} disabled={idx === rules.length - 1} className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent"><i className="fas fa-arrow-down"></i></button>
                                        <button onClick={() => handleDeleteRule(rule.id)} className="w-8 h-8 rounded flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50"><i className="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            ))}
                            {/* Implicit Deny Row */}
                            <tr className="bg-red-50/30 border-t-2 border-red-100 border-dashed">
                                <td className="py-3 pl-4 font-mono text-gray-400">*</td>
                                <td className="py-3 text-gray-500 italic">Any</td>
                                <td className="py-3 text-gray-500 italic">Any</td>
                                <td className="py-3 text-gray-500 italic">Any</td>
                                <td className="py-3"><span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">DENY</span></td>
                                <td className="py-3 text-right text-xs text-gray-400 italic pr-4 py-4">Implicit Rule</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Add Rule Form */}
                <div className="bg-gray-50 p-6 border-t border-gray-200">
                    <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">Add New Rule</h4>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Source</label>
                            <div className="relative">
                                <select 
                                    value={newRule.source}
                                    onChange={(e) => setNewRule({...newRule, source: e.target.value})}
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    {NETWORK_OBJECTS.map(obj => (
                                        <option key={obj.id} value={obj.id}>{obj.label}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><i className="fas fa-chevron-down text-xs"></i></div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Destination</label>
                            <div className="relative">
                                <select 
                                    value={newRule.destination}
                                    onChange={(e) => setNewRule({...newRule, destination: e.target.value})}
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    {NETWORK_OBJECTS.map(obj => (
                                        <option key={obj.id} value={obj.id}>{obj.label}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><i className="fas fa-chevron-down text-xs"></i></div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Service</label>
                            <div className="relative">
                                <select 
                                    value={newRule.service}
                                    onChange={(e) => setNewRule({...newRule, service: e.target.value})}
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    {SERVICES.map(svc => (
                                        <option key={svc.id} value={svc.id}>{svc.label}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><i className="fas fa-chevron-down text-xs"></i></div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Action</label>
                            <div className="relative">
                                <select 
                                    value={newRule.action}
                                    onChange={(e) => setNewRule({...newRule, action: e.target.value as 'ALLOW' | 'DENY'})}
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                >
                                    <option value="ALLOW">ALLOW</option>
                                    <option value="DENY">DENY</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><i className="fas fa-chevron-down text-xs"></i></div>
                            </div>
                        </div>
                        <div>
                            <button 
                                onClick={handleAddRule}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-sm"
                            >
                                <i className="fas fa-plus mr-1"></i> Add Rule
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end">
                    <button 
                        onClick={handleSubmit} 
                        className="bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2 hover:-translate-y-0.5"
                    >
                        <i className="fas fa-check-circle"></i> Validate Policy
                    </button>
                </div>
            </div>
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fas ${success ? 'fa-shield-check' : 'fa-exclamation-triangle'} text-3xl`}></i>
                    </div>
                    <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                        {success ? 'Firewall Policy Secure' : 'Policy Violations Found'}
                    </h3>
                </div>
                
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    <div className="whitespace-pre-line text-gray-700 text-base leading-relaxed">
                        {feedback}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 flex justify-center gap-4">
                    {success ? (
                        <button onClick={onExit} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                            Return to Dashboard
                        </button>
                    ) : (
                        <button onClick={() => setFeedback(null)} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                            Modify Rules
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MultiZoneFirewallPBQ;
