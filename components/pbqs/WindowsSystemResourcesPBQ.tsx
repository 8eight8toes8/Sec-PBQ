
import React, { useState, useEffect, useRef } from 'react';

interface WindowsSystemResourcesPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  icon: string;
  width?: string;
  height?: string;
}

type AppId = 'services' | 'perfmon' | 'eventviewer' | 'explorer' | 'network' | 'cmd';

const WindowsSystemResourcesPBQ: React.FC<WindowsSystemResourcesPBQProps> = ({ onComplete, onExit }) => {
  // --- Window Management State ---
  const [windows, setWindows] = useState<Record<AppId, WindowState>>({
    services: { id: 'services', title: 'Services', isOpen: false, isMinimized: false, zIndex: 1, icon: 'fa-cogs', width: '800px', height: '550px' },
    perfmon: { id: 'perfmon', title: 'Performance Monitor', isOpen: false, isMinimized: false, zIndex: 1, icon: 'fa-chart-line', width: '900px', height: '600px' },
    eventviewer: { id: 'eventviewer', title: 'Event Viewer', isOpen: false, isMinimized: false, zIndex: 1, icon: 'fa-book', width: '800px', height: '500px' },
    explorer: { id: 'explorer', title: 'File Explorer', isOpen: false, isMinimized: false, zIndex: 1, icon: 'fa-folder-open', width: '700px', height: '450px' },
    network: { id: 'network', title: 'Network Connections', isOpen: false, isMinimized: false, zIndex: 1, icon: 'fa-network-wired', width: '600px', height: '400px' },
    cmd: { id: 'cmd', title: 'Command Prompt', isOpen: false, isMinimized: false, zIndex: 1, icon: 'fa-terminal', width: '600px', height: '400px' },
  });
  const [nextZIndex, setNextZIndex] = useState(10);

  // --- Task State ---
  const [serviceStatus, setServiceStatus] = useState({ state: 'Running', startup: 'Automatic' });
  const [perfMonStatus, setPerfMonStatus] = useState({ frozen: false, graphType: 'Line', dcsCreated: false, dcsRunning: false });
  const [events, setEvents] = useState<{ id: number, time: string, source: string, msg: string }[]>([
    { id: 100, time: '10:00:00 AM', source: 'Service Control Manager', msg: 'The Routing and Remote Access service entered the running state.' }
  ]);
  const [dcsConfig, setDcsConfig] = useState({ name: '', counter: '', interval: 0 });
  const [fileSystem, setFileSystem] = useState<string[]>([]);
  const [networkAdapters, setNetworkAdapters] = useState([{ name: 'Ethernet', status: 'Connected' }, { name: 'RRAS Interface', status: 'Active' }]);
  
  // Modal states within apps
  const [showDcsWizard, setShowDcsWizard] = useState(false);
  const [showServiceProps, setShowServiceProps] = useState(false);

  // --- Handlers ---

  const focusWindow = (id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], zIndex: nextZIndex, isMinimized: false }
    }));
    setNextZIndex(prev => prev + 1);
  };

  const openApp = (id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: true, isMinimized: false, zIndex: nextZIndex }
    }));
    setNextZIndex(prev => prev + 1);
  };

  const closeApp = (id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));
  };

  const minimizeApp = (id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true }
    }));
  };

  // --- Logic for Service App ---
  const handleServiceChange = (action: 'stop' | 'start' | 'manual' | 'disabled' | 'automatic') => {
    const timestamp = new Date().toLocaleTimeString();
    
    if (action === 'stop') {
        setServiceStatus(prev => ({ ...prev, state: 'Stopped' }));
        setNetworkAdapters(prev => prev.map(a => a.name === 'RRAS Interface' ? { ...a, status: 'Disconnected' } : a));
        setEvents(prev => [{ id: 101, time: timestamp, source: 'Service Control Manager', msg: 'The Routing and Remote Access service entered the stopped state.' }, ...prev]);
    } else if (action === 'start') {
        setServiceStatus(prev => ({ ...prev, state: 'Running' }));
        setNetworkAdapters(prev => prev.map(a => a.name === 'RRAS Interface' ? { ...a, status: 'Active' } : a));
        setEvents(prev => [{ id: 102, time: timestamp, source: 'Service Control Manager', msg: 'The Routing and Remote Access service entered the running state.' }, ...prev]);
    } else if (action === 'manual') {
        setServiceStatus(prev => ({ ...prev, startup: 'Manual' }));
    } else if (action === 'disabled') {
        setServiceStatus(prev => ({ ...prev, startup: 'Disabled' }));
    } else if (action === 'automatic') {
        setServiceStatus(prev => ({ ...prev, startup: 'Automatic' }));
    }
  };

  // --- Logic for PerfMon App ---
  const handleDcsCreate = () => {
    setDcsConfig({ ...dcsConfig, name: 'Memory Logs', counter: 'Memory\\Available MBytes', interval: 4 });
    setPerfMonStatus(prev => ({ ...prev, dcsCreated: true }));
    setShowDcsWizard(false);
  };

  const handleDcsToggle = () => {
    if (perfMonStatus.dcsRunning) {
        // Stop
        setPerfMonStatus(prev => ({ ...prev, dcsRunning: false }));
        // Create file
        const filename = `DataCollector01.csv`;
        if (!fileSystem.includes(filename)) {
            setFileSystem(prev => [...prev, filename]);
        }
    } else {
        // Start
        setPerfMonStatus(prev => ({ ...prev, dcsRunning: true }));
    }
  };

  const checkCompletion = () => {
    let score = 0;
    // Part 1: Service Stopped/Disabled
    if (serviceStatus.state === 'Stopped') score += 20;
    if (serviceStatus.startup === 'Disabled') score += 20;
    
    // Part 2: DCS Created and Log File Generated
    if (perfMonStatus.dcsCreated) score += 30;
    if (fileSystem.includes('DataCollector01.csv')) score += 30;

    if (score === 100) {
        onComplete(100);
    } else {
        alert(`Lab Incomplete. Score: ${score}/100. \nTasks remaining:\n` + 
              (serviceStatus.state !== 'Stopped' ? "- Stop Routing and Remote Access service\n" : "") + 
              (serviceStatus.startup !== 'Disabled' ? "- Disable Routing and Remote Access service\n" : "") +
              (!perfMonStatus.dcsCreated ? "- Create 'Memory Logs' Data Collector Set\n" : "") +
              (!fileSystem.includes('DataCollector01.csv') ? "- Run DCS to generate log file\n" : "")
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col font-sans overflow-hidden select-none">
      
      {/* Desktop Area */}
      <div className="flex-grow relative bg-[#006ca3] overflow-hidden" 
           style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop")', backgroundSize: 'cover' }}>
        
        {/* Desktop Icons */}
        <div className="absolute top-4 left-4 grid grid-cols-1 gap-6 w-24">
            <div onClick={() => openApp('network')} className="flex flex-col items-center group cursor-pointer hover:bg-white/10 p-2 rounded">
                <i className="fas fa-network-wired text-4xl text-white drop-shadow-md group-hover:opacity-80"></i>
                <span className="text-white text-xs mt-1 drop-shadow text-center font-medium text-shadow">Network</span>
            </div>
            <div onClick={() => openApp('services')} className="flex flex-col items-center group cursor-pointer hover:bg-white/10 p-2 rounded">
                <i className="fas fa-cogs text-4xl text-white drop-shadow-md group-hover:opacity-80"></i>
                <span className="text-white text-xs mt-1 drop-shadow text-center font-medium text-shadow">Admin Tools</span>
            </div>
            <div onClick={() => openApp('perfmon')} className="flex flex-col items-center group cursor-pointer hover:bg-white/10 p-2 rounded">
                <i className="fas fa-chart-line text-4xl text-green-400 drop-shadow-md group-hover:opacity-80"></i>
                <span className="text-white text-xs mt-1 drop-shadow text-center font-medium text-shadow">PerfMon</span>
            </div>
            <div onClick={() => openApp('explorer')} className="flex flex-col items-center group cursor-pointer hover:bg-white/10 p-2 rounded">
                <i className="fas fa-folder text-4xl text-yellow-400 drop-shadow-md group-hover:opacity-80"></i>
                <span className="text-white text-xs mt-1 drop-shadow text-center font-medium text-shadow">This PC</span>
            </div>
        </div>

        {/* --- WINDOW: SERVICES --- */}
        {windows.services.isOpen && (
            <Window 
                state={windows.services} 
                onClose={() => closeApp('services')} 
                onMinimize={() => minimizeApp('services')}
                onFocus={() => focusWindow('services')}
            >
                <div className="flex flex-col h-full bg-white text-sm">
                    <div className="bg-gray-100 p-1 border-b flex gap-2 text-xs">
                        <span className="px-2 hover:bg-gray-200 cursor-pointer">File</span> <span className="px-2 hover:bg-gray-200 cursor-pointer">Action</span> <span className="px-2 hover:bg-gray-200 cursor-pointer">View</span> <span className="px-2 hover:bg-gray-200 cursor-pointer">Help</span>
                    </div>
                    <div className="flex-grow overflow-auto p-0 relative">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-gray-50 border-b sticky top-0">
                                <tr><th className="p-1 pl-4 w-1/3 border-r">Name</th><th className="p-1 border-r">Description</th><th className="p-1 border-r">Status</th><th className="p-1">Startup Type</th></tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-blue-100 cursor-default">
                                    <td className="p-1 pl-4 border-r">Remote Registry</td><td className="border-r">Enables remote users...</td><td className="border-r"></td><td>Disabled</td>
                                </tr>
                                <tr 
                                    className={`cursor-pointer ${showServiceProps ? 'bg-blue-200' : 'hover:bg-blue-100'}`}
                                    onDoubleClick={() => setShowServiceProps(true)}
                                >
                                    <td className="p-1 pl-4 border-r flex items-center gap-2"><i className="fas fa-cog text-gray-500"></i> Routing and Remote Access</td>
                                    <td className="border-r">Offers routing services...</td>
                                    <td className="border-r">{serviceStatus.state === 'Running' ? 'Running' : ''}</td>
                                    <td>{serviceStatus.startup}</td>
                                </tr>
                                <tr className="hover:bg-blue-100 cursor-default">
                                    <td className="p-1 pl-4 border-r">Windows Update</td><td className="border-r">Enables detection...</td><td className="border-r">Running</td><td>Automatic</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* PROPERTIES DIALOG (Overlay) */}
                        {showServiceProps && (
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20">
                                <div className="bg-white border border-gray-400 shadow-xl w-96 p-1 text-xs">
                                    <div className="flex justify-between items-center bg-white p-2 border-b mb-2">
                                        <span className="font-bold">Routing and Remote Access Properties</span>
                                        <button onClick={() => setShowServiceProps(false)} className="text-gray-500 hover:text-red-500"><i className="fas fa-times"></i></button>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="flex flex-col gap-1">
                                            <label>Startup type:</label>
                                            <select 
                                                value={serviceStatus.startup} 
                                                onChange={(e) => handleServiceChange(e.target.value as any)}
                                                className="border p-1 w-full"
                                            >
                                                <option value="Automatic">Automatic</option>
                                                <option value="Manual">Manual</option>
                                                <option value="Disabled">Disabled</option>
                                            </select>
                                        </div>
                                        <div className="fieldset border p-2 relative mt-4">
                                            <legend className="absolute -top-2 left-2 bg-white px-1 text-blue-800">Service status</legend>
                                            <div className="mt-2 mb-2">
                                                Status: <span className="font-bold">{serviceStatus.state}</span>
                                            </div>
                                            <div className="flex gap-2 justify-center">
                                                <button 
                                                    onClick={() => handleServiceChange('start')} 
                                                    disabled={serviceStatus.state === 'Running'}
                                                    className="px-3 py-1 bg-gray-100 border rounded hover:bg-gray-200 disabled:opacity-50"
                                                >Start</button>
                                                <button 
                                                    onClick={() => handleServiceChange('stop')} 
                                                    disabled={serviceStatus.state === 'Stopped'}
                                                    className="px-3 py-1 bg-gray-100 border rounded hover:bg-gray-200 disabled:opacity-50"
                                                >Stop</button>
                                                <button className="px-3 py-1 bg-gray-100 border rounded hover:bg-gray-200 disabled:opacity-50" disabled>Pause</button>
                                                <button className="px-3 py-1 bg-gray-100 border rounded hover:bg-gray-200 disabled:opacity-50" disabled>Resume</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 p-2 bg-gray-50 border-t mt-2">
                                        <button onClick={() => setShowServiceProps(false)} className="px-4 py-1 border bg-white hover:bg-gray-100">OK</button>
                                        <button onClick={() => setShowServiceProps(false)} className="px-4 py-1 border bg-white hover:bg-gray-100">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Window>
        )}

        {/* --- WINDOW: PERFMON --- */}
        {windows.perfmon.isOpen && (
            <Window 
                state={windows.perfmon} 
                onClose={() => closeApp('perfmon')} 
                onMinimize={() => minimizeApp('perfmon')}
                onFocus={() => focusWindow('perfmon')}
            >
                <div className="flex h-full bg-white text-sm">
                    {/* Sidebar */}
                    <div className="w-60 border-r bg-white p-2 overflow-y-auto">
                        <div className="font-bold mb-1 flex items-center gap-2"><i className="fas fa-desktop"></i> Performance</div>
                        <div className="pl-4">
                            <div className="flex items-center gap-1 cursor-pointer hover:bg-blue-50 py-1">
                                <i className="fas fa-chart-area text-green-600"></i> Monitoring Tools
                            </div>
                            <div 
                                className="pl-6 flex items-center gap-1 cursor-pointer bg-blue-100 text-blue-800 py-1 border border-blue-200"
                                onClick={() => setShowDcsWizard(false)}
                            >
                                <i className="fas fa-chart-line text-red-500"></i> Performance Monitor
                            </div>
                            <div className="flex items-center gap-1 cursor-pointer hover:bg-blue-50 mt-1 py-1">
                                <i className="fas fa-database text-yellow-600"></i> Data Collector Sets
                            </div>
                            <div className="pl-6">
                                <div className="flex items-center gap-1 cursor-pointer hover:bg-blue-50 text-gray-500 py-1">
                                    <i className="fas fa-folder"></i> System
                                </div>
                                <div className="flex items-center gap-1 cursor-pointer hover:bg-blue-50 py-1 group">
                                    <i className="fas fa-folder-open text-yellow-500"></i> User Defined
                                </div>
                                <div className="pl-6">
                                    {perfMonStatus.dcsCreated ? (
                                        <div 
                                            className="flex items-center gap-1 cursor-pointer bg-blue-50 p-1 border border-blue-200 rounded"
                                            onClick={handleDcsToggle}
                                        >
                                            <i className={`fas ${perfMonStatus.dcsRunning ? 'fa-play text-green-500' : 'fa-stop text-black'}`}></i> {dcsConfig.name || 'New Set'}
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setShowDcsWizard(true)}
                                            className="text-xs text-blue-600 hover:underline mt-1 flex items-center gap-1"
                                        >
                                            <i className="fas fa-plus-circle"></i> New Data Collector Set
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Main Content */}
                    <div className="flex-grow flex flex-col relative">
                        {/* Toolbar */}
                        <div className="h-10 border-b bg-gray-50 flex items-center px-2 gap-2 shadow-sm">
                            <button onClick={() => setPerfMonStatus(p => ({ ...p, frozen: false }))} title="Unfreeze" className="p-1 hover:bg-gray-200 rounded"><i className="fas fa-play text-green-600"></i></button>
                            <button onClick={() => setPerfMonStatus(p => ({ ...p, frozen: true }))} title="Freeze" className="p-1 hover:bg-gray-200 rounded"><i className="fas fa-pause text-blue-600"></i></button>
                            <div className="h-4 w-px bg-gray-300 mx-1"></div>
                            <button title="Change Graph Type" onClick={() => setPerfMonStatus(p => ({...p, graphType: p.graphType === 'Line' ? 'Report' : 'Line'}))} className="p-1 hover:bg-gray-200 rounded"><i className="fas fa-chart-bar"></i></button>
                        </div>
                        
                        {/* Graph Area - LIGHT THEME UPDATE */}
                        <div className="flex-grow bg-white relative overflow-hidden p-4">
                            {perfMonStatus.graphType === 'Line' ? (
                                <div className="w-full h-full border-l border-b border-gray-400 relative bg-white">
                                    <div className="absolute top-2 right-2 text-green-600 font-mono text-xs font-bold">
                                        {perfMonStatus.frozen ? "PAUSED" : "LIVE CAPTURE"}
                                    </div>
                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-10 pointer-events-none">
                                        {Array.from({length:100}).map((_, i) => <div key={i} className="border-r border-b border-gray-800"></div>)}
                                    </div>
                                    {/* SVG Graph */}
                                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                        <path 
                                            d="M0,250 Q50,200 100,220 T200,180 T300,240 T400,150 T500,200 T600,180 T700,220 T800,190" 
                                            fill="none" 
                                            stroke="red" 
                                            strokeWidth="2" 
                                        />
                                        {!perfMonStatus.frozen && (
                                            <path 
                                                d="M800,190 L850,210 L900,160" 
                                                fill="none" 
                                                stroke="red" 
                                                strokeWidth="2" 
                                                strokeDasharray="5,5" 
                                                className="animate-pulse" 
                                            />
                                        )}
                                        {/* Memory Line if DCS active */}
                                        {perfMonStatus.dcsRunning && !perfMonStatus.frozen && (
                                            <path 
                                                d="M0,300 L900,300" 
                                                fill="none" 
                                                stroke="#00cc00" 
                                                strokeWidth="2"
                                                className="animate-pulse"
                                            />
                                        )}
                                    </svg>
                                </div>
                            ) : (
                                <div className="text-black font-mono text-sm p-4">
                                    <h3 className="font-bold border-b mb-2">Report</h3>
                                    <div className="grid grid-cols-2 gap-4 w-64">
                                        <div>% Processor Time:</div><div className="font-bold">12%</div>
                                        <div>Available MBytes:</div><div className="font-bold text-green-600">4,096</div>
                                        <div>Pages/sec:</div><div className="font-bold">0</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Legend */}
                        <div className="h-32 border-t bg-white p-2 overflow-y-auto text-xs">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr><th>Color</th><th>Scale</th><th>Counter</th><th>Instance</th><th>Parent</th></tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><div className="w-8 h-1 bg-red-600"></div></td>
                                        <td>1.0</td>
                                        <td>% Processor Time</td>
                                        <td>_Total</td>
                                        <td>--</td>
                                    </tr>
                                    {perfMonStatus.dcsCreated && (
                                        <tr>
                                            <td><div className="w-8 h-1 bg-green-500"></div></td>
                                            <td>0.1</td>
                                            <td>Available MBytes</td>
                                            <td>--</td>
                                            <td>Memory</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* WIZARD MODAL */}
                        {showDcsWizard && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-30">
                                <div className="bg-white w-96 border shadow-xl p-0 flex flex-col">
                                    <div className="bg-white p-3 border-b flex justify-between items-center">
                                        <h3 className="font-bold">Create new Data Collector Set</h3>
                                        <button onClick={() => setShowDcsWizard(false)}><i className="fas fa-times"></i></button>
                                    </div>
                                    <div className="p-4 flex-grow bg-gray-50 space-y-4">
                                        <div>
                                            <label className="block mb-1 font-bold">Name:</label>
                                            <input type="text" className="border w-full p-1" defaultValue="Memory Logs" />
                                        </div>
                                        <div>
                                            <label className="block mb-1">Create from a template (Recommended)</label>
                                            <div className="ml-4">
                                                <label className="flex gap-2"><input type="radio" name="create" /> System Diagnosis</label>
                                                <label className="flex gap-2"><input type="radio" name="create" /> System Performance</label>
                                            </div>
                                            <label className="flex gap-2 mt-2 font-bold"><input type="radio" name="create" defaultChecked /> Create manually (Advanced)</label>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t bg-gray-100 flex justify-end gap-2">
                                        <button onClick={handleDcsCreate} className="px-4 py-1 bg-white border hover:bg-gray-200">Next &gt;</button>
                                        <button onClick={() => setShowDcsWizard(false)} className="px-4 py-1 bg-white border hover:bg-gray-200">Cancel</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Window>
        )}

        {/* --- WINDOW: EVENT VIEWER --- */}
        {windows.eventviewer.isOpen && (
            <Window 
                state={windows.eventviewer} 
                onClose={() => closeApp('eventviewer')} 
                onMinimize={() => minimizeApp('eventviewer')}
                onFocus={() => focusWindow('eventviewer')}
            >
                <div className="flex h-full bg-white text-sm">
                    <div className="w-48 border-r bg-white p-2">
                        <div className="font-bold flex items-center gap-2"><i className="fas fa-book"></i> Event Viewer (Local)</div>
                        <div className="pl-4 mt-1">
                            <div className="cursor-pointer hover:bg-gray-100"><i className="fas fa-caret-down"></i> Windows Logs</div>
                            <div className="pl-6 cursor-pointer hover:bg-gray-100 text-gray-600 flex items-center gap-2"><i className="fas fa-file-alt"></i> Application</div>
                            <div className="pl-6 cursor-pointer hover:bg-gray-100 text-gray-600 flex items-center gap-2"><i className="fas fa-shield-alt"></i> Security</div>
                            <div className="pl-6 cursor-pointer bg-blue-100 text-blue-800 font-bold flex items-center gap-2"><i className="fas fa-cog"></i> System</div>
                        </div>
                    </div>
                    <div className="flex-grow p-0 flex flex-col">
                        <div className="bg-gray-50 border-b p-2 font-bold text-xs flex justify-between">
                            <span>System</span>
                            <span>Number of events: {events.length}</span>
                        </div>
                        <div className="flex-grow overflow-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr><th className="p-1 border-r">Level</th><th className="p-1 border-r">Date and Time</th><th className="p-1 border-r">Source</th><th className="p-1">Event ID</th></tr>
                                </thead>
                                <tbody>
                                    {events.map((evt, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50 cursor-pointer even:bg-gray-50">
                                            <td className="p-1 border-r"><i className="fas fa-info-circle text-blue-500"></i> Information</td>
                                            <td className="p-1 border-r">{new Date().toLocaleDateString()} {evt.time}</td>
                                            <td className="p-1 border-r">{evt.source}</td>
                                            <td className="p-1">{evt.id > 100 ? '7036' : '6005'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="h-32 border-t p-2 bg-gray-50 overflow-y-auto">
                            <div className="font-bold mb-1 text-gray-500 border-b">Event Properties</div>
                            <div className="p-2 bg-white border border-gray-200 h-full text-xs font-mono">
                                {events[0].msg}
                            </div>
                        </div>
                    </div>
                </div>
            </Window>
        )}

        {/* --- WINDOW: FILE EXPLORER --- */}
        {windows.explorer.isOpen && (
            <Window 
                state={windows.explorer} 
                onClose={() => closeApp('explorer')} 
                onMinimize={() => minimizeApp('explorer')}
                onFocus={() => focusWindow('explorer')}
            >
                <div className="flex h-full bg-white text-sm flex-col">
                    <div className="border-b p-2 flex items-center gap-2 bg-gray-50">
                        <button className="text-gray-400 hover:text-gray-600"><i className="fas fa-arrow-left"></i></button>
                        <button className="text-gray-400 hover:text-gray-600"><i className="fas fa-arrow-right"></i></button>
                        <div className="flex-grow border bg-white px-2 py-1 flex items-center gap-2 text-xs">
                            <i className="fas fa-hdd text-gray-500"></i> Local Disk (C:) <i className="fas fa-chevron-right text-[10px]"></i> PerfLogs
                        </div>
                        <div className="w-40 border bg-white px-2 py-1 text-gray-400 text-xs">Search PerfLogs</div>
                    </div>
                    <div className="flex-grow p-4 grid grid-cols-4 gap-4 content-start">
                        {fileSystem.length === 0 ? (
                            <div className="col-span-4 text-center text-gray-400 italic mt-10">This folder is empty.</div>
                        ) : (
                            fileSystem.map(file => (
                                <div key={file} className="flex flex-col items-center group cursor-pointer hover:bg-blue-50 p-2 rounded border border-transparent hover:border-blue-100">
                                    <i className="fas fa-file-csv text-green-600 text-4xl drop-shadow-sm"></i>
                                    <span className="text-xs mt-2 text-center truncate w-full group-hover:text-blue-700">{file}</span>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-1 border-t bg-gray-50 text-xs text-gray-500 flex justify-between px-2">
                        <span>{fileSystem.length} items</span>
                    </div>
                </div>
            </Window>
        )}

        {/* --- WINDOW: NETWORK --- */}
        {windows.network.isOpen && (
            <Window 
                state={windows.network} 
                onClose={() => closeApp('network')} 
                onMinimize={() => minimizeApp('network')}
                onFocus={() => focusWindow('network')}
            >
                <div className="flex h-full bg-white text-sm flex-col">
                    <div className="p-3 border-b bg-gray-50 font-bold flex items-center gap-2">
                        <i className="fas fa-globe text-blue-500"></i> Network Connections
                    </div>
                    <div className="p-4 space-y-4 bg-gray-100 flex-grow">
                        {networkAdapters.map((adapter, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-3 bg-white hover:bg-blue-50 border rounded shadow-sm cursor-pointer group">
                                <i className={`fas fa-network-wired text-3xl ${adapter.status === 'Active' || adapter.status === 'Connected' ? 'text-blue-500' : 'text-gray-400'}`}></i>
                                <div>
                                    <div className="font-bold group-hover:text-blue-700">{adapter.name}</div>
                                    <div className="text-xs text-gray-500">{adapter.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto p-2 border-t bg-gray-50 text-right">
                        <button 
                            className="text-xs text-blue-600 hover:underline"
                            onClick={() => {
                                const temp = [...networkAdapters];
                                setNetworkAdapters([]);
                                setTimeout(() => setNetworkAdapters(temp), 100);
                            }}
                        >
                            Refresh (F5)
                        </button>
                    </div>
                </div>
            </Window>
        )}

      </div>

      {/* Taskbar */}
      <div className="h-10 bg-[#e3e3e3] border-t border-white flex items-center px-2 shadow-inner z-50">
        {/* Start Button */}
        <div className="mr-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center text-white shadow-sm hover:bg-blue-400">
                <i className="fab fa-windows text-lg"></i>
            </div>
        </div>
        
        {/* Search */}
        <div className="w-48 bg-white h-8 border border-gray-400 mr-2 flex items-center px-2 text-gray-400 text-xs cursor-text">
            <i className="fas fa-search mr-2"></i> Type here to search
        </div>

        {/* Active Apps */}
        <div className="flex gap-1">
            {(Object.values(windows) as WindowState[]).filter(w => w.isOpen).map(win => (
                <div 
                    key={win.id}
                    onClick={() => win.isMinimized ? focusWindow(win.id as AppId) : minimizeApp(win.id as AppId)}
                    className={`
                        w-40 h-8 flex items-center gap-2 px-2 text-xs border-b-2 cursor-pointer transition-colors select-none
                        ${!win.isMinimized && win.zIndex === nextZIndex - 1 
                            ? 'bg-white border-blue-500 shadow-inner' 
                            : 'bg-[#e3e3e3] hover:bg-white border-transparent hover:border-gray-300'}
                    `}
                >
                    <i className={`fas ${win.icon} text-blue-600`}></i>
                    <span className="truncate">{win.title}</span>
                </div>
            ))}
        </div>

        {/* Tray */}
        <div className="ml-auto flex items-center gap-3 px-2 text-xs text-gray-600 border-l border-gray-300 pl-3">
            <i className="fas fa-chevron-up"></i>
            <i className="fas fa-shield-alt"></i>
            <i className="fas fa-volume-up"></i>
            <i className="fas fa-wifi"></i>
            <div className="flex flex-col items-center leading-none text-right">
                <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                <span>{new Date().toLocaleDateString()}</span>
            </div>
            <div className="w-1 h-8 border-l border-gray-400 ml-1"></div>
        </div>
      </div>

      {/* Exit & Submit Overlay */}
      <div className="absolute top-4 right-4 flex gap-2 z-50">
         <button onClick={checkCompletion} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-lg border border-white flex items-center gap-2">
            <i className="fas fa-check-circle"></i> Submit Lab
         </button>
         <button onClick={onExit} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-lg border border-white">
            Exit
         </button>
      </div>

    </div>
  );
};

// --- Helper Component for Window Frame ---
const Window: React.FC<{ 
    state: WindowState, 
    children: React.ReactNode, 
    onClose: () => void, 
    onMinimize: () => void, 
    onFocus: () => void
}> = ({ state, children, onClose, onMinimize, onFocus }) => {
    
    if (state.isMinimized) return null;

    return (
        <div 
            className="absolute bg-white shadow-2xl border border-gray-400 flex flex-col overflow-hidden animate-popIn"
            style={{ 
                width: state.width || '600px', 
                height: state.height || '400px', 
                top: '50%', left: '50%', 
                transform: 'translate(-50%, -50%)',
                zIndex: state.zIndex 
            }}
            onMouseDown={onFocus}
        >
            {/* Title Bar */}
            <div className="bg-white h-8 flex justify-between items-center px-2 select-none border-b border-gray-200">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                    <i className={`fas ${state.icon} text-blue-500`}></i>
                    {state.title}
                </div>
                <div className="flex gap-0">
                    <button onClick={(e) => { e.stopPropagation(); onMinimize(); }} className="w-10 h-7 hover:bg-gray-200 flex items-center justify-center transition-colors"><i className="fas fa-minus text-xs"></i></button>
                    <button className="w-10 h-7 hover:bg-gray-200 flex items-center justify-center transition-colors"><i className="far fa-square text-xs"></i></button>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-10 h-7 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors"><i className="fas fa-times text-xs"></i></button>
                </div>
            </div>
            {/* Content */}
            <div className="flex-grow overflow-hidden relative">
                {children}
            </div>
        </div>
    );
};

export default WindowsSystemResourcesPBQ;
