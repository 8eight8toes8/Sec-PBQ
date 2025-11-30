
import React, { useState, useEffect, useMemo } from 'react';

interface SIEMLogAnalysisPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface LogEntry {
  id: number;
  timestamp: string;
  host: string;
  source: string;
  sourcetype: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  event_code?: string;
  raw: string; // The full raw log text
}

type Tactic = 'Initial Access' | 'Execution' | 'Persistence' | 'Command & Control' | 'Exfiltration';

const LOG_DATA: LogEntry[] = [
  { 
    id: 90, timestamp: '2023-10-25 07:55:00', host: 'SERVER-01', source: 'System', sourcetype: 'WinEventLog:System', severity: 'INFO', event_code: '6005',
    raw: 'EventCode=6005 Type=Information Message="The Event log service was started." User=NT AUTHORITY\\SYSTEM'
  },
  { 
    id: 91, timestamp: '2023-10-25 08:00:05', host: 'DC-01', source: 'Security', sourcetype: 'WinEventLog:Security', severity: 'INFO', event_code: '4624',
    raw: 'EventCode=4624 LogonType=2 AccountName="JSmith" WorkstationName="WS-04" SrcIP=192.168.1.55 Message="An account was successfully logged on."'
  },
  { 
    id: 101, timestamp: '2023-10-25 08:01:12', host: 'FW-EDGE-01', source: 'firewall_traffic', sourcetype: 'cisco:asa', severity: 'INFO', 
    raw: '%ASA-6-302013: Built outbound UDP connection 89234 for outside:8.8.8.8/53 (8.8.8.8/53) from inside:192.168.1.55/54322 (192.168.1.55/54322)'
  },
  { 
    id: 92, timestamp: '2023-10-25 08:15:33', host: 'SERVER-02', source: 'Security', sourcetype: 'WinEventLog:Security', severity: 'WARN', event_code: '4625',
    raw: 'EventCode=4625 AccountName="admin" FailureReason="Unknown user name or bad password" SrcIP=192.168.1.200'
  },
  { 
    id: 93, timestamp: '2023-10-25 08:30:11', host: 'WS-04', source: 'Application', sourcetype: 'WinEventLog:Application', severity: 'INFO',
    raw: 'EventCode=1001 SourceName="AdobeARM" Message="Product: Adobe Reader -- Configuration completed successfully."'
  },
  { 
    id: 102, timestamp: '2023-10-25 09:15:22', host: 'EMAIL-GW', source: 'smtp_logs', sourcetype: 'proofpoint:smtp', severity: 'INFO',
    raw: 'action=delivered sender="hr-updates@fakedomain.com" recipient="jsmith@corp.local" subject="Urgent: Benefits Enrollment" attachment="benefits_info.html"'
  },
  { 
    id: 94, timestamp: '2023-10-25 09:15:45', host: 'PROXY-01', source: 'web_access', sourcetype: 'bluecoat:proxysg', severity: 'INFO',
    raw: 'src_ip=192.168.1.55 user="jsmith" method=GET uri="http://fakedomain.com/login/benefits.html" category="Unclassified" status=200'
  },
  { 
    id: 103, timestamp: '2023-10-25 09:16:05', host: 'WS-04', source: 'Security', sourcetype: 'WinEventLog:Security', severity: 'WARN', event_code: '4688',
    raw: 'EventCode=4688 NewProcessName="C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe" CreatorProcess="C:\\Program Files\\Browser\\chrome.exe" CommandLine="powershell.exe -w hidden -enc aW1wb3J0LW1vZHVsZS..."'
  },
  { 
    id: 104, timestamp: '2023-10-25 09:16:08', host: 'WS-04', source: 'Sysmon', sourcetype: 'XmlWinEventLog:Microsoft-Windows-Sysmon/Operational', severity: 'CRITICAL', event_code: '13',
    raw: 'EventCode=13 EventType=SetValue TargetObject="HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\Updater" Details="C:\\Users\\JSmith\\AppData\\Local\\Temp\\update.exe"'
  },
  { 
    id: 95, timestamp: '2023-10-25 09:20:15', host: 'WS-02', source: 'Application', sourcetype: 'WinEventLog:Application', severity: 'ERROR', event_code: '1000',
    raw: 'EventCode=1000 Application Error Faulting application name: OUTLOOK.EXE, version: 16.0.4266.1001, faulting module: ntdll.dll'
  },
  { 
    id: 105, timestamp: '2023-10-25 09:30:00', host: 'SERVER-01', source: 'Security', sourcetype: 'WinEventLog:Security', severity: 'WARN', event_code: '4625',
    raw: 'EventCode=4625 AccountName="Administrator" WorkstationName="unknown" SrcIP=10.0.0.5 FailureReason="Account locked out"'
  },
  { 
    id: 106, timestamp: '2023-10-25 10:45:11', host: 'FW-EDGE-01', source: 'firewall_traffic', sourcetype: 'cisco:asa', severity: 'WARN',
    raw: '%ASA-4-106023: Deny tcp src inside:192.168.1.55/49211 dst outside:45.33.2.1/443 by access-group "INSIDE_IN" [0x0, 0x0] (Beaconing Pattern)'
  },
  { 
    id: 98, timestamp: '2023-10-25 10:50:30', host: 'IPS-01', source: 'ids_alerts', sourcetype: 'snort', severity: 'WARN',
    raw: '[1:1000001:1] ET TROJAN Cobalt Strike Beacon Activity Detected [Classification: A Network Trojan was detected] [Priority: 1] {TCP} 192.168.1.55:49211 -> 45.33.2.1:443'
  },
  { 
    id: 107, timestamp: '2023-10-25 11:00:05', host: 'FS-01', source: 'Security', sourcetype: 'WinEventLog:Security', severity: 'INFO', event_code: '5140',
    raw: 'EventCode=5140 ShareName="\\\\*\\Finance" SharePath="\\\\??\\\\D:\\Shares\\Finance" SubjectUserName="JSmith" AccessMask=0x1 (ReadData)'
  },
  { 
    id: 108, timestamp: '2023-10-25 11:05:22', host: 'DLP-GW', source: 'dlp_logs', sourcetype: 'symantec:dlp', severity: 'CRITICAL',
    raw: 'Action=Block Policy="PCI-DSS" Severity=High User="JSmith" Destination="45.33.2.1" Protocol=HTTPS File="Q3_Financials.zip" Size=2.5GB details="Potential Exfiltration"'
  },
];

const REQUIRED_TACTICS: { id: Tactic; label: string }[] = [
  { id: 'Initial Access', label: 'Initial Access' },
  { id: 'Execution', label: 'Execution' },
  { id: 'Persistence', label: 'Persistence' },
  { id: 'Command & Control', label: 'Command & Control' },
  { id: 'Exfiltration', label: 'Exfiltration' },
];

const CORRECT_MAPPINGS: Record<Tactic, number> = {
  'Initial Access': 102,
  'Execution': 103,
  'Persistence': 104,
  'Command & Control': 106,
  'Exfiltration': 108
};

const SIEMLogAnalysisPBQ: React.FC<SIEMLogAnalysisPBQProps> = ({ onComplete, onExit }) => {
  const [searchQuery, setSearchQuery] = useState('index=main *');
  const [mappings, setMappings] = useState<Record<string, number | null>>({
    'Initial Access': null,
    'Execution': null,
    'Persistence': null,
    'Command & Control': null,
    'Exfiltration': null
  });
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  // Derived filtered logs
  const filteredLogs = useMemo(() => {
    if (!searchQuery || searchQuery === 'index=main *') return LOG_DATA;
    
    // Simple mock SPL parser (supports key=value or keyword)
    const terms = searchQuery.replace('index=main', '').trim().split(/\s+/);
    
    return LOG_DATA.filter(log => {
        return terms.every(term => {
            if (term.includes('=')) {
                const [key, value] = term.split('=');
                // Check structured fields
                if (key === 'source' && log.source !== value) return false;
                if (key === 'sourcetype' && log.sourcetype !== value) return false;
                if (key === 'host' && log.host !== value) return false;
                if (key === 'severity' && log.severity.toLowerCase() !== value.toLowerCase()) return false;
                // If key is not a main field, check raw text
                if (!['source','sourcetype','host','severity'].includes(key)) {
                    return log.raw.toLowerCase().includes(term.toLowerCase());
                }
                return true;
            } else {
                return log.raw.toLowerCase().includes(term.toLowerCase()) || 
                       log.source.toLowerCase().includes(term.toLowerCase()) ||
                       log.sourcetype.toLowerCase().includes(term.toLowerCase());
            }
        });
    });
  }, [searchQuery]);

  // Aggregation for Sidebar
  const getFieldCounts = (field: keyof LogEntry) => {
    const counts: Record<string, number> = {};
    filteredLogs.forEach(log => {
        const val = String(log[field]);
        counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const handleFieldClick = (field: string, value: string) => {
    const newTerm = `${field}=${value}`;
    if (!searchQuery.includes(newTerm)) {
        setSearchQuery(prev => `${prev} ${newTerm}`);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleAssignLog = (tactic: Tactic, logId: number) => {
    // Check if mapping is correct immediately? No, standard PBQ flow: submit at end.
    // But let's check if log is already assigned to THIS tactic to toggle off?
    setMappings(prev => ({ ...prev, [tactic]: logId }));
    setActiveMenu(null);
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
        errors.push(tactic.label);
      }
    });

    const score = Math.round((correctCount / REQUIRED_TACTICS.length) * 100);

    if (score === 100) {
      setSuccess(true);
      setFeedback("Investigation Successful! You correctly mapped all phases of the attack chain.");
      onComplete(100);
    } else {
      setSuccess(false);
      setFeedback(`Investigation Incomplete. Please review the logs for the following phases:\n${errors.join(', ')}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f0f0f0] z-50 flex flex-col font-sans text-sm animate-fadeIn">
      {/* 1. Top Navigation Bar (Splunk Style) */}
      <div className="bg-[#171D21] h-12 flex items-center justify-between px-4 shadow-sm z-20">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <span className="text-[#65A637] text-2xl font-bold">&gt;</span>
                <span className="text-white font-bold text-lg tracking-tight">SIEM<span className="font-light text-gray-400">Enterprise</span></span>
            </div>
            <div className="hidden md:flex gap-1 text-[#ccc] text-sm font-medium">
                <button className="px-3 py-3 border-b-4 border-[#65A637] text-white">Search</button>
                <button className="px-3 py-3 hover:text-white transition-colors">Datasets</button>
                <button className="px-3 py-3 hover:text-white transition-colors">Reports</button>
                <button className="px-3 py-3 hover:text-white transition-colors">Alerts</button>
                <button className="px-3 py-3 hover:text-white transition-colors">Dashboards</button>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs">Administrator</span>
            <button onClick={onExit} className="text-gray-400 hover:text-white"><i className="fas fa-times"></i></button>
        </div>
      </div>

      {/* 2. Search Bar Area */}
      <div className="bg-[#212529] p-4 pb-2 shadow-md z-10">
        <div className="flex gap-2 mb-2">
            <div className="relative flex-grow">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-4 pr-10 rounded-l bg-white border-none focus:ring-0 text-gray-800 font-mono text-sm"
                    placeholder="enter search query..." 
                />
                <button 
                    onClick={() => setSearchQuery('index=main *')}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                    title="Clear Search"
                >
                    <i className="fas fa-times-circle"></i>
                </button>
            </div>
            <div className="bg-[#3C444D] flex items-center px-4 rounded-r cursor-pointer border-l border-gray-600">
                <span className="text-white font-medium flex items-center gap-2">
                    <i className="far fa-clock"></i> Last 24 hours <i className="fas fa-caret-down text-xs"></i>
                </span>
            </div>
            <button className="bg-[#65A637] hover:bg-[#538a2d] text-white w-12 rounded flex items-center justify-center transition-colors">
                <i className="fas fa-search text-lg"></i>
            </button>
        </div>
        
        {/* Timeline Visualization Mock */}
        <div className="h-16 flex items-end justify-between gap-[1px] pt-2 pb-1 opacity-80">
            {Array.from({ length: 50 }).map((_, i) => (
                <div 
                    key={i} 
                    className="bg-[#65A637] flex-grow hover:bg-[#85c955] transition-all cursor-pointer"
                    style={{ height: `${Math.max(10, Math.random() * 100)}%`, opacity: Math.random() > 0.3 ? 1 : 0.3 }}
                    title={`${Math.floor(Math.random() * 100)} Events`}
                ></div>
            ))}
        </div>
        <div className="text-xs text-gray-400 flex justify-between mt-1 font-mono">
            <span>{filteredLogs.length} events</span>
            <span>Smart Mode</span>
        </div>
      </div>

      {/* 3. Main Content Area (Three Pane) */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* Left Sidebar: Fields */}
        <div className="w-64 bg-[#f2f4f5] border-r border-gray-300 flex flex-col overflow-y-auto hidden md:flex shrink-0">
            <div className="p-4">
                <h3 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wide">Selected Fields</h3>
                <div className="space-y-4">
                    {['host', 'source', 'sourcetype'].map(field => (
                        <div key={field}>
                            <div className="text-blue-600 hover:underline cursor-pointer text-sm font-medium mb-1 flex justify-between group">
                                {field} <span className="text-gray-400 font-normal group-hover:text-blue-600">{getFieldCounts(field as keyof LogEntry).length}</span>
                            </div>
                            <div className="pl-2 space-y-1">
                                {getFieldCounts(field as keyof LogEntry).slice(0, 4).map(([val, count]) => (
                                    <div 
                                        key={val} 
                                        onClick={() => handleFieldClick(field, val)}
                                        className="flex justify-between text-xs text-gray-600 cursor-pointer hover:bg-gray-200 px-1 rounded"
                                    >
                                        <span className="truncate w-32" title={val}>{val}</span>
                                        <span>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <h3 className="font-bold text-gray-700 mt-6 mb-2 uppercase text-xs tracking-wide">Interesting Fields</h3>
                <div className="space-y-1">
                    {['severity', 'event_code', 'user', 'action', 'dest_ip', 'src_ip'].map(field => (
                        <div key={field} className="text-blue-600 hover:underline cursor-pointer text-sm">
                            {field}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Center: Event List */}
        <div className="flex-grow bg-white flex flex-col min-w-0">
            <div className="bg-[#f5f7fa] border-b border-gray-300 px-4 py-2 flex justify-between items-center text-xs text-gray-500">
                <div className="flex gap-4">
                    <span className="font-bold text-gray-700">List</span>
                    <span>Format</span>
                    <span>Next 20</span>
                </div>
                <div className="flex gap-2">
                    <i className="fas fa-cog"></i>
                    <i className="fas fa-download"></i>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
                {filteredLogs.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                        <i className="fas fa-search text-4xl mb-4 opacity-30"></i>
                        <p>No results found.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm font-mono border-collapse">
                        <tbody>
                            {filteredLogs.map(log => {
                                const isExpanded = expandedRows.includes(log.id);
                                const isAssigned = Object.values(mappings).includes(log.id);
                                
                                return (
                                    <React.Fragment key={log.id}>
                                        <tr className={`border-b border-gray-100 hover:bg-[#f2f8fc] group ${isAssigned ? 'bg-green-50' : ''}`}>
                                            <td className="w-8 py-2 align-top text-center text-gray-400 cursor-pointer" onClick={() => toggleExpand(log.id)}>
                                                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-xs`}></i>
                                            </td>
                                            <td className="w-40 py-2 align-top text-gray-500 whitespace-nowrap">
                                                {log.timestamp}
                                            </td>
                                            <td className="py-2 align-top text-gray-800 break-all relative pr-24">
                                                {/* Raw log preview */}
                                                <div className="line-clamp-2 cursor-pointer" onClick={() => toggleExpand(log.id)}>
                                                    <span className="font-bold text-blue-700">{log.event_code ? `EventCode=${log.event_code} ` : ''}</span>
                                                    {log.raw}
                                                </div>
                                                
                                                {/* Action Button */}
                                                <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => setActiveMenu(activeMenu === log.id ? null : log.id)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded shadow flex items-center gap-1"
                                                    >
                                                        Event Actions <i className="fas fa-caret-down"></i>
                                                    </button>
                                                    {/* Dropdown Menu */}
                                                    {activeMenu === log.id && (
                                                        <div className="absolute right-0 top-8 bg-white border border-gray-300 shadow-xl rounded w-48 z-50 py-1">
                                                            <div className="px-3 py-1 text-xs font-bold text-gray-400 uppercase">Add to Investigation</div>
                                                            {REQUIRED_TACTICS.map(tactic => (
                                                                <button
                                                                    key={tactic.id}
                                                                    onClick={() => handleAssignLog(tactic.id, log.id)}
                                                                    className={`w-full text-left px-4 py-2 text-xs hover:bg-blue-50 ${mappings[tactic.id] === log.id ? 'text-green-600 font-bold' : 'text-gray-700'}`}
                                                                >
                                                                    {mappings[tactic.id] === log.id && <i className="fas fa-check mr-1"></i>}
                                                                    {tactic.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Expanded Detail View */}
                                        {isExpanded && (
                                            <tr className="bg-[#f8f9fa]">
                                                <td colSpan={3} className="px-10 py-4 border-b border-gray-200">
                                                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs mb-3">
                                                        <div className="flex border-b border-gray-200 py-1"><span className="w-24 text-gray-500">host</span> <span className="text-gray-800">{log.host}</span></div>
                                                        <div className="flex border-b border-gray-200 py-1"><span className="w-24 text-gray-500">source</span> <span className="text-gray-800">{log.source}</span></div>
                                                        <div className="flex border-b border-gray-200 py-1"><span className="w-24 text-gray-500">sourcetype</span> <span className="text-gray-800">{log.sourcetype}</span></div>
                                                        <div className="flex border-b border-gray-200 py-1"><span className="w-24 text-gray-500">severity</span> <span className={`font-bold ${log.severity === 'CRITICAL' ? 'text-red-600' : log.severity === 'ERROR' ? 'text-red-500' : 'text-gray-800'}`}>{log.severity}</span></div>
                                                    </div>
                                                    <div className="bg-white border border-gray-300 p-3 rounded font-mono text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                        {log.raw}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

        {/* Right: Investigation Workbench */}
        <div className="w-80 bg-white border-l border-gray-300 flex flex-col shrink-0 shadow-xl z-20">
            <div className="p-4 bg-[#212529] text-white border-b border-gray-600 flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2"><i className="fas fa-clipboard-list text-[#65A637]"></i> Case Status</h3>
                <span className="text-xs bg-[#65A637] px-2 py-0.5 rounded font-bold">New</span>
            </div>
            
            <div className="p-4 flex-grow overflow-y-auto bg-[#f5f5f5]">
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                    Map suspicious events to the Kill Chain stages. Use the <strong>"Event Actions"</strong> button on log rows to add evidence.
                </p>

                <div className="space-y-3">
                    {REQUIRED_TACTICS.map((tactic, idx) => {
                        const logId = mappings[tactic.id];
                        const log = LOG_DATA.find(l => l.id === logId);

                        return (
                            <div key={tactic.id} className="bg-white border border-gray-300 rounded shadow-sm overflow-hidden">
                                <div className="bg-gray-100 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-700 uppercase">{idx + 1}. {tactic.label}</span>
                                    {log && <i className="fas fa-check-circle text-[#65A637]"></i>}
                                </div>
                                <div className="p-3 min-h-[50px] flex flex-col justify-center">
                                    {log ? (
                                        <>
                                            <div className="text-xs font-mono text-gray-800 mb-1 line-clamp-2" title={log.raw}>
                                                {log.raw}
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-[10px] bg-gray-200 px-1.5 rounded text-gray-600">{log.sourcetype}</span>
                                                <button 
                                                    onClick={() => setMappings(prev => ({ ...prev, [tactic.id]: null }))}
                                                    className="text-red-500 hover:text-red-700 text-xs"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic text-center">No evidence mapped</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 border-t border-gray-300 bg-white">
                <button 
                    onClick={handleSubmit}
                    className="w-full bg-[#65A637] hover:bg-[#538a2d] text-white font-bold py-3 rounded shadow transition-all"
                >
                    Submit Case
                </button>
            </div>
        </div>

      </div>

      {/* Feedback Modal */}
      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fas ${success ? 'fa-check' : 'fa-exclamation-circle'} text-3xl`}></i>
                    </div>
                    <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                        {success ? 'Case Closed' : 'Investigation Failed'}
                    </h3>
                </div>
                
                <div className="p-8">
                    <div className="whitespace-pre-line text-gray-700 text-base leading-relaxed">
                        {feedback}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 flex justify-center gap-4">
                    {success ? (
                        <button onClick={onExit} className="w-full bg-[#65A637] hover:bg-[#538a2d] text-white font-bold py-3 px-6 rounded transition-colors shadow-md">
                            Return to Dashboard
                        </button>
                    ) : (
                        <button onClick={() => setFeedback(null)} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded transition-colors shadow-md">
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
