
import React, { useState } from 'react';

interface APTDetectionPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface NetworkFlow {
  id: string;
  timestamp: string;
  process: string;
  sourceIp: string;
  destIp: string;
  port: number;
  protocol: string;
  bytes: number;
  duration: number;
  suspicious: boolean;
  reason?: string;
}

const FLOWS: NetworkFlow[] = [
  { id: 'flow1', timestamp: '14:02:01', process: 'chrome.exe', sourceIp: '192.168.1.105', destIp: '172.217.16.14', port: 443, protocol: 'TCP', bytes: 4500, duration: 120, suspicious: false },
  { id: 'flow2', timestamp: '14:02:05', process: 'svchost.exe', sourceIp: '192.168.1.105', destIp: '104.21.55.2', port: 443, protocol: 'TCP', bytes: 200, duration: 2, suspicious: false },
  { id: 'flow3', timestamp: '02:00:00', process: 'powershell.exe', sourceIp: '192.168.1.105', destIp: '45.13.12.99', port: 8080, protocol: 'TCP', bytes: 15000000, duration: 3600, suspicious: true, reason: 'Large outbound transfer at 2AM via PowerShell to unknown IP on non-standard port.' },
  { id: 'flow4', timestamp: '14:03:10', process: 'outlook.exe', sourceIp: '192.168.1.105', destIp: '40.97.128.0', port: 443, protocol: 'TCP', bytes: 1200, duration: 5, suspicious: false },
  { id: 'flow5', timestamp: '14:05:00', process: 'rundll32.exe', sourceIp: '192.168.1.105', destIp: '192.168.1.5', port: 445, protocol: 'SMB', bytes: 500, duration: 1, suspicious: true, reason: 'Lateral movement attempt using rundll32.exe over SMB.' },
  { id: 'flow6', timestamp: '14:00:00', process: 'system', sourceIp: '192.168.1.105', destIp: '8.8.8.8', port: 53, protocol: 'UDP', bytes: 80, duration: 0, suspicious: false },
  { id: 'flow7', timestamp: 'Periodic', process: 'unknown', sourceIp: '192.168.1.105', destIp: '185.20.1.1', port: 443, protocol: 'TCP', bytes: 64, duration: 0, suspicious: true, reason: 'Regular, small beaconing traffic (Heartbeat) to C2 server.' },
];

const APTDetectionPBQ: React.FC<APTDetectionPBQProps> = ({ onComplete, onExit }) => {
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const toggleFlag = (id: string) => {
    if (flaggedIds.includes(id)) {
      setFlaggedIds(prev => prev.filter(fid => fid !== id));
    } else {
      setFlaggedIds(prev => [...prev, id]);
    }
  };

  const handleSubmit = () => {
    const maliciousIds = FLOWS.filter(f => f.suspicious).map(f => f.id);
    const correctFlags = flaggedIds.filter(id => maliciousIds.includes(id));
    const falsePositives = flaggedIds.filter(id => !maliciousIds.includes(id));
    const missed = maliciousIds.filter(id => !flaggedIds.includes(id));

    let score = 0;
    if (missed.length === 0 && falsePositives.length === 0) {
      score = 100;
    } else {
      // Partial credit logic
      const totalMalicious = maliciousIds.length;
      score = Math.max(0, Math.round(((correctFlags.length - falsePositives.length) / totalMalicious) * 100));
    }

    setSuccess(score >= 80);
    
    if (score >= 80) {
      setFeedback("Excellent work! You correctly identified the data exfiltration (PowerShell), lateral movement (SMB), and C2 Beaconing traffic.");
      onComplete(score);
    } else {
      let msg = `Analysis Incomplete (Score: ${score}%).\n`;
      if (missed.length > 0) msg += `\nMissed Threats: ${missed.length}. Look for odd hours, high volumes, or strange processes.`;
      if (falsePositives.length > 0) msg += `\nFalse Positives: ${falsePositives.length}. Some benign traffic was flagged.`;
      setFeedback(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-fadeIn overflow-y-auto font-sans text-gray-900">
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-user-secret"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">APT Threat Hunting</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Network Traffic Analysis</h3>
                <p className="text-sm text-gray-600">
                    Analyze the captured network flows from the compromised endpoint <strong>(192.168.1.105)</strong>. 
                    Flag suspicious entries indicative of an Advanced Persistent Threat (APT).
                </p>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-100 text-gray-500 uppercase font-bold text-xs border-b border-gray-200">
                        <tr>
                            <th className="p-4">Time</th>
                            <th className="p-4">Process</th>
                            <th className="p-4">Destination</th>
                            <th className="p-4">Port/Proto</th>
                            <th className="p-4 text-right">Bytes</th>
                            <th className="p-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {FLOWS.map(flow => (
                            <tr key={flow.id} className={`hover:bg-gray-50 transition-colors ${flaggedIds.includes(flow.id) ? 'bg-red-50' : ''}`}>
                                <td className="p-4 font-mono text-gray-500">{flow.timestamp}</td>
                                <td className="p-4 text-blue-600 font-bold font-mono">{flow.process}</td>
                                <td className="p-4 font-mono">{flow.destIp}</td>
                                <td className="p-4">{flow.port} ({flow.protocol})</td>
                                <td className="p-4 text-right font-mono text-gray-500">{flow.bytes.toLocaleString()}</td>
                                <td className="p-4 text-center">
                                    <button 
                                        onClick={() => toggleFlag(flow.id)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border shadow-sm ${flaggedIds.includes(flow.id) ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800'}`}
                                    >
                                        {flaggedIds.includes(flow.id) ? 'FLAGGED' : 'FLAG'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="flex justify-end">
            <button 
                onClick={handleSubmit} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 hover:-translate-y-0.5"
            >
                <i className="fas fa-search"></i> Submit Analysis
            </button>
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
             <div className="bg-white p-8 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 text-center">
                 <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${success ? 'fa-check' : 'fa-times'} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">{success ? 'Threat Containment Successful' : 'Investigation Incomplete'}</h3>
                <div className="text-gray-600 text-sm whitespace-pre-line mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 text-left">
                    {feedback}
                </div>
                <button onClick={() => success ? onExit() : setFeedback(null)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md">
                    {success ? 'Return to Dashboard' : 'Review Logs'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default APTDetectionPBQ;
