
import React, { useState } from 'react';

interface SecureNetworkArchitecturePBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface ComponentItem {
  id: string;
  label: string;
  icon: string;
  desc: string;
  category: 'protection' | 'monitoring' | 'access' | 'isolation';
}

interface Slot {
  id: string;
  label: string;
  zone: 'Perimeter' | 'DMZ' | 'Internal' | 'HighSec';
  correctItems: string[];
  currentItemId: string | null;
}

const COMPONENTS: ComponentItem[] = [
  { id: 'firewall_edge', label: 'Edge Firewall', icon: 'fa-brick', desc: 'First line of defense. Filters ingress/egress traffic.', category: 'protection' },
  { id: 'waf', label: 'WAF', icon: 'fa-filter', desc: 'Web Application Firewall. Protects against L7 attacks (SQLi, XSS).', category: 'protection' },
  { id: 'bastion', label: 'Bastion Host', icon: 'fa-terminal', desc: 'Jump Box. Single point of entry for administration.', category: 'access' },
  { id: 'firewall_int', label: 'Internal Firewall', icon: 'fa-columns', desc: 'Segments DMZ from Internal Trust zone.', category: 'protection' },
  { id: 'nips', label: 'NIPS/NIDS', icon: 'fa-eye', desc: 'Network Intrusion Prevention System. Inspects packets for threats.', category: 'monitoring' },
  { id: 'proxy', label: 'Forward Proxy', icon: 'fa-random', desc: 'Filters internal user outbound web traffic.', category: 'protection' },
  { id: 'airgap', label: 'Air-Gapped Backup', icon: 'fa-hdd', desc: 'Offline storage physically isolated from the network.', category: 'isolation' },
  { id: 'honeypot', label: 'Honeypot', icon: 'fa-flask', desc: 'Decoy system to distract and study attackers.', category: 'monitoring' }
];

const INITIAL_SLOTS: Slot[] = [
  { id: 'slot_perimeter', label: 'Perimeter Boundary', zone: 'Perimeter', correctItems: ['firewall_edge'], currentItemId: null },
  { id: 'slot_dmz_web', label: 'Web Svr Protection', zone: 'DMZ', correctItems: ['waf'], currentItemId: null },
  { id: 'slot_dmz_mgmt', label: 'Secure Admin Access', zone: 'DMZ', correctItems: ['bastion'], currentItemId: null },
  { id: 'slot_segment', label: 'Zone Segmentation', zone: 'DMZ', correctItems: ['firewall_int'], currentItemId: null }, // Boundary between DMZ and Internal
  { id: 'slot_int_monitor', label: 'Traffic Inspection', zone: 'Internal', correctItems: ['nips'], currentItemId: null },
  { id: 'slot_int_user', label: 'User Web Filter', zone: 'Internal', correctItems: ['proxy'], currentItemId: null },
  { id: 'slot_secure', label: 'Disaster Recovery', zone: 'HighSec', correctItems: ['airgap'], currentItemId: null }
];

const SecureNetworkArchitecturePBQ: React.FC<SecureNetworkArchitecturePBQProps> = ({ onComplete, onExit }) => {
  const [slots, setSlots] = useState<Slot[]>(INITIAL_SLOTS);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleComponentSelect = (id: string) => {
    setSelectedComponent(id === selectedComponent ? null : id);
  };

  const handleSlotClick = (slotId: string) => {
    // If placing a new component
    if (selectedComponent) {
      // Check if component is already placed elsewhere, remove it if so
      const updatedSlots = slots.map(s => s.currentItemId === selectedComponent ? { ...s, currentItemId: null } : s);
      
      // Place in new slot
      setSlots(updatedSlots.map(s => s.id === slotId ? { ...s, currentItemId: selectedComponent } : s));
      setSelectedComponent(null);
    } 
    // If clicking an occupied slot without selection, remove the item
    else {
      setSlots(slots.map(s => s.id === slotId ? { ...s, currentItemId: null } : s));
    }
  };

  const isPlaced = (id: string) => slots.some(s => s.currentItemId === id);

  const handleSubmit = () => {
    const errors: string[] = [];
    let correctCount = 0;

    slots.forEach(slot => {
        const item = slot.currentItemId;
        if (item && slot.correctItems.includes(item)) {
            correctCount++;
        } else {
            if (!item) {
                errors.push(`Missing component in ${slot.label}.`);
            } else {
                const compName = COMPONENTS.find(c => c.id === item)?.label;
                
                // Specific Feedback
                if (slot.id === 'slot_perimeter' && item !== 'firewall_edge') errors.push("Perimeter: Use an Edge Firewall to filter internet traffic first.");
                else if (slot.id === 'slot_dmz_web' && item !== 'waf') errors.push("DMZ Web: A WAF is best suited to protect web apps from Layer 7 attacks.");
                else if (slot.id === 'slot_dmz_mgmt' && item !== 'bastion') errors.push("DMZ Admin: Use a Bastion Host (Jump Box) for secure remote management.");
                else if (slot.id === 'slot_segment' && item !== 'firewall_int') errors.push("Segmentation: You need an Internal Firewall to separate the DMZ from the LAN.");
                else if (slot.id === 'slot_int_monitor' && item !== 'nips') errors.push("Internal: NIPS/NIDS is best for inspecting internal traffic patterns.");
                else if (slot.id === 'slot_int_user' && item !== 'proxy') errors.push("Internal User: A Forward Proxy filters outbound user web traffic.");
                else if (slot.id === 'slot_secure' && item !== 'airgap') errors.push("High Security: Only an Air-Gapped backup ensures protection against ransomware propagation.");
                else errors.push(`${slot.label}: Incorrect component placed.`);
            }
        }
    });

    if (correctCount === slots.length) {
        setSuccess(true);
        setFeedback("Architecture Validated! \n\nYou have successfully designed a Defense-in-Depth network:\n• Edge/Internal Firewalls create zones.\n• WAF protects applications.\n• Bastion secures management.\n• NIPS monitors traffic.\n• Air-Gapping protects backups.");
        onComplete(100);
    } else {
        setSuccess(false);
        setFeedback(`Design Flaws Detected (${correctCount}/${slots.length} Correct).\n\n` + errors.slice(0, 4).map(e => "• " + e).join("\n"));
    }
  };

  const getSlotItem = (slotId: string) => {
      const slot = slots.find(s => s.id === slotId);
      if (slot?.currentItemId) {
          return COMPONENTS.find(c => c.id === slot.currentItemId);
      }
      return null;
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm"><i className="fas fa-sitemap"></i></div>
            <div><h2 className="text-xl font-bold text-gray-900">Secure Network Architecture</h2><p className="text-xs text-gray-500">Security+ PBQ Simulation</p></div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full"><i className="fas fa-times text-2xl"></i></button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6">
        
        {/* Left: Component Toolbox */}
        <div className="lg:w-1/4 flex flex-col gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><i className="fas fa-box-open text-indigo-500"></i> Security Appliances</h3>
                <div className="space-y-3">
                    {COMPONENTS.map(comp => (
                        <button
                            key={comp.id}
                            onClick={() => handleComponentSelect(comp.id)}
                            disabled={isPlaced(comp.id)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 relative overflow-hidden group
                                ${isPlaced(comp.id) 
                                    ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed' 
                                    : selectedComponent === comp.id
                                        ? 'bg-indigo-50 border-indigo-500 shadow-md ring-1 ring-indigo-400'
                                        : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                                }
                            `}
                        >
                            <div className={`w-8 h-8 rounded flex items-center justify-center text-white ${comp.category === 'protection' ? 'bg-red-500' : comp.category === 'access' ? 'bg-blue-500' : comp.category === 'isolation' ? 'bg-gray-700' : 'bg-green-500'}`}>
                                <i className={`fas ${comp.icon}`}></i>
                            </div>
                            <div className="flex-grow">
                                <div className="font-bold text-sm text-gray-800">{comp.label}</div>
                                <div className="text-[10px] text-gray-500 leading-tight">{comp.desc}</div>
                            </div>
                            {isPlaced(comp.id) && <i className="fas fa-check absolute right-3 top-3 text-green-500"></i>}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Right: Architecture Canvas */}
        <div className="lg:w-3/4">
             <div className="bg-slate-50 p-6 rounded-xl shadow-inner border border-gray-300 min-h-[600px] relative overflow-hidden">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                
                {/* 1. INTERNET */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                    <i className="fas fa-globe text-4xl text-blue-400"></i>
                    <span className="text-xs font-bold text-blue-500 uppercase mt-1">Internet</span>
                </div>
                
                {/* Line: Internet -> Perimeter */}
                <div className="absolute top-16 left-1/2 h-12 w-0.5 bg-gray-400"></div>

                {/* SLOT: PERIMETER */}
                <div className="absolute top-28 left-1/2 -translate-x-1/2 w-48 z-20">
                    <SlotBox 
                        slot={slots.find(s => s.id === 'slot_perimeter')!} 
                        item={getSlotItem('slot_perimeter')} 
                        isActive={selectedComponent !== null}
                        onClick={() => handleSlotClick('slot_perimeter')}
                    />
                </div>

                {/* DMZ CONTAINER */}
                <div className="absolute top-52 left-10 right-10 h-48 border-2 border-dashed border-orange-300 rounded-xl bg-orange-50/30 flex justify-around items-center px-4">
                    <div className="absolute -top-3 left-4 bg-orange-100 text-orange-800 text-xs font-bold px-2 rounded">DMZ (Demilitarized Zone)</div>
                    
                    {/* Line: Perimeter -> DMZ Items */}
                    <div className="absolute -top-10 left-1/2 h-10 w-0.5 bg-gray-400"></div>
                    <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-gray-400"></div>
                    <div className="absolute top-0 left-1/4 h-8 w-0.5 bg-gray-400"></div>
                    <div className="absolute top-0 right-1/4 h-8 w-0.5 bg-gray-400"></div>


                    {/* Slot: WAF */}
                    <div className="flex flex-col items-center gap-2">
                        <SlotBox 
                            slot={slots.find(s => s.id === 'slot_dmz_web')!} 
                            item={getSlotItem('slot_dmz_web')} 
                            isActive={selectedComponent !== null}
                            onClick={() => handleSlotClick('slot_dmz_web')}
                        />
                        <div className="bg-white p-2 rounded shadow-sm border border-gray-200 text-center w-32">
                            <i className="fas fa-server text-gray-400"></i>
                            <div className="text-[10px] font-bold text-gray-600">Public Web Server</div>
                        </div>
                    </div>

                    {/* Slot: Bastion */}
                    <div className="flex flex-col items-center gap-2">
                        <SlotBox 
                            slot={slots.find(s => s.id === 'slot_dmz_mgmt')!} 
                            item={getSlotItem('slot_dmz_mgmt')} 
                            isActive={selectedComponent !== null}
                            onClick={() => handleSlotClick('slot_dmz_mgmt')}
                        />
                         <div className="text-[10px] font-bold text-gray-400 mt-1">Mgmt Access</div>
                    </div>
                </div>

                {/* SLOT: SEGMENTATION */}
                <div className="absolute top-[400px] left-1/2 -translate-x-1/2 w-48 z-20">
                     {/* Lines connecting DMZ to Firewall */}
                     <div className="absolute -top-12 left-1/2 h-12 w-0.5 bg-gray-400"></div>

                    <SlotBox 
                        slot={slots.find(s => s.id === 'slot_segment')!} 
                        item={getSlotItem('slot_segment')} 
                        isActive={selectedComponent !== null}
                        onClick={() => handleSlotClick('slot_segment')}
                    />
                </div>

                {/* INTERNAL CONTAINER */}
                <div className="absolute top-[480px] left-4 right-4 bottom-4 border-2 border-dashed border-green-300 rounded-xl bg-green-50/30 p-4">
                     <div className="absolute -top-3 left-4 bg-green-100 text-green-800 text-xs font-bold px-2 rounded">Internal LAN (Trusted)</div>
                     
                     {/* Line: FW -> Internal */}
                     <div className="absolute -top-6 left-1/2 h-6 w-0.5 bg-gray-400"></div>
                     <div className="absolute top-0 left-1/2 h-8 w-0.5 bg-gray-400"></div>
                     
                     {/* Internal Bus */}
                     <div className="absolute top-8 left-10 right-10 h-1 bg-gray-400 rounded"></div>

                     <div className="mt-12 grid grid-cols-3 gap-4">
                         {/* NIPS */}
                         <div className="flex flex-col items-center relative">
                            <div className="absolute -top-5 w-0.5 h-5 bg-gray-400"></div>
                            <SlotBox 
                                slot={slots.find(s => s.id === 'slot_int_monitor')!} 
                                item={getSlotItem('slot_int_monitor')} 
                                isActive={selectedComponent !== null}
                                onClick={() => handleSlotClick('slot_int_monitor')}
                            />
                            <div className="mt-2 text-center text-xs text-gray-500 font-mono">Core Switch Mirror</div>
                         </div>

                         {/* Proxy */}
                         <div className="flex flex-col items-center relative">
                            <div className="absolute -top-5 w-0.5 h-5 bg-gray-400"></div>
                            <SlotBox 
                                slot={slots.find(s => s.id === 'slot_int_user')!} 
                                item={getSlotItem('slot_int_user')} 
                                isActive={selectedComponent !== null}
                                onClick={() => handleSlotClick('slot_int_user')}
                            />
                             <div className="mt-2 flex gap-2">
                                <i className="fas fa-laptop text-gray-600"></i>
                                <i className="fas fa-laptop text-gray-600"></i>
                             </div>
                             <div className="text-[10px] text-gray-500 font-bold">Workstations</div>
                         </div>

                         {/* Secure Zone / AirGap */}
                         <div className="flex flex-col items-center relative p-2 border-2 border-dotted border-red-300 rounded bg-red-50/50">
                            <div className="text-[10px] text-red-800 font-bold mb-2 uppercase">Secure Zone</div>
                            <SlotBox 
                                slot={slots.find(s => s.id === 'slot_secure')!} 
                                item={getSlotItem('slot_secure')} 
                                isActive={selectedComponent !== null}
                                onClick={() => handleSlotClick('slot_secure')}
                            />
                            <div className="text-[10px] text-red-500 font-bold mt-1 text-center w-full">
                                No physical connection
                            </div>
                         </div>
                     </div>
                </div>

             </div>

             <div className="mt-4 flex justify-end">
                <button 
                    onClick={handleSubmit} 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                    <i className="fas fa-check-circle"></i> Validate Architecture
                </button>
             </div>
        </div>
      </div>

       {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fas ${success ? 'fa-shield-check' : 'fa-exclamation-circle'} text-3xl`}></i>
                    </div>
                    <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                        {success ? 'Architecture Secured' : 'Vulnerabilities Found'}
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
                            Adjust Design
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

// Subcomponent for Slot
const SlotBox: React.FC<{ slot: Slot, item?: ComponentItem | null, isActive: boolean, onClick: () => void }> = ({ slot, item, isActive, onClick }) => (
    <div 
        onClick={onClick}
        className={`
            relative w-full h-16 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all
            ${item 
                ? 'bg-white border-indigo-600 shadow-md' 
                : isActive 
                    ? 'bg-indigo-50/50 border-indigo-300 border-dashed animate-pulse hover:bg-indigo-100' 
                    : 'bg-white/50 border-gray-300 border-dashed hover:border-gray-400'
            }
        `}
    >
        {item ? (
            <div className="flex items-center gap-3 px-3 w-full">
                 <div className={`w-8 h-8 rounded flex-shrink-0 flex items-center justify-center text-white ${item.category === 'protection' ? 'bg-red-500' : item.category === 'access' ? 'bg-blue-500' : item.category === 'isolation' ? 'bg-gray-700' : 'bg-green-500'}`}>
                    <i className={`fas ${item.icon}`}></i>
                </div>
                <div className="flex-grow min-w-0">
                     <div className="text-xs font-bold text-gray-800 truncate">{item.label}</div>
                </div>
                 <i className="fas fa-times-circle text-gray-300 hover:text-red-500 transition-colors"></i>
            </div>
        ) : (
            <div className="text-center">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{slot.label}</div>
                {isActive && <div className="text-[9px] text-indigo-500 font-bold mt-1">Click to Place</div>}
            </div>
        )}
    </div>
);

export default SecureNetworkArchitecturePBQ;
