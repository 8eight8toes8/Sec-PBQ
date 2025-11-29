
import React, { useState } from 'react';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface Certificate {
  id: string;
  cn: string; // Common Name
  issuer: string;
  expiry: string; // Days remaining
  status: 'Active' | 'Expiring' | 'Expired' | 'Revoked' | 'Compromised';
  serial: string;
}

const PKICertsPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  const [certs, setCerts] = useState<Certificate[]>([
    { id: 'c1', cn: 'www.secure-bank.com', issuer: 'GlobalSign CA', expiry: '240', status: 'Active', serial: '1A:2B:3C' },
    { id: 'c2', cn: 'vpn.secure-bank.com', issuer: 'Internal CA', expiry: '2', status: 'Expiring', serial: '4D:5E:6F' },
    { id: 'c3', cn: 'legacy-app.local', issuer: 'Internal CA', expiry: '-15', status: 'Expired', serial: '7G:8H:9I' },
    { id: 'c4', cn: 'dev-server.cloud', issuer: 'Let\'s Encrypt', expiry: '45', status: 'Compromised', serial: '0J:1K:2L' },
  ]);

  const [selectedCert, setSelectedCert] = useState<string | null>(null);
  const [action, setAction] = useState<'view' | 'revoke' | 'renew' | 'csr'>('view');
  const [csrData, setCsrData] = useState({ cn: '', org: '', keySize: '2048' });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tasksCompleted, setTasksCompleted] = useState({ revoked: false, renewed: false, installed: false });

  // Tasks description
  // 1. Revoke the compromised certificate (dev-server.cloud)
  // 2. Renew the expiring certificate (vpn.secure-bank.com)
  // 3. Issue a new certificate for 'mail.secure-bank.com'

  const handleRevoke = (id: string) => {
    const cert = certs.find(c => c.id === id);

    if (cert?.status === 'Compromised') {
        setCerts(prevCerts => prevCerts.map(c => c.id === id ? { ...c, status: 'Revoked' } : c));
        setTasksCompleted(prev => ({ ...prev, revoked: true }));
        setFeedback("Success: Compromised certificate has been added to the CRL (Certificate Revocation List).");
    } else if (cert?.status === 'Revoked') {
        setFeedback("Info: Certificate is already revoked.");
    } else {
        setFeedback("Warning: Revoking a healthy certificate can cause service outages. Only revoke if compromised or no longer needed.");
    }
    setAction('view');
  };

  const handleRenew = (id: string) => {
    const cert = certs.find(c => c.id === id);

    if (cert?.status === 'Expiring' || cert?.status === 'Expired') {
        setCerts(prevCerts => prevCerts.map(c => c.id === id ? { ...c, status: 'Active', expiry: '365' } : c));
        setTasksCompleted(prev => ({ ...prev, renewed: true }));
        setFeedback("Success: Certificate renewed successfully for 1 year.");
    } else {
        setFeedback("Info: This certificate does not need renewal yet.");
    }
    setAction('view');
  };

  const handleGenerateCSR = () => {
    if (csrData.cn === 'mail.secure-bank.com') {
        const newCert: Certificate = {
            id: `c${certs.length + 1}`,
            cn: csrData.cn,
            issuer: 'Internal CA',
            expiry: '365',
            status: 'Active',
            serial: Math.random().toString(16).substr(2, 6).toUpperCase().split('').join(':')
        };
        setCerts(prev => [...prev, newCert]);
        setTasksCompleted(prev => ({ ...prev, installed: true }));
        setFeedback("Success: CSR Signed. New certificate installed for mail.secure-bank.com.");
        setCsrData({ cn: '', org: '', keySize: '2048' });
        setAction('view');
    } else {
        setFeedback("Error: Please generate the certificate for the requested Common Name (mail.secure-bank.com).");
    }
  };

  const checkCompletion = () => {
    if (tasksCompleted.revoked && tasksCompleted.renewed && tasksCompleted.installed) {
        onComplete(100);
    } else {
        setFeedback("Incomplete: You still have pending tasks. Check the scenario list.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-certificate"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">PKI Manager</h2>
            <p className="text-xs text-gray-500">Certificate Lifecycle Management</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">

        {/* Sidebar / Tasks */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-tasks text-teal-600"></i> Pending Tasks
                </h3>
                <ul className="space-y-4">
                    <li className={`flex items-start gap-3 p-3 rounded-lg ${tasksCompleted.revoked ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className={`mt-0.5 ${tasksCompleted.revoked ? 'text-green-600' : 'text-red-500'}`}>
                            <i className={`fas ${tasksCompleted.revoked ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        </div>
                        <div className="text-sm">
                            <span className="font-bold block text-gray-800">Revoke Compromised Cert</span>
                            <span className="text-gray-600">Private key for <strong>dev-server.cloud</strong> was leaked.</span>
                        </div>
                    </li>
                    <li className={`flex items-start gap-3 p-3 rounded-lg ${tasksCompleted.renewed ? 'bg-green-50' : 'bg-orange-50'}`}>
                        <div className={`mt-0.5 ${tasksCompleted.renewed ? 'text-green-600' : 'text-orange-500'}`}>
                            <i className={`fas ${tasksCompleted.renewed ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        </div>
                        <div className="text-sm">
                            <span className="font-bold block text-gray-800">Renew Expiring Cert</span>
                            <span className="text-gray-600"><strong>vpn.secure-bank.com</strong> expires in &lt; 3 days.</span>
                        </div>
                    </li>
                    <li className={`flex items-start gap-3 p-3 rounded-lg ${tasksCompleted.installed ? 'bg-green-50' : 'bg-blue-50'}`}>
                        <div className={`mt-0.5 ${tasksCompleted.installed ? 'text-green-600' : 'text-blue-500'}`}>
                            <i className={`fas ${tasksCompleted.installed ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        </div>
                        <div className="text-sm">
                            <span className="font-bold block text-gray-800">Issue New Cert</span>
                            <span className="text-gray-600">Generate CSR for <strong>mail.secure-bank.com</strong>.</span>
                        </div>
                    </li>
                </ul>
            </div>

            <div className="bg-teal-50 p-5 rounded-xl border border-teal-100">
                 <h4 className="font-bold text-teal-900 mb-2">Quick Actions</h4>
                 <div className="grid grid-cols-1 gap-2">
                    <button
                        onClick={() => { setSelectedCert(null); setAction('csr'); }}
                        className="bg-white text-teal-700 hover:bg-teal-100 border border-teal-200 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-plus-circle"></i> New Certificate Request
                    </button>
                    <button
                         onClick={checkCompletion}
                         className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-colors mt-4"
                    >
                        Validate & Finish
                    </button>
                 </div>
            </div>
        </div>

        {/* Main Dashboard */}
        <div className="flex-grow space-y-6">

            {/* Feedback Banner */}
            {feedback && (
                <div className={`p-4 rounded-lg flex items-start gap-3 animate-fadeIn ${feedback.includes('Success') ? 'bg-green-100 text-green-800 border border-green-200' : feedback.includes('Error') ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}>
                    <i className={`fas ${feedback.includes('Success') ? 'fa-check-circle' : 'fa-info-circle'} mt-1`}></i>
                    <p className="font-medium">{feedback}</p>
                </div>
            )}

            {action === 'csr' ? (
                /* CSR Form */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800">Generate Certificate Signing Request (CSR)</h3>
                        <button onClick={() => setAction('view')} className="text-gray-400 hover:text-gray-600"><i className="fas fa-times"></i></button>
                    </div>
                    <div className="p-8 max-w-lg mx-auto space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Common Name (CN)</label>
                            <input
                                type="text"
                                value={csrData.cn}
                                onChange={(e) => setCsrData({...csrData, cn: e.target.value})}
                                placeholder="e.g., mail.secure-bank.com"
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">The fully qualified domain name (FQDN) to secure.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Organization</label>
                            <input
                                type="text"
                                value={csrData.org}
                                onChange={(e) => setCsrData({...csrData, org: e.target.value})}
                                placeholder="e.g., Secure Bank Ltd."
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Key Size</label>
                            <select
                                value={csrData.keySize}
                                onChange={(e) => setCsrData({...csrData, keySize: e.target.value})}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 outline-none"
                            >
                                <option value="1024">1024 bit (Insecure)</option>
                                <option value="2048">2048 bit (Standard)</option>
                                <option value="4096">4096 bit (High Security)</option>
                            </select>
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                            <button onClick={() => setAction('view')} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                            <button onClick={handleGenerateCSR} className="px-6 py-2 bg-teal-600 text-white font-bold rounded hover:bg-teal-700 shadow-sm">Sign & Install</button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Cert List */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800">Issued Certificates</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                                <tr>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Common Name</th>
                                    <th className="px-6 py-4">Issuer</th>
                                    <th className="px-6 py-4">Expiry</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {certs.map(cert => (
                                    <tr key={cert.id} className={`hover:bg-gray-50 transition-colors ${selectedCert === cert.id ? 'bg-teal-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold
                                                ${cert.status === 'Active' ? 'bg-green-100 text-green-700' :
                                                  cert.status === 'Expiring' ? 'bg-orange-100 text-orange-700' :
                                                  cert.status === 'Revoked' ? 'bg-gray-100 text-gray-500 line-through' :
                                                  cert.status === 'Compromised' ? 'bg-red-100 text-red-700 animate-pulse' :
                                                  'bg-red-100 text-red-700'}`}>
                                                {cert.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-700">{cert.cn}</td>
                                        <td className="px-6 py-4 text-gray-600">{cert.issuer}</td>
                                        <td className="px-6 py-4 font-mono">
                                            {parseInt(cert.expiry) < 0 ? 'Expired' : `${cert.expiry} days`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { setSelectedCert(cert.id); setAction('view'); }}
                                                    title="Select"
                                                    className="text-gray-400 hover:text-teal-600"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                {cert.status !== 'Revoked' && (
                                                    <>
                                                        <button
                                                            onClick={() => { setSelectedCert(cert.id); handleRevoke(cert.id); }}
                                                            title="Revoke Certificate"
                                                            className="text-gray-400 hover:text-red-600"
                                                        >
                                                            <i className="fas fa-ban"></i>
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedCert(cert.id); handleRenew(cert.id); }}
                                                            title="Renew Certificate"
                                                            className="text-gray-400 hover:text-blue-600"
                                                        >
                                                            <i className="fas fa-sync"></i>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default PKICertsPBQ;
