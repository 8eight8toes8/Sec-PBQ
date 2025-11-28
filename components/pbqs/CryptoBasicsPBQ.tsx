import React, { useState } from 'react';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const CryptoBasicsPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  const [config, setConfig] = useState({
    storageEncryption: '',
    transmissionProtocol: '',
    hashingAlgorithm: '',
    keyManagement: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const options = {
    storage: [
      { id: 'des', label: 'DES (56-bit)', secure: false, reason: 'Deprecated and insecure due to short key length.' },
      { id: 'aes128', label: 'AES-128', secure: true, reason: 'Secure standard for general purpose encryption.' },
      { id: 'aes256', label: 'AES-256', secure: true, reason: 'Gold standard (Military Grade) encryption.' },
      { id: 'rot13', label: 'ROT13', secure: false, reason: 'Not encryption, just obfuscation.' }
    ],
    transmission: [
      { id: 'ssl3', label: 'SSL 3.0', secure: false, reason: 'Vulnerable to POODLE attack. Deprecated.' },
      { id: 'tls12', label: 'TLS 1.2', secure: true, reason: 'Industry standard secure protocol.' },
      { id: 'tls13', label: 'TLS 1.3', secure: true, reason: 'Newest, most secure version of TLS.' },
      { id: 'telnet', label: 'Telnet', secure: false, reason: 'Transmits data in cleartext.' }
    ],
    hashing: [
      { id: 'md5', label: 'MD5', secure: false, reason: 'Vulnerable to collision attacks.' },
      { id: 'sha1', label: 'SHA-1', secure: false, reason: 'No longer considered secure against well-funded attackers.' },
      { id: 'sha256', label: 'SHA-256', secure: true, reason: 'Secure hashing algorithm for integrity.' },
      { id: 'bcrypt', label: 'Bcrypt', secure: true, reason: 'Excellent for passwords (slow & salted).' }
    ],
    keys: [
      { id: 'static', label: 'Hardcoded Keys', secure: false, reason: 'Never hardcode keys in source code.' },
      { id: 'hsm', label: 'Hardware Security Module (HSM)', secure: true, reason: 'Best practice for key protection.' },
      { id: 'text', label: 'Text File on Desktop', secure: false, reason: 'Extremely insecure storage.' }
    ]
  };

  const handleChange = (field: keyof typeof config, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setSubmitted(false);
    setFeedback(null);
  };

  const handleSubmit = () => {
    let currentScore = 0;
    const errors: string[] = [];
    const goods: string[] = [];

    // Evaluate Storage
    const storageOpt = options.storage.find(o => o.id === config.storageEncryption);
    if (storageOpt?.secure) {
        currentScore += 25;
        goods.push(`Storage: ${storageOpt.label} is a good choice.`);
    } else {
        errors.push(`Storage: ${storageOpt?.label || 'None'} - ${storageOpt?.reason || 'Please select an option.'}`);
    }

    // Evaluate Transmission
    const transOpt = options.transmission.find(o => o.id === config.transmissionProtocol);
    if (transOpt?.secure) {
        currentScore += 25;
        goods.push(`Transmission: ${transOpt.label} is secure.`);
    } else {
        errors.push(`Transmission: ${transOpt?.label || 'None'} - ${transOpt?.reason || 'Please select an option.'}`);
    }

    // Evaluate Hashing
    const hashOpt = options.hashing.find(o => o.id === config.hashingAlgorithm);
    if (hashOpt?.secure) {
        currentScore += 25;
        goods.push(`Hashing: ${hashOpt.label} is secure.`);
    } else {
        errors.push(`Hashing: ${hashOpt?.label || 'None'} - ${hashOpt?.reason || 'Please select an option.'}`);
    }

    // Evaluate Keys
    const keyOpt = options.keys.find(o => o.id === config.keyManagement);
    if (keyOpt?.secure) {
        currentScore += 25;
        goods.push(`Keys: ${keyOpt.label} is the best practice.`);
    } else {
        errors.push(`Keys: ${keyOpt?.label || 'None'} - ${keyOpt?.reason || 'Please select an option.'}`);
    }

    setScore(currentScore);
    setSubmitted(true);

    if (currentScore === 100) {
        setFeedback("Perfect! You have configured a secure cryptographic system adhering to modern best practices.");
        setTimeout(() => onComplete(100), 2000);
    } else {
        setFeedback("System Insecure. Please review the errors below.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-lock"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cryptography Basics</h2>
            <p className="text-xs text-gray-500">Secure System Configuration</p>
          </div>
        </div>
        <button
          onClick={onExit}
          className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all"
        >
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-6 max-w-5xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* Scenario Banner */}
            <div className="bg-purple-50 p-6 border-b border-purple-100">
                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 flex-shrink-0">
                        <i className="fas fa-shield-alt text-xl"></i>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-purple-900 mb-2">Scenario</h3>
                        <p className="text-purple-800 leading-relaxed">
                            You are the security architect for "Fortress Corp". You need to configure the cryptographic standards for a new sensitive customer database.
                            Your choices must ensure confidentiality, integrity, and security of data both at rest and in transit.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-8 grid gap-8 lg:grid-cols-2">

                {/* Configuration Panel */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-sliders-h text-gray-400"></i> Configuration
                    </h3>

                    {/* Data At Rest */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Data at Rest Encryption</label>
                        <select
                            value={config.storageEncryption}
                            onChange={(e) => handleChange('storageEncryption', e.target.value)}
                            className="w-full p-3 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        >
                            <option value="">Select Algorithm...</option>
                            {options.storage.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">Algorithm used to encrypt database files on disk.</p>
                    </div>

                    {/* Data In Transit */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Transmission Protocol</label>
                        <select
                            value={config.transmissionProtocol}
                            onChange={(e) => handleChange('transmissionProtocol', e.target.value)}
                            className="w-full p-3 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        >
                            <option value="">Select Protocol...</option>
                            {options.transmission.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">Protocol used for client-server communication.</p>
                    </div>

                    {/* Hashing */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Integrity / Password Hashing</label>
                        <select
                            value={config.hashingAlgorithm}
                            onChange={(e) => handleChange('hashingAlgorithm', e.target.value)}
                            className="w-full p-3 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        >
                            <option value="">Select Algorithm...</option>
                            {options.hashing.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">Algorithm for password storage or file integrity checks.</p>
                    </div>

                    {/* Key Management */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Key Management</label>
                        <select
                            value={config.keyManagement}
                            onChange={(e) => handleChange('keyManagement', e.target.value)}
                            className="w-full p-3 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        >
                            <option value="">Select Storage Method...</option>
                            {options.keys.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">How and where cryptographic keys are stored.</p>
                    </div>
                </div>

                {/* System Status / Feedback */}
                <div className="flex flex-col h-full">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                        <i className="fas fa-chart-line text-gray-400"></i> System Status
                    </h3>

                    <div className={`flex-grow rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center transition-colors ${submitted ? (score === 100 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200') : 'bg-gray-50 border-gray-200'}`}>
                        {!submitted ? (
                            <div className="text-center text-gray-400">
                                <i className="fas fa-server text-6xl mb-4 opacity-20"></i>
                                <p>Configure all parameters to run a security audit.</p>
                            </div>
                        ) : (
                            <div className="w-full">
                                <div className="flex justify-center mb-6">
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${score === 100 ? 'border-green-500 text-green-600 bg-white' : 'border-red-500 text-red-600 bg-white'}`}>
                                        <span className="text-3xl font-bold">{score}%</span>
                                    </div>
                                </div>

                                {score === 100 ? (
                                    <div className="text-center">
                                        <h4 className="text-xl font-bold text-green-800 mb-2">System Secure</h4>
                                        <p className="text-green-700">{feedback}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <h4 className="text-xl font-bold text-red-800 text-center mb-4">Security Vulnerabilities Detected</h4>
                                        {/* Feedback list could go here, but using console/state logic above */}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {submitted && score < 100 && (
                        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                             <h5 className="font-bold text-gray-800 mb-3 border-b pb-2">Audit Log</h5>
                             <ul className="space-y-2 text-sm">
                                {options.storage.find(o => o.id === config.storageEncryption) && !options.storage.find(o => o.id === config.storageEncryption)?.secure && (
                                    <li className="text-red-600 flex items-start gap-2"><i className="fas fa-times-circle mt-1"></i> {options.storage.find(o => o.id === config.storageEncryption)?.reason}</li>
                                )}
                                {options.transmission.find(o => o.id === config.transmissionProtocol) && !options.transmission.find(o => o.id === config.transmissionProtocol)?.secure && (
                                    <li className="text-red-600 flex items-start gap-2"><i className="fas fa-times-circle mt-1"></i> {options.transmission.find(o => o.id === config.transmissionProtocol)?.reason}</li>
                                )}
                                {options.hashing.find(o => o.id === config.hashingAlgorithm) && !options.hashing.find(o => o.id === config.hashingAlgorithm)?.secure && (
                                    <li className="text-red-600 flex items-start gap-2"><i className="fas fa-times-circle mt-1"></i> {options.hashing.find(o => o.id === config.hashingAlgorithm)?.reason}</li>
                                )}
                                {options.keys.find(o => o.id === config.keyManagement) && !options.keys.find(o => o.id === config.keyManagement)?.secure && (
                                    <li className="text-red-600 flex items-start gap-2"><i className="fas fa-times-circle mt-1"></i> {options.keys.find(o => o.id === config.keyManagement)?.reason}</li>
                                )}
                             </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <button onClick={() => setConfig({ storageEncryption: '', transmissionProtocol: '', hashingAlgorithm: '', keyManagement: '' })} className="text-gray-500 font-medium hover:text-gray-800">
                    Reset Configuration
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={!config.storageEncryption || !config.transmissionProtocol || !config.hashingAlgorithm || !config.keyManagement}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                    <i className="fas fa-clipboard-check"></i> Run Security Audit
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoBasicsPBQ;
