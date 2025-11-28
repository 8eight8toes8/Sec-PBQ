import React, { useState } from 'react';

interface DDoSProtectionPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const DDoSProtectionPBQ: React.FC<DDoSProtectionPBQProps> = ({ onComplete, onExit }) => {
  const [controls, setControls] = useState({
    rateLimiting: false,
    waf: false,
    geoBlocking: false,
    sinkholing: false
  });
  
  const [traffic, setTraffic] = useState(100); // 100% load
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleControl = (key: keyof typeof controls) => {
    setControls(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    // Scenario: HTTP Flood from foreign botnets
    // Needed: Rate Limiting, WAF, GeoBlocking
    // Sinkholing is usually for DNS/Routing attacks, less relevant for App Layer flood here but acceptable.
    
    let score = 0;
    if (controls.rateLimiting) score += 30;
    if (controls.waf) score += 40;
    if (controls.geoBlocking) score += 30;

    if (score >= 90) {
        setFeedback("Attack Mitigated! Traffic levels normalized. Rate limiting and WAF filtered the malicious HTTP flood.");
        onComplete(100);
    } else {
        setFeedback("Server Overload! You need to implement more comprehensive filtering. Specifically look for controls that handle application layer (Layer 7) floods.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col animate-fadeIn overflow-y-auto text-gray-100">
      <div className="bg-gray-800 shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-red-500 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-network-wired"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">DDoS Mitigation Console</h2>
            <p className="text-xs text-gray-400">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-white p-2 rounded-full">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-8 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Monitor */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col">
            <h3 className="font-bold text-gray-300 mb-4 flex items-center gap-2"><i className="fas fa-chart-area"></i> Traffic Monitor</h3>
            <div className="flex-grow bg-gray-900 rounded-lg p-4 relative overflow-hidden flex items-end justify-center">
                {/* Simulated Graph Bars */}
                <div className="w-full flex items-end justify-around h-64 gap-1">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="w-3 bg-red-500 animate-pulse" style={{ height: `${Math.random() * 40 + 60}%` }}></div>
                    ))}
                </div>
                <div className="absolute top-4 right-4 text-red-500 font-mono font-bold text-xl animate-pulse">
                    LOAD: CRITICAL
                </div>
            </div>
            <p className="mt-4 text-sm text-gray-400">
                <strong>Alert:</strong> High volume of HTTP GET requests originating from multiple international IPs targeting login endpoint.
            </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="font-bold text-gray-300 mb-6 flex items-center gap-2"><i className="fas fa-sliders-h"></i> Mitigation Controls</h3>
            
            <div className="space-y-4">
                <div onClick={() => toggleControl('rateLimiting')} className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center ${controls.rateLimiting ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}>
                    <div>
                        <div className="font-bold text-white">Rate Limiting</div>
                        <div className="text-xs text-gray-400">Cap requests per IP/second</div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${controls.rateLimiting ? 'bg-blue-500' : 'bg-gray-600'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${controls.rateLimiting ? 'translate-x-6' : ''}`}></div>
                    </div>
                </div>

                <div onClick={() => toggleControl('waf')} className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center ${controls.waf ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}>
                    <div>
                        <div className="font-bold text-white">Web App Firewall (WAF)</div>
                        <div className="text-xs text-gray-400">Inspect HTTP payload & challenge bots</div>
                    </div>
                     <div className={`w-12 h-6 rounded-full p-1 transition-colors ${controls.waf ? 'bg-blue-500' : 'bg-gray-600'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${controls.waf ? 'translate-x-6' : ''}`}></div>
                    </div>
                </div>

                 <div onClick={() => toggleControl('geoBlocking')} className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center ${controls.geoBlocking ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}>
                    <div>
                        <div className="font-bold text-white">Geo-Blocking</div>
                        <div className="text-xs text-gray-400">Block traffic from non-service regions</div>
                    </div>
                     <div className={`w-12 h-6 rounded-full p-1 transition-colors ${controls.geoBlocking ? 'bg-blue-500' : 'bg-gray-600'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${controls.geoBlocking ? 'translate-x-6' : ''}`}></div>
                    </div>
                </div>

                <div onClick={() => toggleControl('sinkholing')} className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center ${controls.sinkholing ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'}`}>
                    <div>
                        <div className="font-bold text-white">DNS Sinkholing</div>
                        <div className="text-xs text-gray-400">Redirect malicious domain traffic</div>
                    </div>
                     <div className={`w-12 h-6 rounded-full p-1 transition-colors ${controls.sinkholing ? 'bg-blue-500' : 'bg-gray-600'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${controls.sinkholing ? 'translate-x-6' : ''}`}></div>
                    </div>
                </div>
            </div>

            <button onClick={handleSubmit} className="mt-8 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all animate-pulse">
                Deploy Defenses
            </button>
        </div>

      </div>

      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
             <div className="bg-gray-800 p-8 rounded-xl max-w-md w-full shadow-2xl text-center border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-white">Status Report</h3>
                <p className="text-gray-300 mb-6">{feedback}</p>
                <button onClick={() => feedback.includes('Mitigated') ? onExit() : setFeedback(null)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">
                    {feedback.includes('Mitigated') ? 'Return to Dashboard' : 'Adjust Strategy'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default DDoSProtectionPBQ;