
import React, { useState, useEffect, useRef } from 'react';

interface SnortFirewallPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface TerminalState {
  lines: string[];
}

const MALICIOUS_IP = '209.165.202.133';
const MALICIOUS_PORT = '6666';
const MALWARE_FILE = 'W32.Nimda.Amm.exe';

const SnortFirewallPBQ: React.FC<SnortFirewallPBQProps> = ({ onComplete, onExit }) => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState<'R1_IDS' | 'R1_CLI' | 'H5' | 'H10'>('R1_CLI');
  const [terminals, setTerminals] = useState<Record<string, TerminalState>>({
    'R1_IDS': { lines: ['[root@secOps analyst]#'] },
    'R1_CLI': { lines: ['mininet>'] },
    'H5': { lines: ['[root@secOps analyst]#'] },
    'H10': { lines: ['[root@secOps analyst]#'] },
  });

  const [simState, setSimState] = useState({
    mininetStarted: false,
    snortRunning: false,
    serverRunning: false,
    firewallBlocked: false,
    downloadAttempts: 0,
    malwareDownloaded: false
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminals, activeTab]);

  // --- Helper Functions ---

  const addLine = (tab: string, text: string) => {
    setTerminals(prev => ({
      ...prev,
      [tab]: {
        lines: [...prev[tab].lines, text]
      }
    }));
  };

  const handleTabChange = (tab: 'R1_IDS' | 'R1_CLI' | 'H5' | 'H10') => {
    setActiveTab(tab);
  };

  const triggerSnortAlert = () => {
    if (simState.snortRunning) {
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }) + '.092153';
        const alert = `${timestamp}  [**] [1:1000003:0] Malicious Server Hit! [**] [Priority: 0] {TCP} 209.165.200.235:34484 -> ${MALICIOUS_IP}:${MALICIOUS_PORT}`;
        addLine('R1_IDS', alert);
    }
  };

  // --- Command Handlers ---

  const runStartMininet = () => {
    if (simState.mininetStarted) {
        addLine('R1_CLI', 'Mininet is already running.');
        return;
    }
    addLine('R1_CLI', '$ sudo ./lab.support.files/scripts/cyberops_extended_topo_no_fw.py');
    setTimeout(() => addLine('R1_CLI', '[sudo] password for analyst: '), 500);
    setTimeout(() => {
        addLine('R1_CLI', '*** Adding controller\n*** Add switches\n*** Add hosts\n*** Starting network\n*** Configuring hosts\n*** Starting CLI:\nmininet>');
        setSimState(prev => ({ ...prev, mininetStarted: true }));
    }, 1500);
  };

  const runStartSnort = () => {
    if (!simState.mininetStarted) {
        addLine('R1_IDS', 'Error: Mininet network not started.');
        return;
    }
    if (simState.snortRunning) {
        addLine('R1_IDS', 'Snort is already running.');
        return;
    }
    addLine('R1_IDS', './lab.support.files/scripts/start_snort.sh');
    setTimeout(() => {
        addLine('R1_IDS', 'Running in IDS mode\n--== Initializing Snort ==--\nInitializing Output Plugins!\nInitializing Preprocessors!\nParsing Rules file "/etc/snort/snort.conf"\n...');
        addLine('R1_IDS', 'Snort initialization complete. Monitoring traffic...');
        setSimState(prev => ({ ...prev, snortRunning: true }));
    }, 1000);
  };

  const runStartMalServer = () => {
    if (!simState.mininetStarted) {
        addLine('H10', 'Error: Network unreachable.');
        return;
    }
    addLine('H10', './lab.support.files/scripts/mal_server_start.sh');
    setTimeout(() => {
        addLine('H10', 'Starting Nginx Web Server on port 6666...');
        addLine('H10', '[root@secOps analyst]#');
        setSimState(prev => ({ ...prev, serverRunning: true }));
    }, 800);
  };

  const runNetstat = () => {
    addLine('H10', 'netstat -tunpa');
    if (simState.serverRunning) {
        addLine('H10', `Active Internet connections (servers and established)\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\ntcp        0      0 0.0.0.0:${MALICIOUS_PORT}            0.0.0.0:*               LISTEN      1839/nginx: master`);
    } else {
        addLine('H10', 'Active Internet connections (servers and established)\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name');
    }
    addLine('H10', '[root@secOps analyst]#');
  };

  const runWget = () => {
    if (!simState.mininetStarted) {
        addLine('H5', 'Error: Network unreachable.');
        return;
    }
    const cmd = `wget ${MALICIOUS_IP}:${MALICIOUS_PORT}/${MALWARE_FILE}`;
    addLine('H5', cmd);

    setTimeout(() => {
        if (simState.firewallBlocked) {
            // Blocked Scenario
            addLine('H5', `--${new Date().getFullYear()}-05-01--  http://${MALICIOUS_IP}:${MALICIOUS_PORT}/${MALWARE_FILE}`);
            addLine('H5', `Connecting to ${MALICIOUS_IP}:${MALICIOUS_PORT}... failed: Connection timed out.`);
            addLine('H5', 'Retrying.');
            addLine('H5', `Connecting to ${MALICIOUS_IP}:${MALICIOUS_PORT}... failed: Connection timed out.`);
            addLine('H5', '[root@secOps analyst]#');
        } else if (simState.serverRunning) {
            // Success Scenario
            addLine('H5', `--${new Date().getFullYear()}-05-01--  http://${MALICIOUS_IP}:${MALICIOUS_PORT}/${MALWARE_FILE}`);
            addLine('H5', `Connecting to ${MALICIOUS_IP}:${MALICIOUS_PORT}... connected.`);
            addLine('H5', 'HTTP request sent, awaiting response... 200 OK');
            addLine('H5', 'Length: 345088 (337K) [application/octet-stream]');
            addLine('H5', `Saving to: '${MALWARE_FILE}'`);
            addLine('H5', '100%[===================>] 337.00K  --.-KB/s    in 0.02s');
            addLine('H5', `2023-05-01 - '${MALWARE_FILE}' saved [345088/345088]`);
            addLine('H5', '[root@secOps analyst]#');
            
            setSimState(prev => ({ ...prev, malwareDownloaded: true, downloadAttempts: prev.downloadAttempts + 1 }));
            triggerSnortAlert();
        } else {
            // Server not running
            addLine('H5', `Connecting to ${MALICIOUS_IP}:${MALICIOUS_PORT}... failed: Connection refused.`);
            addLine('H5', '[root@secOps analyst]#');
        }
    }, 1000);
  };

  const runIptablesList = () => {
    if (!simState.mininetStarted) {
        addLine('R1_CLI', 'Error: Host not reachable.');
        return;
    }
    addLine('R1_CLI', 'iptables -L -v');
    setTimeout(() => {
        addLine('R1_CLI', 'Chain INPUT (policy ACCEPT 0 packets, 0 bytes)');
        
        let forwardChain = 'Chain FORWARD (policy ACCEPT 6 packets, 504 bytes)';
        if (simState.firewallBlocked) {
            forwardChain += `\n 0     0 DROP       tcp  --  any    any     anywhere             ${MALICIOUS_IP}      tcp dpt:${MALICIOUS_PORT}`;
        }
        
        addLine('R1_CLI', forwardChain);
        addLine('R1_CLI', 'Chain OUTPUT (policy ACCEPT 0 packets, 0 bytes)');
        addLine('R1_CLI', '[root@secOps ~]#');
    }, 500);
  };

  const runIptablesBlock = () => {
    if (!simState.mininetStarted) {
        addLine('R1_CLI', 'Error: Host not reachable.');
        return;
    }
    const cmd = `iptables -I FORWARD -p tcp -d ${MALICIOUS_IP} --dport ${MALICIOUS_PORT} -j DROP`;
    addLine('R1_CLI', cmd);
    setTimeout(() => {
        setSimState(prev => ({ ...prev, firewallBlocked: true }));
        addLine('R1_CLI', '[root@secOps ~]#');
    }, 500);
  };

  const checkCompletion = () => {
    if (simState.firewallBlocked && simState.malwareDownloaded) {
        onComplete(100);
    } else {
        alert("Lab Incomplete. Ensure you have analyzed the traffic and successfully blocked the malicious server.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-shield-dog"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Snort IDS & Firewall Rules</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6">
        
        {/* Left: Task List & Context */}
        <div className="lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-tasks text-blue-600"></i> Lab Objectives
                </h3>
                <div className="space-y-4 text-sm text-gray-600">
                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${simState.mininetStarted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={`mt-0.5 ${simState.mininetStarted ? 'text-green-600' : 'text-gray-400'}`}>
                            <i className={`fas ${simState.mininetStarted ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        </div>
                        <div>
                            <div className="font-bold text-gray-800">1. Initialize Environment</div>
                            <p>Start Mininet simulation.</p>
                        </div>
                    </div>

                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${simState.snortRunning && simState.serverRunning ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={`mt-0.5 ${simState.snortRunning && simState.serverRunning ? 'text-green-600' : 'text-gray-400'}`}>
                            <i className={`fas ${simState.snortRunning && simState.serverRunning ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        </div>
                        <div>
                            <div className="font-bold text-gray-800">2. Prepare Services</div>
                            <p>Start Snort IDS on R1 and the Malicious Server on H10.</p>
                        </div>
                    </div>

                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${simState.malwareDownloaded ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={`mt-0.5 ${simState.malwareDownloaded ? 'text-green-600' : 'text-gray-400'}`}>
                            <i className={`fas ${simState.malwareDownloaded ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        </div>
                        <div>
                            <div className="font-bold text-gray-800">3. Analyze Traffic</div>
                            <p>Download malware from H5 and observe Snort alerts on R1.</p>
                        </div>
                    </div>

                    <div className={`flex items-start gap-3 p-3 rounded-lg border ${simState.firewallBlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className={`mt-0.5 ${simState.firewallBlocked ? 'text-green-600' : 'text-gray-400'}`}>
                            <i className={`fas ${simState.firewallBlocked ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        </div>
                        <div>
                            <div className="font-bold text-gray-800">4. Block Threat</div>
                            <p>Configure iptables on R1 to DROP traffic to the malicious IP.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl shadow-sm">
                <h4 className="font-bold text-blue-900 mb-2">Scenario Intel</h4>
                <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
                    <li><strong>Malicious IP:</strong> 209.165.202.133</li>
                    <li><strong>Port:</strong> 6666</li>
                    <li><strong>File:</strong> W32.Nimda.Amm.exe</li>
                    <li><strong>Router (R1):</strong> Gateway running Snort & iptables</li>
                </ul>
            </div>
        </div>

        {/* Right: Terminal Interface */}
        <div className="lg:w-2/3 flex flex-col h-[600px] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
            
            {/* Terminal Tabs */}
            <div className="flex bg-slate-800 border-b border-slate-700 overflow-x-auto">
                {[
                    { id: 'R1_CLI', label: 'R1: Terminal (Admin)', icon: 'fa-terminal' },
                    { id: 'R1_IDS', label: 'R1: Snort Logs', icon: 'fa-eye' },
                    { id: 'H5', label: 'H5: User Workstation', icon: 'fa-desktop' },
                    { id: 'H10', label: 'H10: Attacker Server', icon: 'fa-skull' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id as any)}
                        className={`px-4 py-3 text-sm font-bold flex items-center gap-2 transition-colors border-r border-slate-700
                            ${activeTab === tab.id 
                                ? 'bg-slate-900 text-blue-400 border-t-2 border-t-blue-500' 
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                            }`}
                    >
                        <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-500'}`}></i>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Terminal Output */}
            <div className="flex-grow p-4 font-mono text-sm overflow-y-auto custom-scrollbar bg-black/50">
                {terminals[activeTab].lines.map((line, idx) => (
                    <div key={idx} className="mb-1 break-words">
                        {line.startsWith('$') || line.startsWith('mininet>') || line.endsWith('#') ? (
                            <span className="text-green-400 font-bold">{line}</span>
                        ) : line.includes('Error') || line.includes('failed') ? (
                            <span className="text-red-400">{line}</span>
                        ) : line.includes('Malicious Server Hit') ? (
                            <span className="text-yellow-400 font-bold bg-red-900/30 px-1 rounded block mt-1 mb-1 border-l-4 border-yellow-500 pl-2">{line}</span>
                        ) : (
                            <span className="text-slate-300">{line}</span>
                        )}
                    </div>
                ))}
                <div ref={terminalEndRef}></div>
            </div>

            {/* Command Palette (Context Sensitive) */}
            <div className="bg-slate-800 p-4 border-t border-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {activeTab === 'R1_CLI' && (
                        <>
                            <button onClick={runStartMininet} disabled={simState.mininetStarted} className="bg-slate-700 hover:bg-blue-600 text-white py-2 px-3 rounded text-xs font-bold transition-colors disabled:opacity-50">
                                Start Mininet
                            </button>
                            <button onClick={runIptablesList} disabled={!simState.mininetStarted} className="bg-slate-700 hover:bg-blue-600 text-white py-2 px-3 rounded text-xs font-bold transition-colors disabled:opacity-50">
                                List Firewall Rules
                            </button>
                            <button onClick={runIptablesBlock} disabled={!simState.mininetStarted} className="col-span-2 bg-red-700 hover:bg-red-600 text-white py-2 px-3 rounded text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                <i className="fas fa-ban"></i> Block Malicious IP
                            </button>
                        </>
                    )}

                    {activeTab === 'R1_IDS' && (
                        <button onClick={runStartSnort} disabled={simState.snortRunning} className="bg-slate-700 hover:bg-blue-600 text-white py-2 px-3 rounded text-xs font-bold transition-colors disabled:opacity-50">
                            Start Snort IDS
                        </button>
                    )}

                    {activeTab === 'H10' && (
                        <>
                            <button onClick={runStartMalServer} disabled={simState.serverRunning} className="bg-slate-700 hover:bg-red-600 text-white py-2 px-3 rounded text-xs font-bold transition-colors disabled:opacity-50">
                                Start Malware Svr
                            </button>
                            <button onClick={runNetstat} disabled={!simState.serverRunning} className="bg-slate-700 hover:bg-blue-600 text-white py-2 px-3 rounded text-xs font-bold transition-colors disabled:opacity-50">
                                Check Ports (netstat)
                            </button>
                        </>
                    )}

                    {activeTab === 'H5' && (
                        <button onClick={runWget} disabled={!simState.serverRunning} className="col-span-2 bg-slate-700 hover:bg-blue-600 text-white py-2 px-3 rounded text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            <i className="fas fa-download"></i> Download File (wget)
                        </button>
                    )}
                </div>
            </div>
        </div>

      </div>

      {/* Completion Bar */}
      {simState.firewallBlocked && simState.malwareDownloaded && (
          <div className="bg-green-600 text-white p-4 text-center cursor-pointer hover:bg-green-700 transition-colors fixed bottom-0 left-0 right-0 z-50 shadow-lg" onClick={checkCompletion}>
              <span className="font-bold text-lg"><i className="fas fa-check-circle mr-2"></i> Lab Objectives Met! Click to Finish.</span>
          </div>
      )}
    </div>
  );
};

export default SnortFirewallPBQ;
