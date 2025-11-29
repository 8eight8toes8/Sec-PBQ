
import React, { useState } from 'react';

interface CryptographyBasicsPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface Scenario {
  id: number;
  question: string;
  context: string;
  options: { id: string; label: string; type: string }[];
  correctOption: string;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    question: "Select the best algorithm for encrypting data at rest (Full Disk Encryption) on company laptops.",
    context: "You need a fast, symmetric algorithm that is widely supported by hardware acceleration.",
    options: [
      { id: 'aes', label: 'AES-256 (Advanced Encryption Standard)', type: 'Symmetric' },
      { id: 'rsa', label: 'RSA-4096', type: 'Asymmetric' },
      { id: 'des', label: 'DES (Data Encryption Standard)', type: 'Symmetric' },
      { id: 'md5', label: 'MD5', type: 'Hashing' }
    ],
    correctOption: 'aes',
    explanation: "AES-256 is the industry standard for data at rest. It is symmetric (fast) and secure. RSA is too slow for bulk data. DES is obsolete."
  },
  {
    id: 2,
    question: "Choose a secure algorithm for key exchange over an insecure network (e.g., establishing a TLS session).",
    context: "We need to securely agree on a session key without sending it directly.",
    options: [
      { id: 'aes', label: 'AES-256', type: 'Symmetric' },
      { id: 'ecdh', label: 'ECDH (Elliptic Curve Diffie-Hellman)', type: 'Asymmetric' },
      { id: 'sha', label: 'SHA-256', type: 'Hashing' },
      { id: 'rc4', label: 'RC4', type: 'Stream Cipher' }
    ],
    correctOption: 'ecdh',
    explanation: "ECDH (or RSA) is used for secure key exchange. It allows two parties to generate a shared secret over a public channel."
  },
  {
    id: 3,
    question: "Select the appropriate hashing algorithm to verify file integrity.",
    context: "We need to ensure downloaded software packages haven't been tampered with.",
    options: [
      { id: 'md5', label: 'MD5', type: 'Hashing' },
      { id: 'sha256', label: 'SHA-256', type: 'Hashing' },
      { id: 'aes', label: 'AES-256', type: 'Symmetric' },
      { id: 'rot13', label: 'ROT13', type: 'Obfuscation' }
    ],
    correctOption: 'sha256',
    explanation: "SHA-256 is a strong hashing algorithm. MD5 is vulnerable to collision attacks and should be avoided for security-critical integrity checks."
  },
  {
    id: 4,
    question: "Which algorithm should be used for securely storing user passwords in a database?",
    context: "The algorithm must be slow to resist brute-force attacks.",
    options: [
      { id: 'aes', label: 'AES-256 (Encrypted)', type: 'Symmetric' },
      { id: 'base64', label: 'Base64 Encoding', type: 'Encoding' },
      { id: 'sha256', label: 'SHA-256 (Fast Hash)', type: 'Hashing' },
      { id: 'bcrypt', label: 'Bcrypt / PBKDF2', type: 'Key Stretching' }
    ],
    correctOption: 'bcrypt',
    explanation: "Passwords should be salted and hashed using a slow algorithm like Bcrypt, Argon2, or PBKDF2 to prevent rainbow table and fast brute-force attacks."
  }
];

const CryptographyBasicsPBQ: React.FC<CryptographyBasicsPBQProps> = ({ onComplete, onExit }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSelect = (scenarioId: number, optionId: string) => {
    setAnswers(prev => ({ ...prev, [scenarioId]: optionId }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const errors: string[] = [];

    SCENARIOS.forEach(s => {
      if (answers[s.id] === s.correctOption) {
        correctCount++;
      } else {
        errors.push(`Scenario ${s.id}: ${s.explanation}`);
      }
    });

    const score = Math.round((correctCount / SCENARIOS.length) * 100);
    setSuccess(score === 100);
    
    if (score === 100) {
      setFeedback("Excellent! You demonstrated a solid understanding of cryptographic primitives including Symmetric encryption, Asymmetric Key Exchange, Hashing, and Key Stretching.");
      onComplete(100);
    } else {
      setFeedback(`You scored ${score}%. \n\nReview:\n` + errors.map(e => "• " + e).join("\n"));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-lock"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cryptography Basics</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
            <h3 className="font-bold text-blue-900 mb-2">Objective</h3>
            <p className="text-blue-800">Select the appropriate cryptographic standard for each specific security requirement.</p>
        </div>

        <div className="space-y-6">
            {SCENARIOS.map((scenario, index) => (
                <div key={scenario.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Requirement #{index + 1}</h3>
                        <span className="text-xs font-mono text-gray-500">Crypto-Module-{scenario.id}</span>
                    </div>
                    <div className="p-6">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{scenario.question}</h4>
                        <p className="text-sm text-gray-600 mb-6 italic border-l-4 border-blue-400 pl-3 py-1 bg-blue-50/50">
                            Context: {scenario.context}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {scenario.options.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleSelect(scenario.id, opt.id)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                                        answers[scenario.id] === opt.id 
                                            ? 'border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-500' 
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`font-bold ${answers[scenario.id] === opt.id ? 'text-blue-800' : 'text-gray-700'}`}>{opt.label}</span>
                                        {answers[scenario.id] === opt.id && <i className="fas fa-check-circle text-blue-600"></i>}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{opt.type}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-8 flex justify-end">
             <button 
                onClick={handleSubmit} 
                disabled={Object.keys(answers).length < SCENARIOS.length}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-lg transition-all"
            >
                Submit Configuration
            </button>
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white p-8 rounded-xl max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${success ? 'fa-check' : 'fa-times'} text-2xl`}></i>
                </div>
                <h3 className={`text-xl font-bold mb-4 text-center ${success ? 'text-green-800' : 'text-red-800'}`}>{success ? 'Configuration Secure' : 'Security Risks Detected'}</h3>
                <div className="text-sm bg-gray-50 p-4 rounded border border-gray-200 mb-6 whitespace-pre-line text-gray-700 leading-relaxed">
                    {feedback}
                </div>
                <button onClick={() => success ? onExit() : setFeedback(null)} className={`w-full py-3 text-white font-bold rounded-lg shadow-md transition-colors ${success ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'}`}>
                    {success ? 'Return to Dashboard' : 'Fix Issues'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default CryptographyBasicsPBQ;
