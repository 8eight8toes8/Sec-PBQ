
import React, { useState } from 'react';

interface WirelessConfigPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const WirelessConfigPBQ: React.FC<WirelessConfigPBQProps> = ({ onComplete, onExit }) => {
  const [config, setConfig] = useState({
    ssid: 'Corp_Secure_WiFi',
    broadcastSsid: true,
    securityMode: 'WPA2-Personal (PSK)',
    encryption: 'TKIP (Legacy)',
    radiusIp: '',
    radiusPort: '1812',
    radiusSecret: '',
    power: 'High (100%)'
  });

  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const errors: string[] = [];
    
    // Security Mode Check
    if (config.securityMode !== 'WPA3-Enterprise (802.1X)') {
         if (config.securityMode.includes('Enterprise') && config.securityMode.includes('WPA2')) {
            errors.push("WPA2-Enterprise is acceptable, but WPA3-Enterprise provides superior protection (SAE/GCMP) and is preferred.");
        } else if (config.securityMode.includes('Personal') || config.securityMode.includes('PSK')) {
            errors.push("Enterprise environments must use 'Enterprise' (802.1X) modes, not Personal/PSK.");
        } else if (config.securityMode.includes('WEP') || config.securityMode.includes('Open')) {
            errors.push("Selected security mode is obsolete or insecure.");
        }
    }

    // Encryption Check
    if (config.encryption.includes('TKIP')) {
        errors.push("TKIP is deprecated and insecure. Use AES or GCMP.");
    }

    // RADIUS Checks
    if (config.securityMode.includes('Enterprise')) {
        if (!config.radiusIp || config.radiusIp === '0.0.0.0') errors.push("Valid RADIUS Server IP is required for Enterprise authentication.");
        if (config.radiusPort !== '1812') errors.push("Standard RADIUS Authentication port is 1812.");
        if (config.radiusSecret.length < 8) errors.push("RADIUS Shared Secret is too short/weak.");
    }

    if (errors.length === 0) {
        setSuccess(true);
        setFeedback("Configuration Secured! \n\n• WPA3-Enterprise enforces 802.1X authentication.\n• AES/GCMP ensures strong encryption.\n• RADIUS settings are correctly defined.");
        onComplete(100);
    } else {
        setSuccess(false);
        setFeedback(errors.map(e => "• " + e).join("\n"));
    }
  };

  const isEnterprise = config.securityMode.includes('Enterprise');

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm"><i className="fas fa-wifi"></i></div>
            <div><h2 className="text-xl font-bold text-gray-900">Wireless Access Point Controller</h2><p className="text-xs text-gray-500">Security+ PBQ Simulation</p></div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all"><i className="fas fa-times text-2xl"></i></button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
         <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
            
            {/* Left Sidebar: Instructions */}
            <div className="bg-gray-50 border-r border-gray-200 p-8 lg:w-1/3 w-full flex flex-col gap-6">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-3 flex items-center gap-2">
                        <i className="fas fa-clipboard-list text-blue-600"></i> Configuration Task
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4 text-sm">
                        Configure the corporate Wireless Access Point (WAP) for <strong>maximum security</strong> standards.
                    </p>
                </div>

                <div className="bg-blue-50/80 p-5 rounded-xl border border-blue-100 shadow-sm">
                    <strong className="block mb-3 text-blue-800 text-sm uppercase tracking-wide">Requirements</strong>
                    <ul className="space-y-3 text-sm text-blue-900">
                        <li className="flex items-start gap-2">
                            <i className="fas fa-check-circle mt-1 text-blue-500"></i>
                            <span>Employees must use <strong>individual domain credentials</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <i className="fas fa-ban mt-1 text-red-400"></i>
                            <span>Legacy protocols (WEP, TKIP) are strictly prohibited.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <i className="fas fa-server mt-1 text-blue-500"></i>
                            <span>Centralized authentication via RADIUS at <strong>192.168.10.5</strong>.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Content: Admin Panel */}
            <div className="lg:w-2/3 w-full bg-gray-100/50">
                {/* Router Header Style */}
                <div className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-3 font-mono">
                        <i className="fas fa-broadcast-tower text-green-400 text-xl animate-pulse"></i> 
                        <div>
                            <div className="font-bold tracking-wider">ADMIN PANEL</div>
                            <div className="text-[10px] text-slate-400">FIRMWARE v4.2.1-stable</div>
                        </div>
                    </div>
                    <div className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 font-bold">
                        SYSTEM ONLINE
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    
                    {/* Wireless Settings Group */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">
                            Basic Wireless Settings
                        </h4>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Network Name (SSID)</label>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input 
                                        type="text" 
                                        value={config.ssid} 
                                        onChange={(e) => handleChange('ssid', e.target.value)}
                                        className="flex-grow p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium transition-all shadow-inner" 
                                    />
                                    <label className="flex items-center gap-3 cursor-pointer select-none px-4 py-2 rounded-lg border border-transparent hover:bg-gray-100 transition-colors">
                                        <input 
                                            type="checkbox" 
                                            checked={config.broadcastSsid}
                                            onChange={(e) => handleChange('broadcastSsid', e.target.checked)}
                                            className="rounded text-blue-600 focus:ring-blue-500 w-5 h-5 border-gray-300"
                                        />
                                        <span className="text-sm text-gray-700 font-medium">Broadcast SSID</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings Group */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">
                            Security Configuration
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Security Mode</label>
                                <div className="relative">
                                    <select 
                                        value={config.securityMode}
                                        onChange={(e) => handleChange('securityMode', e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium text-gray-800 shadow-sm hover:border-blue-400 transition-colors cursor-pointer"
                                    >
                                        <option value="Open">Open (Unsecured)</option>
                                        <option value="WEP">WEP (Legacy)</option>
                                        <option value="WPA2-Personal (PSK)">WPA2-Personal (PSK)</option>
                                        <option value="WPA2-Enterprise (802.1X)">WPA2-Enterprise (802.1X)</option>
                                        <option value="WPA3-Personal (SAE)">WPA3-Personal (SAE)</option>
                                        <option value="WPA3-Enterprise (802.1X)">WPA3-Enterprise (802.1X)</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <i className="fas fa-chevron-down text-xs"></i>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Encryption Algorithm</label>
                                <div className="relative">
                                    <select 
                                        value={config.encryption}
                                        onChange={(e) => handleChange('encryption', e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium text-gray-800 shadow-sm hover:border-blue-400 transition-colors cursor-pointer"
                                    >
                                        <option value="TKIP (Legacy)">TKIP (Legacy)</option>
                                        <option value="AES-CCMP">AES-CCMP</option>
                                        {config.securityMode.includes('WPA3') && <option value="GCMP-256">GCMP-256</option>}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <i className="fas fa-chevron-down text-xs"></i>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Transmit Power</label>
                                <div className="relative">
                                    <select 
                                        value={config.power}
                                        onChange={(e) => handleChange('power', e.target.value)}
                                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-medium text-gray-800 shadow-sm hover:border-blue-400 transition-colors cursor-pointer"
                                    >
                                        <option value="High (100%)">High (100%)</option>
                                        <option value="Medium (50%)">Medium (50%)</option>
                                        <option value="Low (25%)">Low (25%)</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                                        <i className="fas fa-signal text-xs"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enterprise AAA (Conditional) */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isEnterprise ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <i className="fas fa-server text-9xl text-indigo-900"></i>
                            </div>
                            
                            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-6 flex items-center gap-2 relative z-10">
                                <span className="bg-indigo-200 p-1 rounded"><i className="fas fa-key"></i></span> RADIUS / AAA Configuration
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
                                <div className="md:col-span-8">
                                    <label className="block text-xs font-bold text-indigo-900 uppercase mb-1.5">Server IP Address</label>
                                    <input 
                                        type="text" 
                                        value={config.radiusIp} 
                                        onChange={(e) => handleChange('radiusIp', e.target.value)}
                                        placeholder="192.168.x.x"
                                        className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm bg-white shadow-sm" 
                                    />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-xs font-bold text-indigo-900 uppercase mb-1.5">Auth Port</label>
                                    <input 
                                        type="text" 
                                        value={config.radiusPort} 
                                        onChange={(e) => handleChange('radiusPort', e.target.value)}
                                        placeholder="1812"
                                        className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm bg-white shadow-sm" 
                                    />
                                </div>
                                <div className="md:col-span-12">
                                    <label className="block text-xs font-bold text-indigo-900 uppercase mb-1.5">Shared Secret</label>
                                    <input 
                                        type="password" 
                                        value={config.radiusSecret} 
                                        onChange={(e) => handleChange('radiusSecret', e.target.value)}
                                        placeholder="Enter RADIUS Secret..."
                                        className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm bg-white shadow-sm" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button 
                            onClick={handleSubmit} 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-10 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-3"
                        >
                            <i className="fas fa-save"></i> Save Configuration
                        </button>
                    </div>
                </div>
            </div>
         </div>
      </div>

       {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white p-8 rounded-2xl max-w-md w-full text-center shadow-2xl transform transition-all scale-100 border border-gray-100">
                <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${success ? 'fa-shield-check' : 'fa-exclamation-triangle'} text-4xl`}></i>
                </div>
                
                <h3 className={`text-2xl font-bold mb-2 ${success ? 'text-gray-800' : 'text-gray-800'}`}>
                    {success ? 'Configuration Applied' : 'Security Audit Failed'}
                </h3>
                
                <div className={`text-left p-5 rounded-xl border text-sm mb-8 whitespace-pre-line leading-relaxed ${success ? 'bg-green-50 border-green-100 text-green-900' : 'bg-red-50 border-red-100 text-red-900'}`}>
                    {feedback}
                </div>
                
                <button 
                    onClick={() => success ? onExit() : setFeedback(null)} 
                    className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${success ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' : 'bg-gray-800 hover:bg-gray-900 shadow-gray-500/30'}`}
                >
                    {success ? <>Return to Dashboard <i className="fas fa-arrow-right"></i></> : <>Review Settings <i className="fas fa-wrench"></i></>}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default WirelessConfigPBQ;
