
import React, { useState } from 'react';

interface SecureConfigReq2PBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

// Types
type ComplianceStatus = 'Pending' | 'Compliant' | 'Non-Compliant';

interface Requirement {
  id: string;
  pciRef: string;
  description: string;
  status: ComplianceStatus;
  correctStatus: 'Compliant' | 'Non-Compliant'; // Initial state before remediation
  remediationOptions?: string[];
  correctRemediation?: string;
  isRemediated: boolean;
}

// Initial Requirements Checklist
const REQUIREMENTS: Requirement[] = [
  {
    id: 'req_1',
    pciRef: 'Req 1.2.1',
    description: 'Restrict inbound and outbound traffic to that which is necessary for the cardholder data environment.',
    status: 'Pending',
    correctStatus: 'Non-Compliant',
    remediationOptions: ['Disable Firewall', 'Restrict SSH to Jump Box IP', 'Allow Any/Any'],
    correctRemediation: 'Restrict SSH to Jump Box IP',
    isRemediated: false
  },
  {
    id: 'req_2',
    pciRef: 'Req 2.1',
    description: 'Always change vendor-supplied defaults for system passwords and other security parameters.',
    status: 'Pending',
    correctStatus: 'Non-Compliant',
    remediationOptions: ['Delete admin user', 'Change admin password', 'Rename admin user'],
    correctRemediation: 'Change admin password',
    isRemediated: false
  },
  {
    id: 'req_3',
    pciRef: 'Req 3.4',
    description: 'Render PAN (Primary Account Number) unreadable anywhere it is stored (hashing, encryption, truncation).',
    status: 'Pending',
    correctStatus: 'Non-Compliant',
    remediationOptions: ['Enable AES-256 Encryption', 'Mask first 6 digits', 'Change column name'],
    correctRemediation: 'Enable AES-256 Encryption',
    isRemediated: false
  },
  {
    id: 'req_4',
    pciRef: 'Req 4.1',
    description: 'Use strong cryptography and security protocols to safeguard sensitive cardholder data during transmission.',
    status: 'Pending',
    correctStatus: 'Compliant',
    isRemediated: true // Already good
  },
  {
    id: 'req_7',
    pciRef: 'Req 7.1',
    description: 'Limit access to system components and cardholder data to only those individuals whose job requires such access.',
    status: 'Pending',
    correctStatus: 'Non-Compliant',
    remediationOptions: ['Revoke Marketing access', 'Grant everyone Read access', 'Delete database'],
    correctRemediation: 'Revoke Marketing access',
    isRemediated: false
  }
];

const SecureConfigReq2PBQ: React.FC<SecureConfigReq2PBQProps> = ({ onComplete, onExit }) => {
  const [checklist, setChecklist] = useState<Requirement[]>(REQUIREMENTS);
  const [activeTab, setActiveTab] = useState<'firewall' | 'users' | 'database' | 'web'>('firewall');
  const [remediationModal, setRemediationModal] = useState<string | null>(null); // Req ID
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Config State (Visuals update upon remediation)
  const [config, setConfig] = useState({
    firewallSshSource: '0.0.0.0/0 (Any)',
    adminPasswordLastSet: 'Never (Default)',
    dbEncryption: 'None (Plaintext)',
    marketingAccess: 'Read/Write',
  });

  const handleStatusChange = (id: string, status: ComplianceStatus) => {
    const req = checklist.find(r => r.id === id);
    if (!req) return;

    if (status === 'Non-Compliant' && !req.isRemediated) {
      // Trigger remediation flow
      setRemediationModal(id);
    } 
    
    setChecklist(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const applyRemediation = (reqId: string, option: string) => {
    const req = checklist.find(r => r.id === reqId);
    if (!req) return;

    if (option === req.correctRemediation) {
      // Update System Config Visuals
      if (reqId === 'req_1') setConfig(prev => ({ ...prev, firewallSshSource: '10.5.1.100/32 (Jump Box)' }));
      if (reqId === 'req_2') setConfig(prev => ({ ...prev, adminPasswordLastSet: 'Just Now (Strong)' }));
      if (reqId === 'req_3') setConfig(prev => ({ ...prev, dbEncryption: 'AES-256 (Encrypted)' }));
      if (reqId === 'req_7') setConfig(prev => ({ ...prev, marketingAccess: 'None' }));

      // Update Checklist
      setChecklist(prev => prev.map(r => r.id === reqId ? { ...r, status: 'Compliant', isRemediated: true } : r));
    } else {
        alert("Incorrect Remediation: This action does not fully satisfy the PCI-DSS requirement or causes operational issues.");
        // Keep status as Non-Compliant
    }
    setRemediationModal(null);
  };

  const handleSubmit = () => {
    // Audit Check
    // 1. All items must be marked Compliant (either initially or after remediation)
    // 2. Initial assessment must have been correct (handled by the flow forcing remediation on Non-Compliant)
    
    const allCompliant = checklist.every(r => r.status === 'Compliant');
    
    if (allCompliant) {
        setSuccess(true);
        setFeedback("Audit Passed! \n\nEnvironment is now PCI-DSS Compliant. \n• Firewall locked down.\n• Default passwords changed.\n• Data at Rest encrypted.\n• Least Privilege enforced.");
        onComplete(100);
    } else {
        setSuccess(false);
        const pending = checklist.filter(r => r.status === 'Pending').length;
        const failed = checklist.filter(r => r.status === 'Non-Compliant').length;
        setFeedback(`Audit Incomplete.\n\n• Pending Items: ${pending}\n• Unresolved Violations: ${failed}\n\nPlease review all requirements and remediate violations.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-800 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-clipboard-check"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Compliance Audit & Remediation</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation (PCI-DSS)</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6">
        
        {/* LEFT: Audit Checklist */}
        <div className="lg:w-2/5 flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                <div className="p-5 bg-gray-800 border-b border-gray-700 text-white flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2">
                        <i className="fas fa-tasks"></i> Audit Checklist
                    </h3>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded border border-gray-600">PCI-DSS v4.0</span>
                </div>
                
                <div className="flex-grow overflow-y-auto p-0">
                    {checklist.map((req) => (
                        <div key={req.id} className={`p-4 border-b border-gray-100 transition-colors ${req.status === 'Compliant' ? 'bg-green-50/50' : req.status === 'Non-Compliant' ? 'bg-red-50/50' : 'bg-white'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-xs text-gray-500 uppercase tracking-wide">{req.pciRef}</span>
                                {req.isRemediated && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Remediated</span>}
                            </div>
                            <p className="text-sm text-gray-800 mb-4 leading-snug">{req.description}</p>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleStatusChange(req.id, 'Compliant')}
                                    disabled={req.isRemediated}
                                    className={`flex-1 py-2 text-xs font-bold rounded border transition-all flex items-center justify-center gap-1
                                        ${req.status === 'Compliant' 
                                            ? 'bg-green-600 text-white border-green-600 shadow-sm' 
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-green-400 hover:text-green-600'
                                        }`}
                                >
                                    <i className="fas fa-check"></i> Compliant
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(req.id, 'Non-Compliant')}
                                    disabled={req.isRemediated}
                                    className={`flex-1 py-2 text-xs font-bold rounded border transition-all flex items-center justify-center gap-1
                                        ${req.status === 'Non-Compliant' 
                                            ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-red-400 hover:text-red-600'
                                        }`}
                                >
                                    <i className="fas fa-times"></i> Violation
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <button 
                        onClick={handleSubmit}
                        className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-file-signature"></i> Submit Audit Report
                    </button>
                </div>
            </div>
        </div>

        {/* RIGHT: System Configuration Viewer */}
        <div className="lg:w-3/5 flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-full min-h-[600px]">
                
                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                    {[
                        { id: 'firewall', icon: 'fa-fire', label: 'Firewall' },
                        { id: 'users', icon: 'fa-users-cog', label: 'Users & Auth' },
                        { id: 'database', icon: 'fa-database', label: 'Database' },
                        { id: 'web', icon: 'fa-globe', label: 'Web Server' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap
                                ${activeTab === tab.id 
                                    ? 'border-blue-600 text-blue-800 bg-white' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                }
                            `}
                        >
                            <i className={`fas ${tab.icon}`}></i> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="p-8 bg-slate-50 flex-grow font-mono text-sm overflow-y-auto">
                    
                    {activeTab === 'firewall' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-gray-700 border-b border-gray-100 pb-2 mb-2">Inbound Rules (Zone: Untrusted)</h4>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-xs text-gray-400 uppercase">
                                            <th className="pb-2">Proto</th>
                                            <th className="pb-2">Port</th>
                                            <th className="pb-2">Source</th>
                                            <th className="pb-2">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600">
                                        <tr className="border-b border-gray-100">
                                            <td className="py-2">TCP</td>
                                            <td>443 (HTTPS)</td>
                                            <td>0.0.0.0/0</td>
                                            <td className="text-green-600 font-bold">ALLOW</td>
                                        </tr>
                                        <tr>
                                            <td className="py-2">TCP</td>
                                            <td>22 (SSH)</td>
                                            <td className={`${config.firewallSshSource === '0.0.0.0/0 (Any)' ? 'text-red-500 font-bold bg-red-50 px-1 rounded' : 'text-green-600 font-bold'}`}>{config.firewallSshSource}</td>
                                            <td className="text-green-600 font-bold">ALLOW</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="text-xs text-gray-500">
                                <i className="fas fa-info-circle"></i> Firewall managed by UFW v0.36
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-gray-700 border-b border-gray-100 pb-2 mb-2">Local Users</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <div>
                                            <div className="font-bold text-gray-800">root</div>
                                            <div className="text-xs text-gray-500">UID: 0</div>
                                        </div>
                                        <div className="text-xs text-gray-500">Login Disabled</div>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-200">
                                        <div>
                                            <div className="font-bold text-gray-800">admin</div>
                                            <div className="text-xs text-gray-500">UID: 1001 (Administrators)</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500">Password Changed:</div>
                                            <div className={`text-xs font-bold ${config.adminPasswordLastSet.includes('Never') ? 'text-red-600' : 'text-green-600'}`}>{config.adminPasswordLastSet}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <div>
                                            <div className="font-bold text-gray-800">web_service</div>
                                            <div className="text-xs text-gray-500">UID: 1002 (Service Account)</div>
                                        </div>
                                        <div className="text-xs text-green-600">Key Auth Only</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'database' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-gray-700 border-b border-gray-100 pb-2 mb-2">Schema: PaymentGateway</h4>
                                <div className="mb-4">
                                    <div className="text-xs font-bold text-gray-500 mb-1">Table: transactions</div>
                                    <div className="border border-gray-200 rounded overflow-hidden">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-gray-100 text-gray-500">
                                                <tr>
                                                    <th className="p-2">Column</th>
                                                    <th className="p-2">Type</th>
                                                    <th className="p-2">Attributes</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-gray-700">
                                                <tr className="border-b border-gray-50">
                                                    <td className="p-2">id</td>
                                                    <td className="p-2">INT</td>
                                                    <td className="p-2">PK, Auto-Inc</td>
                                                </tr>
                                                <tr className="border-b border-gray-50 bg-yellow-50/50">
                                                    <td className="p-2 font-bold">cc_number</td>
                                                    <td className="p-2">VARCHAR(16)</td>
                                                    <td className={`p-2 font-bold ${config.dbEncryption.includes('None') ? 'text-red-600' : 'text-green-600'}`}>{config.dbEncryption}</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-2">amount</td>
                                                    <td className="p-2">DECIMAL</td>
                                                    <td className="p-2">NOT NULL</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <h4 className="font-bold text-gray-700 border-b border-gray-100 pb-2 mb-2">Access Control Lists (ACLs)</h4>
                                <ul className="text-xs space-y-1">
                                    <li className="flex justify-between"><span className="text-gray-600">app_user:</span> <span className="text-green-600">Read/Write (Transactions)</span></li>
                                    <li className="flex justify-between bg-yellow-50 p-1 rounded">
                                        <span className="text-gray-800 font-bold">group_marketing:</span> 
                                        <span className={`${config.marketingAccess === 'None' ? 'text-gray-400 line-through' : 'text-red-600 font-bold'}`}>{config.marketingAccess} (All Tables)</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'web' && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                                <h4 className="font-bold text-gray-700 border-b border-gray-100 pb-2 mb-2">NGINX Configuration</h4>
                                <pre className="text-xs text-gray-600 overflow-x-auto">
{`server {
    listen 443 ssl http2;
    server_name pay.secure-site.com;

    # SSL Protocols
    ssl_protocols TLSv1.2 TLSv1.3;  # Compliant
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logging
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    location / {
        proxy_pass http://backend:3000;
    }
}`}
                                </pre>
                            </div>
                            <div className="bg-green-50 border border-green-200 p-3 rounded text-xs text-green-800">
                                <i className="fas fa-check-circle"></i> TLS 1.0/1.1 disabled. Strong ciphers enforced.
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>

      </div>

      {/* Remediation Modal */}
      {remediationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800">Remediation Action Required</h3>
                    <p className="text-sm text-gray-500 mt-1">Select the appropriate fix for <strong>{checklist.find(r => r.id === remediationModal)?.pciRef}</strong></p>
                </div>
                <div className="p-6 bg-gray-50">
                    <p className="mb-4 text-sm text-gray-700 font-medium">{checklist.find(r => r.id === remediationModal)?.description}</p>
                    <div className="space-y-2">
                        {checklist.find(r => r.id === remediationModal)?.remediationOptions?.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => applyRemediation(remediationModal, opt)}
                                className="w-full text-left p-3 bg-white border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all text-sm font-medium shadow-sm"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-200 flex justify-end">
                    <button onClick={() => setRemediationModal(null)} className="text-gray-500 hover:text-gray-700 text-sm font-bold px-4">Cancel</button>
                </div>
            </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fas ${success ? 'fa-shield-check' : 'fa-exclamation-triangle'} text-3xl`}></i>
                    </div>
                    <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                        {success ? 'Compliance Achieved' : 'Audit Failed'}
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
                            Continue Auditing
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SecureConfigReq2PBQ;
