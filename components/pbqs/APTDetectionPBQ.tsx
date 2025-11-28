
import React, { useState } from 'react';
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface LogEntry {
  id: number;
  timestamp: string;
  source: string;
  destination: string;
  event: string;
  details: string;
  isIOC: boolean;
}

const APTDetectionPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const logs: LogEntry[] = [
    { id: 1, timestamp: '02:05:12', source: '192.168.10.45', destination: '10.1.1.5', event: 'File Share Access', details: 'User accessing HR_Docs share', isIOC: false },
    { id: 2, timestamp: '02:05:15', source: '192.168.10.102', destination: '45.13.22.10', event: 'Outbound Traffic', details: 'High volume transfer (2.5GB) via HTTP', isIOC: true },
    { id: 3, timestamp: '02:06:00', source: '192.168.10.45', destination: '8.8.8.8', event: 'DNS Query', details: 'Standard query: google.com', isIOC: false },
    { id: 4, timestamp: '02:06:15', source: '192.168.10.102', destination: '104.22.11.5', event: 'Beacon', details: 'Connection attempt every 60s (Pulse)', isIOC: true },
    { id: 5, timestamp: '02:07:00', source: '192.168.10.22', destination: '10.1.1.2', event: 'Login Success', details: 'Admin login via RDP', isIOC: false },
    { id: 6, timestamp: '02:07:30', source: '192.168.10.102', destination: 'Localhost', event: 'Process Execution', details: 'powershell.exe -enc aW52b2tlLWV4cHJlc3Npb24uLi4=', isIOC: true },
    { id: 7, timestamp: '02:08:00', source: '192.168.10.55', destination: '10.1.1.5', event: 'File Share Access', details: 'User accessing Sales_Docs share', isIOC: false },
    { id: 8, timestamp: '02:15:00', source: '192.168.10.102', destination: '192.168.10.103', event: 'Port Scan', details: 'Scanning ports 22, 445, 3389', isIOC: true },
  ];

  const toggleLog = (id: number) => {
    setSelectedLogs(prev =>
      prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
    );
  };

  const handleSubmit = () => {
    const totalIOCs = logs.filter(l => l.isIOC).length;
    const correctSelections = selectedLogs.filter(id => logs.find(l => l.id === id)?.isIOC).length;
    const incorrectSelections = selectedLogs.filter(id => !logs.find(l => l.id === id)?.isIOC).length;

    let score = 0;
    const messages = [];

    // Calculate score
    // Reward for finding IOCs, penalize for false positives
    if (incorrectSelections === 0 && correctSelections === totalIOCs) {
        score = 100;
        messages.push("Perfect analysis! You identified all indicators of compromise without any false positives.");
    } else {
        score = Math.max(0, Math.round((correctSelections / totalIOCs) * 100) - (incorrectSelections * 20));

        if (correctSelections < totalIOCs) {
            messages.push(`You missed ${totalIOCs - correctSelections} indicator(s). Look for patterns like data exfiltration, beaconing, and obfuscated commands.`);
        }
        if (incorrectSelections > 0) {
            messages.push(`You flagged ${incorrectSelections} normal event(s) as suspicious (False Positives).`);
        }
    }

    setSuccess(score >= 80);
    setFeedback(messages.join("\n"));
    if (score >= 80) onComplete(score);
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-user-secret"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">APT Detection</h2>
            <p className="text-xs text-gray-500">Threat Hunting & Log Analysis</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex gap-4">
                    <div className="hidden md:flex w-12 h-12 bg-red-100 rounded-full items-center justify-center text-red-600 flex-shrink-0">
                        <i className="fas fa-search-dollar text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Investigate Suspicious Activity</h3>
                        <p className="text-gray-600">
                            Review the SIEM logs below. Identify and flag log entries that indicate an Advanced Persistent Threat (APT) activity.
                            Look for <strong>Data Exfiltration</strong>, <strong>Beaconing</strong>, <strong>Obfuscated Commands</strong>, and <strong>Lateral Movement</strong>.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 text-gray-600 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Flag</th>
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Source</th>
                            <th className="px-6 py-4">Destination</th>
                            <th className="px-6 py-4">Event Type</th>
                            <th className="px-6 py-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map((log) => (
                            <tr
                                key={log.id}
                                onClick={() => toggleLog(log.id)}
                                className={`cursor-pointer transition-colors ${selectedLogs.includes(log.id) ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}`}
                            >
                                <td className="px-6 py-4 text-center">
                                    <div className={`w-5 h-5 rounded border-2 mx-auto flex items-center justify-center ${selectedLogs.includes(log.id) ? 'bg-red-600 border-red-600' : 'border-gray-300'}`}>
                                        {selectedLogs.includes(log.id) && <i className="fas fa-check text-white text-xs"></i>}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-gray-600">{log.timestamp}</td>
                                <td className="px-6 py-4 font-mono">{log.source}</td>
                                <td className="px-6 py-4 font-mono">{log.destination}</td>
                                <td className="px-6 py-4 font-bold text-gray-700">{log.event}</td>
                                <td className="px-6 py-4 text-gray-600">{log.details}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end items-center">
                <div className="mr-6 text-gray-500 font-medium">
                    {selectedLogs.length} events flagged
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-red-500/30 transition-all flex items-center gap-2"
                >
                    <i className="fas fa-bug"></i> Report Incident
                </button>
            </div>
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        <i className={`fas ${success ? 'fa-check-circle' : 'fa-search'} text-3xl`}></i>
                    </div>
                    <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-orange-800'}`}>
                        {success ? 'Threat Eliminated' : 'Investigation Incomplete'}
                    </h3>
                </div>

                <div className="p-8">
                    <div className="whitespace-pre-line text-gray-700 text-lg leading-relaxed mb-6 text-center">
                        {feedback}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 flex justify-center">
                    {success ? (
                        <button onClick={onExit} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">Case Closed</button>
                    ) : (
                        <button onClick={() => setFeedback(null)} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">Continue Investigation</button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default APTDetectionPBQ;
