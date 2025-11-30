
import React, { useState } from 'react';

interface NetworkLabelingPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface ComponentItem {
  id: string;
  label: string;
  icon: string;
  category: 'network' | 'security' | 'endpoint';
  desc: string;
}

interface DropSlot {
  id: string;
  label: string;
  correctIds: string[];
  currentId: string | null;
}

const INVENTORY: ComponentItem[] = [
  { id: 'router', label: 'Edge Router', icon: 'fa-route', category: 'network', desc: 'Routes traffic between networks (Internet/Corp).' },
  { id: 'firewall', label: 'Next-Gen Firewall', icon: 'fa-shield-alt', category: 'security', desc: 'Filters traffic based on ACLs and state.' },
  { id: 'switch', label: 'Core Switch', icon: 'fa-sitemap', category: 'network', desc: 'Connects internal devices on the LAN.' },
  { id: 'wap', label: 'Wireless AP', icon: 'fa-wifi', category: 'network', desc: 'Provides Wi-Fi access to employees.' },
  { id: 'waf', label: 'WAF', icon: 'fa-filter', category: 'security', desc: 'Protects web apps from Layer 7 attacks.' },
  { id: 'web_svr', label: 'Web Server', icon: 'fa-server', category: 'endpoint', desc: 'Public-facing HTTP/HTTPS server.' },
  { id: 'db_svr', label: 'Database Server', icon: 'fa-database', category: 'endpoint', desc: 'Stores sensitive backend data.' },
  { id: 'ups', label: 'UPS', icon: 'fa-battery-full', category: 'network', desc: 'Uninterruptible Power Supply (Distractor).' }, // Distractor
];

const INITIAL_SLOTS: DropSlot[] = [
  { id: 'slot_edge', label: 'Internet Gateway', correctIds: ['router'], currentId: null },
  { id: 'slot_perimeter', label: 'Perimeter Defense', correctIds: ['firewall'], currentId: null },
  { id: 'slot_dmz_sec', label: 'App Protection', correctIds: ['waf'], currentId: null },
  { id: 'slot_dmz_svr', label: 'Public Service', correctIds: ['web_svr'], currentId: null },
  { id: 'slot_core', label: 'LAN Backbone', correctIds: ['switch'], currentId: null },
  { id: 'slot_wifi', label: 'Mobility', correctIds: ['wap'], currentId: null },
  { id: 'slot_data', label: 'Secure Storage', correctIds: ['db_svr'], currentId: null },
];

const NetworkLabelingPBQ: React.FC<NetworkLabelingPBQProps> = ({ onComplete, onExit }) => {
  const [slots, setSlots] = useState<DropSlot[]>(INITIAL_SLOTS);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSelect = (id: string) => {
    setSelectedItem(id === selectedItem ? null : id);
  };

  const handleSlotClick = (slotId: string) => {
    if (selectedItem) {
        // Place item
        // First remove item if it's already somewhere else
        const cleanedSlots = slots.map(s => s.currentId === selectedItem ? { ...s, currentId: null } : s);
        
        // Then place in new slot
        setSlots(cleanedSlots.map(s => s.id === slotId ? { ...s, currentId: selectedItem } : s));
        setSelectedItem(null);
    } else {
        // Clear slot if clicked without selection
        setSlots(slots.map(s => s.id === slotId ? { ...s, currentId: null } : s));
    }
  };

  const isPlaced = (id: string) => slots.some(s => s.currentId === id);

  const handleSubmit = () => {
    let correctCount = 0;
    const errors: string[] = [];

    slots.forEach(slot => {
        if (slot.currentId && slot.correctIds.includes(slot.currentId)) {
            correctCount++;
        } else {
            if (!slot.currentId) {
                errors.push(`${slot.label}: Empty slot.`);
            } else {
                const item = INVENTORY.find(i => i.id === slot.currentId);
                // Specific feedback
                if (slot.id === 'slot_edge' && item?.id !== 'router') errors.push("Edge: Routers are needed to connect to the ISP/Internet.");
                else if (slot.id === 'slot_perimeter' && item?.id !== 'firewall') errors.push("Perimeter: A Firewall is the primary defense against external threats.");
                else if (slot.id === 'slot_dmz_sec' && item?.id !== 'waf') errors.push("DMZ Security: A WAF specifically protects web apps.");
                else if (slot.id === 'slot_core' && item?.id !== 'switch') errors.push("Core: Switches connect internal devices.");
                else if (slot.id === 'slot_data' && item?.id !== 'db_svr') errors.push("Data: Databases belong in the most secure zone (Internal).");
                else errors.push(`${slot.label}: Incorrect device placed.`);
            }
        }
    });

    if (correctCount === slots.length) {
        setSuccess(true);
        setFeedback("Topology Validated!\n\n• **Edge Router** handles connectivity.\n• **Firewall** enforces ACLs.\n• **WAF** protects the **Web Server** in the DMZ.\n• **Core Switch** manages the LAN.\n• **Database** is secured internally.");
        onComplete(100);
    } else {
        setSuccess(false);
        setFeedback(`Configuration Incomplete (${correctCount}/${slots.length}).\n\n` + errors.slice(0, 3).map(e => "• " + e).join("\n"));
    }
  };

  const getSlotContent = (slotId: string) => {
      const slot = slots.find(s => s.id === slotId);
      if (slot?.currentId) {
          return INVENTORY.find(i => i.id === slot.currentId);
      }
      return null;
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto font-sans text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-project-diagram"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Network Topology Labeling</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">
        
        {/* LEFT: Inventory */}
        <div className="lg:w-1/4 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-server text-blue-600"></i> Device Inventory
                </h3>
                <p className="text-xs text-gray-500 mb-4">Select a device to place it on the topology map.</p>
                
                <div className="space-y-3">
                    {INVENTORY.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleSelect(item.id)}
                            disabled={isPlaced(item.id)}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 group relative overflow-hidden
                                ${isPlaced(item.id) 
                                    ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed' 
                                    : selectedItem === item.id 
                                        ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-400' 
                                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                }
                            `}
                        >
                            <div className={`w-10 h-10 rounded flex items-center justify-center text-lg shadow-sm
                                ${item.category === 'security' ? 'bg-red-100 text-red-600' : item.category === 'network' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}
                            `}>
                                <i className={`fas ${item.icon}`}></i>
                            </div>
                            <div>
                                <div className="font-bold text-sm text-gray-800">{item.label}</div>
                                <div className="text-[10px] text-gray-500 leading-tight">{item.desc}</div>
                            </div>
                            {isPlaced(item.id) && <i className="fas fa-check absolute right-3 text-green-500"></i>}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 text-sm mb-2"><i className="fas fa-info-circle"></i> Instructions</h4>
                <p className="text-xs text-blue-800 leading-relaxed">
                    Drag and drop (or click to select/place) the correct networking and security appliances into the appropriate zones to secure the enterprise network.
                </p>
            </div>
        </div>

        {/* RIGHT: Diagram */}
        <div className="lg:w-3/4">
            <div className="bg-slate-50 p-8 rounded-xl shadow-inner border border-gray-300 min-h-[700px] relative flex flex-col items-center">
                {/* Background Lines (SVG) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                    {/* Main Backbone Line */}
                    <line x1="50%" y1="10%" x2="50%" y2="85%" stroke="#cbd5e1" strokeWidth="4" />
                    
                    {/* DMZ Branch */}
                    <line x1="50%" y1="35%" x2="80%" y2="35%" stroke="#cbd5e1" strokeWidth="4" />
                    <line x1="80%" y1="35%" x2="80%" y2="50%" stroke="#cbd5e1" strokeWidth="4" />
                    
                    {/* WiFi Branch */}
                    <line x1="50%" y1="65%" x2="20%" y2="65%" stroke="#cbd5e1" strokeWidth="4" />
                    <line x1="20%" y1="65%" x2="20%" y2="75%" stroke="#cbd5e1" strokeWidth="4" />
                </svg>

                {/* 1. INTERNET */}
                <div className="z-10 flex flex-col items-center mb-8">
                    <i className="fas fa-globe text-4xl text-blue-300"></i>
                    <span className="text-xs font-bold text-blue-400 mt-1 uppercase tracking-widest">Internet</span>
                </div>

                {/* SLOT: Edge Router */}
                <div className="z-10 mb-8">
                    <SlotBox 
                        slot={slots.find(s => s.id === 'slot_edge')!} 
                        item={getSlotContent('slot_edge')} 
                        isActive={selectedItem !== null} 
                        onClick={() => handleSlotClick('slot_edge')} 
                    />
                </div>

                {/* SLOT: Perimeter Firewall */}
                <div className="z-10 mb-8">
                    <SlotBox 
                        slot={slots.find(s => s.id === 'slot_perimeter')!} 
                        item={getSlotContent('slot_perimeter')} 
                        isActive={selectedItem !== null} 
                        onClick={() => handleSlotClick('slot_perimeter')} 
                    />
                </div>

                {/* DMZ & INTERNAL SPLIT */}
                <div className="w-full flex justify-between px-10 relative z-10">
                    
                    {/* DMZ AREA (Right Side) */}
                    <div className="absolute right-10 top-0 flex flex-col items-center gap-6">
                        <div className="bg-orange-50 border-2 border-dashed border-orange-200 p-4 rounded-xl flex flex-col items-center gap-4">
                            <span className="text-xs font-bold text-orange-600 uppercase bg-orange-100 px-2 py-1 rounded">Screened Subnet (DMZ)</span>
                            
                            <SlotBox 
                                slot={slots.find(s => s.id === 'slot_dmz_sec')!} 
                                item={getSlotContent('slot_dmz_sec')} 
                                isActive={selectedItem !== null} 
                                onClick={() => handleSlotClick('slot_dmz_sec')} 
                            />
                            
                            <i className="fas fa-arrow-down text-orange-200"></i>
                            
                            <SlotBox 
                                slot={slots.find(s => s.id === 'slot_dmz_svr')!} 
                                item={getSlotContent('slot_dmz_svr')} 
                                isActive={selectedItem !== null} 
                                onClick={() => handleSlotClick('slot_dmz_svr')} 
                            />
                        </div>
                    </div>
                </div>

                {/* SLOT: Core Switch (Center) */}
                <div className="z-10 mt-24 mb-12">
                    <SlotBox 
                        slot={slots.find(s => s.id === 'slot_core')!} 
                        item={getSlotContent('slot_core')} 
                        isActive={selectedItem !== null} 
                        onClick={() => handleSlotClick('slot_core')} 
                    />
                </div>

                {/* INTERNAL LEAVES */}
                <div className="w-full flex justify-center gap-32 relative z-10">
                    
                    {/* WiFi */}
                    <div className="flex flex-col items-center">
                        <SlotBox 
                            slot={slots.find(s => s.id === 'slot_wifi')!} 
                            item={getSlotContent('slot_wifi')} 
                            isActive={selectedItem !== null} 
                            onClick={() => handleSlotClick('slot_wifi')} 
                        />
                        <div className="mt-2 text-xs font-bold text-gray-400">Office Wi-Fi</div>
                    </div>

                    {/* Data */}
                    <div className="flex flex-col items-center">
                        <SlotBox 
                            slot={slots.find(s => s.id === 'slot_data')!} 
                            item={getSlotContent('slot_data')} 
                            isActive={selectedItem !== null} 
                            onClick={() => handleSlotClick('slot_data')} 
                        />
                        <div className="mt-2 text-xs font-bold text-gray-400">Secure Data Center</div>
                    </div>
                </div>

            </div>

            <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleSubmit} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                    <i className="fas fa-check-circle"></i> Validate Topology
                </button>
            </div>
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm">
             <div className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 text-center animate-scaleIn">
                 <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${success ? 'fa-check' : 'fa-times'} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-800">{success ? 'Network Secured' : 'Configuration Incorrect'}</h3>
                <div className={`text-sm whitespace-pre-line mb-6 p-4 rounded-xl border text-left leading-relaxed ${success ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    {feedback}
                </div>
                <button onClick={() => success ? onExit() : setFeedback(null)} className={`w-full font-bold py-3 rounded-xl transition-colors shadow-md text-white ${success ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'}`}>
                    {success ? 'Return to Dashboard' : 'Try Again'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

// Reusable Slot Component
const SlotBox: React.FC<{ slot: DropSlot, item?: ComponentItem | null, isActive: boolean, onClick: () => void }> = ({ slot, item, isActive, onClick }) => (
    <div 
        onClick={onClick}
        className={`
            w-48 h-16 bg-white rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all relative
            ${item 
                ? 'border-blue-500 shadow-md' 
                : isActive 
                    ? 'border-blue-300 border-dashed animate-pulse bg-blue-50' 
                    : 'border-gray-300 border-dashed hover:border-gray-400'
            }
        `}
    >
        {item ? (
            <div className="flex items-center gap-3 w-full px-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-sm
                    ${item.category === 'security' ? 'bg-red-500' : item.category === 'network' ? 'bg-blue-500' : 'bg-purple-500'}
                `}>
                    <i className={`fas ${item.icon}`}></i>
                </div>
                <span className="text-xs font-bold text-gray-800">{item.label}</span>
                <i className="fas fa-times-circle absolute -top-2 -right-2 text-red-500 bg-white rounded-full"></i>
            </div>
        ) : (
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{slot.label}</span>
        )}
    </div>
);

export default NetworkLabelingPBQ;
