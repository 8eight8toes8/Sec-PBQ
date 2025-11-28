
import React, { useState } from 'react';

interface WirelessConfigPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const WirelessConfigPBQ: React.FC<WirelessConfigPBQProps> = ({ onComplete, onExit }) => {
  const [config, setConfig] = useState({
    ssid: 'Corp_Secure_WiFi',
    broadcastSsid: true,
    securityMode: 'WPA2-Personal', // Default to insecure/basic
    encryption: 'TKIP',
    radiusIp: '',
    radiusPort: '1812',
    radiusSecret: '',
    power: 'High'
  });

  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const errors: string[] = [];
    
    // Security Mode Check
    if (config.securityMode !== 'WPA3-Enterprise') {
        if (config.securityMode === 'WPA2-Enterprise') {
            errors.push("WPA2-Enterprise is acceptable, but WPA3-Enterprise provides superior protection (SAE/GCMP) and is preferred for modern deployments.");
        } else if (config.securityMode.includes('Personal') || config.securityMode.includes('PSK')) {
            errors.push("Enterprise environments must use 'Enterprise' (802.1X) modes, not Personal/PSK, to allow for individual user authentication.");
        } else if (config.securityMode === 'WEP' || config.securityMode === 'Open') {
            errors.push("Selected security mode is obsolete or insecure.");
        }
    }

    // Encryption Check
    if (config.encryption === 'TKIP') {
        errors.push("TKIP is deprecated and insecure. Use AES or GCMP.");
    }

    // RADIUS Checks (Only if Enterprise mode is roughly selected)
    if (config.securityMode.includes('Enterprise')) {
        if (!config.radiusIp || config.radiusIp === '0.0.0.0') errors.push("Valid RADIUS Server IP is required for Enterprise authentication.");
        if (config.radiusPort !== '1812') errors.push("Standard RADIUS Authentication port is 1812.");
        if (config.radiusSecret.length < 8) errors.push("RADIUS Shared Secret is too short/weak.");
    }

    // Signal Power (Optional optimization, but typically we want to contain signal)
    if (config.power === 'High') {
        // Not a hard fail usually, but good for feedback
        // errors.push("Warning: High power might bleed signal outside the building. Consider 'Medium'."); 
    }

    // SSID Broadcast
    // Security+ debate: Hiding SSID is "security by obscurity", but often requested. We won't penalize it here to avoid confusion.

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
            <div><h2 className="text-xl font-bold text-gray-900">Wireless Controller</h2><p className="text-xs text-gray-500">Security+ PBQ Simulation</p></div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full"><i className="fas fa-times text-2xl"></i></button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
         <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Router UI Header */}
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <div className="flex items-center gap-2 font-mono text-lg">
                    <i className="fas fa-satellite-dish"></i> ADMIN PANEL v4.2
                </div>
                <div className="text-xs text-gray-400">Firmware: 2024.10.01-Stable</div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Context/Instructions */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-2">Scenario</h3>
                        <p className="text-sm text-blue-800 leading-relaxed">
                            Configure the corporate Wireless Access Point for <strong>maximum security</strong>. 
                        </p>
                        <p className="text-sm text-blue-800 leading-relaxed mt-2">
                            Employees must authenticate using their individual domain credentials (username/password). A centralized AAA server is available at <strong>192.168.10.5</strong>.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="border-b pb-2 mb-4">
                        <h3 className="font-bold text-gray-700">Wireless Settings</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Network Name (SSID)</label>
                            <input 
                                type="text" 
                                value={config.ssid} 
                                onChange={(e) => handleChange('ssid', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    checked={config.broadcastSsid}
                                    onChange={(e) => handleChange('broadcastSsid', e.target.checked)}
                                    className="rounded text-blue-600 focus:ring-blue-500 w-5 h-5"
                                />
                                <span className="text-sm text-gray-700">Broadcast SSID</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Security Mode</label>
                            <select 
                                value={config.securityMode}
                                onChange={(e) => handleChange('securityMode', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="Open">Open (No Security)</option>
                                <option value="WEP">WEP (Legacy)</option>
                                <option value="WPA2-Personal">WPA2-Personal (PSK)</option>
                                <option value="WPA2-Enterprise">WPA2-Enterprise (802.1X)</option>
                                <option value="WPA3-Personal">WPA3-Personal (SAE)</option>
                                <option value="WPA3-Enterprise">WPA3-Enterprise (802.1X)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Encryption</label>
                            <select 
                                value={config.encryption}
                                onChange={(e) => handleChange('encryption', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="TKIP">TKIP</option>
                                <option value="AES">AES-CCMP</option>
                                {config.securityMode.includes('WPA3') && <option value="GCMP">GCMP-256</option>}
                            </select>
                        </div>

                         <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Transmit Power</label>
                            <select 
                                value={config.power}
                                onChange={(e) => handleChange('power', e.target.value)}
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="High">High (100%)</option>
                                <option value="Medium">Medium (50%)</option>
                                <option value="Low">Low (25%)</option>
                            </select>
                        </div>
                    </div>

                    {/* Radius Section - Conditional */}
                    <div className={`transition-all duration-300 overflow-hidden ${isEnterprise ? 'max-h-96 opacity-100' : 'max-h-0 opacity-50'}`}>
                        <div className="border-b pb-2 mb-4 mt-2">
                            <h3 className="font-bold text-gray-700">RADIUS Server Configuration (AAA)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Server IP Address</label>
                                <input 
                                    type="text" 
                                    value={config.radiusIp} 
                                    onChange={(e) => handleChange('radiusIp', e.target.value)}
                                    placeholder="e.g., 192.168.10.5"
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-600 mb-1">Port</label>
                                <input 
                                    type="text" 
                                    value={config.radiusPort} 
                                    onChange={(e) => handleChange('radiusPort', e.target.value)}
                                    placeholder="1812"
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                                />
                            </div>
                             <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-600 mb-1">Shared Secret</label>
                                <input 
                                    type="password" 
                                    value={config.radiusSecret} 
                                    onChange={(e) => handleChange('radiusSecret', e.target.value)}
                                    placeholder="Enter strong secret"
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button 
                            onClick={handleSubmit} 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
         </div>
      </div>

       {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white p-8 rounded-xl max-w-md text-center shadow-2xl">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${success ? 'fa-check' : 'fa-times'} text-2xl`}></i>
                </div>
                <h3 className={`text-xl font-bold mb-4 ${success ? 'text-green-800' : 'text-red-800'}`}>{success ? 'Configuration Valid' : 'Security Vulnerability Detected'}</h3>
                <div className="text-left bg-gray-50 p-4 rounded border border-gray-200 text-sm mb-6 whitespace-pre-line text-gray-700">
                    {feedback}
                </div>
                <button onClick={() => success ? onExit() : setFeedback(null)} className={`px-6 py-2 text-white font-bold rounded shadow-md transition-colors ${success ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'}`}>
                    {success ? 'Return to Dashboard' : 'Modify Settings'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default WirelessConfigPBQ;
