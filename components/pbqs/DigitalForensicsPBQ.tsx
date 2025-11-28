import React, { useState } from 'react';

interface DigitalForensicsPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const DigitalForensicsPBQ: React.FC<DigitalForensicsPBQProps> = ({ onComplete, onExit }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const FILES = [
    { id: 'file1', name: 'vacation.jpg', hash: 'a1b2c3d4', type: 'image/jpeg', suspicious: false },
    { id: 'file2', name: 'invoice.pdf', hash: 'e5f6g7h8', type: 'application/pdf', suspicious: false },
    { id: 'file3', name: 'svchost.exe', hash: 'BADH4SH1', type: 'application/x-msdownload', suspicious: true }, // Malware disguised
    { id: 'file4', name: 'notes.txt', hash: '12345678', type: 'text/plain', suspicious: false }
  ];

  const handleScan = (id: string) => {
    setSelectedFile(id);
  };

  const handleSubmit = () => {
    const file = FILES.find(f => f.id === selectedFile);
    if (file?.suspicious) {
        setFeedback("Success! You identified the malicious executable masquerading as a system process. The hash matches known IoCs.");
        onComplete(100);
    } else {
        setFeedback("Incorrect. This file appears benign. Look for executables or mismatched hashes.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-search-plus"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Forensic Investigation</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-8 max-w-4xl mx-auto w-full">
         <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="font-bold text-gray-800 mb-4">Evidence Drive: /Users/Admin/Downloads</h3>
            <p className="text-sm text-gray-500 mb-6">Analyze the files found in the download directory. Identify the malware artifact.</p>
            
            <div className="grid grid-cols-1 gap-4">
                {FILES.map(file => (
                    <div 
                        key={file.id}
                        onClick={() => handleScan(file.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer flex justify-between items-center transition-all ${selectedFile === file.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="flex items-center gap-3">
                            <i className={`fas fa-file text-2xl text-gray-400`}></i>
                            <div>
                                <div className="font-bold text-gray-700">{file.name}</div>
                                <div className="text-xs text-gray-500 font-mono">Hash: {file.hash}</div>
                            </div>
                        </div>
                        {selectedFile === file.id && <div className="text-blue-600 font-bold text-sm">Selected</div>}
                    </div>
                ))}
            </div>

            <button onClick={handleSubmit} disabled={!selectedFile} className="mt-8 w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow disabled:opacity-50">
                Flag as Malicious
            </button>
         </div>
      </div>

      {feedback && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white p-8 rounded-xl max-w-md w-full shadow-2xl text-center">
                <h3 className="text-xl font-bold mb-4">{feedback.includes('Success') ? 'Threat Identified' : 'Investigation Failed'}</h3>
                <p className="text-gray-600 mb-6">{feedback}</p>
                <button onClick={() => feedback.includes('Success') ? onExit() : setFeedback(null)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">
                    {feedback.includes('Success') ? 'Close Case' : 'Continue Search'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default DigitalForensicsPBQ;