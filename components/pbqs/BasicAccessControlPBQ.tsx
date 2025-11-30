
import React, { useState, useEffect } from 'react';

interface BasicAccessControlPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

// Types
type Permission = 'Full Control' | 'Modify' | 'Read & Execute' | 'List folder contents' | 'Read' | 'Write';
type Principal = 
  'Administrators' | 
  'SYSTEM' | 
  'Authenticated Users' | 
  'Legal_Team' | 
  'Auditors' | 
  'Contractors' | 
  'HR_Managers' | 
  'Finance_Analysts' | 
  'Temporary_Staff';

interface AccessControlEntry {
  principal: Principal;
  type: 'Allow' | 'Deny';
  permissions: Permission[];
}

interface Folder {
  id: string;
  name: string;
  path: string;
  description: string;
  requirements: string[];
  acl: AccessControlEntry[];
}

const ALL_PERMISSIONS: Permission[] = [
  'Full Control',
  'Modify',
  'Read & Execute',
  'List folder contents',
  'Read',
  'Write'
];

const AVAILABLE_PRINCIPALS: Principal[] = [
  'Administrators', 
  'SYSTEM', 
  'Authenticated Users', 
  'Legal_Team', 
  'Auditors', 
  'Contractors', 
  'HR_Managers', 
  'Finance_Analysts', 
  'Temporary_Staff'
];

// Initial State Data
const INITIAL_FOLDERS: Folder[] = [
  {
    id: 'legal',
    name: 'Legal_Cases',
    path: 'C:\\Data\\Legal_Cases',
    description: 'Confidential legal documents. Only the Legal Team should edit. Auditors need read access. Contractors must be explicitly blocked.',
    requirements: [
        "Legal_Team: Can read, write, and delete files.",
        "Auditors: Can view files but NOT make changes.",
        "Contractors: Must be explicitly DENIED all access (even if they are in other groups)."
    ],
    acl: [
      { principal: 'Administrators', type: 'Allow', permissions: ['Full Control', 'Modify', 'Read & Execute', 'List folder contents', 'Read', 'Write'] },
      { principal: 'SYSTEM', type: 'Allow', permissions: ['Full Control', 'Modify', 'Read & Execute', 'List folder contents', 'Read', 'Write'] },
      { principal: 'Authenticated Users', type: 'Allow', permissions: ['Read & Execute', 'List folder contents', 'Read'] } // Vulnerability: Too broad
    ]
  },
  {
    id: 'software',
    name: 'Software_Installers',
    path: 'C:\\Software\\Installers',
    description: 'Central repository for authorized software. Users need to run installers, but should not be able to delete or modify them to prevent malware injection.',
    requirements: [
        "Authenticated Users: Can run/execute files.",
        "Authenticated Users: Must NOT have Modify or Write permissions.",
        "Administrators: Full Control."
    ],
    acl: [
      { principal: 'Administrators', type: 'Allow', permissions: ['Full Control', 'Modify', 'Read & Execute', 'List folder contents', 'Read', 'Write'] },
      { principal: 'Authenticated Users', type: 'Allow', permissions: ['Modify', 'Read & Execute', 'List folder contents', 'Read', 'Write'] } // Vulnerability: Users can delete files
    ]
  },
  {
    id: 'payroll',
    name: 'Payroll_2024',
    path: 'C:\\Finance\\Payroll_2024',
    description: 'Highly sensitive salary data. Only HR Managers can edit. Finance Analysts can read. Temporary Staff must be blocked.',
    requirements: [
        "HR_Managers: Can edit and delete files.",
        "Finance_Analysts: Read-only access.",
        "Temporary_Staff: Explicit Deny to override any inherited permissions."
    ],
    acl: [
      { principal: 'Administrators', type: 'Allow', permissions: ['Full Control', 'Modify', 'Read & Execute', 'List folder contents', 'Read', 'Write'] },
      { principal: 'SYSTEM', type: 'Allow', permissions: ['Full Control', 'Modify', 'Read & Execute', 'List folder contents', 'Read', 'Write'] },
      { principal: 'HR_Managers', type: 'Allow', permissions: ['Read & Execute', 'List folder contents', 'Read'] } // Missing Modify
    ]
  }
];

const BasicAccessControlPBQ: React.FC<BasicAccessControlPBQProps> = ({ onComplete, onExit }) => {
  const [folders, setFolders] = useState<Folder[]>(JSON.parse(JSON.stringify(INITIAL_FOLDERS)));
  const [selectedFolderId, setSelectedFolderId] = useState<string>('legal');
  const [selectedPrincipal, setSelectedPrincipal] = useState<Principal | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const activeFolder = folders.find(f => f.id === selectedFolderId) || folders[0];
  
  // Find ACL entry for selected principal (Allow by default for selection context)
  const activeEntry = activeFolder.acl.find(entry => entry.principal === selectedPrincipal);

  useEffect(() => {
    if (activeFolder.acl.length > 0) {
      setSelectedPrincipal(activeFolder.acl[0].principal);
    } else {
      setSelectedPrincipal(null);
    }
  }, [selectedFolderId]);

  const handleAddPrincipal = (principal: Principal) => {
    // Check if exists
    if (activeFolder.acl.some(entry => entry.principal === principal)) {
      alert('Principal already exists in ACL.');
      return;
    }

    const updatedFolders = folders.map(f => {
      if (f.id === selectedFolderId) {
        return {
          ...f,
          acl: [...f.acl, { principal, type: 'Allow', permissions: ['Read & Execute', 'List folder contents', 'Read'] as Permission[] }]
        };
      }
      return f;
    });
    
    setFolders(updatedFolders);
    setSelectedPrincipal(principal);
    setIsAddingUser(false);
  };

  const handleRemovePrincipal = () => {
    if (!selectedPrincipal) return;
    
    const updatedFolders = folders.map(f => {
      if (f.id === selectedFolderId) {
        const newACL = f.acl.filter(entry => entry.principal !== selectedPrincipal);
        return { ...f, acl: newACL };
      }
      return f;
    });

    setFolders(updatedFolders);
    const folder = updatedFolders.find(f => f.id === selectedFolderId);
    setSelectedPrincipal(folder && folder.acl.length > 0 ? folder.acl[0].principal : null);
  };

  const togglePermission = (permission: Permission, type: 'Allow' | 'Deny') => {
    if (!selectedPrincipal) return;

    const updatedFolders = folders.map(f => {
      if (f.id === selectedFolderId) {
        // Look for existing entry of this type
        let entryIndex = f.acl.findIndex(e => e.principal === selectedPrincipal && e.type === type);
        
        // If entry doesn't exist for this type (e.g., adding a Deny to a user who only has Allow), create it?
        // For simplicity in this UI, we will toggle the TYPE of the entry if we click the opposite column, OR handle complex multi-entry logic.
        // SIMPLIFICATION: Each principal has ONE entry row. We just change flags. 
        // If user clicks Deny, we treat it as switching that specific permission to Deny state or adding a Deny entry?
        // Real Windows ACLs can have multiple ACEs.
        // Let's stick to: A principal is displayed. We toggled flags.
        // If 'Deny' is checked, 'Allow' is unchecked for that perm.
        
        // We need to manage the ACE list better. 
        // Let's assume one ACE object per principal in our state for simplicity, but it stores allow/deny status per permission? 
        // No, Windows UI shows "Allow" and "Deny" columns for a selected principal.
        
        // Let's check if we have an entry.
        const entry = f.acl.find(e => e.principal === selectedPrincipal);
        if (!entry) return f;

        const newPermissions = new Set(entry.permissions);
        
        // Logic for Allow Checkbox
        if (type === 'Allow') {
            if (entry.type === 'Deny') {
                // Switching entire entry type or just this perm?
                // Real Windows: Allow and Deny are separate ACEs.
                // PBQ Simplification: The UI represents the "Effective" setting we want to apply.
                // Let's just track if the user wants this Principal to generally ALLOW or DENY specific things.
                // To keep it simple: If they click Deny on 'Full Control', the whole entry becomes Deny type for that perm?
                
                // Redesign: The ACL array in state should support multiple ACEs, but the UI selects a Principal.
                // If we want to simulate the "Edit Permissions" dialog:
                // It shows a list of permissions with Allow/Deny checkboxes.
                
                // Let's just assume we update the existing entry.
                // If the user clicks "Deny", we mark the entry as Deny type? Or do we need mixed?
                // Requirement 1 needs "Explicit Deny".
                
                // Solution: We will store `type` on the ACE. 
                // If user clicks a Deny box, we verify if the ACE is 'Allow'. If so, we might need to flip it or warn.
                // Actually, easiest way: Just allow toggling. If ANY Deny box is checked, the ACE becomes a DENY ACE (simulating an explicit deny rule placed at top).
                // If Allow boxes are checked, it's an Allow ACE.
                // This prevents mixed Allow/Deny on single line which is valid but confusing for this level.
            }
        }
        
        // Let's Try:
        // Clicking Allow[Perm]: Adds Perm to list, sets type to Allow.
        // Clicking Deny[Perm]: Adds Perm to list, sets type to Deny.
        // Unclicking: Removes from list.
        
        if (type !== entry.type) {
            // User is switching columns. Clear permissions and switch type to start fresh for this perm?
            // Or just switch the type of the whole ACE?
            // Let's switch the whole ACE type to match the column clicked for simplicity.
            // If I click Deny Full Control, the user is now DENIED Full Control.
            return {
                ...f,
                acl: f.acl.map(e => e.principal === selectedPrincipal ? { ...e, type: type, permissions: [permission] } : e)
            };
        } else {
            // Same type, toggle permission in list
            if (newPermissions.has(permission)) {
                newPermissions.delete(permission);
                // Cascading removal
                if (permission === 'Read') newPermissions.clear();
                if (permission === 'Read & Execute') { newPermissions.delete('Modify'); newPermissions.delete('Full Control'); }
                if (permission === 'Modify') newPermissions.delete('Full Control');
            } else {
                newPermissions.add(permission);
                // Cascading add
                if (permission === 'Full Control') ALL_PERMISSIONS.forEach(p => newPermissions.add(p));
                if (permission === 'Modify') ['Read & Execute', 'List folder contents', 'Read', 'Write'].forEach(p => newPermissions.add(p));
                if (permission === 'Read & Execute') ['List folder contents', 'Read'].forEach(p => newPermissions.add(p));
            }
            
            return {
                ...f,
                acl: f.acl.map(e => e.principal === selectedPrincipal ? { ...e, permissions: Array.from(newPermissions) } : e)
            };
        }
      }
      return f;
    });

    setFolders(updatedFolders);
  };

  const handleSubmit = () => {
    const errors: string[] = [];
    
    // 1. Legal Cases Validation
    const legal = folders.find(f => f.id === 'legal')!;
    
    // Legal_Team: Modify (Allow)
    const legalTeam = legal.acl.find(a => a.principal === 'Legal_Team');
    if (!legalTeam) errors.push("Legal_Cases: 'Legal_Team' is missing.");
    else if (legalTeam.type === 'Deny' || !legalTeam.permissions.includes('Modify')) errors.push("Legal_Cases: 'Legal_Team' needs Modify access.");

    // Auditors: Read (Allow), No Write
    const auditors = legal.acl.find(a => a.principal === 'Auditors');
    if (!auditors) errors.push("Legal_Cases: 'Auditors' group is missing.");
    else if (auditors.permissions.includes('Modify') || auditors.permissions.includes('Write')) errors.push("Legal_Cases: 'Auditors' should NOT have Write/Modify access.");
    else if (!auditors.permissions.includes('Read')) errors.push("Legal_Cases: 'Auditors' need Read access.");

    // Contractors: Explicit Deny
    const contractors = legal.acl.find(a => a.principal === 'Contractors');
    if (!contractors || contractors.type !== 'Deny') errors.push("Legal_Cases: 'Contractors' must be explicitly DENIED access.");

    // Authenticated Users: Should be removed
    if (legal.acl.find(a => a.principal === 'Authenticated Users')) errors.push("Legal_Cases: Remove generic 'Authenticated Users' group to ensure confidentiality.");


    // 2. Software Installers Validation
    const soft = folders.find(f => f.id === 'software')!;
    
    // Auth Users: Read & Exec ONLY
    const authUsers = soft.acl.find(a => a.principal === 'Authenticated Users');
    if (!authUsers) errors.push("Software: 'Authenticated Users' group is missing.");
    else {
        if (!authUsers.permissions.includes('Read & Execute')) errors.push("Software: Users must be able to execute installers.");
        if (authUsers.permissions.includes('Modify') || authUsers.permissions.includes('Write')) errors.push("Software: Users must NOT have Write/Modify permissions (Integrity Risk).");
    }


    // 3. Payroll Validation
    const payroll = folders.find(f => f.id === 'payroll')!;
    
    // HR Managers: Modify
    const hr = payroll.acl.find(a => a.principal === 'HR_Managers');
    if (!hr || !hr.permissions.includes('Modify')) errors.push("Payroll: HR_Managers need Modify access.");

    // Finance Analysts: Read
    const fin = payroll.acl.find(a => a.principal === 'Finance_Analysts');
    if (!fin) errors.push("Payroll: Finance_Analysts group missing.");
    else if (fin.permissions.includes('Write')) errors.push("Payroll: Finance_Analysts should be Read-Only.");

    // Temp Staff: Deny
    const temp = payroll.acl.find(a => a.principal === 'Temporary_Staff');
    if (!temp || temp.type !== 'Deny') errors.push("Payroll: Temporary_Staff must be explicitly DENIED.");


    if (errors.length === 0) {
      setSuccess(true);
      setFeedback("Configuration Validated!\n\n• Confidentiality preserved for Legal/Payroll.\n• Integrity enforced for Software.\n• Least Privilege and Explicit Deny rules applied correctly.");
      onComplete(100);
    } else {
      setSuccess(false);
      setFeedback(errors.map(e => "• " + e).join("\n"));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-user-lock"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Access Control & NTFS Permissions</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-180px)] min-h-[600px]">
          
          {/* Left Column: Folder Tree */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <i className="fas fa-server text-blue-500"></i> Corporate File Server
                </h3>
            </div>
            <div className="p-2 space-y-1 overflow-y-auto flex-grow bg-slate-50">
                {folders.map(folder => (
                    <button
                        key={folder.id}
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedFolderId === folder.id ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'hover:bg-white border border-transparent'}`}
                    >
                        <i className={`fas ${folder.id === 'legal' ? 'fa-briefcase' : folder.id === 'software' ? 'fa-compact-disc' : 'fa-file-invoice-dollar'} ${selectedFolderId === folder.id ? 'text-blue-600' : 'text-gray-400'}`}></i>
                        <div>
                            <div className="font-bold text-sm">{folder.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{folder.path}</div>
                        </div>
                    </button>
                ))}
            </div>
            <div className="p-5 border-t border-gray-100 bg-yellow-50 rounded-b-xl">
                <h4 className="text-xs font-bold text-yellow-800 uppercase tracking-wide mb-2"><i className="fas fa-clipboard-list"></i> Security Requirements</h4>
                <ul className="text-xs text-yellow-900 space-y-2 list-disc pl-4">
                    {activeFolder.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                    ))}
                </ul>
            </div>
          </div>

          {/* Right Column: Permissions Dialog */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
             {/* Dialog Header */}
             <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">Advanced Security Settings for {activeFolder.name}</h3>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <i className="fas fa-shield-alt text-gray-500"></i>
                </div>
             </div>

             {/* Principals List */}
             <div className="p-6 border-b border-gray-200 flex-grow flex flex-col">
                <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Permission Entries:</label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsAddingUser(true)}
                            className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-gray-700 hover:bg-gray-50"
                        >
                            Add
                        </button>
                        <button 
                            onClick={handleRemovePrincipal}
                            disabled={!selectedPrincipal}
                            className="px-3 py-1 bg-white border border-gray-300 rounded text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                            Remove
                        </button>
                    </div>
                </div>
                
                <div className="border border-gray-300 rounded-lg overflow-hidden flex-grow relative">
                    <div className="bg-gray-100 border-b border-gray-200 flex text-xs font-bold text-gray-600 py-2 px-4">
                        <div className="flex-grow">Principal</div>
                        <div className="w-24">Type</div>
                        <div className="w-32">Access</div>
                    </div>
                    <div className="overflow-y-auto h-48 bg-white">
                        {activeFolder.acl.map(entry => (
                            <div 
                                key={entry.principal}
                                onClick={() => setSelectedPrincipal(entry.principal)}
                                className={`flex items-center px-4 py-2 border-b border-gray-100 cursor-pointer text-sm ${selectedPrincipal === entry.principal ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-gray-700'}`}
                            >
                                <div className="flex-grow flex items-center gap-2">
                                    <i className={`fas fa-user${['Administrators','HR_Managers','Legal_Team','Finance_Analysts'].includes(entry.principal) ? '-tie' : ''} ${selectedPrincipal === entry.principal ? 'text-blue-200' : 'text-gray-400'}`}></i>
                                    {entry.principal}
                                </div>
                                <div className="w-24 font-mono text-xs">{entry.type}</div>
                                <div className="w-32 text-xs truncate">
                                    {entry.permissions.includes('Full Control') ? 'Full Control' : entry.permissions.includes('Modify') ? 'Modify' : entry.permissions.includes('Read') ? 'Read' : 'Special'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add User Modal Overlay */}
                    {isAddingUser && (
                        <div className="absolute inset-0 bg-white/95 z-20 flex flex-col p-4 animate-fadeIn">
                            <h4 className="font-bold text-gray-800 mb-3 text-sm">Select User, Computer, Service Account, or Group</h4>
                            <div className="flex-grow overflow-y-auto border border-gray-300 rounded mb-3">
                                {AVAILABLE_PRINCIPALS.map(p => (
                                    <button 
                                        key={p}
                                        onClick={() => handleAddPrincipal(p)}
                                        disabled={activeFolder.acl.some(a => a.principal === p)}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 disabled:opacity-40 disabled:hover:bg-white border-b border-gray-100 last:border-0"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setIsAddingUser(false)} className="w-full py-2 bg-gray-200 text-sm font-bold rounded hover:bg-gray-300">Cancel</button>
                        </div>
                    )}
                </div>
             </div>

             {/* Permissions Checkboxes */}
             <div className="p-6 bg-gray-50 flex-grow flex flex-col">
                <p className="text-sm text-gray-600 mb-3 font-medium">
                    Permissions for <span className="font-bold text-gray-900">{selectedPrincipal || '...'}</span>
                </p>
                <div className="border border-gray-300 bg-white flex-grow overflow-hidden flex flex-col rounded-lg shadow-sm">
                    <div className="flex border-b border-gray-200 bg-gray-100">
                        <div className="flex-grow px-4 py-2 text-xs font-bold text-gray-600">Permission</div>
                        <div className="w-16 text-center px-2 py-2 text-xs font-bold text-gray-600 border-l border-gray-200">Allow</div>
                        <div className="w-16 text-center px-2 py-2 text-xs font-bold text-gray-600 border-l border-gray-200">Deny</div>
                    </div>
                    <div className="overflow-y-auto">
                        {ALL_PERMISSIONS.map(permission => {
                            const isAllowed = activeEntry?.type === 'Allow' && activeEntry.permissions.includes(permission);
                            const isDenied = activeEntry?.type === 'Deny' && activeEntry.permissions.includes(permission);
                            const isDisabled = !selectedPrincipal;
                            
                            return (
                                <div key={permission} className="flex items-center border-b border-gray-100 last:border-0 hover:bg-blue-50 h-9 group">
                                    <div className="flex-grow px-4 text-sm text-gray-700">{permission}</div>
                                    
                                    {/* Allow Checkbox */}
                                    <div className="w-16 flex justify-center items-center border-l border-gray-100 h-full bg-white group-hover:bg-blue-50/50">
                                        <input 
                                            type="checkbox" 
                                            checked={isAllowed || false} 
                                            onChange={() => togglePermission(permission, 'Allow')}
                                            disabled={isDisabled}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    
                                    {/* Deny Checkbox */}
                                    <div className="w-16 flex justify-center items-center border-l border-gray-100 h-full bg-white group-hover:bg-blue-50/50">
                                        <input 
                                            type="checkbox"
                                            checked={isDenied || false}
                                            onChange={() => togglePermission(permission, 'Deny')}
                                            disabled={isDisabled}
                                            className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4 cursor-pointer disabled:cursor-not-allowed accent-red-600" 
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
             </div>

             {/* Footer */}
             <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-end gap-3">
                <button 
                    onClick={handleSubmit} 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-8 rounded shadow-sm transition-all transform hover:-translate-y-0.5"
                >
                    Apply & Verify
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all scale-100">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <i className={`fas ${success ? 'fa-check-double' : 'fa-exclamation-triangle'} text-3xl`}></i>
                    </div>
                    <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                        {success ? 'Permissions Secured!' : 'Security Audit Failed'}
                    </h3>
                </div>
                
                <div className="p-8">
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
                            Review Settings
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BasicAccessControlPBQ;
