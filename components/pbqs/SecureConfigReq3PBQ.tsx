
import React, { useState, useEffect } from 'react';

interface SecureConfigReq3PBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

type PolicyLevel = 'Legacy' | 'Modern' | 'ZeroTrust';

interface Config {
  identity: PolicyLevel;
  device: PolicyLevel;
  network: PolicyLevel;
}

interface TrafficEvent {
  id: number;
  source: string;
  user: string;
  deviceStatus: string;
  riskLevel: string;
  action: string;
  destination: string;
  result: 'ALLOWED' | 'BLOCKED';
  expectedResult: 'ALLOWED' | 'BLOCKED';
  description: string;
}

const SecureConfigReq3PBQ: React.FC<SecureConfigReq3PBQProps> = ({ onComplete, onExit }) => {
  // Configuration State
  const [config, setConfig] = useState<Config>({
    identity: 'Legacy',
    device: 'Legacy',
    network: 'Legacy'
  });

  const [logs, setLogs] = useState<TrafficEvent[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Simulation Logic
  const runSimulation = () => {
    setIsSimulating(true);
    setLogs([]);
    
    // Define scenarios
    const scenarios: Omit<TrafficEvent, 'id' | 'result'>[] = [
      {
        source: '192.168.1.50',
        user: 'Alice (Finance)',
        deviceStatus: 'Healthy, Managed',
        riskLevel: 'Low',
        action: 'Access Finance DB',
        destination: 'DB-Finance',
        expectedResult: 'ALLOWED',
        description: 'Legitimate user accessing authorized resource.'
      },
      {
        source: '192.168.1.100',
        user: 'Bob (Sales)',
        deviceStatus: 'Infected (Ransomware)',
        riskLevel: 'High',
        action: 'Access CRM',
        destination: 'App-CRM',
        expectedResult: 'BLOCKED',
        description: 'Compromised device attempting access.'
      },
      {
        source: '203.0.113.5',
        user: 'Admin',
        deviceStatus: 'Unknown (Personal Laptop)',
        riskLevel: 'Medium',
        action: 'RDP Access',
        destination: 'Server-01',
        expectedResult: 'BLOCKED',
        description: 'Unmanaged device attempting admin access.'
      },
      {
        source: '10.0.5.2',
        user: 'System',
        deviceStatus: 'Server (Web)',
        riskLevel: 'Critical',
        action: 'SSH Scan (Lateral Movement)',
        destination: 'Server-DB',
        expectedResult: 'BLOCKED',
        description: 'Web server attempting lateral movement to DB (Exploit).'
      }
    ];

    let delay = 0;
    const newLogs: TrafficEvent[] = [];

    scenarios.forEach((scenario, index) => {
      setTimeout(() => {
        let result: 'ALLOWED' | 'BLOCKED' = 'ALLOWED';

        // 1. Identity Logic
        if (config.identity === 'Legacy') {
            // Password only - Weak protection
            // Allows almost everyone if they have creds
        } else if (config.identity === 'ZeroTrust') {
            // Blocks High Risk users
            if (scenario.riskLevel === 'High' || scenario.riskLevel === 'Critical') result = 'BLOCKED';
        }

        // 2. Device Logic
        if (config.device === 'Legacy') {
            // Doesn't check health
        } else if (config.device === 'Modern') {
            // Checks for Managed
            if (scenario.deviceStatus.includes('Unknown')) result = 'BLOCKED';
        } else if (config.device === 'ZeroTrust') {
            // Checks for Health + Managed
            if (scenario.deviceStatus.includes('Infected') || scenario.deviceStatus.includes('Unknown')) result = 'BLOCKED';
        }

        // 3. Network Logic
        if (config.network === 'Legacy') {
            // Flat network - allows lateral movement easily
        } else if (config.network === 'ZeroTrust') {
            // Micro-segmentation - Denies lateral movement/unauthorized flows
            if (scenario.action.includes('Lateral')) result = 'BLOCKED';
        }

        // Combined Final Logic for specific failure modes overrides
        // If config is weak, bad things are ALLOWED
        // If config is strong, good things might be BLOCKED if misconfigured (not implemented for simplicity here, assume good configs allow good traffic)

        const logEntry: TrafficEvent = { ...scenario, id: index, result };
        setLogs(prev => [...prev, logEntry]);
        
        // Final check after last log
        if (index === scenarios.length - 1) {
            setIsSimulating(false);
            evaluateResults([...newLogs, logEntry]); // Pass accumulated logs logic implies state update delay workarounds or just call eval
        }
        newLogs.push(logEntry);
      }, delay);
      delay += 1000;
    });
  };

  // Trigger evaluation when simulation ends (via effect on logs length or explicit call)
  useEffect(() => {
    if (!isSimulating && logs.length === 4) {
        evaluateResults(logs);
    }
  }, [isSimulating, logs.length]);

  const evaluateResults = (finalLogs: TrafficEvent[]) => {
    const correct = finalLogs.filter(l => l.result === l.expectedResult).length;
    const total = finalLogs.length;
    
    if (correct === total) {
        setSuccess(true);
        setFeedback("Zero Trust Architecture Verified! \n\n• Identity Policy blocks high-risk users.\n• Device Health blocks infected/unmanaged endpoints.\n• Micro-segmentation prevents lateral movement.");
        onComplete(100);
    } else {
        setSuccess(false);
        setFeedback(`Simulation Failed. ${correct}/${total} scenarios handled correctly.\n\nReview the Traffic Log to see which threats were allowed or legitimate users blocked.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-purple-700 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-fingerprint"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Zero Trust Implementation</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Intro */}
        <div className="bg-gray-800 text-white p-6 rounded-xl shadow-md mb-8 flex justify-between items-center">
            <div>
                <h3 className="text-lg font-bold mb-1">Architecture Migration: Trust No One, Verify Everything</h3>
                <p className="text-gray-400 text-sm">Configure the Identity, Device, and Network pillars to move from a Legacy Perimeter model to a Zero Trust Architecture.</p>
            </div>
            <div className="hidden md:block">
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${config.identity === 'ZeroTrust' && config.device === 'ZeroTrust' && config.network === 'ZeroTrust' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}>Target: Zero Trust</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: Configuration Pillars */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Pillar 1: Identity */}
                <div className={`p-5 rounded-xl border-2 transition-all ${config.identity === 'ZeroTrust' ? 'bg-purple-50 border-purple-500' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
                            <i className="fas fa-user-check"></i>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">Identity Pillar</h4>
                            <p className="text-xs text-gray-500">Authentication & Risk</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button onClick={() => setConfig({...config, identity: 'Legacy'})} className={`w-full text-left p-2 rounded text-sm ${config.identity === 'Legacy' ? 'bg-gray-200 font-bold' : 'hover:bg-gray-50'}`}>
                            <i className="fas fa-key mr-2"></i> Password Only (Legacy)
                        </button>
                        <button onClick={() => setConfig({...config, identity: 'Modern'})} className={`w-full text-left p-2 rounded text-sm ${config.identity === 'Modern' ? 'bg-blue-100 text-blue-800 font-bold' : 'hover:bg-gray-50'}`}>
                            <i className="fas fa-mobile-alt mr-2"></i> MFA (Modern)
                        </button>
                        <button onClick={() => setConfig({...config, identity: 'ZeroTrust'})} className={`w-full text-left p-2 rounded text-sm ${config.identity === 'ZeroTrust' ? 'bg-purple-600 text-white font-bold shadow-md' : 'hover:bg-gray-50'}`}>
                            <i className="fas fa-brain mr-2"></i> Adaptive Risk + MFA (Zero Trust)
                        </button>
                    </div>
                </div>

                {/* Pillar 2: Device */}
                <div className={`p-5 rounded-xl border-2 transition-all ${config.device === 'ZeroTrust' ? 'bg-purple-50 border-purple-500' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                            <i className="fas fa-laptop-medical"></i>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">Device Pillar</h4>
                            <p className="text-xs text-gray-500">Health & Compliance</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button onClick={() => setConfig({...config, device: 'Legacy'})} className={`w-full text-left p-2 rounded text-sm ${config.device === 'Legacy' ? 'bg-gray-200 font-bold' : 'hover:bg-gray-50'}`}>
                            <i className="fas fa-ban mr-2"></i> No Checks (Legacy)
                        </button>
                        <button onClick={() => setConfig({...config, device: 'Modern'})} className={`w-full text-left p-2 rounded text-sm ${config.device === 'Modern' ? 'bg-blue-100 text-blue-800 font-bold' : 'hover:bg-gray-50'}`}>
                            <i className="fas fa-building mr-2"></i> Domain Joined Only (Modern)
                        </button>
                        <button onClick={() => setConfig({...config, device: 'ZeroTrust'})} className={`w-full text-left p-2 rounded text-sm ${config.device === 'ZeroTrust' ? 'bg-purple-600 text-white font-bold shadow-md' : 'hover:bg-gray-50'}`}>
                            <i className="fas fa-heartbeat mr-2"></i> Health Verification (Zero Trust)
                        </button>
                    </div>
                </div>

                {/* Pillar 3: Network */}
                <div className={`p-5 rounded-xl border-2 transition-all ${config.network === 'ZeroTrust' ? 'bg-purple-50 border-purple-500' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl">
                            <i className="fas fa-network-wired"></i>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">Network Pillar</h4>
                            <p className="text-xs text-gray-500">Segmentation</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <button onClick={() => setConfig({...config, network: 'Legacy'})} className={`w-full text-left p-2 rounded text-sm ${config.network === 'Legacy' ? 'bg-gray-200 font-bold' : 'hover:bg-gray-50'}`}>
                            <i className="fas fa-globe mr-2"></i> Flat Network / VPN (Legacy)
                        </button>
                        <button onClick={() => setConfig({...config, network: 'Modern'})} className={`w-full text-left p-2 rounded text-sm ${config.network === 'Modern' ? 'bg-blue-100 text-blue-800 font-bold' : 'hover:bg-gray-50'}`}>
                            <i className="fas fa-layer-group mr-2"></i> VLAN Segmentation (Modern)
                        </button>
                        <button onClick={() => setConfig({...config, network: 'ZeroTrust'})} className={`w-full text-left p-2 rounded text-sm ${config.network === 'ZeroTrust' ? 'bg-purple-600 text-white font-bold shadow-md' : 'hover:bg-gray-50'}`}>
                            <i className="fas fa-microchip mr-2"></i> Micro-segmentation (Zero Trust)
                        </button>
                    </div>
                </div>

            </div>

            {/* RIGHT: Simulation Engine */}
            <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white rounded-xl shadow-md border border-gray-200 flex-grow flex flex-col overflow-hidden min-h-[500px]">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Traffic Simulation Log</h3>
                        <button 
                            onClick={runSimulation}
                            disabled={isSimulating}
                            className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${isSimulating ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            {isSimulating ? <><i className="fas fa-spinner fa-spin"></i> Processing</> : <><i className="fas fa-play"></i> Run Scenarios</>}
                        </button>
                    </div>

                    <div className="flex-grow p-0 overflow-y-auto bg-slate-50">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-200 text-gray-600 text-xs uppercase font-bold sticky top-0">
                                <tr>
                                    <th className="p-3">User/Source</th>
                                    <th className="p-3">Context (Device/Risk)</th>
                                    <th className="p-3">Destination</th>
                                    <th className="p-3 text-right">Policy Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                                            Configure the pillars on the left and click "Run Scenarios" to test your architecture.
                                        </td>
                                    </tr>
                                )}
                                {logs.map(log => (
                                    <tr key={log.id} className="bg-white animate-fadeIn">
                                        <td className="p-3">
                                            <div className="font-bold text-gray-800">{log.user}</div>
                                            <div className="text-xs text-gray-500">{log.source}</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-gray-700">{log.deviceStatus}</div>
                                            <div className={`text-xs font-bold ${log.riskLevel === 'High' || log.riskLevel === 'Critical' ? 'text-red-500' : 'text-green-500'}`}>Risk: {log.riskLevel}</div>
                                        </td>
                                        <td className="p-3 font-mono text-xs text-blue-600">{log.destination}</td>
                                        <td className="p-3 text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${log.result === 'ALLOWED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {log.result}
                                            </span>
                                            {/* Status Indicator compared to expected */}
                                            <div className="mt-1">
                                                {log.result === log.expectedResult ? (
                                                    <span className="text-[10px] text-green-600 flex items-center justify-end gap-1"><i className="fas fa-check"></i> Correct</span>
                                                ) : (
                                                    <span className="text-[10px] text-red-600 flex items-center justify-end gap-1"><i className="fas fa-times"></i> Security Fail</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                        {success ? 'Architecture Validated' : 'Security Gaps Found'}
                    </h3>
                </div>
                
                <div className="p-8">
                    <div className="whitespace-pre-line text-gray-700 text-sm leading-relaxed">
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
                            Adjust Configuration
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SecureConfigReq3PBQ;
