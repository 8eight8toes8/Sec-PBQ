
import React, { useState } from 'react';

interface Props {
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

const MultiZoneFirewallPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
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
    const penaltyPerError = 10;

    // Helper for fuzzy matching IP/Ports
    const match = (rule: FirewallRule, act: string, src: string, dst: string, prt: string) => {
      const p = rule.port.toLowerCase();
      const s = rule.source.toLowerCase();
      const d = rule.destination.toLowerCase();

      const portMatch = prt === '*' ? true : p.includes(prt);
      // Simple string inclusion for IP ranges
      const srcMatch = src === '*' ? true : s.includes(src);
      const dstMatch = dst === '*' ? true : d.includes(dst);

      return rule.action === act && srcMatch && dstMatch && portMatch;
    };

    // 1. Internet -> DMZ Web (80/443)
    const req1 = rules.some(r => match(r, 'ALLOW', '0.0.0.0', '172.16.10', '80') || match(r, 'ALLOW', '0.0.0.0', '172.16.10', '443'));
    if (req1) { score += 20; feedbackMessages.push("✓ Internet access to DMZ Web Servers allowed."); }
    else { feedbackMessages.push("✗ Missing Public -> DMZ Web rule."); }

    // 2. DMZ -> Intranet DB (1433)
    const req2 = rules.some(r => match(r, 'ALLOW', '172.16.10', '10.1.1', '1433'));
    if (req2) { score += 20; feedbackMessages.push("✓ DMZ Web Server connection to Internal DB allowed."); }
    else { feedbackMessages.push("✗ Missing DMZ -> Internal DB rule."); }

    // 3. Extranet -> DMZ API (8080)
    const req3 = rules.some(r => match(r, 'ALLOW', '192.168.50', '172.16.10', '8080'));
    if (req3) { score += 20; feedbackMessages.push("✓ Partner Extranet access to DMZ API allowed."); }
    else { feedbackMessages.push("✗ Missing Extranet -> DMZ API rule."); }

    // 4. Block Internet -> Intranet
    // This is implicitly handled by default deny usually, but sometimes explicit deny is asked.
    // We'll check if they accidentally ALLOWED it.
    const badRule1 = rules.some(r => r.action === 'ALLOW' && r.source.includes('0.0.0.0') && r.destination.includes('10.1.1'));
    if (badRule1) { score -= 20; feedbackMessages.push("CRITICAL FAILURE: Allowed direct Internet access to Internal Network!"); }

    // 5. Default Deny All (Any -> Any Deny)
    // We check if the LAST rule is Deny Any Any
    const lastRule = rules[rules.length - 1];
    const hasDefaultDeny = lastRule && lastRule.action === 'DENY' &&
                          (lastRule.source.toLowerCase().includes('any') || lastRule.source === '0.0.0.0/0') &&
                          (lastRule.destination.toLowerCase().includes('any') || lastRule.destination === '0.0.0.0/0');

    if (hasDefaultDeny) {
        score += 20;
        feedbackMessages.push("✓ Default Implicit Deny rule configured.");
        if (lastRule.log) {
            score += 20;
            feedbackMessages.push("✓ Logging enabled on Default Deny.");
        } else {
            feedbackMessages.push("✗ Default Deny should be logged.");
        }
    } else {
        feedbackMessages.push("✗ Missing 'Deny Any Any' at the bottom of the ruleset.");
    }

    // Cap score at 100, floor at 0
    score = Math.max(0, Math.min(100, score));

    setSuccess(score >= 80);
    setFeedback(`Score: ${score}/100\n\n${feedbackMessages.join('\n')}`);
    if (score >= 80) onComplete(score);
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
            <p className="text-xs text-gray-500">Advanced Access Control</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">Network Topology</h3>
              <ul className="space-y-3 text-sm font-mono text-gray-600">
                <li className="flex justify-between border-b pb-2"><span>Internet</span> <span className="text-red-500">0.0.0.0/0</span></li>
                <li className="flex justify-between border-b pb-2"><span>Intranet (Secure)</span> <span className="text-green-600">10.1.1.0/24</span></li>
                <li className="flex justify-between border-b pb-2"><span>DMZ (Public)</span> <span className="text-orange-500">172.16.10.0/24</span></li>
                <li className="flex justify-between border-b pb-2"><span>Extranet (Partner)</span> <span className="text-blue-500">192.168.50.0/24</span></li>
              </ul>
            </div>

            <div className="bg-red-50 p-5 rounded-xl border border-red-100">
              <h3 className="font-bold text-red-900 mb-3">Security Policy</h3>
              <ul className="space-y-3 text-sm text-red-800 list-disc pl-4">
                <li><strong>Web Servers (DMZ)</strong> must be accessible from the Internet on HTTP/HTTPS.</li>
                <li><strong>Web Servers</strong> need to talk to the <strong>Internal Database</strong> on port 1433 (SQL).</li>
                <li><strong>Partners (Extranet)</strong> need access to the <strong>API Server (DMZ)</strong> on port 8080.</li>
                <li><strong>Internal Network</strong> must be isolated from direct Internet access (inbound).</li>
                <li>Implement a <strong>Default Deny</strong> policy for all other traffic and <strong>Log</strong> it.</li>
              </ul>
            </div>
          </div>

          {/* Rule Builder */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">Firewall Ruleset</h3>

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
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400 italic">No rules configured.</td>
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
                      placeholder="e.g., 0.0.0.0/0"
                      className="w-full rounded border-gray-300 text-sm p-2 font-mono"
                    />
                 </div>
                 <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Dest IP</label>
                    <input
                      type="text"
                      value={newRule.destination}
                      onChange={(e) => setNewRule({...newRule, destination: e.target.value})}
                      placeholder="e.g., 172.16.10.0/24"
                      className="w-full rounded border-gray-300 text-sm p-2 font-mono"
                    />
                 </div>
                 <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Port(s)</label>
                    <input
                      type="text"
                      value={newRule.port}
                      onChange={(e) => setNewRule({...newRule, port: e.target.value})}
                      placeholder="e.g., 80, 443"
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
                  className="bg-red-600 hover:bg-red-700 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-red-500/30 transition-all flex items-center gap-2"
               >
                  <i className="fas fa-check-circle"></i> Validate Config
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
                                <i className="fas fa-star text-yellow-500"></i> Reference Solution
                            </h4>
                            <div className="space-y-2 font-mono text-gray-600">
                                  <p className="p-2 bg-green-50 rounded border border-green-100">ALLOW 0.0.0.0/0 -&gt; 172.16.10.0/24 (80,443)</p>
                                  <p className="p-2 bg-green-50 rounded border border-green-100">ALLOW 172.16.10.0/24 -&gt; 10.1.1.0/24 (1433)</p>
                                  <p className="p-2 bg-green-50 rounded border border-green-100">ALLOW 192.168.50.0/24 -&gt; 172.16.10.0/24 (8080)</p>
                                  <p className="p-2 bg-green-50 rounded border border-green-100">DENY ANY -&gt; ANY (LOG)</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <button
                                onClick={() => setShowSolution(true)}
                                className="text-blue-600 hover:text-blue-800 font-semibold underline"
                            >
                                View Reference Solution
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

export default MultiZoneFirewallPBQ;
