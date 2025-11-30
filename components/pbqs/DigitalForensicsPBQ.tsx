
import React, { useState } from 'react';

interface DigitalForensicsPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

// Types
interface FileObj {
  name: string;
  type: 'file' | 'dir';
  size: string;
  path: string;
  magicBytes: string; // Hex string header
  content: string; // For Strings viewer
  hash: string; // SHA-256
  isMalicious: boolean;
  threatType?: 'Malware' | 'Exfiltration' | 'Spoofing';
}

interface Directory {
  [key: string]: FileObj | Directory;
}

// Mock Data
const IOC_DATABASE = [
  { hash: 'e3b0c442...', label: 'Empty File Hash (Benign)' },
  { hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', label: 'Ransomware.WannaCry.Variant' },
  { hash: 'a1b2c3d4e5f6...', label: 'Trojan.Emotet.Payload' },
  { hash: '1234567890abcdef...', label: 'Generic.Malware.Dropper' }
];

const FILE_SYSTEM: FileObj[] = [
  { 
    name: 'invoice_2024.pdf', 
    type: 'file', 
    size: '1.2 MB', 
    path: '/home/admin/Downloads', 
    magicBytes: '25 50 44 46 2D 31 2E', // %PDF
    content: '...Invoice details... Total: $500...',
    hash: 'aa987654...', 
    isMalicious: false 
  },
  { 
    name: 'family_vacation.jpg', 
    type: 'file', 
    size: '4.5 MB', 
    path: '/home/admin/Pictures', 
    magicBytes: '4D 5A 90 00 03 00 00', // MZ (Executable!) Spoofing
    content: 'This program cannot be run in DOS mode... PowerShell -Enc ...', 
    hash: '1234567890abcdef...', 
    isMalicious: true,
    threatType: 'Spoofing'
  },
  { 
    name: 'svchost.exe', 
    type: 'file', 
    size: '22 KB', 
    path: '/tmp/.hidden', // Suspicious path
    magicBytes: '4D 5A 90 00 03 00 00', 
    content: 'Connect 192.168.1.55:4444... Download payload...', 
    hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 
    isMalicious: true,
    threatType: 'Malware'
  },
  { 
    name: 'passwords.txt', 
    type: 'file', 
    size: '2 KB', 
    path: '/home/admin/Documents', 
    magicBytes: '55 73 65 72 3A 20 61', // 'User: a'
    content: 'root:password123\nadmin:admin\ndb_backup:securePass!', 
    hash: 'bb112233...', 
    isMalicious: true, // While not malware, it's a security violation/exfil risk
    threatType: 'Exfiltration'
  },
  {
    name: 'system.dll',
    type: 'file',
    size: '1.5 MB',
    path: '/Windows/System32',
    magicBytes: '4D 5A 90 00 03 00 00',
    content: '...Microsoft Corporation...',
    hash: 'cc998877...',
    isMalicious: false
  }
];

const TOOLS = [
  { id: 'explorer', name: 'File Explorer', icon: 'fa-folder-open' },
  { id: 'hex', name: 'Hex Viewer', icon: 'fa-microchip' },
  { id: 'hash', name: 'Hash Calculator', icon: 'fa-hashtag' },
  { id: 'strings', name: 'Strings', icon: 'fa-font' }
];

const DigitalForensicsPBQ: React.FC<DigitalForensicsPBQProps> = ({ onComplete, onExit }) => {
  const [activeTool, setActiveTool] = useState('explorer');
  const [selectedFile, setSelectedFile] = useState<FileObj | null>(null);
  const [evidenceBag, setEvidenceBag] = useState<FileObj[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Helper to get files by directory for the "Explorer" view
  const getFilesByDir = (dir: string) => FILE_SYSTEM.filter(f => f.path === dir);
  const directories = Array.from(new Set(FILE_SYSTEM.map(f => f.path)));

  const handleAddToEvidence = () => {
    if (selectedFile && !evidenceBag.find(f => f.name === selectedFile.name)) {
      setEvidenceBag([...evidenceBag, selectedFile]);
    }
  };

  const handleRemoveEvidence = (fileName: string) => {
    setEvidenceBag(evidenceBag.filter(f => f.name !== fileName));
  };

  const handleSubmit = () => {
    const maliciousFiles = FILE_SYSTEM.filter(f => f.isMalicious);
    
    // Check 1: Did they find all malicious files?
    const foundAll = maliciousFiles.every(m => evidenceBag.find(e => e.name === m.name));
    
    // Check 2: Did they flag any benign files? (False Positives)
    const falsePositives = evidenceBag.filter(e => !e.isMalicious);

    if (foundAll && falsePositives.length === 0) {
      setSuccess(true);
      setFeedback("Excellent Investigation! You correctly identified:\n\n1. The spoofed 'family_vacation.jpg' (actually an executable).\n2. The malicious 'svchost.exe' running from /tmp with a known bad hash.\n3. The unsecured 'passwords.txt' file.");
      onComplete(100);
    } else {
      setSuccess(false);
      let msg = "Investigation Incomplete or Inaccurate.\n\n";
      if (!foundAll) msg += "• You missed one or more malicious artifacts.\n";
      if (falsePositives.length > 0) msg += `• You flagged ${falsePositives.length} benign files as evidence.\n`;
      msg += "\nHint: Check Magic Bytes for spoofing and compare Hashes against the IOC list.";
      setFeedback(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-search-plus"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Digital Forensics Lab</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6">
        
        {/* LEFT: Forensic Toolkit Sidebar */}
        <div className="lg:w-1/5 flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Toolkit</h3>
                </div>
                <div>
                    {TOOLS.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id)}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${activeTool === tool.id ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <i className={`fas ${tool.icon} w-5 text-center`}></i>
                            <span className="font-medium text-sm">{tool.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* IOC Reference */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-grow">
                <div className="p-4 bg-red-50 border-b border-red-100">
                    <h3 className="font-bold text-red-800 text-sm uppercase tracking-wide flex items-center gap-2">
                        <i className="fas fa-bug"></i> Threat Intel (IOCs)
                    </h3>
                </div>
                <div className="p-4 text-xs space-y-3 overflow-y-auto max-h-[300px]">
                    {IOC_DATABASE.map((ioc, idx) => (
                        <div key={idx} className="border-b border-gray-100 last:border-0 pb-2">
                            <div className="font-bold text-gray-700 mb-1">{ioc.label}</div>
                            <div className="font-mono text-gray-500 break-all bg-gray-50 p-1 rounded">{ioc.hash}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* CENTER: Main Workspace */}
        <div className="lg:w-3/5 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 h-full min-h-[500px] flex flex-col relative overflow-hidden">
                
                {/* TOOL: FILE EXPLORER */}
                {activeTool === 'explorer' && (
                    <div className="flex flex-col h-full animate-fadeIn">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800"><i className="fas fa-hdd text-gray-500 mr-2"></i> Evidence Drive: /dev/sda1</h3>
                        </div>
                        <div className="flex-grow p-4 space-y-6 overflow-y-auto">
                            {directories.map(dir => (
                                <div key={dir}>
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-2">
                                        <i className="fas fa-folder text-yellow-500"></i> {dir}
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 pl-4">
                                        {getFilesByDir(dir).map(file => (
                                            <div 
                                                key={file.name}
                                                onClick={() => setSelectedFile(file)}
                                                className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${selectedFile?.name === file.name ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <i className={`fas fa-file text-xl text-gray-400`}></i>
                                                    <div>
                                                        <div className="font-bold text-gray-800 text-sm">{file.name}</div>
                                                        <div className="text-xs text-gray-500">{file.size}</div>
                                                    </div>
                                                </div>
                                                {evidenceBag.find(e => e.name === file.name) && (
                                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">Flagged</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TOOL: HEX VIEWER */}
                {activeTool === 'hex' && (
                    <div className="flex flex-col h-full animate-fadeIn">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-800">Hex Inspection</h3>
                        </div>
                        <div className="flex-grow p-6">
                            {selectedFile ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-gray-700">File: {selectedFile.name}</span>
                                        <span className="text-xs text-gray-500">Magic Bytes Analysis</span>
                                    </div>
                                    <div className="bg-gray-900 text-green-400 font-mono p-4 rounded-lg shadow-inner text-sm">
                                        <div className="flex gap-4 border-b border-gray-700 pb-2 mb-2 text-gray-500">
                                            <span>OFFSET</span>
                                            <span>00 01 02 03 04 05 06 07</span>
                                            <span>ASCII</span>
                                        </div>
                                        <div className="flex gap-4">
                                            <span className="text-gray-500">00000000</span>
                                            <span className="text-white font-bold">{selectedFile.magicBytes}</span>
                                            <span className="text-gray-400 ml-4">
                                                {selectedFile.magicBytes.startsWith('4D 5A') ? 'MZ.....' : 
                                                 selectedFile.magicBytes.startsWith('25 50') ? '%PDF...' : 
                                                 '.......'}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-gray-500">...</div>
                                    </div>
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800">
                                        <strong>Quick Reference:</strong><br/>
                                        • <code>4D 5A</code> = Executable (.exe, .dll)<br/>
                                        • <code>25 50 44 46</code> = PDF Document<br/>
                                        • <code>FF D8 FF</code> = JPEG Image
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 mt-20">
                                    <i className="fas fa-arrow-left mb-2"></i><br/>
                                    Select a file in Explorer first.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TOOL: HASH CALCULATOR */}
                {activeTool === 'hash' && (
                    <div className="flex flex-col h-full animate-fadeIn">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-800">Crypto Hash</h3>
                        </div>
                        <div className="flex-grow p-6">
                            {selectedFile ? (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target File</label>
                                        <div className="p-3 bg-gray-100 rounded border border-gray-200 font-mono text-sm">{selectedFile.name}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SHA-256 Hash</label>
                                        <div className="p-3 bg-white rounded border border-gray-300 font-mono text-xs break-all shadow-sm">
                                            {selectedFile.hash}
                                        </div>
                                    </div>
                                    
                                    {/* Auto-Compare Logic Visualization */}
                                    <div className="mt-8">
                                        <h4 className="font-bold text-gray-700 mb-2">Threat Intel Match</h4>
                                        {IOC_DATABASE.find(ioc => ioc.hash === selectedFile.hash) ? (
                                            <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-3">
                                                <i className="fas fa-biohazard text-2xl"></i>
                                                <div>
                                                    <div className="font-bold">MALICIOUS MATCH FOUND</div>
                                                    <div className="text-xs">Signature: {IOC_DATABASE.find(ioc => ioc.hash === selectedFile.hash)?.label}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-3">
                                                <i className="fas fa-check-circle text-2xl"></i>
                                                <div>
                                                    <div className="font-bold">No Known Matches</div>
                                                    <div className="text-xs">Hash not found in current IOC database.</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 mt-20">Select a file to hash.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* TOOL: STRINGS */}
                {activeTool === 'strings' && (
                    <div className="flex flex-col h-full animate-fadeIn">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-gray-800">Strings Extraction</h3>
                        </div>
                        <div className="flex-grow p-6">
                            {selectedFile ? (
                                <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-xs h-full overflow-y-auto">
                                    <div className="mb-2 text-gray-500 border-b border-gray-700 pb-1">$ strings {selectedFile.name} | head -n 10</div>
                                    <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
                                </div>
                            ) : (
                                <div className="text-center text-gray-400 mt-20">Select a file to analyze.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Selection Footer */}
                {selectedFile && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center shadow-lg z-20">
                        <div className="flex items-center gap-2">
                            <i className="fas fa-file text-gray-400"></i>
                            <span className="font-bold text-gray-700">{selectedFile.name}</span>
                        </div>
                        <button 
                            onClick={handleAddToEvidence}
                            disabled={evidenceBag.some(e => e.name === selectedFile.name)}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
                        >
                            {evidenceBag.some(e => e.name === selectedFile.name) ? 'In Evidence Bag' : 'Add to Evidence'}
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT: Evidence Bag & Report */}
        <div className="lg:w-1/5 flex flex-col h-full min-h-[500px]">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col h-full overflow-hidden">
                <div className="p-4 bg-gray-800 text-white">
                    <h3 className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                        <i className="fas fa-briefcase"></i> Evidence Bag
                    </h3>
                </div>
                
                <div className="flex-grow p-4 bg-gray-50 overflow-y-auto space-y-3">
                    {evidenceBag.length === 0 && (
                        <div className="text-center text-gray-400 text-sm mt-10 italic">
                            No evidence collected.
                        </div>
                    )}
                    {evidenceBag.map(file => (
                        <div key={file.name} className="bg-white p-3 rounded shadow-sm border border-gray-200 relative group">
                            <button 
                                onClick={() => handleRemoveEvidence(file.name)}
                                className="absolute top-1 right-1 text-gray-300 hover:text-red-500 p-1"
                            >
                                <i className="fas fa-times-circle"></i>
                            </button>
                            <div className="font-bold text-sm text-gray-800 truncate pr-4">{file.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{file.path}</div>
                            <div className="mt-2 text-xs font-bold text-blue-600 uppercase bg-blue-50 inline-block px-1 rounded">
                                {file.threatType || 'Suspect'}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-white border-t border-gray-200">
                    <button 
                        onClick={handleSubmit}
                        disabled={evidenceBag.length === 0}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg shadow-md transition-all hover:-translate-y-0.5"
                    >
                        Submit Case Report
                    </button>
                </div>
            </div>
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
                        {success ? 'Case Solved' : 'Investigation Failed'}
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
                            Continue Investigation
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default DigitalForensicsPBQ;
