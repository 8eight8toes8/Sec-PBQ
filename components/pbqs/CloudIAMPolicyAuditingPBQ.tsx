
import React, { useState } from 'react';

interface CloudIAMPolicyAuditingPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface PolicyStatement {
  sid: string;
  effect: 'Allow' | 'Deny';
  actions: string[];
  resources: string[];
  risk?: string; // If present, this statement is flawed
}

interface Identity {
  id: string;
  name: string;
  type: 'User' | 'Role' | 'Group';
  icon: string;
  policy: PolicyStatement[];
}

const IDENTITIES: Identity[] = [
  {
    id: 'user_dev',
    name: 'dev_jason',
    type: 'User',
    icon: 'fa-user-astronaut',
    policy: [
      {
        sid: 'AllowS3List',
        effect: 'Allow',
        actions: ['s3:ListAllMyBuckets', 's3:GetBucketLocation'],
        resources: ['*']
      },
      {
        sid: 'AllowDevEC2',
        effect: 'Allow',
        actions: ['ec2:StartInstances', 'ec2:StopInstances'],
        resources: ['arn:aws:ec2:us-east-1:123456789012:instance/*']
      },
      {
        sid: 'DangerousAdmin',
        effect: 'Allow',
        actions: ['*'],
        resources: ['*'],
        risk: 'Critical: Full Administrator Access granted to a developer account.'
      }
    ]
  },
  {
    id: 'role_lambda',
    name: 'lambda_image_resizer',
    type: 'Role',
    icon: 'fa-robot',
    policy: [
      {
        sid: 'AllowS3Read',
        effect: 'Allow',
        actions: ['s3:GetObject'],
        resources: ['arn:aws:s3:::prod-images/*']
      },
      {
        sid: 'AllowLogging',
        effect: 'Allow',
        actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
        resources: ['arn:aws:logs:*:*:*']
      },
      {
        sid: 'OverPermissiveWrite',
        effect: 'Allow',
        actions: ['s3:PutObject', 's3:DeleteObject'],
        resources: ['*'],
        risk: 'High: Lambda can write/delete in ANY bucket, not just target.'
      }
    ]
  },
  {
    id: 'group_audit',
    name: 'audit_team',
    type: 'Group',
    icon: 'fa-users',
    policy: [
      {
        sid: 'ReadOnlyAccess',
        effect: 'Allow',
        actions: ['ec2:Describe*', 's3:List*', 's3:Get*'],
        resources: ['*']
      }
    ]
  }
];

const CloudIAMPolicyAuditingPBQ: React.FC<CloudIAMPolicyAuditingPBQProps> = ({ onComplete, onExit }) => {
  const [selectedId, setSelectedId] = useState<string>('user_dev');
  const [remediatedSids, setRemediatedSids] = useState<string[]>([]);
  const [selectedSid, setSelectedSid] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const activeIdentity = IDENTITIES.find(i => i.id === selectedId);

  const handleRemediate = (sid: string) => {
    setRemediatedSids(prev => [...prev, sid]);
    setSelectedSid(null);
  };

  const handleSubmit = () => {
    // Total risks in the system
    let totalRisks = 0;
    IDENTITIES.forEach(i => i.policy.forEach(p => { if (p.risk) totalRisks++; }));

    // User fixed risks
    const fixedCorrectly = remediatedSids.length; // Simplified: assumes you can only fix risky ones via UI logic

    if (fixedCorrectly === totalRisks) {
      setSuccess(true);
      setFeedback("Audit Complete! You have successfully enforced Least Privilege by removing wildcard admin access and scoping resource permissions.");
      onComplete(100);
    } else {
      setSuccess(false);
      setFeedback(`Audit Incomplete. You fixed ${fixedCorrectly} out of ${totalRisks} critical violations. Review all identities.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-id-card-alt"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Cloud IAM Policy Audit</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-6">
        
        {/* Left: Identity List */}
        <div className="lg:w-1/4 flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Identities</h3>
                </div>
                <div>
                    {IDENTITIES.map(identity => {
                        const riskCount = identity.policy.filter(p => p.risk).length;
                        const fixedCount = identity.policy.filter(p => remediatedSids.includes(p.sid)).length;
                        const isClean = riskCount === fixedCount;

                        return (
                            <button
                                key={identity.id}
                                onClick={() => { setSelectedId(identity.id); setSelectedSid(null); }}
                                className={`w-full text-left px-4 py-4 flex items-center justify-between transition-all border-l-4 ${selectedId === identity.id ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-transparent hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-gray-500 bg-gray-100`}>
                                        <i className={`fas ${identity.icon}`}></i>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm">{identity.name}</div>
                                        <div className="text-xs text-gray-500">{identity.type}</div>
                                    </div>
                                </div>
                                {isClean ? (
                                    <i className="fas fa-check-circle text-green-500"></i>
                                ) : (
                                    <i className="fas fa-exclamation-circle text-red-400 animate-pulse"></i>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-indigo-900 rounded-xl shadow-md p-6 text-white">
                <h4 className="font-bold mb-2 flex items-center gap-2"><i className="fas fa-info-circle"></i> Instructions</h4>
                <p className="text-xs text-indigo-200 leading-relaxed">
                    Review the JSON policy documents for each identity. Identify violations of the <strong>Principle of Least Privilege</strong>.
                    <br/><br/>
                    Look for:
                    <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Wildcard actions (<code>"*"</code>)</li>
                        <li>Wildcard resources (<code>"*"</code>) on sensitive actions</li>
                        <li>Permissions unrelated to job function</li>
                    </ul>
                </p>
            </div>
        </div>

        {/* Right: Policy Editor */}
        <div className="lg:w-3/4 flex flex-col">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 flex-grow flex flex-col overflow-hidden min-h-[500px]">
                <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 font-mono">
                        PolicyDocument: <span className="text-indigo-600">{activeIdentity?.name}_policy.json</span>
                    </h3>
                    <div className="text-xs font-bold px-2 py-1 bg-gray-200 text-gray-600 rounded uppercase">JSON</div>
                </div>

                <div className="flex-grow p-6 bg-slate-50 overflow-y-auto font-mono text-sm">
                    <div className="text-gray-500">{'{'}</div>
                    <div className="pl-4 text-purple-600">"Version": <span className="text-green-600">"2012-10-17"</span>,</div>
                    <div className="pl-4 text-purple-600">"Statement": <span className="text-gray-800">[</span></div>
                    
                    {activeIdentity?.policy.map((stmt, idx) => {
                        const isRemediated = remediatedSids.includes(stmt.sid);
                        const isSelected = selectedSid === stmt.sid;
                        
                        return (
                            <div 
                                key={stmt.sid}
                                onClick={() => setSelectedSid(stmt.sid)}
                                className={`
                                    ml-8 my-2 p-4 rounded border-2 cursor-pointer transition-all relative group
                                    ${isRemediated 
                                        ? 'bg-green-50 border-green-200 opacity-75' 
                                        : isSelected 
                                            ? 'bg-blue-50 border-blue-400 shadow-md ring-1 ring-blue-300' 
                                            : 'bg-white border-gray-200 hover:border-gray-400'
                                    }
                                `}
                            >
                                <div className="text-gray-400 text-xs absolute top-2 right-2">{stmt.sid}</div>
                                {isRemediated && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 font-bold text-green-600">
                                        <i className="fas fa-check mr-2"></i> REMEDIATED
                                    </div>
                                )}
                                
                                <div><span className="text-purple-700">"Effect"</span>: <span className="text-green-600">"{stmt.effect}"</span>,</div>
                                <div>
                                    <span className="text-purple-700">"Action"</span>: [
                                    {stmt.actions.map((a, i) => (
                                        <span key={i} className="text-red-500">"{a}"{i < stmt.actions.length - 1 ? ', ' : ''}</span>
                                    ))}
                                    ],
                                </div>
                                <div>
                                    <span className="text-purple-700">"Resource"</span>: [
                                    {stmt.resources.map((r, i) => (
                                        <span key={i} className="text-blue-600">"{r}"{i < stmt.resources.length - 1 ? ', ' : ''}</span>
                                    ))}
                                    ]
                                </div>
                            </div>
                        );
                    })}

                    <div className="pl-4 text-gray-800">]</div>
                    <div className="text-gray-500">{'}'}</div>
                </div>

                {/* Remediation Panel */}
                {selectedSid && (
                    <div className="p-6 bg-gray-100 border-t border-gray-200 animate-slideUp">
                        {(() => {
                            const stmt = activeIdentity?.policy.find(p => p.sid === selectedSid);
                            if (stmt?.risk) {
                                return (
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h4 className="font-bold text-red-600 mb-1 flex items-center gap-2">
                                                <i className="fas fa-shield-virus"></i> Security Risk Detected
                                            </h4>
                                            <p className="text-sm text-gray-700">{stmt.risk}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleRemediate(stmt.sid)}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform hover:-translate-y-0.5"
                                        >
                                            Fix Violation
                                        </button>
                                    </div>
                                );
                            } else {
                                return (
                                    <div className="flex items-center gap-3 text-green-700">
                                        <i className="fas fa-check-circle text-xl"></i>
                                        <div>
                                            <h4 className="font-bold text-sm">Policy Statement Secure</h4>
                                            <p className="text-xs text-green-600">This statement follows least privilege principles.</p>
                                        </div>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                )}
            </div>

            <div className="mt-4 flex justify-end">
                <button 
                    onClick={handleSubmit} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
                >
                    <i className="fas fa-clipboard-check"></i> Submit Audit Report
                </button>
            </div>
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fas ${success ? 'fa-check' : 'fa-times'} text-3xl`}></i>
                    </div>
                    <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                        {success ? 'Audit Passed' : 'Audit Failed'}
                    </h3>
                </div>
                
                <div className="p-8 text-center">
                    <p className="text-gray-700 text-lg leading-relaxed">{feedback}</p>
                </div>

                <div className="p-6 bg-gray-50 flex justify-center gap-4">
                    {success ? (
                        <button onClick={onExit} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                            Return to Dashboard
                        </button>
                    ) : (
                        <button onClick={() => setFeedback(null)} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                            Continue Auditing
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CloudIAMPolicyAuditingPBQ;
