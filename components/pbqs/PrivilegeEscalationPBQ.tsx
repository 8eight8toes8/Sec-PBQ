
import React, { useState, useEffect, useRef } from 'react';

interface PrivilegeEscalationPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface TerminalLine {
  id: number;
  text: string;
  type: 'input' | 'output' | 'info';
  isEvidence?: boolean; // Is this line a clue?
  flagged?: boolean;    // Has user clicked it?
}

const COMMANDS = [
  { cmd: 'whoami', label: 'Check Current User', icon: 'fa-user' },
  { cmd: 'id', label: 'Check Group Membership', icon: 'fa-users' },
  { cmd: 'uname -a', label: 'Kernel Info', icon: 'fa-microchip' },
  { cmd: 'sudo -l', label: 'Check Sudo Rights', icon: 'fa-key' },
  { cmd: 'cat /etc/crontab', label: 'List System Cron Jobs', icon: 'fa-clock' },
  { cmd: 'ps aux | grep root', label: 'List Root Processes', icon: 'fa-cogs' },
  { cmd: 'find / -perm -4000', label: 'Find SUID Binaries', icon: 'fa-search' },
  { cmd: 'ls -l /opt/sysadmin/backup.sh', label: 'Check Script Permissions', icon: 'fa-file-code' },
];

const PrivilegeEscalationPBQ: React.FC<PrivilegeEscalationPBQProps> = ({ onComplete, onExit }) => {
  // Game State
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 0, text: 'Welcome to Ubuntu 22.04.2 LTS (GNU/Linux 5.15.0-72-generic x86_64)', type: 'info' },
    { id: 1, text: 'System Check initiated...', type: 'info' },
    { id: 2, text: 'Type commands or use the toolkit to investigate potential privilege escalation vectors.', type: 'info' },
  ]);
  const [evidenceCount, setEvidenceCount] = useState(0);
  const [scriptDiscovered, setScriptDiscovered] = useState(false); // Unlock specific file check
  const [phase, setPhase] = useState<'investigate' | 'analyze' | 'remediate'>('investigate');
  const [selectedRemediation, setSelectedRemediation] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new lines
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const addLine = (text: string, type: 'input' | 'output' | 'info', isEvidence = false) => {
    setLines(prev => [...prev, { id: Date.now() + Math.random(), text, type, isEvidence, flagged: false }]);
  };

  const handleCommand = (cmdObj: { cmd: string; label: string }) => {
    addLine(`consultant@webserver:~$ ${cmdObj.cmd}`, 'input');

    // Simulate Processing Delay
    setTimeout(() => {
      switch (cmdObj.cmd) {
        case 'whoami':
          addLine('consultant', 'output');
          break;
        case 'id':
          // CLUE 1: User is in 'developers' group
          addLine('uid=1002(consultant) gid=1002(consultant) groups=1002(consultant),1005(developers)', 'output', true);
          break;
        case 'uname -a':
          addLine('Linux webserver 5.15.0-72-generic #79-Ubuntu SMP Wed Apr 19 08:22:18 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux', 'output');
          break;
        case 'sudo -l':
          addLine('Matching Defaults entries for consultant on webserver:', 'output');
          addLine('    env_reset, mail_badpass, secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin', 'output');
          addLine('User consultant may run the following commands on webserver:', 'output');
          addLine('    (root) /usr/bin/systemctl status apache2', 'output'); // Red Herring, limited command
          break;
        case 'cat /etc/crontab':
          addLine('# /etc/crontab: system-wide crontab', 'output');
          addLine('SHELL=/bin/sh', 'output');
          addLine('PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin', 'output');
          addLine('17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly', 'output');
          // CLUE 2: Root runs a script
          addLine('*  *    * * *   root    /opt/sysadmin/backup.sh', 'output', true); 
          setScriptDiscovered(true);
          break;
        case 'ps aux | grep root':
          addLine('root         1  0.0  0.1 168000 12000 ?        Ss   08:00   0:01 /sbin/init', 'output');
          addLine('root       892  0.0  0.0  12000  4000 ?        Ss   08:00   0:00 /lib/systemd/systemd-logind', 'output');
          addLine('root      1022  0.0  0.0  85000  6000 ?        Ssl  08:00   0:00 /usr/sbin/rsyslogd -n', 'output');
          break;
        case 'find / -perm -4000':
          addLine('/usr/bin/passwd', 'output');
          addLine('/usr/bin/newgrp', 'output');
          addLine('/usr/bin/chsh', 'output');
          addLine('/usr/bin/sudo', 'output');
          addLine('/usr/bin/mount', 'output');
          // Standard SUIDs, nothing suspicious here
          break;
        case 'ls -l /opt/sysadmin/backup.sh':
          // CLUE 3: Writable by Group 'developers'
          addLine('-rwxrwxr-x 1 root developers 452 Oct 25 09:00 /opt/sysadmin/backup.sh', 'output', true);
          break;
        default:
          addLine('Command not found', 'output');
      }
    }, 400);
  };

  const toggleFlag = (id: number) => {
    setLines(prev => prev.map(line => {
      if (line.id === id && line.type === 'output') {
        const newFlagged = !line.flagged;
        // Update evidence count
        if (line.isEvidence) {
            if (newFlagged && !line.flagged) setEvidenceCount(c => c + 1);
            if (!newFlagged && line.flagged) setEvidenceCount(c => c - 1);
        }
        return { ...line, flagged: newFlagged };
      }
      return line;
    }));
  };

  const submitRemediation = () => {
    if (selectedRemediation === 'chmod') {
        setSuccess(true);
        setFeedback("SUCCESS: Correct Remediation. By removing the write permission for the group (chmod g-w), the 'developers' group can no longer inject malicious code into the script running as root.");
        onComplete(100);
    } else if (selectedRemediation === 'remove_user') {
        setSuccess(false);
        setFeedback("INCOMPLETE: Removing the user from the group might disrupt legitimate work. The vulnerability is the permissions on the file itself.");
    } else if (selectedRemediation === 'sudoers') {
        setSuccess(false);
        setFeedback("INCORRECT: The vulnerability is not in the sudoers file. Sudo rights were restricted to 'status' only.");
    } else {
        setSuccess(false);
        setFeedback("Please select a valid remediation strategy.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto font-sans text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-arrow-up"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Privilege Escalation Investigation</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
         <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col lg:flex-row min-h-[650px]">
            
            {/* LEFT SIDEBAR: Context & Tools */}
            <div className="lg:w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
                {/* Scenario Header */}
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
                        <i className="fas fa-search-location text-blue-600"></i> Scenario
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        You have logged in as a low-privileged consultant. Your goal is to identify a misconfiguration that allows escalation to <strong>root</strong>.
                    </p>
                    <div className="mt-4 p-3 bg-blue-100/50 rounded-lg border border-blue-200 text-blue-800 text-sm">
                        <strong>Task:</strong> Run commands to enumerate the system. Click on suspicious output lines in the terminal to flag them as evidence.
                    </div>
                </div>

                {/* Toolkit */}
                <div className="p-6 flex-grow overflow-y-auto">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Command Toolkit</h4>
                    <div className="space-y-2">
                        {COMMANDS.map((c) => {
                            if (c.cmd.includes('/opt/sysadmin') && !scriptDiscovered) return null;
                            return (
                                <button
                                    key={c.cmd}
                                    onClick={() => handleCommand(c)}
                                    className="w-full text-left px-4 py-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg text-sm text-gray-700 transition-all flex items-center gap-3 shadow-sm group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        <i className={`fas ${c.icon}`}></i>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800">{c.label}</div>
                                        <div className="font-mono text-xs text-gray-500 mt-0.5">{c.cmd}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Evidence & Action Footer */}
                <div className="p-6 bg-gray-100 border-t border-gray-200">
                    {phase === 'investigate' ? (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-gray-700">Evidence Collected</span>
                                <span className={`text-sm font-bold px-2 py-0.5 rounded ${evidenceCount >= 3 ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                    {evidenceCount}/3
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${(evidenceCount / 3) * 100}%` }}></div>
                            </div>
                            <button 
                                onClick={() => setPhase('remediate')}
                                disabled={evidenceCount < 3}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 rounded-lg transition-colors shadow-sm"
                            >
                                Analyze Findings
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="text-sm text-green-700 font-bold mb-2">Investigation Complete</div>
                            <button 
                                onClick={() => setPhase('remediate')}
                                className="w-full bg-white border-2 border-green-600 text-green-700 font-bold py-2 rounded-lg"
                            >
                                Review Remediation
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Terminal & Remediation Interface */}
            <div className="lg:w-2/3 bg-slate-50 p-6 flex flex-col relative">
                
                {phase === 'remediate' ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-full flex flex-col animate-fadeIn">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Vulnerability Assessment</h3>
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-900 text-sm leading-relaxed">
                                <strong>Critical Finding:</strong> The system automation script <code>/opt/sysadmin/backup.sh</code> is executed by <strong>root</strong> via cron, yet it is writable by the <strong>developers</strong> group. The current user is a member of this group, allowing for arbitrary code execution as root.
                            </div>
                        </div>

                        <h4 className="font-bold text-gray-700 mb-4">Select Remediation Strategy</h4>
                        <div className="space-y-3 flex-grow">
                            <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedRemediation === 'chmod' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-200 bg-white'}`}>
                                <input type="radio" name="remediation" className="mt-1 w-4 h-4 accent-blue-600" onChange={() => setSelectedRemediation('chmod')} />
                                <div>
                                    <div className="font-bold text-gray-800">Restrict File Permissions</div>
                                    <p className="text-sm text-gray-600 mt-1">Remove write permissions for the group. Only root should be able to modify the script.</p>
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block border border-gray-300">chmod 755 /opt/sysadmin/backup.sh</code>
                                </div>
                            </label>

                            <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedRemediation === 'sudoers' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-200 bg-white'}`}>
                                <input type="radio" name="remediation" className="mt-1 w-4 h-4 accent-blue-600" onChange={() => setSelectedRemediation('sudoers')} />
                                <div>
                                    <div className="font-bold text-gray-800">Modify Sudoers File</div>
                                    <p className="text-sm text-gray-600 mt-1">Restrict the user's ability to run sudo commands.</p>
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block border border-gray-300">visudo (Remove NOPASSWD)</code>
                                </div>
                            </label>

                            <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedRemediation === 'remove_user' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-blue-200 bg-white'}`}>
                                <input type="radio" name="remediation" className="mt-1 w-4 h-4 accent-blue-600" onChange={() => setSelectedRemediation('remove_user')} />
                                <div>
                                    <div className="font-bold text-gray-800">Revoke Group Membership</div>
                                    <p className="text-sm text-gray-600 mt-1">Remove the consultant user from the developers group.</p>
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 inline-block border border-gray-300">gpasswd -d consultant developers</code>
                                </div>
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setPhase('investigate')} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors">
                                Back to Terminal
                            </button>
                            <button onClick={submitRemediation} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-green-500/30 transition-all transform hover:-translate-y-0.5">
                                Apply Fix
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Terminal Header */}
                        <div className="bg-gray-100 text-gray-600 px-4 py-2 flex justify-between items-center text-xs font-bold border-b border-gray-200">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <span>consultant@webserver (ssh)</span>
                            <i className="fas fa-wifi"></i>
                        </div>

                        {/* Terminal Window - LIGHT THEME */}
                        <div className="flex-grow bg-white p-4 overflow-y-auto font-mono text-sm space-y-1 custom-scrollbar">
                            {lines.map((line) => (
                                <div 
                                    key={line.id} 
                                    onClick={() => line.type === 'output' && toggleFlag(line.id)}
                                    className={`
                                        break-all transition-all px-2 py-0.5 rounded cursor-default
                                        ${line.type === 'input' ? 'text-blue-700 font-bold mt-3' : 'text-gray-800'}
                                        ${line.type === 'info' ? 'text-gray-500 italic' : ''}
                                        ${line.type === 'output' ? 'hover:bg-blue-50 cursor-pointer' : ''}
                                        ${line.flagged ? 'bg-yellow-100 border-l-4 border-yellow-500 pl-2' : ''}
                                    `}
                                >
                                    {line.type === 'input' && <span className="text-gray-400 mr-2">➜</span>}
                                    {line.text}
                                    {line.flagged && <span className="float-right text-yellow-600 text-xs uppercase font-bold tracking-wider ml-4"><i className="fas fa-flag"></i> Evidence</span>}
                                </div>
                            ))}
                            <div ref={bottomRef}></div>
                        </div>
                        
                        <div className="p-2 bg-gray-50 text-center text-xs text-gray-500 border-t border-gray-200">
                            Tip: Click on output lines in the terminal to flag them as evidence.
                        </div>
                    </div>
                )}
            </div>
         </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
             <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 text-center animate-scaleIn">
                 <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${success ? 'fa-check' : 'fa-times'} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">{success ? 'Vulnerability Patched' : 'Remediation Failed'}</h3>
                <div className={`text-sm whitespace-pre-line mb-6 p-4 rounded-xl border text-left leading-relaxed ${success ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    {feedback}
                </div>
                <button onClick={() => success ? onExit() : setFeedback(null)} className={`w-full font-bold py-3 rounded-xl transition-colors shadow-md text-white ${success ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'}`}>
                    {success ? 'Return to Dashboard' : 'Try Again'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default PrivilegeEscalationPBQ;
