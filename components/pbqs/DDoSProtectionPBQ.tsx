
import React, { useState, useEffect, useRef } from 'react';

interface DDoSProtectionPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

type AttackType = 'NONE' | 'UDP_FLOOD' | 'SYN_FLOOD' | 'HTTP_FLOOD';
type MitigationType = 'SCRUBBING' | 'SYN_COOKIES' | 'WAF' | 'RATE_LIMIT' | 'BLACKHOLE';

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'INFO' | 'WARN' | 'ALERT';
}

const ATTACK_SCENARIOS: Record<AttackType, {
  name: string;
  description: string;
  bandwidthImpact: number; // Gbps
  cpuImpact: number; // %
  latencyImpact: number; // ms
  clues: string[];
  effectiveMitigations: MitigationType[];
}> = {
  'NONE': {
    name: 'Normal Traffic',
    description: 'Traffic levels are nominal.',
    bandwidthImpact: 2,
    cpuImpact: 15,
    latencyImpact: 20,
    clues: ['GET /index.html 200 OK', 'Keep-Alive normal', 'User session established'],
    effectiveMitigations: []
  },
  'UDP_FLOOD': {
    name: 'Volumetric Attack',
    description: 'Massive influx of traffic saturating the uplink.',
    bandwidthImpact: 98, // Saturation > 90 triggers OFFLINE
    cpuImpact: 45,
    latencyImpact: 150,
    clues: ['Inbound UDP packet (1400 bytes) port 53', 'Fragmented IP packets detected', 'Interface eth0 saturated', 'UDP checksum errors'],
    effectiveMitigations: ['SCRUBBING']
  },
  'SYN_FLOOD': {
    name: 'Protocol Attack',
    description: 'Exhausting server connection tables.',
    bandwidthImpact: 30,
    cpuImpact: 99, // > 90 triggers OFFLINE
    latencyImpact: 600,
    clues: ['TCP state: SYN_RECV count > 10000', 'Connection table full', 'Handshake timeout', 'ACK not received'],
    effectiveMitigations: ['SYN_COOKIES']
  },
  'HTTP_FLOOD': {
    name: 'Application Attack',
    description: 'Layer 7 resource exhaustion.',
    bandwidthImpact: 15,
    cpuImpact: 88,
    latencyImpact: 2500, // > 1000 triggers OFFLINE
    clues: ['GET /login.php HTTP/1.1', 'Database connection pool exhausted', '503 Service Unavailable', 'User-Agent: bot-net-v1'],
    effectiveMitigations: ['WAF', 'RATE_LIMIT']
  }
};

const DDoSProtectionPBQ: React.FC<DDoSProtectionPBQProps> = ({ onComplete, onExit }) => {
  // Game State
  const [activeMitigations, setActiveMitigations] = useState<MitigationType[]>([]);
  const [phase, setPhase] = useState(0); // 0: Start, 1: UDP, 2: SYN, 3: HTTP, 4: Win
  
  // Metrics State
  const [bandwidth, setBandwidth] = useState(2);
  const [cpu, setCpu] = useState(15);
  const [latency, setLatency] = useState(20);
  const [serverStatus, setServerStatus] = useState<'ONLINE' | 'DEGRADED' | 'OFFLINE'>('ONLINE');
  const [statusMessage, setStatusMessage] = useState('Systems Nominal');
  
  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logCounter = useRef(0);

  // Timer for game loop
  useEffect(() => {
    const interval = setInterval(() => {
      gameLoop();
    }, 1000);
    return () => clearInterval(interval);
  }, [activeMitigations, phase]);

  const addLog = (msg: string, type: 'INFO' | 'WARN' | 'ALERT' = 'INFO') => {
    const newLog = {
      id: logCounter.current++,
      timestamp: new Date().toLocaleTimeString(),
      message: msg,
      type
    };
    setLogs(prev => [newLog, ...prev.slice(0, 19)]); // Keep last 20
  };

  const gameLoop = () => {
    // 1. Determine Attack State based on Phase
    let targetAttack: AttackType = 'NONE';
    if (phase === 1) targetAttack = 'UDP_FLOOD';
    else if (phase === 2) targetAttack = 'SYN_FLOOD';
    else if (phase === 3) targetAttack = 'HTTP_FLOOD';
    
    const scenario = ATTACK_SCENARIOS[targetAttack];
    
    // 2. Logic: Blackhole overrides everything
    if (activeMitigations.includes('BLACKHOLE')) {
        setBandwidth(0);
        setCpu(1);
        setLatency(0);
        setServerStatus('OFFLINE');
        setStatusMessage('Traffic Dropped (Blackhole)');
        if (Math.random() > 0.8) addLog('Blackhole Active: All traffic dropped. Service unavailable.', 'WARN');
        return;
    }

    // 3. Logic: Check Mitigations
    // Must contain AT LEAST ONE effective mitigation
    const hasEffective = scenario.effectiveMitigations.some(m => activeMitigations.includes(m));
    
    // 4. Calculate Targets
    let targetBw = scenario.bandwidthImpact;
    let targetCpu = scenario.cpuImpact;
    let targetLat = scenario.latencyImpact;

    if (hasEffective) {
        // Mitigation effective
        targetBw = 5;
        targetCpu = 25;
        targetLat = 30;
    } else {
        // Penalty for Wrong Mitigations
        // e.g. WAF on UDP flood wastes CPU trying to parse garbage
        if (targetAttack === 'UDP_FLOOD' && (activeMitigations.includes('WAF') || activeMitigations.includes('RATE_LIMIT'))) {
            targetCpu += 20; // Penalty
            if (Math.random() > 0.7) addLog('WARN: WAF struggling to parse malformed UDP packets.', 'WARN');
        }
        // e.g. Scrubbing on HTTP flood adds latency but doesn't stop it (logic layer)
        if (targetAttack === 'HTTP_FLOOD' && activeMitigations.includes('SCRUBBING')) {
            targetLat += 100; // Penalty
        }
    }

    // 5. Apply Smooth Transitions
    setBandwidth(prev => Math.floor(prev + (targetBw - prev) * 0.2));
    setCpu(prev => Math.floor(prev + (targetCpu - prev) * 0.2));
    setLatency(prev => Math.floor(prev + (targetLat - prev) * 0.2));

    // 6. Determine Status
    // Thresholds: Offline if severe, Degraded if warning
    let newStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE' = 'ONLINE';
    if (cpu > 90 || latency > 1000 || bandwidth > 90) newStatus = 'OFFLINE';
    else if (cpu > 60 || latency > 200 || bandwidth > 70) newStatus = 'DEGRADED';
    
    setServerStatus(newStatus);
    setStatusMessage(newStatus === 'ONLINE' ? 'Operational' : newStatus === 'OFFLINE' ? 'Service Down' : 'Performance Degraded');

    // 7. Generate Logs
    if (Math.random() > 0.3) {
        const clues = hasEffective ? ATTACK_SCENARIOS['NONE'].clues : scenario.clues;
        const randomClue = clues[Math.floor(Math.random() * clues.length)];
        const type = hasEffective ? 'INFO' : 'ALERT';
        addLog(randomClue, type);
    }
  };

  const toggleMitigation = (mitigation: MitigationType) => {
    if (activeMitigations.includes(mitigation)) {
        setActiveMitigations(prev => prev.filter(m => m !== mitigation));
        addLog(`Disabling ${mitigation}...`, 'WARN');
    } else {
        setActiveMitigations(prev => [...prev, mitigation]);
        addLog(`Enabling ${mitigation}...`, 'INFO');
    }
  };

  const startNextPhase = () => {
    const nextPhase = phase + 1;
    setPhase(nextPhase);
    setActiveMitigations([]); // Reset mitigations for the new wave
    
    if (nextPhase === 1) addLog("ALERT: Traffic spike detected on external interface!", 'ALERT');
    if (nextPhase === 2) addLog("ALERT: Server connection pool filling up rapidly!", 'ALERT');
    if (nextPhase === 3) addLog("ALERT: Web application responding slowly!", 'ALERT');
    if (nextPhase === 4) {
        onComplete(100); // Win condition
    }
  };

  const isStable = serverStatus === 'ONLINE' && phase > 0;

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-fadeIn overflow-y-auto font-sans text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-network-wired"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Advanced DDoS Mitigation</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Status & Logs */}
        <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Server Health */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-server text-blue-600"></i> Server Health
                </h3>
                
                <div className="space-y-4">
                    {/* Bandwidth */}
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                            <span>Uplink Usage</span>
                            <span>{bandwidth} Gbps / 100 Gbps</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${bandwidth > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(bandwidth, 100)}%` }}></div>
                        </div>
                    </div>

                    {/* CPU */}
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                            <span>CPU Load</span>
                            <span>{cpu}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${cpu > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(cpu, 100)}%` }}></div>
                        </div>
                    </div>

                    {/* Latency */}
                    <div>
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                            <span>App Latency</span>
                            <span>{latency} ms</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${latency > 500 ? 'bg-red-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(latency/20, 100)}%` }}></div>
                        </div>
                    </div>

                    <div className={`mt-4 p-3 rounded-lg text-center font-bold text-sm border-2 transition-colors duration-500 ${serverStatus === 'ONLINE' ? 'bg-green-50 border-green-200 text-green-700' : serverStatus === 'DEGRADED' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        STATUS: {statusMessage}
                    </div>
                </div>
            </div>

            {/* Live Logs */}
            <div className="bg-gray-900 rounded-xl shadow-inner border border-gray-700 flex flex-col flex-grow min-h-[300px] overflow-hidden">
                <div className="bg-gray-800 p-3 border-b border-gray-700 flex justify-between items-center">
                    <span className="text-gray-300 font-mono text-xs font-bold">/var/log/syslog</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                </div>
                <div className="p-4 font-mono text-xs overflow-y-auto flex-grow space-y-1 custom-scrollbar">
                    {logs.map(log => (
                        <div key={log.id} className={`${log.type === 'ALERT' ? 'text-red-400 font-bold' : log.type === 'WARN' ? 'text-yellow-300' : 'text-gray-400'}`}>
                            <span className="text-gray-600">[{log.timestamp}]</span> {log.message}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column: Controls & Game Flow */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Scenario Header */}
            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">
                        {phase === 0 ? "Ready to Start" : phase === 4 ? "Simulation Complete" : `Attack Phase ${phase}/3`}
                    </h2>
                    <p className="text-blue-200 text-sm mt-1">
                        {phase === 0 && "Initialize the monitoring systems to begin traffic simulation."}
                        {phase === 1 && "Target: Volumetric Traffic Flood."}
                        {phase === 2 && "Target: TCP State Exhaustion."}
                        {phase === 3 && "Target: Application Layer Saturation."}
                        {phase === 4 && "All threats neutralized. Network stable."}
                    </p>
                </div>
                {phase < 4 && (
                    <button 
                        onClick={startNextPhase} 
                        disabled={phase > 0 && !isStable}
                        className={`px-6 py-3 rounded-lg font-bold shadow-lg transition-all ${phase > 0 && !isStable ? 'bg-gray-500 cursor-not-allowed opacity-50' : 'bg-white text-blue-600 hover:scale-105'}`}
                    >
                        {phase === 0 ? "Start Simulation" : "Next Wave"}
                    </button>
                )}
            </div>

            {/* Mitigation Controls */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-grow">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <i className="fas fa-sliders-h text-blue-600"></i> Mitigation Controls
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Scrubbing */}
                    <div 
                        onClick={() => toggleMitigation('SCRUBBING')} 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center group ${activeMitigations.includes('SCRUBBING') ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                    >
                        <div>
                            <div className="font-bold text-gray-800">Traffic Scrubbing</div>
                            <div className="text-xs text-gray-500">Filters Volumetric Floods (UDP/ICMP)</div>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${activeMitigations.includes('SCRUBBING') ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${activeMitigations.includes('SCRUBBING') ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </div>

                    {/* SYN Cookies */}
                    <div 
                        onClick={() => toggleMitigation('SYN_COOKIES')} 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center group ${activeMitigations.includes('SYN_COOKIES') ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                    >
                        <div>
                            <div className="font-bold text-gray-800">SYN Cookies</div>
                            <div className="text-xs text-gray-500">Mitigates TCP SYN Floods</div>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${activeMitigations.includes('SYN_COOKIES') ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${activeMitigations.includes('SYN_COOKIES') ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </div>

                    {/* WAF */}
                    <div 
                        onClick={() => toggleMitigation('WAF')} 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center group ${activeMitigations.includes('WAF') ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                    >
                        <div>
                            <div className="font-bold text-gray-800">Web App Firewall</div>
                            <div className="text-xs text-gray-500">Inspects Layer 7 (HTTP) Traffic</div>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${activeMitigations.includes('WAF') ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${activeMitigations.includes('WAF') ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </div>

                    {/* Rate Limit */}
                    <div 
                        onClick={() => toggleMitigation('RATE_LIMIT')} 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center group ${activeMitigations.includes('RATE_LIMIT') ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                    >
                        <div>
                            <div className="font-bold text-gray-800">Rate Limiting</div>
                            <div className="text-xs text-gray-500">Caps requests per IP/sec</div>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${activeMitigations.includes('RATE_LIMIT') ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${activeMitigations.includes('RATE_LIMIT') ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </div>

                    {/* Blackhole */}
                    <div 
                        onClick={() => toggleMitigation('BLACKHOLE')} 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center group md:col-span-2 ${activeMitigations.includes('BLACKHOLE') ? 'bg-red-50 border-red-500' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-red-100 p-2 rounded text-red-600"><i className="fas fa-ban"></i></div>
                            <div>
                                <div className="font-bold text-gray-800">Blackhole Routing</div>
                                <div className="text-xs text-gray-500">Drops ALL traffic (Emergency Only) - Takes Service Offline</div>
                            </div>
                        </div>
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${activeMitigations.includes('BLACKHOLE') ? 'bg-red-600' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${activeMitigations.includes('BLACKHOLE') ? 'translate-x-4' : ''}`}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default DDoSProtectionPBQ;
