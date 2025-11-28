
import React, { useState, useEffect } from 'react';

interface IncidentResponsePBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface Phase {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// The correct order: Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned
const CORRECT_ORDER = ['prep', 'ident', 'cont', 'erad', 'recov', 'll'];

const PHASES: Phase[] = [
  { id: 'ident', name: 'Identification', description: 'Detecting and determining the scope of the incident.', icon: 'fa-search', color: 'bg-yellow-500' },
  { id: 'll', name: 'Lessons Learned', description: 'Post-incident analysis to improve future response.', icon: 'fa-book-reader', color: 'bg-purple-600' },
  { id: 'erad', name: 'Eradication', description: 'Removing the root cause (e.g., malware, compromised accounts).', icon: 'fa-trash-alt', color: 'bg-red-600' },
  { id: 'prep', name: 'Preparation', description: 'Training, policy creation, and tool deployment before an event.', icon: 'fa-tools', color: 'bg-blue-600' },
  { id: 'recov', name: 'Recovery', description: 'Restoring systems to normal operation and monitoring.', icon: 'fa-recycle', color: 'bg-green-600' },
  { id: 'cont', name: 'Containment', description: 'Isolating systems to prevent the spread of the incident.', icon: 'fa-box', color: 'bg-orange-500' },
];

const IncidentResponsePBQ: React.FC<IncidentResponsePBQProps> = ({ onComplete, onExit }) => {
  // State
  const [availablePhases, setAvailablePhases] = useState<Phase[]>([]);
  const [slots, setSlots] = useState<(Phase | null)[]>([null, null, null, null, null, null]);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize scrambled phases
  useEffect(() => {
    reshuffle();
  }, []);

  const reshuffle = () => {
    // Fisher-Yates Shuffle
    const shuffled = [...PHASES];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setAvailablePhases(shuffled);
    setSlots([null, null, null, null, null, null]);
    setSelectedPhaseId(null);
    setFeedback(null);
    setSuccess(false);
  };

  const handlePhaseClick = (phaseId: string) => {
    if (selectedPhaseId === phaseId) {
      setSelectedPhaseId(null); // Deselect
    } else {
      setSelectedPhaseId(phaseId);
    }
  };

  const handleSlotClick = (index: number) => {
    // Scenario 1: Placing a selected phase into an empty slot
    if (selectedPhaseId && slots[index] === null) {
      const phase = availablePhases.find(p => p.id === selectedPhaseId);
      if (phase) {
        const newSlots = [...slots];
        newSlots[index] = phase;
        setSlots(newSlots);
        setAvailablePhases(prev => prev.filter(p => p.id !== selectedPhaseId));
        setSelectedPhaseId(null);
      }
    }
    // Scenario 2: Removing a phase from a slot (clicking it)
    else if (slots[index] !== null) {
      const phaseToRemove = slots[index];
      if (phaseToRemove) {
        const newSlots = [...slots];
        newSlots[index] = null;
        setSlots(newSlots);
        setAvailablePhases(prev => [...prev, phaseToRemove]);
        // Optional: auto-select the removed phase to move it quickly
        setSelectedPhaseId(phaseToRemove.id);
      }
    }
  };

  const handleSubmit = () => {
    // Check if all slots are filled
    if (slots.some(s => s === null)) {
      setFeedback("Please fill all timeline slots before submitting.");
      return;
    }

    // Check order
    let correctCount = 0;
    const errors: string[] = [];
    
    slots.forEach((phase, index) => {
      if (phase?.id === CORRECT_ORDER[index]) {
        correctCount++;
      } else {
        // Add specific feedback
        if (phase?.id === 'prep' && index !== 0) errors.push("Preparation must happen *before* an incident occurs.");
        if (phase?.id === 'll' && index !== 5) errors.push("Lessons Learned is always the *final* step.");
        if (phase?.id === 'cont' && index > 2) errors.push("Containment needs to happen early to stop the spread.");
      }
    });

    if (correctCount === 6) {
      setSuccess(true);
      setFeedback("Perfect! You have correctly identified the PICERL lifecycle order: \n\n1. Preparation\n2. Identification\n3. Containment\n4. Eradication\n5. Recovery\n6. Lessons Learned");
      onComplete(100);
    } else {
      setSuccess(false);
      const genericErrors = errors.length > 0 ? errors : ["The phases are not in the correct chronological order."];
      setFeedback(`Incorrect Order. You got ${correctCount}/6 correct.\n\nHints:\n` + genericErrors.slice(0, 3).map(e => "• " + e).join("\n"));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Incident Response Lifecycle</h2>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Phase Bank */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <i className="fas fa-layer-group text-blue-500"></i> Phase Bank
              </h3>
              <p className="text-sm text-gray-600 mb-6">Click a phase to select it, then click a numbered slot on the timeline to place it.</p>
              
              <div className="space-y-3">
                {availablePhases.length === 0 && (
                    <div className="p-8 text-center text-gray-400 italic border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
                        All phases placed.
                    </div>
                )}
                {availablePhases.map(phase => (
                  <button
                    key={phase.id}
                    onClick={() => handlePhaseClick(phase.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 group
                      ${selectedPhaseId === phase.id 
                        ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]' 
                        : 'border-gray-100 bg-white hover:border-blue-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${phase.color}`}>
                        <i className={`fas ${phase.icon}`}></i>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">{phase.name}</h4>
                        <p className="text-xs text-gray-500 leading-tight mt-1">{phase.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Timeline Slots */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 h-full flex flex-col min-h-[600px]">
                <div className="mb-10 text-center">
                    <h3 className="text-2xl font-bold text-gray-800">Build the Incident Response Timeline</h3>
                    <p className="text-gray-500 mt-1">Place the phases in the correct chronological order (Step 1 to 6).</p>
                </div>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-16 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute left-1/2 top-6 bottom-6 w-1.5 bg-gray-100 -translate-x-1/2 rounded-full z-0"></div>

                    {slots.map((slot, index) => (
                        <div key={index} className={`relative z-10 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12 md:translate-y-20'}`}>
                            
                            {/* Step Number Badge */}
                            <div className={`
                                absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-4 border-white shadow-md z-20
                                ${index % 2 === 0 ? 'right-0 md:-right-5 translate-x-1/2' : 'left-0 md:-left-5 -translate-x-1/2'}
                                ${slot ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                            `}>
                                {index + 1}
                            </div>

                            <button
                                onClick={() => handleSlotClick(index)}
                                className={`
                                    w-full p-4 rounded-xl border-2 border-dashed transition-all min-h-[110px] flex items-center justify-center relative group
                                    ${slot 
                                        ? 'bg-white border-solid border-gray-200 shadow-sm hover:border-red-300 hover:bg-red-50' 
                                        : selectedPhaseId 
                                            ? 'bg-blue-50/50 border-blue-400 animate-pulse cursor-pointer' 
                                            : 'bg-gray-50 border-gray-200'
                                    }
                                `}
                            >
                                {slot ? (
                                    <div className={`flex items-center gap-4 w-full ${index % 2 === 0 ? 'flex-row-reverse md:flex-row' : 'flex-row'}`}>
                                        <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-sm ${slot.color}`}>
                                            <i className={`fas ${slot.icon} text-lg`}></i>
                                        </div>
                                        <div className={`text-left ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} flex-grow`}>
                                            <h4 className="font-bold text-gray-800 text-lg">{slot.name}</h4>
                                            <p className="text-xs text-gray-500 leading-tight">{slot.description}</p>
                                        </div>
                                        
                                        {/* Remove Hint Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-[1px]">
                                            <span className="text-red-500 font-bold flex items-center gap-2">
                                                <i className="fas fa-times"></i> Remove
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-300 font-bold text-xl flex flex-col items-center">
                                        <span>Step</span>
                                        <span className="text-4xl opacity-20">{index + 1}</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-between items-center">
             <button 
                onClick={reshuffle} 
                className="text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-200 px-4 py-2 rounded transition-colors"
             >
                Reset Timeline
             </button>
             <button 
                onClick={handleSubmit} 
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-12 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
                <i className="fas fa-check-circle"></i> Validate Order
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
                        {success ? 'Timeline Correct!' : 'Sequence Error'}
                    </h3>
                </div>
                
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    <div className="whitespace-pre-line text-gray-700 text-base leading-relaxed">
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
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default IncidentResponsePBQ;
