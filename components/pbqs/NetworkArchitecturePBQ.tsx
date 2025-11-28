
import React, { useState } from 'react';
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

type DeviceType = 'firewall' | 'web_server' | 'db_server' | 'workstation' | 'ids' | 'vpn';

interface ZoneSlot {
  id: string;
  zone: 'Internet' | 'DMZ' | 'LAN' | 'DataCenter';
  device: DeviceType | null;
  label: string;
}

const NetworkArchitecturePBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  const [slots, setSlots] = useState<ZoneSlot[]>([
    { id: 'dmz-1', zone: 'DMZ', device: null, label: 'Public Service' },
    { id: 'dmz-2', zone: 'DMZ', device: null, label: 'Remote Access' },
    { id: 'lan-1', zone: 'LAN', device: null, label: 'User Device' },
    { id: 'dc-1', zone: 'DataCenter', device: null, label: 'Backend Storage' },
    { id: 'edge-1', zone: 'Internet', device: null, label: 'Perimeter Defense' },
  ]);

  const [selectedDevice, setSelectedDevice] = useState<DeviceType | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const devices: { type: DeviceType; icon: string; name: string }[] = [
    { type: 'firewall', icon: 'fa-shield-alt', name: 'Next-Gen Firewall' },
    { type: 'web_server', icon: 'fa-server', name: 'Web Server' },
    { type: 'db_server', icon: 'fa-database', name: 'SQL Database' },
    { type: 'workstation', icon: 'fa-desktop', name: 'Employee PC' },
    { type: 'vpn', icon: 'fa-network-wired', name: 'VPN Concentrator' },
  ];

  const handleSlotClick = (id: string) => {
    if (selectedDevice) {
        setSlots(slots.map(s => s.id === id ? { ...s, device: selectedDevice } : s));
        setSelectedDevice(null);
    } else {
        // Clear slot
        setSlots(slots.map(s => s.id === id ? { ...s, device: null } : s));
    }
  };

  const handleSubmit = () => {
    let score = 0;
    const errors: string[] = [];

    // Validation Logic
    const getSlot = (id: string) => slots.find(s => s.id === id);

    // 1. Edge Firewall
    if (getSlot('edge-1')?.device === 'firewall') score += 20;
    else errors.push("The perimeter needs a robust defense device (Firewall).");

    // 2. DMZ Web Server
    if (getSlot('dmz-1')?.device === 'web_server') score += 20;
    else errors.push("Public facing services like Web Servers belong in the DMZ.");

    // 3. DMZ VPN
    if (getSlot('dmz-2')?.device === 'vpn') score += 20;
    else errors.push("Remote access entry points (VPN) should terminate in the DMZ.");

    // 4. LAN Workstation
    if (getSlot('lan-1')?.device === 'workstation') score += 20;
    else errors.push("User devices belong in the internal LAN.");

    // 5. Data Center DB
    if (getSlot('dc-1')?.device === 'db_server') score += 20;
    else errors.push("Sensitive data storage (SQL DB) belongs in the most secure zone (Data Center).");

    if (errors.length === 0) {
        setSuccess(true);
        setFeedback("Architecture Validated. You have successfully implemented a defense-in-depth secure network topology.");
        onComplete(100);
    } else {
        setSuccess(false);
        setFeedback(errors.map(e => "• " + e).join("\n"));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-800 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-sitemap"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Secure Network Architecture</h2>
            <p className="text-xs text-gray-500">Network Segmentation & Placement</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">

        {/* Toolbox */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 text-center">Device Palette</h3>
                <p className="text-xs text-gray-500 mb-4 text-center">Select a device then click a slot to place it.</p>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                    {devices.map(d => (
                        <button
                            key={d.type}
                            onClick={() => setSelectedDevice(d.type)}
                            className={`p-3 rounded-lg border-2 flex items-center gap-3 transition-all ${selectedDevice === d.type ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-600'}`}
                        >
                            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center border border-gray-100 shadow-sm">
                                <i className={`fas ${d.icon}`}></i>
                            </div>
                            <span className="font-medium text-sm">{d.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors"
            >
                Validate Design
            </button>
        </div>

        {/* Diagram Area */}
        <div className="flex-grow bg-white p-8 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col gap-12 max-w-3xl mx-auto">
                {/* Internet Zone */}
                <div className="flex flex-col items-center">
                    <div className="mb-2 text-gray-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <i className="fas fa-globe"></i> Internet
                    </div>
                    {/* Edge Slot */}
                    <div
                        onClick={() => handleSlotClick('edge-1')}
                        className={`w-48 h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:bg-gray-50 ${slots.find(s => s.id === 'edge-1')?.device ? 'border-solid border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                    >
                         {slots.find(s => s.id === 'edge-1')?.device ? (
                            <div className="text-center">
                                <i className={`fas ${devices.find(d => d.type === slots.find(s => s.id === 'edge-1')?.device)?.icon} text-2xl text-blue-600 mb-1`}></i>
                                <div className="text-xs font-bold text-blue-800">{devices.find(d => d.type === slots.find(s => s.id === 'edge-1')?.device)?.name}</div>
                            </div>
                         ) : (
                            <span className="text-gray-400 text-sm font-medium">Perimeter Defense</span>
                         )}
                    </div>
                    <div className="h-8 w-0.5 bg-gray-300"></div>
                </div>

                {/* DMZ Zone */}
                <div className="border-2 border-orange-100 bg-orange-50/30 rounded-xl p-6 relative">
                    <div className="absolute -top-3 left-4 bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold uppercase">DMZ</div>
                    <div className="flex justify-center gap-12">
                         {['dmz-1', 'dmz-2'].map(sid => {
                             const slot = slots.find(s => s.id === sid);
                             return (
                                <div
                                    key={sid}
                                    onClick={() => handleSlotClick(sid)}
                                    className={`w-40 h-32 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:bg-white ${slot?.device ? 'border-solid border-blue-500 bg-white shadow-sm' : 'border-orange-200 bg-white/50'}`}
                                >
                                    {slot?.device ? (
                                        <div className="text-center">
                                            <i className={`fas ${devices.find(d => d.type === slot.device)?.icon} text-3xl text-blue-600 mb-2`}></i>
                                            <div className="text-xs font-bold text-blue-800">{devices.find(d => d.type === slot.device)?.name}</div>
                                        </div>
                                    ) : (
                                        <span className="text-orange-300 text-sm font-medium text-center px-2">{slot?.label}</span>
                                    )}
                                </div>
                             );
                         })}
                    </div>
                </div>

                <div className="h-8 w-0.5 bg-gray-300 mx-auto"></div>

                {/* Internal Zones Container */}
                <div className="grid grid-cols-2 gap-8">
                     {/* LAN Zone */}
                    <div className="border-2 border-green-100 bg-green-50/30 rounded-xl p-6 relative">
                        <div className="absolute -top-3 left-4 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Internal LAN</div>
                        <div className="flex justify-center">
                            {['lan-1'].map(sid => {
                                const slot = slots.find(s => s.id === sid);
                                return (
                                    <div
                                        key={sid}
                                        onClick={() => handleSlotClick(sid)}
                                        className={`w-40 h-32 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:bg-white ${slot?.device ? 'border-solid border-blue-500 bg-white shadow-sm' : 'border-green-200 bg-white/50'}`}
                                    >
                                        {slot?.device ? (
                                            <div className="text-center">
                                                <i className={`fas ${devices.find(d => d.type === slot.device)?.icon} text-3xl text-blue-600 mb-2`}></i>
                                                <div className="text-xs font-bold text-blue-800">{devices.find(d => d.type === slot.device)?.name}</div>
                                            </div>
                                        ) : (
                                            <span className="text-green-300 text-sm font-medium text-center px-2">{slot?.label}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Data Center Zone */}
                    <div className="border-2 border-purple-100 bg-purple-50/30 rounded-xl p-6 relative">
                        <div className="absolute -top-3 left-4 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Data Center</div>
                        <div className="flex justify-center">
                            {['dc-1'].map(sid => {
                                const slot = slots.find(s => s.id === sid);
                                return (
                                    <div
                                        key={sid}
                                        onClick={() => handleSlotClick(sid)}
                                        className={`w-40 h-32 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-all hover:bg-white ${slot?.device ? 'border-solid border-blue-500 bg-white shadow-sm' : 'border-purple-200 bg-white/50'}`}
                                    >
                                        {slot?.device ? (
                                            <div className="text-center">
                                                <i className={`fas ${devices.find(d => d.type === slot.device)?.icon} text-3xl text-blue-600 mb-2`}></i>
                                                <div className="text-xs font-bold text-blue-800">{devices.find(d => d.type === slot.device)?.name}</div>
                                            </div>
                                        ) : (
                                            <span className="text-purple-300 text-sm font-medium text-center px-2">{slot?.label}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fas ${success ? 'fa-check-circle' : 'fa-times-circle'} text-3xl`}></i>
                    </div>
                    <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                        {success ? 'Architecture Approved' : 'Design Flaws Detected'}
                    </h3>
                </div>

                <div className="p-8">
                    <div className="whitespace-pre-line text-gray-700 text-lg leading-relaxed mb-6">
                        {feedback}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 flex justify-center">
                    {success ? (
                        <button onClick={onExit} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">Complete Lab</button>
                    ) : (
                        <button onClick={() => setFeedback(null)} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">Modify Design</button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
const NetworkArchitecturePBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="network_architecture"
      title="Secure Network Architecture"
      scenario="Design a segmented network to improve security posture and reduce the blast radius of a breach."
      objective="Assign the correct network segment or technology to the scenario."
      questions={[
        {
          id: "q1",
          text: "Where should you place a public-facing web server?",
          options: [
            { value: "DMZ", label: "DMZ (Demilitarized Zone)" },
            { value: "LAN", label: "Internal LAN" },
            { value: "Management", label: "Management VLAN" },
            { value: "Guest", label: "Guest Network" }
          ],
          correctValue: "DMZ",
          feedback: "Public-facing services should be isolated in a DMZ to protect the internal network."
        },
        {
          id: "q2",
          text: "You want to separate the Finance department's traffic from the Engineering department. What technology should you use?",
          options: [
            { value: "VLAN", label: "VLAN (Virtual LAN)" },
            { value: "VPN", label: "VPN" },
            { value: "NAT", label: "NAT" },
            { value: "Proxy", label: "Proxy Server" }
          ],
          correctValue: "VLAN",
          feedback: "VLANs are used to logically segment traffic on the same physical infrastructure."
        },
        {
          id: "q3",
          text: "To safely manage switches and routers remotely, they should be placed in a:",
          options: [
            { value: "OOB", label: "Out-of-Band (OOB) Management Network" },
            { value: "DMZ", label: "DMZ" },
            { value: "Guest", label: "Guest Network" },
            { value: "Public", label: "Public Subnet" }
          ],
          correctValue: "OOB",
          feedback: "Management interfaces should be on a separate, restricted Out-of-Band network."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default NetworkArchitecturePBQ;
