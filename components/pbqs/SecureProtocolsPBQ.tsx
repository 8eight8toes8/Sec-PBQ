
import React, { useState } from 'react';

interface SecureProtocolsPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface ServiceConfig {
  id: string;
  name: string;
  currentProtocol: string;
  currentPort: number;
  status: 'Insecure' | 'Secure';
  description: string;
}

const INITIAL_SERVICES: ServiceConfig[] = [
  { id: 'remote_admin', name: 'Remote Administration', currentProtocol: 'Telnet', currentPort: 23, status: 'Insecure', description: 'Used for CLI access to the router.' },
  { id: 'file_transfer', name: 'File Transfer', currentProtocol: 'FTP', currentPort: 21, status: 'Insecure', description: 'Used to upload config files.' },
  { id: 'web_portal', name: 'Web Management Portal', currentProtocol: 'HTTP', currentPort: 80, status: 'Insecure', description: 'Web interface for admins.' },
  { id: 'directory', name: 'Directory Services', currentProtocol: 'LDAP', currentPort: 389, status: 'Insecure', description: 'User authentication backend.' }
];

const SECURE_OPTIONS: Record<string, { proto: string; port: number }[]> = {
  'remote_admin': [
    { proto: 'SSH', port: 22 },
    { proto: 'RDP', port: 3389 }
  ],
  'file_transfer': [
    { proto: 'SFTP', port: 22 },
    { proto: 'FTPS', port: 990 }
  ],
  'web_portal': [
    { proto: 'HTTPS', port: 443 }
  ],
  'directory': [
    { proto: 'LDAPS', port: 636 }
  ]
};

const SecureProtocolsPBQ: React.FC<SecureProtocolsPBQProps> = ({ onComplete, onExit }) => {
  const [services, setServices] = useState<ServiceConfig[]>(INITIAL_SERVICES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = (id: string, proto: string, port: number) => {
    setServices(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, currentProtocol: proto, currentPort: port, status: 'Secure' };
      }
      return s;
    }));
    setEditingId(null);
  };

  const handleSubmit = () => {
    const insecureServices = services.filter(s => s.status === 'Insecure');
    if (insecureServices.length === 0) {
      setSuccess(true);
      setFeedback("Perfect! All cleartext protocols have been replaced with their encrypted counterparts (SSH, SFTP, HTTPS, LDAPS). This protects credentials and data from sniffing attacks.");
      onComplete(100);
    } else {
      setSuccess(false);
      setFeedback(`You still have ${insecureServices.length} insecure services running.\n\n` + insecureServices.map(s => `• ${s.name} is using ${s.currentProtocol} (Cleartext)`).join("\n"));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-shield-alt"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Secure Protocols Implementation</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-5xl mx-auto w-full">
         <div className="bg-red-50 p-6 rounded-xl border border-red-200 mb-8 flex items-start gap-4">
            <div className="bg-red-100 p-3 rounded-full text-red-600 shrink-0">
                <i className="fas fa-exclamation-triangle text-xl"></i>
            </div>
            <div>
                <h3 className="font-bold text-red-900 mb-1">Vulnerability Scan Report</h3>
                <p className="text-red-800 text-sm">
                    The security audit identified that the following services are using insecure, cleartext protocols. 
                    Credentials are actively being sniffed on the network.
                </p>
            </div>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold">
                    <tr>
                        <th className="p-4">Service Name</th>
                        <th className="p-4">Current Protocol</th>
                        <th className="p-4">Port</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {services.map(service => (
                        <tr key={service.id} className="hover:bg-gray-50">
                            <td className="p-4">
                                <div className="font-bold text-gray-800">{service.name}</div>
                                <div className="text-xs text-gray-500">{service.description}</div>
                            </td>
                            <td className="p-4 font-mono font-medium">{service.currentProtocol}</td>
                            <td className="p-4 font-mono text-gray-600">{service.currentPort}</td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${service.status === 'Insecure' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {service.status}
                                </span>
                            </td>
                            <td className="p-4 text-right relative">
                                {service.status === 'Insecure' ? (
                                    <button 
                                        onClick={() => setEditingId(service.id)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
                                    >
                                        Remediate
                                    </button>
                                ) : (
                                    <span className="text-green-600 font-bold text-sm"><i className="fas fa-check"></i> Secured</span>
                                )}

                                {/* Dropdown for selection */}
                                {editingId === service.id && (
                                    <div className="absolute right-4 top-14 z-20 bg-white border border-gray-200 shadow-xl rounded-xl p-2 w-48 animate-fadeIn">
                                        <div className="text-xs font-bold text-gray-400 px-2 py-1 uppercase">Select Protocol</div>
                                        {SECURE_OPTIONS[service.id].map(opt => (
                                            <button
                                                key={opt.proto}
                                                onClick={() => handleUpdate(service.id, opt.proto, opt.port)}
                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors flex justify-between"
                                            >
                                                <span>{opt.proto}</span>
                                                <span className="text-gray-400 text-xs">Port {opt.port}</span>
                                            </button>
                                        ))}
                                        <button 
                                            onClick={() => setEditingId(null)}
                                            className="w-full text-center mt-2 text-xs text-gray-400 hover:text-gray-600 py-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </div>

         <div className="mt-8 flex justify-end">
             <button 
                onClick={handleSubmit} 
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
            >
                Verify Configuration
            </button>
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white p-8 rounded-xl max-w-lg w-full shadow-2xl">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${success ? 'fa-check' : 'fa-times'} text-2xl`}></i>
                </div>
                <h3 className={`text-xl font-bold mb-4 text-center ${success ? 'text-green-800' : 'text-red-800'}`}>{success ? 'All Services Secured' : 'Risks Remain'}</h3>
                <div className="text-sm bg-gray-50 p-4 rounded border border-gray-200 mb-6 whitespace-pre-line text-gray-700 leading-relaxed">
                    {feedback}
                </div>
                <button onClick={() => success ? onExit() : setFeedback(null)} className={`w-full py-3 text-white font-bold rounded-lg shadow-md transition-colors ${success ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'}`}>
                    {success ? 'Return to Dashboard' : 'Continue Remediation'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default SecureProtocolsPBQ;
