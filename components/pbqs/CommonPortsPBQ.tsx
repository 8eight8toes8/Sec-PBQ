
import React, { useState, useEffect } from 'react';

interface CommonPortsPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  correctPort: number;
  isSecure: boolean;
  icon: string;
  colorClass: string;
}

const INITIAL_SERVICES: ServiceItem[] = [
  { id: 'ftp', name: 'FTP', description: 'File Transfer Protocol', correctPort: 21, isSecure: false, icon: 'fa-file-upload', colorClass: 'bg-orange-100 text-orange-600' },
  { id: 'ssh', name: 'SSH', description: 'Secure Shell', correctPort: 22, isSecure: true, icon: 'fa-terminal', colorClass: 'bg-gray-800 text-gray-200' },
  { id: 'telnet', name: 'Telnet', description: 'Remote Terminal (Legacy)', correctPort: 23, isSecure: false, icon: 'fa-network-wired', colorClass: 'bg-red-100 text-red-600' },
  { id: 'smtp', name: 'SMTP', description: 'Simple Mail Transfer', correctPort: 25, isSecure: false, icon: 'fa-envelope', colorClass: 'bg-blue-100 text-blue-600' },
  { id: 'dns', name: 'DNS', description: 'Domain Name System', correctPort: 53, isSecure: false, icon: 'fa-sitemap', colorClass: 'bg-purple-100 text-purple-600' },
  { id: 'http', name: 'HTTP', description: 'Hypertext Transfer Protocol', correctPort: 80, isSecure: false, icon: 'fa-globe', colorClass: 'bg-cyan-100 text-cyan-600' },
  { id: 'https', name: 'HTTPS', description: 'HTTP Secure', correctPort: 443, isSecure: true, icon: 'fa-lock', colorClass: 'bg-green-100 text-green-600' },
  { id: 'rdp', name: 'RDP', description: 'Remote Desktop Protocol', correctPort: 3389, isSecure: true, icon: 'fa-desktop', colorClass: 'bg-indigo-100 text-indigo-600' },
];

const PORTS_LIST = [21, 22, 23, 25, 53, 80, 443, 3389];

const CommonPortsPBQ: React.FC<CommonPortsPBQProps> = ({ onComplete, onExit }) => {
  const [availablePorts, setAvailablePorts] = useState<number[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [assignments, setAssignments] = useState<Record<string, number | null>>({});
  const [securityStatus, setSecurityStatus] = useState<Record<string, 'secure' | 'insecure' | null>>({});
  const [selectedPort, setSelectedPort] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Shuffle ports and services on mount
  useEffect(() => {
    // Shuffle Ports
    const shuffledPorts = [...PORTS_LIST];
    for (let i = shuffledPorts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledPorts[i], shuffledPorts[j]] = [shuffledPorts[j], shuffledPorts[i]];
    }
    setAvailablePorts(shuffledPorts);

    // Shuffle Services (so they aren't ordered by port number)
    const shuffledServices = [...INITIAL_SERVICES];
    for (let i = shuffledServices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledServices[i], shuffledServices[j]] = [shuffledServices[j], shuffledServices[i]];
    }
    setServices(shuffledServices);
  }, []);

  const handlePortSelect = (port: number) => {
    // If clicking the already selected port, deselect it
    if (selectedPort === port) {
      setSelectedPort(null);
    } else {
      setSelectedPort(port);
    }
  };

  const handleAssignPort = (serviceId: string) => {
    if (selectedPort !== null) {
      // Check if this port is already assigned elsewhere, if so, remove it from there
      const newAssignments = { ...assignments };
      Object.keys(newAssignments).forEach(key => {
        if (newAssignments[key] === selectedPort) {
          newAssignments[key] = null;
        }
      });
      
      newAssignments[serviceId] = selectedPort;
      setAssignments(newAssignments);
      setSelectedPort(null);
    } else if (assignments[serviceId]) {
      // If no port is selected but we click a filled slot, remove the assignment (put back to bank)
      setAssignments({ ...assignments, [serviceId]: null });
    }
  };

  const toggleSecurity = (serviceId: string, status: 'secure' | 'insecure') => {
    setSecurityStatus(prev => ({
      ...prev,
      [serviceId]: prev[serviceId] === status ? null : status
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const totalChecks = services.length * 2; // Port + Security Status
    const errors: string[] = [];

    services.forEach(service => {
      const assignedPort = assignments[service.id];
      const status = securityStatus[service.id];

      // Check Port
      if (assignedPort === service.correctPort) {
        correctCount++;
      } else {
        errors.push(`${service.name}: Incorrect port assigned.`);
      }

      // Check Security
      const correctStatus = service.isSecure ? 'secure' : 'insecure';
      if (status === correctStatus) {
        correctCount++;
      } else {
        errors.push(`${service.name}: Incorrect security classification.`);
      }
    });

    const score = Math.round((correctCount / totalChecks) * 100);

    if (score === 100) {
      setSuccess(true);
      setFeedback("Perfect! You have correctly identified all default ports and their security postures. This knowledge is critical for configuring firewall rules and establishing secure baselines.");
      onComplete(100);
    } else {
      setSuccess(false);
      setFeedback(`You scored ${score}%. \n\nIssues found:\n` + errors.slice(0, 5).map(e => "• " + e).join("\n") + (errors.length > 5 ? `\n...and ${errors.length - 5} more errors.` : ""));
    }
  };

  // Helper to check if a port is currently assigned to any service
  const isPortAssigned = (port: number) => {
    return Object.values(assignments).includes(port);
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-network-wired"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Identify Common Ports</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button 
          onClick={onExit} 
          className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all"
          title="Exit Lab"
        >
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Instructions & Port Bank */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2">Instructions</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                1. Select a port number from the <strong>Port Bank</strong>.
                <br/>
                2. Click the empty slot on the matching <strong>Service</strong>.
                <br/>
                3. Toggle whether the protocol is <strong>Secure</strong> or <strong>Insecure</strong>.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-server text-blue-500"></i> Port Bank
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {availablePorts.map(port => {
                  const assigned = isPortAssigned(port);
                  const isSelected = selectedPort === port;
                  return (
                    <button
                      key={port}
                      onClick={() => !assigned && handlePortSelect(port)}
                      disabled={assigned}
                      className={`
                        py-3 px-2 rounded-lg font-mono font-bold text-lg transition-all shadow-sm border-2
                        ${assigned 
                          ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed' 
                          : isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105 ring-2 ring-blue-300 ring-offset-2'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                        }
                      `}
                    >
                      {port}
                    </button>
                  );
                })}
              </div>
              {selectedPort && (
                 <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg text-center border border-blue-100 animate-pulse">
                    Port <strong>{selectedPort}</strong> selected.<br/>Click a service slot to assign.
                 </div>
              )}
            </div>
          </div>

          {/* Service List */}
          <div className="lg:col-span-3 space-y-4">
            {services.map(service => {
               const assignedPort = assignments[service.id];
               const status = securityStatus[service.id];
               
               return (
                 <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center gap-4 transition-colors hover:border-blue-300">
                    {/* Icon & Info */}
                    <div className="flex items-center gap-4 w-full md:w-1/3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${service.colorClass}`}>
                            <i className={`fas ${service.icon}`}></i>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-lg">{service.name}</h4>
                            <p className="text-xs text-gray-500">{service.description}</p>
                        </div>
                    </div>

                    {/* Port Slot */}
                    <div className="flex-grow flex justify-center w-full md:w-auto">
                        <button 
                            onClick={() => handleAssignPort(service.id)}
                            className={`
                                w-full md:w-40 h-12 rounded-lg border-2 border-dashed flex items-center justify-center font-mono font-bold text-xl transition-all
                                ${assignedPort 
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm border-solid' 
                                    : selectedPort 
                                        ? 'bg-blue-50/30 border-blue-400 text-blue-400 hover:bg-blue-100 cursor-pointer'
                                        : 'bg-gray-50 border-gray-300 text-gray-400'
                                }
                            `}
                        >
                            {assignedPort ? assignedPort : 'TCP/UDP'}
                        </button>
                    </div>

                    {/* Security Toggle */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                        <button 
                            onClick={() => toggleSecurity(service.id, 'insecure')}
                            className={`flex-1 md:w-24 py-2 px-3 rounded text-sm font-semibold transition-all ${status === 'insecure' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            Insecure
                        </button>
                        <button 
                            onClick={() => toggleSecurity(service.id, 'secure')}
                            className={`flex-1 md:w-24 py-2 px-3 rounded text-sm font-semibold transition-all ${status === 'secure' ? 'bg-green-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                            Secure
                        </button>
                    </div>
                 </div>
               );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-end">
            <button 
                onClick={handleSubmit} 
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-12 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
                <i className="fas fa-check-circle"></i> Validate Configuration
            </button>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fas ${success ? 'fa-shield-check' : 'fa-exclamation-circle'} text-3xl`}></i>
                    </div>
                    <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                        {success ? 'Configuration Correct!' : 'Configuration Errors'}
                    </h3>
                </div>
                
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    <div className="whitespace-pre-line text-gray-700 text-lg leading-relaxed">
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
                            Review & Fix
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CommonPortsPBQ;
