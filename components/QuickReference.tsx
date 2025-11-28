
import React, { useState } from 'react';

interface Command {
  cmd: string;
  desc: string;
}

interface Tool {
  tool: string;
  platforms: string[];
  description: string;
  commands: Command[];
}

type Category = 'networktools' | 'systemadmin' | 'securitytools' | 'loganalysis' | 'filepermissions' | 'processmanagement';

const QUICK_REF_DATA: Record<Category, Tool[]> = {
  networktools: [
    {
      tool: "netstat",
      platforms: ["Windows", "Linux"],
      description: "Display network connections and statistics",
      commands: [
        { cmd: "netstat -an", desc: "Display all connections and listening ports" },
        { cmd: "netstat -tulpn", desc: "Show listening TCP/UDP ports with process (Linux)" },
        { cmd: "netstat -ano", desc: "Show all connections with PIDs (Windows)" },
        { cmd: "netstat -r", desc: "Display routing table" }
      ]
    },
    {
        tool: "traceroute / tracert",
        platforms: ["Windows", "Linux"],
        description: "Trace the path packets take to a network host",
        commands: [
            { cmd: "traceroute google.com", desc: "Trace path to host (Linux)" },
            { cmd: "tracert google.com", desc: "Trace path to host (Windows)" },
            { cmd: "traceroute -n 8.8.8.8", desc: "Trace without DNS resolution (faster)" }
        ]
    },
    {
      tool: "ss",
      platforms: ["Linux"],
      description: "Socket statistics - modern netstat replacement",
      commands: [
        { cmd: "ss -tuln", desc: "Show TCP/UDP listening ports" },
        { cmd: "ss -s", desc: "Display socket statistics summary" },
        { cmd: "ss -tp", desc: "Show TCP connections with process names" }
      ]
    },
    {
      tool: "nmap",
      platforms: ["Linux", "Windows"],
      description: "Network mapper and port scanner",
      commands: [
        { cmd: "nmap -sV 192.168.1.1", desc: "Service version detection scan" },
        { cmd: "nmap -sS 192.168.1.0/24", desc: "SYN stealth scan of subnet" },
        { cmd: "nmap -A 192.168.1.1", desc: "Aggressive scan (OS, version, scripts)" }
      ]
    },
    {
      tool: "tcpdump",
      platforms: ["Linux"],
      description: "Network packet analyzer",
      commands: [
        { cmd: "tcpdump -i eth0", desc: "Capture packets on interface eth0" },
        { cmd: "tcpdump port 80", desc: "Capture HTTP traffic only" },
        { cmd: "tcpdump -w cap.pcap", desc: "Write captured packets to file" }
      ]
    },
    {
        tool: "dig/nslookup",
        platforms: ["Linux", "Windows"],
        description: "DNS lookup utilities",
        commands: [
            { cmd: "dig google.com", desc: "DNS lookup (Linux)" },
            { cmd: "nslookup google.com", desc: "DNS lookup (Windows)" },
            { cmd: "dig @8.8.8.8 google.com", desc: "Query specific DNS server" }
        ]
    },
    {
        tool: "curl / wget",
        platforms: ["Linux", "Windows"],
        description: "Command line data transfer tools",
        commands: [
            { cmd: "curl -I https://example.com", desc: "Fetch HTTP headers only" },
            { cmd: "curl -O https://example.com/file.zip", desc: "Download file" },
            { cmd: "wget https://example.com/file.zip", desc: "Download file (wget)" }
        ]
    }
  ],
  systemadmin: [
    {
      tool: "ipconfig",
      platforms: ["Windows"],
      description: "Windows IP configuration utility",
      commands: [
        { cmd: "ipconfig /all", desc: "Display full IP configuration details" },
        { cmd: "ipconfig /flushdns", desc: "Clear DNS resolver cache" },
        { cmd: "ipconfig /release", desc: "Release IP address" },
        { cmd: "ipconfig /renew", desc: "Renew IP address" }
      ]
    },
    {
        tool: "whoami / hostname",
        platforms: ["Windows", "Linux"],
        description: "User and system identification",
        commands: [
            { cmd: "whoami", desc: "Display current user" },
            { cmd: "hostname", desc: "Display system name" },
            { cmd: "id", desc: "Show user and group IDs (Linux)" }
        ]
    },
    {
      tool: "ip",
      platforms: ["Linux"],
      description: "Linux IP configuration tool",
      commands: [
        { cmd: "ip addr show", desc: "Display IP addresses" },
        { cmd: "ip route show", desc: "Display routing table" },
        { cmd: "ip neigh show", desc: "Show ARP cache" }
      ]
    },
    {
        tool: "df / du",
        platforms: ["Linux"],
        description: "Disk usage statistics",
        commands: [
            { cmd: "df -h", desc: "Disk free space (human readable)" },
            { cmd: "du -sh /var/log", desc: "Directory size summary" }
        ]
    },
    {
      tool: "systemctl",
      platforms: ["Linux"],
      description: "Systemd service manager",
      commands: [
        { cmd: "systemctl status sshd", desc: "Check SSH service status" },
        { cmd: "systemctl restart apache2", desc: "Restart Apache web server" },
        { cmd: "systemctl enable nginx", desc: "Enable service at boot" }
      ]
    }
  ],
  securitytools: [
    {
      tool: "iptables",
      platforms: ["Linux"],
      description: "Linux firewall administration",
      commands: [
        { cmd: "iptables -L -v", desc: "List all firewall rules" },
        { cmd: "iptables -A INPUT -p tcp --dport 22 -j ACCEPT", desc: "Allow SSH" },
        { cmd: "iptables -F", desc: "Flush all rules" }
      ]
    },
    {
      tool: "openssl",
      platforms: ["Linux", "Windows"],
      description: "SSL/TLS and cryptography toolkit",
      commands: [
        { cmd: "openssl genrsa -out key.pem 2048", desc: "Generate RSA private key" },
        { cmd: "openssl req -new -key key.pem -out csr.pem", desc: "Create CSR" },
        { cmd: "openssl s_client -connect google.com:443", desc: "Test SSL connection" }
      ]
    },
    {
        tool: "hashcat",
        platforms: ["Linux", "Windows"],
        description: "Advanced password recovery tool",
        commands: [
            { cmd: "hashcat -m 0 hash.txt list.txt", desc: "Crack MD5 hashes" },
            { cmd: "hashcat -m 1000 hash.txt list.txt", desc: "Crack NTLM hashes" }
        ]
    },
    {
        tool: "Wireshark / tshark",
        platforms: ["Windows", "Linux"],
        description: "Packet analyzer",
        commands: [
            { cmd: "tshark -i eth0", desc: "Capture on interface eth0 (CLI)" },
            { cmd: "Use GUI for deep analysis", desc: "Filter: ip.addr == 192.168.1.5" }
        ]
    },
    {
        tool: "Metasploit (msfconsole)",
        platforms: ["Linux"],
        description: "Penetration testing framework",
        commands: [
            { cmd: "msfconsole", desc: "Launch the console" },
            { cmd: "search smb_login", desc: "Search for modules" },
            { cmd: "use exploit/...", desc: "Select a module" }
        ]
    }
  ],
  loganalysis: [
    {
      tool: "grep",
      platforms: ["Linux"],
      description: "Search text using patterns",
      commands: [
        { cmd: "grep 'Failed' auth.log", desc: "Find failed login attempts" },
        { cmd: "grep -r 'pattern' /var/log/", desc: "Recursive search in directory" },
        { cmd: "grep -v 'exclude'", desc: "Invert match (exclude pattern)" }
      ]
    },
    {
        tool: "tail",
        platforms: ["Linux"],
        description: "Display last lines of files",
        commands: [
            { cmd: "tail -f /var/log/syslog", desc: "Follow log in real-time" },
            { cmd: "tail -n 50 access.log", desc: "Show last 50 lines" }
        ]
    },
    {
        tool: "journalctl",
        platforms: ["Linux"],
        description: "Query the systemd journal",
        commands: [
            { cmd: "journalctl -xe", desc: "Show end of journal with explanation" },
            { cmd: "journalctl -u sshd", desc: "Show logs for SSH unit" },
            { cmd: "journalctl -f", desc: "Follow journal entries" }
        ]
    },
    {
        tool: "dmesg",
        platforms: ["Linux"],
        description: "Kernel ring buffer messages",
        commands: [
            { cmd: "dmesg | grep usb", desc: "Check for USB device events" },
            { cmd: "dmesg -T", desc: "Show readable timestamps" }
        ]
    }
  ],
  filepermissions: [
    {
      tool: "chmod",
      platforms: ["Linux"],
      description: "Change file permissions",
      commands: [
        { cmd: "chmod 755 script.sh", desc: "rwxr-xr-x permissions" },
        { cmd: "chmod +x script.sh", desc: "Add execute permission" },
        { cmd: "chmod 600 id_rsa", desc: "Secure private key (rw-------)" }
      ]
    },
    {
      tool: "chown",
      platforms: ["Linux"],
      description: "Change file ownership",
      commands: [
        { cmd: "chown user:group file.txt", desc: "Change owner and group" },
        { cmd: "chown -R user directory", desc: "Recursive ownership change" }
      ]
    },
    {
        tool: "umask",
        platforms: ["Linux"],
        description: "Set default file permissions",
        commands: [
            { cmd: "umask", desc: "Show current mask" },
            { cmd: "umask 077", desc: "Set secure defaults (rw-------)" }
        ]
    },
    {
        tool: "icacls",
        platforms: ["Windows"],
        description: "Windows file permission tool",
        commands: [
            { cmd: "icacls file.txt /grant User:F", desc: "Grant full control" },
            { cmd: "icacls file.txt /deny User:W", desc: "Deny write permission" }
        ]
    }
  ],
  processmanagement: [
    {
      tool: "ps",
      platforms: ["Linux"],
      description: "Process status",
      commands: [
        { cmd: "ps aux", desc: "Show all processes" },
        { cmd: "ps -ef | grep apache", desc: "Find specific process" }
      ]
    },
    {
      tool: "kill",
      platforms: ["Linux"],
      description: "Terminate processes",
      commands: [
        { cmd: "kill -9 1234", desc: "Force kill PID 1234" },
        { cmd: "pkill firefox", desc: "Kill process by name" }
      ]
    },
    {
        tool: "nice / renice",
        platforms: ["Linux"],
        description: "Process priority management",
        commands: [
            { cmd: "nice -n 10 command", desc: "Run with lower priority" },
            { cmd: "renice -n -5 -p 1234", desc: "Increase priority of running process" }
        ]
    },
    {
        tool: "tasklist/taskkill",
        platforms: ["Windows"],
        description: "Windows process management",
        commands: [
            { cmd: "tasklist", desc: "List running processes" },
            { cmd: "taskkill /PID 1234 /F", desc: "Force kill process" }
        ]
    }
  ]
};

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'networktools', label: 'Network Tools' },
  { id: 'systemadmin', label: 'System Admin' },
  { id: 'securitytools', label: 'Security Tools' },
  { id: 'loganalysis', label: 'Log Analysis' },
  { id: 'filepermissions', label: 'File & Permissions' },
  { id: 'processmanagement', label: 'Process Mgmt' }
];

const QuickReference: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('networktools');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = QUICK_REF_DATA[activeCategory].filter(tool => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tool.tool.toLowerCase().includes(searchLower) ||
      tool.description.toLowerCase().includes(searchLower) ||
      tool.commands.some(c => c.cmd.toLowerCase().includes(searchLower) || c.desc.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-terminal"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quick Reference Guide</h2>
            <p className="text-xs text-gray-500">Essential commands, ports, and concepts for cybersecurity professionals</p>
          </div>
        </div>
        <button 
          onClick={onExit} 
          className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all"
          title="Close"
        >
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Search */}
        <div className="mb-6">
            <div className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input 
                    type="text" 
                    placeholder="Search commands, tools, or descriptions..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
            </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeCategory === cat.id ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
                >
                    {cat.label}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTools.length > 0 ? (
                filteredTools.map((tool, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-teal-800 flex items-center gap-2">
                                    <i className="fas fa-chevron-right text-xs"></i> {tool.tool}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">{tool.description}</p>
                            </div>
                            <div className="flex gap-2">
                                {tool.platforms.map(p => (
                                    <span key={p} className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${p === 'Windows' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 space-y-3">
                            {tool.commands.map((cmd, cIdx) => (
                                <div key={cIdx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <code className="bg-gray-800 text-green-400 px-3 py-1.5 rounded text-sm font-mono flex-grow sm:flex-none sm:w-1/2">
                                        {cmd.cmd}
                                    </code>
                                    <span className="text-sm text-gray-600">{cmd.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center py-12 text-gray-400">
                    <i className="fas fa-search text-4xl mb-3"></i>
                    <p>No commands found matching your search.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default QuickReference;