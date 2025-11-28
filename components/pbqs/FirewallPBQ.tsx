
import React, { useState } from 'react';

interface FirewallPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface FirewallRule {
  action: 'ALLOW' | 'DENY';
  source: string;
  destination: string;
  port: string;
  protocol: string;
  log: boolean;
}

const FirewallPBQ: React.FC<FirewallPBQProps> = ({ onComplete, onExit }) => {
  const [rules, setRules] = useState<FirewallRule[]>([]);
  const [newRule, setNewRule] = useState<FirewallRule>({
    action: 'ALLOW',
    source: '',
    destination: '',
    port: '',
    protocol: 'TCP',
    log: false
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddRule = () => {
    if (!newRule.source || !newRule.destination || !newRule.port) {
      alert("Please fill in all fields");
      return;
    }
    setRules([...rules, newRule]);
    setNewRule({ ...newRule, source: '', destination: '', port: '' });
  };

  const handleDeleteRule = (index: number) => {
    const updatedRules = [...rules];
    updatedRules.splice(index, 1);
    setRules(updatedRules);
  };

  const handleSubmit = () => {
    let score = 0;
    const feedbackMessages: string[] = [];

    // Requirement 1: Outbound Web Access
    const req1 = rules.some(r => 
      r.action === 'ALLOW' && 
      r.source.includes('192.168.10') && 
      (r.destination === '0.0.0.0/0' || r.destination.toLowerCase() === 'any') &&
      (r.port.includes('80') || r.port.includes('443') || r.port.includes('53'))
    );
    if (req1) { score += 20; feedbackMessages.push("✓ Outbound web access configured."); }
    else { feedbackMessages.push("✗ Missing or incorrect outbound web/DNS access rule."); }

    // Requirement 2: Block Inbound from Internet
    const req2 = rules.some(r => 
      r.action === 'DENY' && 
      r.source === '0.0.0.0/0' && 
      r.destination.includes('192.168.10')
    );
    if (req2) { score += 20; feedbackMessages.push("✓ Inbound internet blocking configured."); }
    else { feedbackMessages.push("✗ Internet to Internal traffic must be explicitly blocked."); }

    // Requirement 3: Admin SSH to DMZ
    const req3 = rules.some(r => 
      r.action === 'ALLOW' && 
      r.source.includes('192.168.20') && 
      r.destination.includes('10.10.10') &&
      r.port.includes('22')
    );
    if (req3) { score += 20; feedbackMessages.push("✓ Admin SSH access allowed."); }
    else { feedbackMessages.push("✗ Admin SSH access to DMZ missing."); }

    // Requirement 4: DMZ Web Server Access
    const req4 = rules.some(r => 
      r.action === 'ALLOW' && 
      r.source === '0.0.0.0/0' && 
      r.destination.includes('10.10.10') &&
      (r.port.includes('80') || r.port.includes('443'))
    );
    if (req4) { score += 20; feedbackMessages.push("✓ Public web access to DMZ allowed."); }
    else { feedbackMessages.push("✗ Missing public access to DMZ web servers."); }

    // Requirement 5: Logging Denied Traffic
    const req5 = rules.some(r => r.action === 'DENY' && r.log === true);
    if (req5) { score += 20; feedbackMessages.push("✓ Logging enabled for denied traffic."); }
    else { feedbackMessages.push("✗ Deny rules should have logging enabled."); }

    setSuccess(score >= 80);
    setFeedback(`Score: ${score}/100\n\n${feedbackMessages.join('\n')}`);
    if (score >= 80) onComplete(score);
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-fire"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Firewall Configuration</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">Network Zones</h3>
              <ul className="space-y-2 text-sm font-mono text-gray-600">
                <li><strong>Internet:</strong> 0.0.0.0/0</li>
                <li><strong>Internal:</strong> 192.168.10.0/24</li>
                <li><strong>DMZ:</strong> 10.10.10.0/24</li>
                <li><strong>Admin:</strong> 192.168.20.0/24</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-3">Requirements</h3>
              <ul className="space-y-3 text-sm text-blue-800 list-disc pl-4">
                <li>Allow Internal users outbound Web (80/443) & DNS (53).</li>
                <li>Block ALL inbound traffic from Internet to Internal.</li>
                <li>Allow Admin SSH (22) access to DMZ.</li>
                <li>Allow Internet access to DMZ Web Servers (80/443).</li>
                <li>Ensure all DENY rules are logged.</li>
              </ul>
            </div>
          </div>

          {/* Rule Builder */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">Access Control List</h3>
              
              {/* Existing Rules Table */}
              <div className="overflow-x-auto mb-6 border rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium uppercase">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Source</th>
                      <th className="px-4 py-3">Destination</th>
                      <th className="px-4 py-3">Port</th>
                      <th className="px-4 py-3">Log</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rules.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400 italic">No rules configured. Add rules below.</td>
                      </tr>
                    )}
                    {rules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${rule.action === 'ALLOW' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {rule.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono">{rule.source}</td>
                        <td className="px-4 py-3 font-mono">{rule.destination}</td>
                        <td className="px-4 py-3">{rule.port}</td>
                        <td className="px-4 py-3 text-gray-500">{rule.log ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => handleDeleteRule(idx)} className="text-red-400 hover:text-red-600">
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Rule Form */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                 <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Action</label>
                    <select 
                      value={newRule.action}
                      onChange={(e) => setNewRule({...newRule, action: e.target.value as 'ALLOW' | 'DENY'})}
                      className="w-full rounded border-gray-300 text-sm p-2"
                    >
                      <option value="ALLOW">ALLOW</option>
                      <option value="DENY">DENY</option>
                    </select>
                 </div>
                 <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Source IP</label>
                    <input 
                      type="text" 
                      value={newRule.source}
                      onChange={(e) => setNewRule({...newRule, source: e.target.value})}
                      placeholder="0.0.0.0/0"
                      className="w-full rounded border-gray-300 text-sm p-2 font-mono"
                    />
                 </div>
                 <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Dest IP</label>
                    <input 
                      type="text" 
                      value={newRule.destination}
                      onChange={(e) => setNewRule({...newRule, destination: e.target.value})}
                      placeholder="10.10.10.0/24"
                      className="w-full rounded border-gray-300 text-sm p-2 font-mono"
                    />
                 </div>
                 <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Port(s)</label>
                    <input 
                      type="text" 
                      value={newRule.port}
                      onChange={(e) => setNewRule({...newRule, port: e.target.value})}
                      placeholder="80, 443"
                      className="w-full rounded border-gray-300 text-sm p-2"
                    />
                 </div>
                 <div className="md:col-span-1 flex items-center h-10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newRule.log}
                        onChange={(e) => setNewRule({...newRule, log: e.target.checked})}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Log?</span>
                    </label>
                 </div>
                 <div className="md:col-span-1">
                    <button 
                      onClick={handleAddRule}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
                    >
                      Add
                    </button>
                 </div>
              </div>
            </div>

            <div className="flex justify-end">
               <button 
                  onClick={handleSubmit} 
                  className="bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2"
               >
                  <i className="fas fa-check-circle"></i> Validate Rules
               </button>
            </div>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fas ${success ? 'fa-shield-check' : 'fa-exclamation-circle'} text-3xl`}></i>
                    </div>
                    <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                        {success ? 'Configuration Successful!' : 'Configuration Issues'}
                    </h3>
                </div>
                
                <div className="p-8 overflow-y-auto">
                    <div className="whitespace-pre-line text-gray-700 text-base leading-relaxed mb-6">
                        {feedback}
                    </div>
                    
                    {showSolution ? (
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-sm">
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <i className="fas fa-star text-yellow-500"></i> Gold Standard Solution
                            </h4>
                            <div className="space-y-2 font-mono text-gray-600">
                                  <p className="p-2 bg-green-50 rounded border border-green-100">ALLOW 192.168.10.0/24 -&gt; 0.0.0.0/0 (80,443,53)</p>
                                  <p className="p-2 bg-green-50 rounded border border-green-100">DENY 0.0.0.0/0 -&gt; 192.168.10.0/24 (LOG)</p>
                                  <p className="p-2 bg-green-50 rounded border border-green-100">ALLOW 192.168.20.0/24 -&gt; 10.10.10.0/24 (22)</p>
                                  <p className="p-2 bg-green-50 rounded border border-green-100">ALLOW 0.0.0.0/0 -&gt; 10.10.10.0/24 (80,443)</p>
                                  <p className="p-2 bg-green-50 rounded border border-green-100">DENY ANY -&gt; ANY (LOG)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <button 
                                onClick={() => setShowSolution(true)}
                                className="text-blue-600 hover:text-blue-800 font-semibold underline"
                            >
                                View Optimal Solution
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50 flex justify-center gap-4 border-t border-gray-100">
                    {success ? (
                        <button onClick={onExit} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">Return to Dashboard</button>
                    ) : (
                        <button onClick={() => { setFeedback(null); setShowSolution(false); }} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">Adjust Rules</button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default FirewallPBQ;
