
import React, { useState } from 'react';

interface NetworkLabelingPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

type ItemType = 'device' | 'zone';

interface DraggableItem {
  id: string;
  label: string;
  icon: string;
  type: ItemType;
  color: string;
}

interface DropZone {
  id: string;
  label: string; // Display label for the slot (e.g., "Zone A", "Device 1")
  acceptedType: ItemType;
  currentUserId: string | null; // ID of the item currently placed here
  correctItemIds: string[]; // IDs of items that are considered correct for this slot
}

const ITEMS: DraggableItem[] = [
  // Zones
  { id: 'zone_internet', label: 'Internet / Untrusted', icon: 'fa-globe', type: 'zone', color: 'bg-gray-500' },
  { id: 'zone_dmz', label: 'DMZ', icon: 'fa-shield-alt', type: 'zone', color: 'bg-orange-500' },
  { id: 'zone_internal', label: 'Internal / Trusted', icon: 'fa-network-wired', type: 'zone', color: 'bg-green-600' },
  
  // Devices
  { id: 'dev_firewall_edge', label: 'Firewall', icon: 'fa-fire', type: 'device', color: 'bg-red-600' },
  { id: 'dev_firewall_int', label: 'Firewall', icon: 'fa-fire', type: 'device', color: 'bg-red-600' },
  { id: 'dev_router', label: 'Router', icon: 'fa-random', type: 'device', color: 'bg-blue-600' },
  { id: 'dev_switch', label: 'Switch', icon: 'fa-sitemap', type: 'device', color: 'bg-blue-500' },
  { id: 'dev_web_server', label: 'Web Server', icon: 'fa-server', type: 'device', color: 'bg-purple-600' },
  { id: 'dev_db_server', label: 'DB Server', icon: 'fa-database', type: 'device', color: 'bg-indigo-700' },
  { id: 'dev_waf', label: 'WAF', icon: 'fa-filter', type: 'device', color: 'bg-yellow-600' },
];

const INITIAL_ZONES: DropZone[] = [
  // Zones Containers
  { id: 'slot_zone_1', label: 'Zone 1 (Left)', acceptedType: 'zone', currentUserId: null, correctItemIds: ['zone_internet'] },
  { id: 'slot_zone_2', label: 'Zone 2 (Middle)', acceptedType: 'zone', currentUserId: null, correctItemIds: ['zone_dmz'] },
  { id: 'slot_zone_3', label: 'Zone 3 (Right)', acceptedType: 'zone', currentUserId: null, correctItemIds: ['zone_internal'] },

  // Device Slots
  // Flexible validation: Accept ANY firewall ID for firewall slots to avoid confusion
  { id: 'slot_dev_1', label: 'Boundary Device', acceptedType: 'device', currentUserId: null, correctItemIds: ['dev_firewall_edge', 'dev_firewall_int', 'dev_router'] },
  { id: 'slot_dev_2', label: 'Public Facing Svr', acceptedType: 'device', currentUserId: null, correctItemIds: ['dev_web_server'] },
  { id: 'slot_dev_3', label: 'App Protection', acceptedType: 'device', currentUserId: null, correctItemIds: ['dev_waf'] }, // Before web server
  { id: 'slot_dev_4', label: 'Internal Segmentation', acceptedType: 'device', currentUserId: null, correctItemIds: ['dev_firewall_int', 'dev_firewall_edge'] },
  { id: 'slot_dev_5', label: 'Backend Data', acceptedType: 'device', currentUserId: null, correctItemIds: ['dev_db_server'] },
];

const NetworkLabelingPBQ: React.FC<NetworkLabelingPBQProps> = ({ onComplete, onExit }) => {
  const [dropZones, setDropZones] = useState<DropZone[]>(INITIAL_ZONES);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleItemClick = (itemId: string) => {
    if (selectedItem === itemId) {
      setSelectedItem(null);
    } else {
      setSelectedItem(itemId);
    }
  };

  const handleZoneClick = (zoneId: string) => {
    const zone = dropZones.find(z => z.id === zoneId);

    // CASE 1: Placing a selected item
    if (selectedItem) {
      const item = ITEMS.find(i => i.id === selectedItem);

      if (zone && item) {
        if (zone.acceptedType !== item.type) {
          // Optionally show ephemeral error "Invalid type for this slot"
          return;
        }

        // Remove item from any other zone it might be in (move logic)
        const newZones = dropZones.map(z => {
          if (z.currentUserId === selectedItem) {
            return { ...z, currentUserId: null };
          }
          return z;
        });

        // Place in new zone
        const updatedZones = newZones.map(z => {
          if (z.id === zoneId) {
            return { ...z, currentUserId: selectedItem };
          }
          return z;
        });

        setDropZones(updatedZones);
        setSelectedItem(null);
      }
    } 
    // CASE 2: Picking up an item from the board
    else if (zone && zone.currentUserId) {
        setSelectedItem(zone.currentUserId);
        setDropZones(prev => prev.map(z => {
            if (z.id === zoneId) return { ...z, currentUserId: null };
            return z;
        }));
    }
  };

  const getPlacedItem = (zoneId: string) => {
    const zone = dropZones.find(z => z.id === zoneId);
    if (!zone || !zone.currentUserId) return null;
    return ITEMS.find(i => i.id === zone.currentUserId);
  };

  const isItemPlaced = (itemId: string) => {
    return dropZones.some(z => z.currentUserId === itemId);
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const errors: string[] = [];

    dropZones.forEach(zone => {
      if (zone.correctItemIds.includes(zone.currentUserId || '')) {
        correctCount++;
      } else {
        // Detailed error logic
        if (!zone.currentUserId) {
          errors.push(`${zone.label}: Missing component.`);
        } else {
           const item = ITEMS.find(i => i.id === zone.currentUserId);
           // Specific feedback based on common mistakes
           if (zone.id === 'slot_zone_1' && item?.id !== 'zone_internet') errors.push("Zone 1: The leftmost zone is typically the Internet/Untrusted zone.");
           if (zone.id === 'slot_zone_2' && item?.id !== 'zone_dmz') errors.push("Zone 2: The area between two firewalls (or exposed to public) is the DMZ.");
           if (zone.id === 'slot_zone_3' && item?.id !== 'zone_internal') errors.push("Zone 3: The most protected area is the Internal network.");
           
           if (zone.id === 'slot_dev_5' && item?.id === 'dev_web_server') errors.push("Placement Error: Web Servers should be in the DMZ, not the deep internal network.");
           if (zone.id === 'slot_dev_2' && item?.id === 'dev_db_server') errors.push("Placement Error: Database Servers contain sensitive data and should not be in the DMZ.");
           if (zone.id === 'slot_dev_3' && item?.id !== 'dev_waf') errors.push("App Protection: A WAF is best placed in front of the Web Server to filter traffic.");
        }
      }
    });

    if (correctCount === dropZones.length) {
      setSuccess(true);
      setFeedback("Excellent Architecture! You have correctly identified the zones and placed security controls.\n\n• The DMZ separates untrusted traffic from the internal network.\n• The WAF protects the Web Server from application attacks.\n• The Database is safely segregated in the Internal Trusted zone.");
      onComplete(100);
    } else {
      setSuccess(false);
      setFeedback(`Architecture Validation Failed.\n\nIssues:\n${errors.slice(0, 4).map(e => "• " + e).join("\n")}${errors.length > 4 ? "\n...and more." : ""}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-project-diagram"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Network Diagram Labeling</h2>
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

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Toolbox */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-toolbox text-blue-500"></i> Component Bank
                </h3>
                <p className="text-sm text-gray-500 mb-4">Click an item to select it, then click a slot on the diagram to place it.</p>
                
                <div className="space-y-6">
                    {/* Zones */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Network Zones</h4>
                        <div className="space-y-2">
                            {ITEMS.filter(i => i.type === 'zone').map(item => {
                                const isPlaced = isItemPlaced(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => !isPlaced && handleItemClick(item.id)}
                                        disabled={isPlaced}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all border-2 text-left
                                            ${isPlaced 
                                                ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed opacity-50' 
                                                : selectedItem === item.id
                                                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-md'
                                                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        <div className={`w-8 h-8 rounded flex items-center justify-center text-white ${item.color}`}>
                                            <i className={`fas ${item.icon}`}></i>
                                        </div>
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Devices */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Security Appliances</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {ITEMS.filter(i => i.type === 'device').map(item => {
                                const isPlaced = isItemPlaced(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => !isPlaced && handleItemClick(item.id)}
                                        disabled={isPlaced}
                                        className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-all border-2 text-center h-24 justify-center
                                            ${isPlaced 
                                                ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed opacity-50' 
                                                : selectedItem === item.id
                                                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-md'
                                                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                            }
                                        `}
                                    >
                                        <div className={`w-8 h-8 rounded flex items-center justify-center text-white ${item.color}`}>
                                            <i className={`fas ${item.icon}`}></i>
                                        </div>
                                        <span className="font-medium text-xs leading-tight">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Diagram Area */}
        <div className="w-full lg:w-3/4">
            <div className="bg-white p-1 rounded-xl shadow-md border border-gray-200 h-full min-h-[600px] relative overflow-hidden bg-slate-50">
                {/* DIAGRAM CANVAS */}
                <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto">
                    <div className="relative w-full max-w-5xl min-w-[800px] aspect-[16/9]">
                        
                        {/* Connecting Lines (SVG) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                             {/* Cloud to Firewall 1 */}
                             <line x1="11%" y1="50%" x2="25%" y2="50%" stroke="#94a3b8" strokeWidth="4" strokeDasharray="8,4" />
                             
                             {/* Firewall 1 to Switch 1 (44% is center of switch) */}
                             <line x1="25%" y1="50%" x2="44%" y2="50%" stroke="#94a3b8" strokeWidth="4" />
                             
                             {/* Switch 1 to WAF (Up and Over) */}
                             <line x1="44%" y1="50%" x2="44%" y2="30%" stroke="#94a3b8" strokeWidth="4" />
                             <line x1="44%" y1="30%" x2="49.5%" y2="30%" stroke="#94a3b8" strokeWidth="4" />
                             
                             {/* WAF to Web Server (Aligns to ~62.5%) */}
                             <line x1="49.5%" y1="30%" x2="62.5%" y2="30%" stroke="#94a3b8" strokeWidth="4" />

                             {/* Switch 1 to Firewall 2 */}
                             <line x1="44%" y1="50%" x2="71%" y2="50%" stroke="#94a3b8" strokeWidth="4" />
                             
                             {/* Firewall 2 to Internal Switch */}
                             <line x1="71%" y1="50%" x2="87%" y2="50%" stroke="#94a3b8" strokeWidth="4" />
                        </svg>

                        {/* ZONE 1: INTERNET (Left 2%, Width 18%) -> Center 11% */}
                        <div 
                            className="absolute top-[20%] left-[2%] w-[18%] h-[60%] border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-start pt-4 bg-gray-50/50 hover:bg-blue-50/30 transition-colors"
                            onClick={() => handleZoneClick('slot_zone_1')}
                        >
                            {/* Zone Label Slot */}
                            <div className={`w-[90%] p-2 rounded border-2 text-center min-h-[40px] flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${getPlacedItem('slot_zone_1') ? 'bg-gray-700 text-white border-gray-700' : 'bg-white border-gray-200 text-gray-400 border-dashed hover:border-gray-400'}`}>
                                {getPlacedItem('slot_zone_1')?.label || 'Zone Label'}
                            </div>
                            <div className="mt-auto mb-10 text-6xl text-gray-200">
                                <i className="fas fa-cloud"></i>
                            </div>
                        </div>

                        {/* DEVICE SLOT 1: Boundary Firewall (Left 22%, Width 6%) -> Center 25% */}
                        <div 
                            className="absolute top-[42%] left-[22%] w-[6%] h-[16%] z-10"
                            onClick={() => handleZoneClick('slot_dev_1')}
                        >
                             <div className={`w-full h-full rounded-lg shadow-sm flex items-center justify-center cursor-pointer transition-all border-2 hover:scale-105 ${getPlacedItem('slot_dev_1') ? getPlacedItem('slot_dev_1')?.color + ' text-white border-transparent' : 'bg-white border-gray-300 border-dashed text-gray-300 hover:border-blue-400'}`}>
                                <i className={`fas ${getPlacedItem('slot_dev_1')?.icon || 'fa-plus'} text-xl`}></i>
                             </div>
                             <div className="absolute -bottom-6 w-32 left-1/2 -translate-x-1/2 text-center text-[10px] font-bold text-gray-500 bg-white/80 px-1 rounded">Edge Device</div>
                        </div>

                        {/* ZONE 2: DMZ (Left 35%, Width 35%) */}
                        <div 
                            className="absolute top-[15%] left-[35%] w-[35%] h-[70%] border-2 border-dashed border-orange-200 rounded-xl flex flex-col items-center justify-start pt-4 bg-orange-50/20 hover:bg-orange-50/50 transition-colors"
                            onClick={() => handleZoneClick('slot_zone_2')}
                        >
                             {/* Zone Label Slot */}
                             <div className={`w-[120px] p-2 rounded border-2 text-center min-h-[40px] flex items-center justify-center text-xs font-bold cursor-pointer transition-all mb-8 ${getPlacedItem('slot_zone_2') ? 'bg-orange-600 text-white border-orange-600' : 'bg-white border-orange-200 text-orange-300 border-dashed hover:border-orange-300'}`}>
                                {getPlacedItem('slot_zone_2')?.label || 'Zone Label'}
                            </div>

                            {/* DMZ Switch (Static) - Relative Left 20% -> Absolute 35 + (35*0.2) = 42%. Center ~44% */}
                            <div className="absolute top-[45%] left-[20%] w-12 h-12 bg-blue-100 rounded border border-blue-300 flex items-center justify-center text-blue-600 shadow-sm" title="DMZ Switch">
                                <i className="fas fa-sitemap"></i>
                            </div>

                            {/* Device Slot 3: WAF - Relative Left 35% -> Absolute 35 + (35*0.35) = 47.25%. Center ~49.5% */}
                            <div 
                                className="absolute top-[15%] left-[35%] w-14 h-14"
                                onClick={(e) => { e.stopPropagation(); handleZoneClick('slot_dev_3'); }}
                            >
                                <div className={`w-full h-full rounded-lg shadow-sm flex items-center justify-center cursor-pointer transition-all border-2 hover:scale-105 ${getPlacedItem('slot_dev_3') ? getPlacedItem('slot_dev_3')?.color + ' text-white border-transparent' : 'bg-white border-gray-300 border-dashed text-gray-300 hover:border-blue-400'}`}>
                                    <i className={`fas ${getPlacedItem('slot_dev_3')?.icon || 'fa-plus'} text-xl`}></i>
                                </div>
                                <div className="absolute -bottom-6 w-32 left-1/2 -translate-x-1/2 text-center text-[10px] font-bold text-gray-500">App Security</div>
                            </div>

                            {/* Device Slot 2: Web Server - Relative Right 15% -> Relative Left 85%. Absolute 35 + (35*0.85) = 64.75%. Center ~62.5%  */}
                            <div 
                                className="absolute top-[15%] right-[15%] w-14 h-14"
                                onClick={(e) => { e.stopPropagation(); handleZoneClick('slot_dev_2'); }}
                            >
                                <div className={`w-full h-full rounded-lg shadow-sm flex items-center justify-center cursor-pointer transition-all border-2 hover:scale-105 ${getPlacedItem('slot_dev_2') ? getPlacedItem('slot_dev_2')?.color + ' text-white border-transparent' : 'bg-white border-gray-300 border-dashed text-gray-300 hover:border-blue-400'}`}>
                                    <i className={`fas ${getPlacedItem('slot_dev_2')?.icon || 'fa-plus'} text-xl`}></i>
                                </div>
                                <div className="absolute -bottom-6 w-32 left-1/2 -translate-x-1/2 text-center text-[10px] font-bold text-gray-500">Public Svr</div>
                            </div>

                        </div>

                        {/* DEVICE SLOT 4: Internal Firewall (Left 68%, Width 6%) -> Center 71% */}
                        <div 
                            className="absolute top-[42%] left-[68%] w-[6%] h-[16%] z-10"
                            onClick={() => handleZoneClick('slot_dev_4')}
                        >
                             <div className={`w-full h-full rounded-lg shadow-sm flex items-center justify-center cursor-pointer transition-all border-2 hover:scale-105 ${getPlacedItem('slot_dev_4') ? getPlacedItem('slot_dev_4')?.color + ' text-white border-transparent' : 'bg-white border-gray-300 border-dashed text-gray-300 hover:border-blue-400'}`}>
                                <i className={`fas ${getPlacedItem('slot_dev_4')?.icon || 'fa-plus'} text-xl`}></i>
                             </div>
                             <div className="absolute -bottom-6 w-32 left-1/2 -translate-x-1/2 text-center text-[10px] font-bold text-gray-500 bg-white/80 px-1 rounded">Internal FW</div>
                        </div>

                        {/* ZONE 3: INTERNAL (Right 2%, Width 22%) -> Center ~87% */}
                        <div 
                            className="absolute top-[20%] right-[2%] w-[22%] h-[60%] border-2 border-dashed border-green-300 rounded-xl flex flex-col items-center justify-start pt-4 bg-green-50/20 hover:bg-green-50/50 transition-colors"
                            onClick={() => handleZoneClick('slot_zone_3')}
                        >
                            {/* Zone Label Slot */}
                            <div className={`w-[90%] p-2 rounded border-2 text-center min-h-[40px] flex items-center justify-center text-xs font-bold cursor-pointer transition-all mb-8 ${getPlacedItem('slot_zone_3') ? 'bg-green-600 text-white border-green-600' : 'bg-white border-green-200 text-green-300 border-dashed hover:border-green-300'}`}>
                                {getPlacedItem('slot_zone_3')?.label || 'Zone Label'}
                            </div>
                            
                            {/* Internal Switch (Static) */}
                            <div className="w-12 h-12 bg-blue-100 rounded border border-blue-300 flex items-center justify-center text-blue-600 shadow-sm mb-8" title="Core Switch">
                                <i className="fas fa-sitemap"></i>
                            </div>

                            {/* Device Slot 5: DB Server */}
                            <div 
                                className="w-16 h-16"
                                onClick={(e) => { e.stopPropagation(); handleZoneClick('slot_dev_5'); }}
                            >
                                <div className={`w-full h-full rounded-lg shadow-sm flex items-center justify-center cursor-pointer transition-all border-2 hover:scale-105 ${getPlacedItem('slot_dev_5') ? getPlacedItem('slot_dev_5')?.color + ' text-white border-transparent' : 'bg-white border-gray-300 border-dashed text-gray-300 hover:border-blue-400'}`}>
                                    <i className={`fas ${getPlacedItem('slot_dev_5')?.icon || 'fa-plus'} text-2xl`}></i>
                                </div>
                                <div className="text-center text-[10px] font-bold text-gray-500 mt-2">Sensitive Data</div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Hint Overlay */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow border border-gray-200 max-w-xs text-sm text-gray-600 pointer-events-none">
                    <p><strong>Objective:</strong> Securely architect the network by placing zones and devices. Ensure the Database is isolated and Web traffic is inspected.</p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="bg-white p-4 border-t border-gray-200 flex justify-between items-center px-8">
         <button 
            onClick={() => setDropZones(INITIAL_ZONES)} 
            className="text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-100 px-4 py-2 rounded transition-colors"
         >
            Reset Diagram
         </button>
         <button 
            onClick={handleSubmit} 
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-2 px-8 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2"
         >
            <i className="fas fa-check-circle"></i> Validate Architecture
         </button>
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
                        {success ? 'Architecture Secure!' : 'Security Flaws Detected'}
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
                            Adjust Architecture
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default NetworkLabelingPBQ;
