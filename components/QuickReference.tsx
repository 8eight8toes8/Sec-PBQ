
import React, { useState, useEffect, useRef } from 'react';

// --- Types ---

interface CommandScenario {
  cmd: string;
  description: string;
  output: string; // The simulated terminal output
}

interface ToolOption {
  flag: string;
  description: string;
}

interface ToolDetail {
  id: string;
  name: string;
  category: Category;
  platforms: string[];
  description: string;
  syntax: string;
  options: ToolOption[];
  scenarios: CommandScenario[];
}

type Category = 'network' | 'system' | 'security' | 'forensics' | 'files';

// --- Data ---

const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'network', label: 'Network', icon: 'fa-network-wired' },
  { id: 'security', label: 'Security', icon: 'fa-shield-alt' },
  { id: 'system', label: 'System', icon: 'fa-server' },
  { id: 'forensics', label: 'Forensics', icon: 'fa-search' },
  { id: 'files', label: 'Files', icon: 'fa-file-code' },
];

const TOOLS_DATA: ToolDetail[] = [
  // --- Network ---
  {
    id: 'nmap',
    name: 'Nmap',
    category: 'network',
    platforms: ['Linux', 'Windows', 'macOS'],
    description: 'Network Mapper. The de facto standard for network discovery and security auditing.',
    syntax: 'nmap [Scan Type(s)] [Options] {target specification}',
    options: [
      { flag: '-sS', description: 'TCP SYN Scan (Stealth)' },
      { flag: '-sV', description: 'Probe open ports to determine service/version info' },
      { flag: '-O', description: 'Enable OS detection' },
      { flag: '-A', description: 'Enable OS detection, version detection, script scanning, and traceroute' },
      { flag: '-p', description: 'Only scan specified ports (e.g. -p 80,443)' }
    ],
    scenarios: [
      {
        cmd: 'nmap -sS -p 22,80 192.168.1.1',
        description: 'Perform a stealth scan on specific ports.',
        output: `Starting Nmap 7.93 ( https://nmap.org ) at 2023-10-27 10:00 EST
Nmap scan report for gateway (192.168.1.1)
Host is up (0.0020s latency).

PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
MAC Address: AA:BB:CC:DD:EE:FF (Cisco Systems)

Nmap done: 1 IP address (1 host up) scanned in 0.45 seconds`
      },
      {
        cmd: 'nmap -sV 192.168.1.50',
        description: 'Detect service versions on a target.',
        output: `Starting Nmap 7.93...
Nmap scan report for webserver (192.168.1.50)
Host is up (0.0010s latency).
Not shown: 998 closed ports
PORT    STATE SERVICE VERSION
80/tcp  open  http    Apache httpd 2.4.41 ((Ubuntu))
443/tcp open  ssl/http Apache httpd 2.4.41 ((Ubuntu))

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 6.32 seconds`
      }
    ]
  },
  {
    id: 'netstat',
    name: 'Netstat',
    category: 'network',
    platforms: ['Windows', 'Linux'],
    description: 'Print network connections, routing tables, interface statistics, masquerade connections, and multicast memberships.',
    syntax: 'netstat [options]',
    options: [
      { flag: '-a', description: 'Show all connections and listening ports' },
      { flag: '-n', description: 'Show numerical addresses (no DNS resolution)' },
      { flag: '-o', description: 'Show PID (Windows)' },
      { flag: '-p', description: 'Show PID/Program name (Linux)' },
      { flag: '-r', description: 'Display routing table' }
    ],
    scenarios: [
      {
        cmd: 'netstat -an',
        description: 'List all active connections (numerical).',
        output: `Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 192.168.1.5:54322       104.21.55.2:443         ESTABLISHED
tcp        0      0 192.168.1.5:22          192.168.1.100:61234     ESTABLISHED
udp        0      0 0.0.0.0:68              0.0.0.0:*`
      },
      {
        cmd: 'netstat -r',
        description: 'Show the IP routing table.',
        output: `Kernel IP routing table
Destination     Gateway         Genmask         Flags   MSS Window  irtt Iface
0.0.0.0         192.168.1.1     0.0.0.0         UG        0 0          0 eth0
192.168.1.0     0.0.0.0         255.255.255.0   U         0 0          0 eth0
172.17.0.0      0.0.0.0         255.255.0.0     U         0 0          0 docker0`
      }
    ]
  },
  {
    id: 'ping',
    name: 'Ping',
    category: 'network',
    platforms: ['All'],
    description: 'Send ICMP ECHO_REQUEST to network hosts to test connectivity.',
    syntax: 'ping [options] destination',
    options: [
      { flag: '-c <count>', description: 'Stop after sending count packets (Linux)' },
      { flag: '-n <count>', description: 'Stop after sending count packets (Windows)' },
      { flag: '-t', description: 'Ping continuously until stopped (Windows)' }
    ],
    scenarios: [
      {
        cmd: 'ping -c 4 8.8.8.8',
        description: 'Check connectivity to Google DNS.',
        output: `PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=115 time=14.2 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=115 time=13.8 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=115 time=15.1 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=115 time=14.5 ms

--- 8.8.8.8 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 13.812/14.405/15.120/0.501 ms`
      }
    ]
  },
  {
    id: 'dig',
    name: 'Dig',
    category: 'network',
    platforms: ['Linux', 'macOS'],
    description: 'Domain Information Groper. DNS lookup utility.',
    syntax: 'dig [server] [name] [type]',
    options: [
      { flag: '+short', description: 'Show only the IP address' },
      { flag: 'MX', description: 'Query Mail Exchange records' },
      { flag: 'NS', description: 'Query Name Server records' },
      { flag: '@server', description: 'Query a specific DNS server' }
    ],
    scenarios: [
      {
        cmd: 'dig google.com +short',
        description: 'Get the IP address of google.com.',
        output: `142.250.190.46`
      },
      {
        cmd: 'dig google.com MX',
        description: 'Get Mail Exchange records.',
        output: `; <<>> DiG 9.16.1-Ubuntu <<>> google.com MX
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 62781
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;google.com.                    IN      MX

;; ANSWER SECTION:
google.com.             300     IN      MX      10 smtp.google.com.

;; Query time: 24 msec
;; SERVER: 127.0.0.53#53(127.0.0.53)
;; WHEN: Fri Oct 27 10:15:00 UTC 2023
;; MSG SIZE  rcvd: 64`
      }
    ]
  },
  // --- Security ---
  {
    id: 'openssl',
    name: 'OpenSSL',
    category: 'security',
    platforms: ['Linux', 'Windows'],
    description: 'A robust toolkit for the Transport Layer Security (TLS) and Secure Sockets Layer (SSL) protocols.',
    syntax: 'openssl command [options]',
    options: [
      { flag: 'genrsa', description: 'Generate an RSA private key' },
      { flag: 'req', description: 'PKCS#10 X.509 Certificate Signing Request (CSR) management' },
      { flag: 'x509', description: 'X.509 Certificate Data Management' },
      { flag: 's_client', description: 'SSL/TLS client tool for testing' }
    ],
    scenarios: [
      {
        cmd: 'openssl s_client -connect google.com:443',
        description: 'Debug a TLS connection to a remote server.',
        output: `CONNECTED(00000003)
depth=2 C = US, O = Google Trust Services LLC, CN = GTS Root R1
verify return:1
depth=1 C = US, O = Google Trust Services LLC, CN = GTS CA 1C3
verify return:1
depth=0 CN = *.google.com
verify return:1
---
Certificate chain
 0 s:CN = *.google.com
   i:C = US, O = Google Trust Services LLC, CN = GTS CA 1C3
---
Server certificate
-----BEGIN CERTIFICATE-----
MIIEiDCCA3CgAwIBAgIRA...
`
      },
      {
        cmd: 'openssl genrsa -out private.key 2048',
        description: 'Generate a 2048-bit RSA private key.',
        output: `Generating RSA private key, 2048 bit long modulus (2 primes)
...................................................................................................+++++
..................................................+++++
e is 65537 (0x010001)
`
      }
    ]
  },
  {
    id: 'hashcat',
    name: 'Hashcat',
    category: 'security',
    platforms: ['Linux', 'Windows'],
    description: 'World\'s fastest and most advanced password recovery utility.',
    syntax: 'hashcat [options] hashfile [mask|wordlist]',
    options: [
      { flag: '-m', description: 'Hash type (0 = MD5, 1000 = NTLM, etc.)' },
      { flag: '-a', description: 'Attack mode (0 = Wordlist, 3 = Brute-force)' },
      { flag: '--show', description: 'Show cracked passwords only' }
    ],
    scenarios: [
      {
        cmd: 'hashcat -m 0 -a 0 hashes.txt rockyou.txt',
        description: 'Crack MD5 hashes using a dictionary attack.',
        output: `hashcat (v6.2.5) starting...

Dictionary cache built:
* Filename..: rockyou.txt
* Passwords.: 14344392
* Bytes.....: 139921507

5d41402abc4b2a76b9719d911017c592:hello
1a1dc91c907325c69271ddf0c944bc72:pass123

Session..........: hashcat
Status...........: Cracked
Hash.Name........: MD5
Hash.Target......: hashes.txt
Time.Started.....: Fri Oct 27 10:05:00 2023
Time.Estimated...: Fri Oct 27 10:05:01 2023`
      }
    ]
  },
  // --- System ---
  {
    id: 'ps',
    name: 'ps',
    category: 'system',
    platforms: ['Linux'],
    description: 'Report a snapshot of the current processes.',
    syntax: 'ps [options]',
    options: [
      { flag: '-e', description: 'Select all processes' },
      { flag: '-f', description: 'Do full-format listing' },
      { flag: 'aux', description: 'BSD style (all users, user oriented, no terminal)' }
    ],
    scenarios: [
      {
        cmd: 'ps aux | grep apache',
        description: 'Find apache processes running.',
        output: `root       923  0.0  0.4  12044  4020 ?        Ss   09:00   0:00 /usr/sbin/apache2 -k start
www-data   924  0.0  0.2  12044  2010 ?        S    09:00   0:00 /usr/sbin/apache2 -k start
www-data   925  0.0  0.2  12044  2010 ?        S    09:00   0:00 /usr/sbin/apache2 -k start
user      1050  0.0  0.0   8000   900 pts/0    S+   10:15   0:00 grep --color=auto apache`
      }
    ]
  },
  {
    id: 'systemctl',
    name: 'Systemctl',
    category: 'system',
    platforms: ['Linux (Systemd)'],
    description: 'Control the systemd system and service manager.',
    syntax: 'systemctl [command] [unit]',
    options: [
      { flag: 'start', description: 'Start (activate) one or more units' },
      { flag: 'stop', description: 'Stop (deactivate) one or more units' },
      { flag: 'status', description: 'Show runtime status of one or more units' },
      { flag: 'enable', description: 'Enable one or more units files (start at boot)' }
    ],
    scenarios: [
      {
        cmd: 'systemctl status sshd',
        description: 'Check the status of the SSH service.',
        output: `● ssh.service - OpenBSD Secure Shell server
     Loaded: loaded (/lib/systemd/system/ssh.service; enabled; vendor preset: enabled)
     Active: active (running) since Fri 2023-10-27 08:00:00 UTC; 2h 15min ago
       Docs: man:sshd(8)
   Main PID: 850 (sshd)
      Tasks: 1 (limit: 1116)
     Memory: 5.2M
        CPU: 102ms
     CGroup: /system.slice/ssh.service
             └─850 sshd: /usr/sbin/sshd -D [listener] 0 of 10-100 startups`
      }
    ]
  },
  // --- Forensics ---
  {
    id: 'grep',
    name: 'Grep',
    category: 'forensics',
    platforms: ['Linux'],
    description: 'Print lines searching a file for a pattern.',
    syntax: 'grep [options] pattern [file...]',
    options: [
      { flag: '-i', description: 'Ignore case' },
      { flag: '-r', description: 'Recursive search' },
      { flag: '-v', description: 'Invert match (select non-matching lines)' },
      { flag: '-n', description: 'Show line numbers' }
    ],
    scenarios: [
      {
        cmd: "grep -r 'password' /var/log/",
        description: 'Recursively search for "password" in logs (finding leaks).',
        output: `/var/log/auth.log:Oct 27 09:12:01 server sshd[1234]: Failed password for invalid user admin from 192.168.1.55 port 54321 ssh2
/var/log/syslog:Oct 27 08:05:22 server app[999]: DEBUG: user_login: username=bob password=secret (Wait, don't log this!)`
      }
    ]
  },
  {
    id: 'strings',
    name: 'Strings',
    category: 'forensics',
    platforms: ['Linux', 'Windows (Sysinternals)'],
    description: 'Print printable character sequences in files. Useful for analyzing binaries.',
    syntax: 'strings [options] file',
    options: [
      { flag: '-n <min>', description: 'Print sequences of at least <min> characters' },
      { flag: '-e', description: 'Select character encoding (s = 7-bit, b = 16-bit bigendian, etc)' }
    ],
    scenarios: [
      {
        cmd: 'strings suspicious.exe | head -n 5',
        description: 'Extract readable text from a binary file.',
        output: `!This program cannot be run in DOS mode.
UPX0
UPX1
.rsrc
3.99
http://c2-server.malicious.com/beacon`
      }
    ]
  },
  // --- Files ---
  {
    id: 'chmod',
    name: 'Chmod',
    category: 'files',
    platforms: ['Linux', 'macOS'],
    description: 'Change file mode bits (permissions).',
    syntax: 'chmod [options] mode file',
    options: [
      { flag: '+x', description: 'Add execute permission' },
      { flag: '755', description: 'rwxr-xr-x (Owner: Full, Group/Other: Read+Exec)' },
      { flag: '600', description: 'rw------- (Owner: Read+Write, Group/Other: None)' },
      { flag: '-R', description: 'Recursive change' }
    ],
    scenarios: [
      {
        cmd: 'ls -l script.sh && chmod +x script.sh && ls -l script.sh',
        description: 'Make a script executable.',
        output: `-rw-r--r-- 1 user user 45 Oct 27 10:00 script.sh
-rwxr-xr-x 1 user user 45 Oct 27 10:00 script.sh`
      }
    ]
  }
];

const QuickReference: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('network');
  const [selectedToolId, setSelectedToolId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Terminal State
  const [terminalHistory, setTerminalHistory] = useState<{ type: 'cmd' | 'out', text: string }[]>([
    { type: 'out', text: 'Welcome to the SecPro Interactive Terminal.' },
    { type: 'out', text: 'Select a tool and click "Run" on an example to see output.' }
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first tool when category changes
  useEffect(() => {
    const firstTool = TOOLS_DATA.find(t => t.category === activeCategory);
    if (firstTool && !selectedToolId) {
        setSelectedToolId(firstTool.id);
    }
  }, [activeCategory]);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  const runScenario = (cmd: string, output: string) => {
    // 1. Add Command
    setTerminalHistory(prev => [...prev, { type: 'cmd', text: cmd }]);
    
    // 2. Simulate processing delay
    setTimeout(() => {
        setTerminalHistory(prev => [...prev, { type: 'out', text: output }]);
    }, 400 + Math.random() * 300);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    setTerminalHistory(prev => [...prev, { type: 'cmd', text: terminalInput }]);
    
    // Simple mock response for manual typing
    setTimeout(() => {
        setTerminalHistory(prev => [...prev, { type: 'out', text: `(Simulation) Command '${terminalInput.split(' ')[0]}' executed. Try clicking the examples above for realistic output.` }]);
    }, 200);
    
    setTerminalInput('');
  };

  const filteredTools = TOOLS_DATA.filter(t => 
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (searchTerm ? true : t.category === activeCategory) // If searching, ignore category filter
  );

  const activeTool = TOOLS_DATA.find(t => t.id === selectedToolId) || filteredTools[0];

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-hidden font-sans text-gray-800">
      {/* Header */}
      <div className="bg-white shadow-md p-4 flex justify-between items-center border-b border-gray-200 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-terminal"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quick Reference Lab</h2>
            <p className="text-xs text-gray-500">Interactive Command & Tool Library</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-grow overflow-hidden">
        
        {/* SIDEBAR: Navigation - LIGHT THEME */}
        <div className="w-72 bg-white flex-shrink-0 flex flex-col border-r border-gray-200">
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                    <input 
                        type="text" 
                        placeholder="Search tools..." 
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value) setSelectedToolId(''); }}
                        className="w-full bg-gray-50 text-gray-800 pl-10 pr-3 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none border border-gray-200 transition-all placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Categories */}
            {!searchTerm && (
                <div className="flex overflow-x-auto p-3 gap-2 border-b border-gray-100 scrollbar-hide bg-gray-50/50">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center gap-1 w-20 border
                                ${activeCategory === cat.id 
                                    ? 'bg-white border-blue-200 text-blue-600 shadow-sm' 
                                    : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100'
                                }
                            `}
                        >
                            <i className={`fas ${cat.icon} text-lg mb-1`}></i>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Tool List */}
            <div className="flex-grow overflow-y-auto p-3 space-y-1 bg-gray-50/30">
                {filteredTools.length > 0 ? (
                    filteredTools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setSelectedToolId(tool.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between group transition-all border
                                ${activeTool?.id === tool.id 
                                    ? 'bg-white border-blue-200 shadow-sm text-blue-700 ring-1 ring-blue-50' 
                                    : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200 text-gray-600'
                                }
                            `}
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">{tool.name}</span>
                                <span className="text-[10px] uppercase text-gray-400 font-semibold">{tool.category}</span>
                            </div>
                            <i className={`fas fa-chevron-right text-xs opacity-0 group-hover:opacity-100 transition-opacity ${activeTool?.id === tool.id ? 'opacity-100 text-blue-500' : 'text-gray-400'}`}></i>
                        </button>
                    ))
                ) : (
                    <div className="p-8 text-center text-xs text-gray-400 italic">No tools match your search.</div>
                )}
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-grow flex flex-col bg-gray-50 overflow-hidden relative">
            {activeTool ? (
                <div className="flex flex-col h-full">
                    
                    {/* Tool Header */}
                    <div className="p-6 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">{activeTool.name}</h1>
                                <p className="text-gray-600 max-w-2xl text-sm leading-relaxed">{activeTool.description}</p>
                            </div>
                            <div className="flex gap-2">
                                {activeTool.platforms.map(p => (
                                    <span key={p} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold border border-gray-200">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-gray-200 font-mono text-sm text-gray-700 flex items-center gap-3">
                            <span className="text-blue-600 font-bold select-none">$</span>
                            {activeTool.syntax}
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-8">
                        
                        {/* Options Table */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-xs text-gray-500 uppercase flex items-center gap-2">
                                <i className="fas fa-flag"></i> Common Options
                            </div>
                            <table className="w-full text-sm text-left">
                                <tbody className="divide-y divide-gray-100">
                                    {activeTool.options.map((opt, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="p-3 w-32 font-mono text-blue-700 font-bold border-r border-gray-100 bg-gray-50/50">{opt.flag}</td>
                                            <td className="p-3 text-gray-700">{opt.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Interactive Examples */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <i className="fas fa-terminal text-blue-600"></i> Interactive Lab
                            </h3>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-[450px]"> {/* Fixed height for terminal layout */}
                                
                                {/* Example List */}
                                <div className="flex flex-col h-full">
                                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-grow">
                                        {activeTool.scenarios.map((scenario, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all group">
                                                <p className="text-sm font-bold text-gray-700 mb-2">{scenario.description}</p>
                                                <div className="bg-gray-100 p-2 rounded flex justify-between items-center group-hover:bg-blue-50 transition-colors border border-gray-200">
                                                    <code className="text-xs font-mono text-gray-800 break-all mr-2">{scenario.cmd}</code>
                                                    <button 
                                                        onClick={() => runScenario(scenario.cmd, scenario.output)}
                                                        className="bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 hover:border-blue-600 text-xs px-3 py-1.5 rounded shadow-sm font-bold transition-all flex items-center gap-1"
                                                    >
                                                        <i className="fas fa-play"></i> Run
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800">
                                        <strong>Pro Tip:</strong> Click "Run" to visualize the command output in the terminal on the right.
                                    </div>
                                </div>

                                {/* Virtual Terminal */}
                                <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-700 flex flex-col overflow-hidden font-mono text-xs">
                                    {/* Term Header */}
                                    <div className="bg-slate-800 px-3 py-2 flex items-center justify-between border-b border-slate-700">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="text-gray-400">student@sec-lab:~</div>
                                        <button onClick={() => setTerminalHistory([])} className="text-gray-500 hover:text-white" title="Clear Terminal">
                                            <i className="fas fa-eraser"></i>
                                        </button>
                                    </div>

                                    {/* Term Body */}
                                    <div className="flex-grow p-4 overflow-y-auto text-gray-300 space-y-1 bg-black/20 custom-scrollbar">
                                        {terminalHistory.map((line, idx) => (
                                            <div key={idx} className={`${line.type === 'cmd' ? 'text-blue-400 font-bold mt-3' : 'text-gray-300 whitespace-pre-wrap'}`}>
                                                {line.type === 'cmd' ? (
                                                    <span><span className="text-green-400">student@sec-lab:~$</span> {line.text}</span>
                                                ) : (
                                                    line.text
                                                )}
                                            </div>
                                        ))}
                                        <div ref={terminalEndRef}></div>
                                    </div>

                                    {/* Term Input */}
                                    <form onSubmit={handleTerminalSubmit} className="bg-slate-800 p-2 flex items-center border-t border-slate-700">
                                        <span className="text-green-400 mr-2 font-bold">$</span>
                                        <input 
                                            type="text" 
                                            value={terminalInput}
                                            onChange={(e) => setTerminalInput(e.target.value)}
                                            className="bg-transparent border-none outline-none text-gray-200 w-full font-mono placeholder-gray-600"
                                            placeholder="Type a command..."
                                        />
                                    </form>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <i className="fas fa-toolbox text-6xl mb-4 opacity-20"></i>
                    <p>Select a tool from the sidebar to view details.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default QuickReference;
