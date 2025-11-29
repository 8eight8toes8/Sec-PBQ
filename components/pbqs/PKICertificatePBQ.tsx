
import React, { useState } from 'react';

interface PKICertificatePBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const STEPS = ['Generate Keys', 'Create CSR', 'Submit to CA', 'Install Cert'];

const PKICertificatePBQ: React.FC<PKICertificatePBQProps> = ({ onComplete, onExit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Form State
  const [cn, setCn] = useState('');
  const [org, setOrg] = useState('');
  
  const [keyGenerated, setKeyGenerated] = useState(false);
  const [csrGenerated, setCsrGenerated] = useState(false);
  const [certSigned, setCertSigned] = useState(false);
  const [installed, setInstalled] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleGenKey = () => {
    addLog("Generating RSA-2048 Private Key...");
    setTimeout(() => {
        addLog("Private Key generated (server.key). Stored securely.");
        setKeyGenerated(true);
        setCurrentStep(1);
    }, 1000);
  };

  const handleGenCsr = () => {
    if (!cn || !org) {
        alert("Please fill in Common Name and Organization");
        return;
    }
    addLog(`Generating Certificate Signing Request (CSR) for ${cn}...`);
    addLog(`Subject: CN=${cn}, O=${org}`);
    setTimeout(() => {
        addLog("CSR generated (server.csr). Ready for CA submission.");
        setCsrGenerated(true);
        setCurrentStep(2);
    }, 1000);
  };

  const handleSubmitCA = () => {
    addLog("Submitting CSR to Internal CA...");
    setTimeout(() => {
        addLog("CA: Validating request...");
        addLog("CA: Request approved. Signing with Root CA Key...");
        addLog("Certificate received (server.crt).");
        setCertSigned(true);
        setCurrentStep(3);
    }, 1500);
  };

  const handleInstall = () => {
    addLog("Binding server.crt and server.key to Web Server configuration...");
    addLog("Restarting NGINX service...");
    setTimeout(() => {
        addLog("SUCCESS: Web Server is now serving traffic over HTTPS (Port 443).");
        setInstalled(true);
        onComplete(100);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-certificate"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">PKI Lifecycle Management</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Wizard */}
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between mb-2">
                    {STEPS.map((step, idx) => (
                        <div key={idx} className={`text-xs font-bold uppercase tracking-wider ${idx <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                            {step}
                        </div>
                    ))}
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${((currentStep) / (STEPS.length - 1)) * 100}%` }}></div>
                </div>
            </div>

            {/* Step Content */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg min-h-[400px] flex flex-col">
                {currentStep === 0 && (
                    <div className="animate-fadeIn">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 1: Generate Key Pair</h3>
                        <p className="text-gray-600 mb-8">
                            The first step in securing a server is generating a cryptographic key pair. 
                            The <strong>Private Key</strong> must be kept secret on the server. 
                            The <strong>Public Key</strong> will be embedded in the certificate.
                        </p>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-6">
                            $ openssl genrsa -out server.key 2048
                        </div>
                        <button 
                            onClick={handleGenKey}
                            disabled={keyGenerated}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
                        >
                            {keyGenerated ? 'Keys Generated' : 'Execute Command'}
                        </button>
                    </div>
                )}

                {currentStep === 1 && (
                    <div className="animate-fadeIn">
                         <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 2: Create CSR</h3>
                         <p className="text-gray-600 mb-6">
                            Create a <strong>Certificate Signing Request</strong>. This file contains your Public Key and identity information to be sent to the Certificate Authority (CA).
                        </p>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Common Name (CN)</label>
                                <input 
                                    type="text" 
                                    value={cn}
                                    onChange={e => setCn(e.target.value)}
                                    placeholder="e.g., www.secure-bank.com"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">The Fully Qualified Domain Name (FQDN) you are securing.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Organization (O)</label>
                                <input 
                                    type="text" 
                                    value={org}
                                    onChange={e => setOrg(e.target.value)}
                                    placeholder="e.g., Secure Bank Corp"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={handleGenCsr}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
                        >
                            Generate CSR
                        </button>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="animate-fadeIn">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 3: Submit to CA</h3>
                        <p className="text-gray-600 mb-6">
                            Upload the CSR to your Certificate Authority. The CA will validate your identity and digitally sign the certificate using their Private Key, establishing the Chain of Trust.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex items-start gap-3">
                            <i className="fas fa-file-contract text-yellow-600 mt-1"></i>
                            <div>
                                <h4 className="font-bold text-yellow-800 text-sm">CSR Contents</h4>
                                <p className="text-xs text-yellow-700 font-mono mt-1 break-all">
                                    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={handleSubmitCA}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                        >
                            <i className="fas fa-paper-plane"></i> Send to CA
                        </button>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="animate-fadeIn">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Step 4: Install Certificate</h3>
                        <p className="text-gray-600 mb-6">
                            The CA has returned the signed certificate (<strong>server.crt</strong>). 
                            Configure the web server to use this certificate along with the private key generated in Step 1.
                        </p>
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 bg-green-50 border border-green-200 p-4 rounded-lg text-center">
                                <i className="fas fa-key text-green-600 text-2xl mb-2"></i>
                                <div className="text-xs font-bold text-green-800">server.key</div>
                            </div>
                            <div className="flex-1 bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
                                <i className="fas fa-certificate text-blue-600 text-2xl mb-2"></i>
                                <div className="text-xs font-bold text-blue-800">server.crt</div>
                            </div>
                        </div>
                        {installed ? (
                             <div className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg text-center animate-pulse">
                                <i className="fas fa-check-circle"></i> Installation Complete
                            </div>
                        ) : (
                            <button 
                                onClick={handleInstall}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg"
                            >
                                Install & Restart Service
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Right: Terminal Log */}
        <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-700 flex flex-col overflow-hidden h-full max-h-[600px]">
             <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-xs text-gray-400 font-mono">root@webserver:~</span>
             </div>
             <div className="flex-grow p-4 font-mono text-sm text-gray-300 overflow-y-auto space-y-2">
                <div className="text-gray-500"># System Ready. Waiting for input...</div>
                {logs.map((log, i) => (
                    <div key={i} className="animate-fadeIn">
                        <span className="text-blue-500 mr-2">➜</span>
                        {log}
                    </div>
                ))}
                {installed && (
                    <div className="mt-4 pt-4 border-t border-gray-700 text-green-400">
                        <i className="fas fa-lock"></i> Connection Secured. <br/>
                        Subject: {cn} <br/>
                        Issuer: SecPro Internal CA <br/>
                        Expires: 365 Days
                    </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default PKICertificatePBQ;
