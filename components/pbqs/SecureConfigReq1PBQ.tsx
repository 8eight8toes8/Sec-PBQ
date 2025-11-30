
import React, { useState } from 'react';

interface SecureConfigReq1PBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const SecureConfigReq1PBQ: React.FC<SecureConfigReq1PBQProps> = ({ onComplete, onExit }) => {
  // State for Server Configuration
  const [sshConfig, setSshConfig] = useState({
    permitRootLogin: 'yes',
    passwordAuth: 'yes',
    port: '22',
    maxAuthTries: '6',
    x11Forwarding: 'yes'
  });

  const [services, setServices] = useState([
    { id: 'apache2', name: 'Apache Web Server', status: 'running', required: true },
    { id: 'telnetd', name: 'Telnet Service', status: 'running', required: false },
    { id: 'vsftpd', name: 'FTP Server', status: 'running', required: false },
    { id: 'ssh', name: 'OpenSSH Server', status: 'running', required: true }
  ]);

  const [kernelParams, setKernelParams] = useState({
    disableIpForwarding: false,
    disableIcmpRedirects: false,
    logMartians: false,
    randomizeVaSpace: false
  });

  const [firewall, setFirewall] = useState({
    status: 'inactive',
    defaultIncoming: 'ALLOW',
    defaultOutgoing: 'ALLOW',
    allowSsh: true,
    allowHttp: true
  });

  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handlers
  const handleSshChange = (field: string, value: string) => {
    setSshConfig(prev => ({ ...prev, [field]: value }));
  };

  const toggleService = (id: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === id) return { ...s, status: s.status === 'running' ? 'stopped' : 'running' };
      return s;
    }));
  };

  const toggleKernel = (field: keyof typeof kernelParams) => {
    setKernelParams(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleFirewallChange = (field: string, value: any) => {
    setFirewall(prev => ({ ...prev, [field]: value }));
  };

  // Validation Logic
  const handleSubmit = () => {
    const errors: string[] = [];
    let score = 0;

    // 1. SSH Hardening
    if (sshConfig.permitRootLogin !== 'no') errors.push("SSH: Root login must be disabled.");
    if (sshConfig.passwordAuth !== 'no') errors.push("SSH: Password authentication should be disabled (use Keys).");
    if (sshConfig.x11Forwarding !== 'no') errors.push("SSH: X11 Forwarding should be disabled to prevent GUI attacks.");
    if (sshConfig.port === '22') errors.push("SSH: Recommendation is to move SSH to a non-standard port (Security by Obscurity, but reduces noise).");
    if (errors.length === 0) score += 25; // SSH Partial score logic simplified here

    // 2. Services
    const telnet = services.find(s => s.id === 'telnetd');
    const ftp = services.find(s => s.id === 'vsftpd');
    if (telnet?.status === 'running') errors.push("Services: Telnet is insecure (cleartext). Stop and disable it.");
    if (ftp?.status === 'running') errors.push("Services: FTP is insecure. Use SFTP instead.");
    // Ensure critical services are running
    const apache = services.find(s => s.id === 'apache2');
    if (apache?.status !== 'running') errors.push("Services: Web Server (Apache) must remain running.");
    if (errors.length <= (sshConfig.port === '22' ? 3 : 2)) score += 25; 

    // 3. Kernel Parameters (Sysctl)
    if (!kernelParams.disableIpForwarding) errors.push("Kernel: IP Forwarding should be disabled on a host (not a router).");
    if (!kernelParams.disableIcmpRedirects) errors.push("Kernel: ICMP Redirects should be disabled to prevent MITM.");
    if (!kernelParams.logMartians) errors.push("Kernel: Martian packets (spoofed IPs) should be logged.");
    if (!kernelParams.randomizeVaSpace) errors.push("Kernel: ASLR (Address Space Layout Randomization) must be enabled.");
    if (Object.values(kernelParams).every(Boolean)) score += 25;

    // 4. Firewall (UFW)
    if (firewall.status !== 'active') errors.push("Firewall: UFW is inactive.");
    if (firewall.defaultIncoming !== 'DENY') errors.push("Firewall: Default incoming policy must be DENY.");
    if (!firewall.allowSsh) errors.push("Firewall: You locked yourself out! SSH access required.");
    if (!firewall.allowHttp) errors.push("Firewall: Web Server requires HTTP access.");
    if (firewall.status === 'active' && firewall.defaultIncoming === 'DENY' && firewall.allowSsh) score += 25;

    // Final Score Calculation (Simplified)
    const finalScore = Math.max(0, 100 - (errors.length * 10));

    setSuccess(finalScore >= 90);
    setFeedback(finalScore >= 90 
        ? "Server Hardened Successfully! \n\n• SSH is secured.\n• Insecure services removed.\n• Kernel parameters optimized.\n• Firewall active." 
        : `Hardening Incomplete (Score: ${finalScore}%).\n\nIssues:\n` + errors.map(e => "• " + e).join("\n"));
    
    if (finalScore >= 90) onComplete(100);
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-gray-800 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-server"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Advanced Server Hardening</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Scenario Banner */}
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md mb-8">
            <h3 className="text-xl font-bold mb-2">Scenario: Public Web Server</h3>
            <p className="text-blue-100">
                You are configuring a new Linux web server exposed to the internet. 
                Your goal is to reduce the attack surface by disabling insecure access methods, removing unnecessary services, and applying kernel-level protections.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* 1. SSH Configuration */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2"><i className="fas fa-terminal"></i> SSH Config (sshd_config)</h4>
                    <span className="text-xs text-gray-500 font-mono">/etc/ssh/sshd_config</span>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4 items-center">
                        <label className="text-sm font-bold text-gray-700">PermitRootLogin</label>
                        <select 
                            value={sshConfig.permitRootLogin}
                            onChange={(e) => handleSshChange('permitRootLogin', e.target.value)}
                            className="col-span-2 p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="yes">yes</option>
                            <option value="prohibit-password">prohibit-password</option>
                            <option value="no">no</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center">
                        <label className="text-sm font-bold text-gray-700">PasswordAuth</label>
                        <select 
                            value={sshConfig.passwordAuth}
                            onChange={(e) => handleSshChange('passwordAuth', e.target.value)}
                            className="col-span-2 p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="yes">yes</option>
                            <option value="no">no (Use Keys)</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center">
                        <label className="text-sm font-bold text-gray-700">Listen Port</label>
                        <input 
                            type="number"
                            value={sshConfig.port}
                            onChange={(e) => handleSshChange('port', e.target.value)}
                            className="col-span-2 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center">
                        <label className="text-sm font-bold text-gray-700">X11Forwarding</label>
                        <select 
                            value={sshConfig.x11Forwarding}
                            onChange={(e) => handleSshChange('x11Forwarding', e.target.value)}
                            className="col-span-2 p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="yes">yes</option>
                            <option value="no">no</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* 2. Service Management */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2"><i className="fas fa-cogs"></i> Active Services</h4>
                    <span className="text-xs text-gray-500">systemctl</span>
                </div>
                <div className="p-6">
                    <div className="space-y-3">
                        {services.map(service => (
                            <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${service.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-800">{service.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{service.id}.service</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => toggleService(service.id)}
                                    className={`px-3 py-1 rounded text-xs font-bold border transition-all ${
                                        service.status === 'running' 
                                            ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                                            : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                    }`}
                                >
                                    {service.status === 'running' ? 'STOP' : 'START'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Kernel Hardening */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2"><i className="fas fa-microchip"></i> Kernel Parameters</h4>
                    <span className="text-xs text-gray-500 font-mono">/etc/sysctl.conf</span>
                </div>
                <div className="p-6 space-y-3">
                    <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">Disable IP Packet Forwarding</span>
                        <input type="checkbox" checked={kernelParams.disableIpForwarding} onChange={() => toggleKernel('disableIpForwarding')} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">Disable ICMP Redirects</span>
                        <input type="checkbox" checked={kernelParams.disableIcmpRedirects} onChange={() => toggleKernel('disableIcmpRedirects')} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">Log "Martian" Packets</span>
                        <input type="checkbox" checked={kernelParams.logMartians} onChange={() => toggleKernel('logMartians')} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">Enable ASLR (Address Space Layout Randomization)</span>
                        <input type="checkbox" checked={kernelParams.randomizeVaSpace} onChange={() => toggleKernel('randomizeVaSpace')} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                    </label>
                </div>
            </div>

            {/* 4. Firewall */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2"><i className="fas fa-fire-alt"></i> Firewall (UFW)</h4>
                    <div className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${firewall.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {firewall.status}
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="font-bold text-gray-700">Firewall State</label>
                        <button 
                            onClick={() => handleFirewallChange('status', firewall.status === 'active' ? 'inactive' : 'active')}
                            className={`w-14 h-8 rounded-full p-1 transition-colors ${firewall.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${firewall.status === 'active' ? 'translate-x-6' : ''}`}></div>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Default Incoming</label>
                            <select 
                                value={firewall.defaultIncoming}
                                onChange={(e) => handleFirewallChange('defaultIncoming', e.target.value)}
                                className="w-full p-2 border rounded bg-white text-sm"
                            >
                                <option value="ALLOW">ALLOW</option>
                                <option value="DENY">DENY</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Default Outgoing</label>
                            <select 
                                value={firewall.defaultOutgoing}
                                onChange={(e) => handleFirewallChange('defaultOutgoing', e.target.value)}
                                className="w-full p-2 border rounded bg-white text-sm"
                            >
                                <option value="ALLOW">ALLOW</option>
                                <option value="DENY">DENY</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={firewall.allowSsh} onChange={(e) => handleFirewallChange('allowSsh', e.target.checked)} className="rounded text-blue-600" />
                            <span className="text-sm text-gray-700">Allow SSH (Port {sshConfig.port})</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={firewall.allowHttp} onChange={(e) => handleFirewallChange('allowHttp', e.target.checked)} className="rounded text-blue-600" />
                            <span className="text-sm text-gray-700">Allow HTTP/HTTPS (Ports 80/443)</span>
                        </label>
                    </div>
                </div>
            </div>

        </div>

        <div className="mt-8 flex justify-end">
            <button 
                onClick={handleSubmit} 
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-10 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
                <i className="fas fa-check-shield"></i> Validate Hardening
            </button>
        </div>

      </div>

      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fas ${success ? 'fa-shield-check' : 'fa-exclamation-triangle'} text-3xl`}></i>
                    </div>
                    <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                        {success ? 'Server Secure' : 'Vulnerabilities Remain'}
                    </h3>
                </div>
                
                <div className="p-8">
                    <div className="whitespace-pre-line text-gray-700 text-sm leading-relaxed">
                        {feedback}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 flex justify-center gap-4">
                    {success ? (
                        <button onClick={onExit} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                            Return to Dashboard
                        </button>
                    ) : (
                        <button onClick={() => setFeedback(null)} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                            Continue Hardening
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SecureConfigReq1PBQ;
