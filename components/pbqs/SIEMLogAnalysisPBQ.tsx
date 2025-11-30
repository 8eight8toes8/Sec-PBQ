
import React, { useState } from 'react';

interface SIEMLogAnalysisPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface LogEntry {
  id: number;
  timestamp: string;
  source: string;
  event_id: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  message: string;
}

type Tactic = 'Initial Access' | 'Execution' | 'Persistence' | 'Command & Control' | 'Exfiltration';

const LOG_DATA: LogEntry[] = [
  { id: 90, timestamp: '2023-10-25 07:55:00', source: 'System Monitor', event_id: 'SYS-BOOT', severity: 'INFO', message: 'Server-01 uptime check: 45 days, 12 hours. Service status: NOMINAL.' },
  { id: 91, timestamp: '2023-10-25 08:00:05', source: 'Active Directory', event_id: 'AUTH-SUCCESS', severity: 'INFO', message: 'User JSmith logged in successfully from workstation WS-04 (192.168.1.55).' },
  { id: 101, timestamp: '2023-10-25 08:01:12', source: 'Firewall', event_id: 'FW-ALLOW', severity: 'INFO', message: 'Packet allowed from 192.168.1.55 to 8.8.8.8:53 (UDP)' },
  { id: 92, timestamp: '2023-10-25 08:15:33', source: 'Server-02', event_id: 'RDP-FAIL', severity: 'WARN', message: 'Failed RDP login attempt from 192.168.1.200 (IT-Admin-Workstation). Bad password.' },
  { id: 93, timestamp: '2023-10-25 08:30:11', source: 'Update Service', event_id: 'SOFT-UPD', severity: 'INFO', message: 'Adobe Acrobat Reader update service started. Downloading patch v23.001.' },
  { id: 102, timestamp: '2023-10-25 09:15:22', source: 'Email Gateway', event_id: 'MAIL-RECV', severity: 'INFO', message: 'Email received from "hr-updates@fakedomain.com" Subject: "Urgent: Benefits Enrollment"' },
  { id: 94, timestamp: '2023-10-25 09:15:45', source: 'Web Proxy', event_id: 'URL-VISIT', severity: 'INFO', message: 'WS-04 request: GET http://fakedomain.com/login/benefits.html (Category: Unclassified)' },
  { id: 103, timestamp: '2023-10-25 09:16:05', source: 'Endpoint (Workstation-04)', event_id: 'PROC-START', severity: 'WARN', message: 'User clicked link in email. Browser spawned process: powershell.exe -w hidden -enc ...' },
  { id: 104, timestamp: '2023-10-25 09:16:08', source: 'Endpoint (Workstation-04)', event_id: 'SYS-MOD', severity: 'CRITICAL', message: 'Registry Key Modified: HKCU\\...\\Run\\Updater.exe (Persistence mechanism detected)' },
  { id: 95, timestamp: '2023-10-25 09:20:15', source: 'Application Monitor', event_id: 'APP-CRASH', severity: 'ERROR', message: 'Outlook.exe stopped responding on WS-02. Fault module: ntdll.dll.' },
  { id: 105, timestamp: '2023-10-25 09:30:00', source: 'Server-01', event_id: 'AUTH-FAIL', severity: 'WARN', message: 'Failed login attempt for user admin' },
  { id: 96, timestamp: '2023-10-25 10:00:00', source: 'Backup System', event_id: 'BACKUP-START', severity: 'INFO', message: 'Scheduled incremental backup started for Volume D:.' },
  { id: 97, timestamp: '2023-10-25 10:15:45', source: 'WAF', event_id: 'SQL-INJ', severity: 'CRITICAL', message: 'Blocked SQL Injection attempt from external IP 203.0.113.44 against public web server.' },
  { id: 106, timestamp: '2023-10-25 10:45:11', source: 'Firewall', event_id: 'FW-ALLOW', severity: 'WARN', message: 'Outbound connection to 45.33.2.1:443 (Known Malicious IP) - Beacon detected' },
  { id: 98, timestamp: '2023-10-25 10:50:30', source: 'IPS', event_id: 'NET-SIG', severity: 'WARN', message: 'Potential Cobalt Strike beacon pattern detected from 192.168.1.55.' },
  { id: 107, timestamp: '2023-10-25 11:00:05', source: 'File Server', event_id: 'FILE-ACCESS', severity: 'INFO', message: 'User JSmith accessed share \\\\Finance\\Q3_Reports' },
  { id: 108, timestamp: '2023-10-25 11:05:22', source: 'DLP System', event_id: 'DATA-XFER', severity: 'CRITICAL', message: 'Large outbound file transfer (2.5GB) to 45.33.2.1 detected via HTTPS' },
  { id: 109, timestamp: '2023-10-25 11:10:15', source: 'Antivirus', event_id: 'SCAN-CLEAN', severity: 'INFO', message: 'Scheduled scan completed. No threats found.' },
  { id: 99, timestamp: '2023-10-25 11:20:00', source: 'Endpoint (Workstation-04)', event_id: 'USB-INSERT', severity: 'INFO', message: 'USB Mass Storage device connected: Kingston DataTraveler.' },
];

const REQUIRED_TACTICS: { id: Tactic; label: string; description: string }[] = [
  { id: 'Initial Access', label: 'Initial Access', description: 'How the attacker got in.' },
  { id: 'Execution', label: 'Execution', description: 'Malicious code running.' },
  { id: 'Persistence', label: 'Persistence', description: 'Maintaining access.' },
  { id: 'Command & Control', label: 'Command & Control', description: 'Communicating with attacker.' },
  { id: 'Exfiltration', label: 'Exfiltration', description: 'Stealing data.' },
];

const CORRECT_MAPPINGS: Record<Tactic, number> = {
  'Initial Access': 102,
  'Execution': 103,
  'Persistence': 104,
  'Command & Control': 106,
  'Exfiltration': 108
};

const SIEMLogAnalysisPBQ: React.FC<SIEMLogAnalysisPBQProps> = ({ onComplete, onExit }) => {
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [mappings, setMappings] = useState<Record<string, number | null>>({
    'Initial Access': null,
    'Execution': null,
    'Persistence': null,
    'Command & Control': null,
    'Exfiltration': null
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogClick = (id: number) => {
    setSelectedLogId(id);
  };

  const handleAssignLog = (tactic: string) => {
    if (selectedLogId === null) return;

    // Check if log is already used elsewhere
    const existingTactic = Object.keys(mappings).find(key => mappings[key] === selectedLogId);
    if (existingTactic && existingTactic !== tactic) {
      setMappings(prev => ({ ...prev, [existingTactic]: null, [tactic]: selectedLogId }));
    } else {
      setMappings(prev => ({ ...prev, [tactic]: selectedLogId }));
    }
    
    setSelectedLogId(null);
  };

  const handleClearMapping = (tactic: string) => {
    setMappings(prev => ({ ...prev, [tactic]: null }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const errors: string[] = [];

    REQUIRED_TACTICS.forEach(tactic => {
      const assignedLogId = mappings[tactic.id];
      const correctLogId = CORRECT_MAPPINGS[tactic.id];

      if (assignedLogId === correctLogId) {
        correctCount++;
      } else {
        if (assignedLogId === null) {
            errors.push(`${tactic.id}: No log entry assigned.`);
        } else {
            errors.push(`${tactic.id}: Incorrect log entry. Review the event details.`);
        }
      }
    });

    const score = Math.round((correctCount / REQUIRED_TACTICS.length) * 100);

    if (score === 100) {
      setSuccess(true);
      setFeedback("Excellent Analysis! You correctly reconstructed the attack chain: Phishing -> PowerShell Execution -> Registry Persistence -> C2 Beaconing -> Data Exfiltration.");
      onComplete(100);
    } else {
      setSuccess(false);
      setFeedback(`Analysis Incomplete. Score: ${score}%\n\n` + errors.map(e => "• " + e).join("\n"));
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'ERROR': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'WARN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'INFO': return 'bg-blue-50 text-blue-800 border-blue-100';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = LOG_DATA.filter(log => 
    log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.event_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-hidden font-sans text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 border-b border-gray-200 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-search"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">SIEM Log Analysis</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button 
          onClick={onExit} 
          className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all"
        >
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row h-full overflow-hidden">
        
        {/* Left: Log Console */}
        <div className="w-full lg:w-2/3 flex flex-col border-r border-gray-200 bg-white">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <i className="fas fa-list-alt text-blue-500"></i> Event Logs
            </h3>
            <div className="flex gap-2 items-center">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <span className="text-xs text-gray-500 font-medium">Live Capture</span>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="px-4 py-3 bg-white border-b border-gray-100">
            <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input 
                    type="text" 
                    placeholder="Search Event ID or Message..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 text-gray-800 text-sm py-2 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto p-0 text-sm custom-scrollbar bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 sticky top-0 uppercase text-xs font-bold tracking-wider shadow-sm">
                <tr>
                  <th className="p-3 border-b border-gray-200 w-40">Timestamp</th>
                  <th className="p-3 border-b border-gray-200 w-28">Severity</th>
                  <th className="p-3 border-b border-gray-200 w-36">Source</th>
                  <th className="p-3 border-b border-gray-200">Event Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map(log => (
                    <tr 
                      key={log.id} 
                      onClick={() => handleLogClick(log.id)}
                      className={`
                        cursor-pointer transition-colors hover:bg-blue-50
                        ${selectedLogId === log.id ? 'bg-blue-100/50' : ''}
                        ${Object.values(mappings).includes(log.id) ? 'bg-green-50' : ''}
                      `}
                    >
                      <td className="p-3 text-gray-500 whitespace-nowrap font-mono text-xs">{log.timestamp}</td>
                      <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${getSeverityBadge(log.severity)}`}>
                            {log.severity}
                          </span>
                      </td>
                      <td className="p-3 text-gray-700 font-medium">{log.source}</td>
                      <td className="p-3 text-gray-600 truncate max-w-md" title={log.message}>
                          <span className="font-mono text-xs text-blue-600 mr-2 bg-blue-50 px-1 rounded border border-blue-100">[{log.event_id}]</span>
                          {log.message}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-gray-400 italic bg-gray-50">
                      No logs match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between px-4">
             <span>Showing {filteredLogs.length} of {LOG_DATA.length} events</span>
             <span>Select a log entry to map to a tactic</span>
          </div>
        </div>

        {/* Right: Incident Report */}
        <div className="w-full lg:w-1/3 bg-gray-50 flex flex-col border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
             <div className="mb-6">
                 <h3 className="text-lg font-bold text-gray-800 mb-1">Incident Report Builder</h3>
                 <p className="text-sm text-gray-500 leading-relaxed">
                    Map suspicious log events to the <strong>MITRE ATT&CK</strong> tactics to reconstruct the kill chain.
                 </p>
             </div>

             <div className="space-y-4">
                {REQUIRED_TACTICS.map((tactic, index) => {
                    const assignedLogId = mappings[tactic.id];
                    const log = LOG_DATA.find(l => l.id === assignedLogId);

                    return (
                        <div key={tactic.id} className="relative group">
                            <div className="flex items-center justify-between mb-1.5 px-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                                    <span className="bg-gray-200 text-gray-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">{index + 1}</span>
                                    {tactic.label}
                                </label>
                                {assignedLogId && (
                                    <button onClick={() => handleClearMapping(tactic.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">
                                        <i className="fas fa-times"></i> Remove
                                    </button>
                                )}
                            </div>
                            <div 
                                onClick={() => handleAssignLog(tactic.id)}
                                className={`
                                    p-3 rounded-lg border-2 border-dashed cursor-pointer transition-all min-h-[70px] flex flex-col justify-center bg-white
                                    ${assignedLogId 
                                        ? 'border-green-500 bg-green-50/30 shadow-sm border-solid' 
                                        : selectedLogId 
                                            ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-100 animate-pulse' 
                                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                    }
                                `}
                            >
                                {log ? (
                                    <>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(log.severity)}`}>{log.severity}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">{log.timestamp.split(' ')[1]}</span>
                                        </div>
                                        <div className="text-xs text-gray-700 line-clamp-2 font-medium leading-tight">{log.message}</div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <div className="text-xs text-gray-400 italic">
                                            {selectedLogId ? 'Click to assign selected log' : tactic.description}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
             </div>
          </div>

          <div className="mt-auto p-6 bg-white border-t border-gray-200">
             <button 
                onClick={handleSubmit}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
             >
                <i className="fas fa-file-contract"></i> Generate Report
             </button>
          </div>
        </div>

      </div>

      {/* Feedback Modal */}
      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fas ${success ? 'fa-check' : 'fa-exclamation'} text-3xl`}></i>
                    </div>
                    <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                        {success ? 'Threat Neutralized' : 'Analysis Failed'}
                    </h3>
                </div>
                
                <div className="p-8">
                    <div className="whitespace-pre-line text-gray-700 text-base leading-relaxed">
                        {feedback}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 flex justify-center gap-4">
                    {success ? (
                        <button onClick={onExit} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                            Close Case
                        </button>
                    ) : (
                        <button onClick={() => setFeedback(null)} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                            Continue Investigation
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SIEMLogAnalysisPBQ;
