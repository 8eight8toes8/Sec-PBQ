
import React, { useState, useEffect } from 'react';

interface BasicAccessControlPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

// Types
type Permission = 'Full Control' | 'Modify' | 'Read & Execute' | 'List folder contents' | 'Read' | 'Write';
type Principal = 'Administrators' | 'HR_Staff' | 'Everyone';

interface AccessControlEntry {
  principal: Principal;
  permissions: Permission[];
}

interface Folder {
  id: string;
  name: string;
  path: string;
  description: string;
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

const AVAILABLE_PRINCIPALS: Principal[] = ['Administrators', 'HR_Staff', 'Everyone'];

// Initial State Data
const INITIAL_FOLDERS: Folder[] = [
  {
    id: 'hr',
    name: 'HR_Confidential',
    path: 'C:\\Data\\HR_Confidential',
    description: 'Contains sensitive employee records. Only HR Staff should be able to edit. Administrators need full access. No one else should have access.',
    acl: [
      { principal: 'Administrators', permissions: ['Full Control', 'Modify', 'Read & Execute', 'List folder contents', 'Read', 'Write'] },
      { principal: 'Everyone', permissions: ['Read & Execute', 'List folder contents', 'Read'] } // Vulnerability to fix
    ]
  },
  {
    id: 'public',
    name: 'Public_Share',
    path: 'C:\\Data\\Public_Share',
    description: 'Collaboration folder. Everyone in the company should be able to read, write, and delete files. Administrators need full access.',
    acl: [
      { principal: 'Administrators', permissions: ['Full Control', 'Modify', 'Read & Execute', 'List folder contents', 'Read', 'Write'] },
      { principal: 'Everyone', permissions: ['Read & Execute', 'List folder contents', 'Read'] } // Missing Write/Modify
    ]
  },
  {
    id: 'policies',
    name: 'Company_Policies',
    path: 'C:\\Data\\Company_Policies',
    description: 'Read-only reference documents. Everyone should be able to read, but only Administrators should be able to change files.',
    acl: [
      { principal: 'Administrators', permissions: ['Full Control', 'Modify', 'Read & Execute', 'List folder contents', 'Read', 'Write'] },
      { principal: 'Everyone', permissions: ['Full Control', 'Modify', 'Read & Execute', 'List folder contents', 'Read', 'Write'] } // Vulnerability: Everyone has Full Control
    ]
  }
];

const BasicAccessControlPBQ: React.FC<BasicAccessControlPBQProps> = ({ onComplete, onExit }) => {
  const [folders, setFolders] = useState<Folder[]>(JSON.parse(JSON.stringify(INITIAL_FOLDERS)));
  const [selectedFolderId, setSelectedFolderId] = useState<string>('hr');
  const [selectedPrincipal, setSelectedPrincipal] = useState<Principal | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const activeFolder = folders.find(f => f.id === selectedFolderId) || folders[0];
  const activeACL = activeFolder.acl.find(entry => entry.principal === selectedPrincipal);

  // Auto-select first principal when folder changes
  useEffect(() => {
    if (activeFolder.acl.length > 0) {
      setSelectedPrincipal(activeFolder.acl[0].principal);
    } else {
      setSelectedPrincipal(null);
    }
  }, [selectedFolderId]); // Only run when folder ID changes

  const handleAddPrincipal = (principal: Principal) => {
    if (activeFolder.acl.some(entry => entry.principal === principal)) {
      alert('User/Group already exists in ACL.');
      return;
    }

    const updatedFolders = folders.map(f => {
      if (f.id === selectedFolderId) {
        return {
          ...f,
          acl: [...f.acl, { principal, permissions: ['Read & Execute', 'List folder contents', 'Read'] as Permission[] }]
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
    // Select another principal if available
    const folder = updatedFolders.find(f => f.id === selectedFolderId);
    setSelectedPrincipal(folder && folder.acl.length > 0 ? folder.acl[0].principal : null);
  };

  const togglePermission = (permission: Permission) => {
    if (!selectedPrincipal || !activeACL) return;

    const currentPerms = new Set(activeACL.permissions);
    const hasPerm = currentPerms.has(permission);

    if (hasPerm) {
      // Unchecking
      currentPerms.delete(permission);
      // Logic: Unchecking Read implies unchecking everything that relies on it
      if (permission === 'Read') {
         currentPerms.clear(); // Removing Read removes all access usually
      }
      if (permission === 'Read & Execute') {
         currentPerms.delete('Modify');
         currentPerms.delete('Full Control');
      }
       if (permission === 'Write') {
         currentPerms.delete('Modify');
         currentPerms.delete('Full Control');
      }
      if (permission === 'Modify') {
          currentPerms.delete('Full Control');
      }
    } else {
      // Checking
      currentPerms.add(permission);
      // Cascading logic
      if (permission === 'Full Control') {
        ALL_PERMISSIONS.forEach(p => currentPerms.add(p));
      }
      if (permission === 'Modify') {
        (['Read & Execute', 'List folder contents', 'Read', 'Write'] as Permission[]).forEach(p => currentPerms.add(p));
      }
      if (permission === 'Read & Execute') {
         (['List folder contents', 'Read'] as Permission[]).forEach(p => currentPerms.add(p));
      }
      if (permission === 'List folder contents') {
        currentPerms.add('Read'); // Usually goes together
      }
    }

    const updatedFolders = folders.map(f => {
      if (f.id === selectedFolderId) {
        return {
          ...f,
          acl: f.acl.map(entry => 
            entry.principal === selectedPrincipal 
              ? { ...entry, permissions: Array.from(currentPerms) as Permission[] }
              : entry
          )
        };
      }
      return f;
    });

    setFolders(updatedFolders);
  };

  const handleSubmit = () => {
    let errors: string[] = [];
    
    // Validation Logic
    const hrFolder = folders.find(f => f.id === 'hr')!;
    const publicFolder = folders.find(f => f.id === 'public')!;
    const policiesFolder = folders.find(f => f.id === 'policies')!;

    // 1. HR Folder Checks
    // Admins: Full Control
    const hrAdmin = hrFolder.acl.find(a => a.principal === 'Administrators');
    if (!hrAdmin || !hrAdmin.permissions.includes('Full Control')) errors.push("HR_Confidential: Administrators should have Full Control.");
    
    // HR_Staff: Modify
    const hrStaff = hrFolder.acl.find(a => a.principal === 'HR_Staff');
    if (!hrStaff) {
        errors.push("HR_Confidential: HR_Staff group is missing.");
    } else if (!hrStaff.permissions.includes('Modify')) {
        errors.push("HR_Confidential: HR_Staff should have Modify access.");
    }

    // Everyone: Removed
    const hrEveryone = hrFolder.acl.find(a => a.principal === 'Everyone');
    if (hrEveryone) errors.push("HR_Confidential: 'Everyone' group should be removed to ensure confidentiality.");


    // 2. Public Folder Checks
    // Admins: Full Control
    const pubAdmin = publicFolder.acl.find(a => a.principal === 'Administrators');
    if (!pubAdmin || !pubAdmin.permissions.includes('Full Control')) errors.push("Public_Share: Administrators should have Full Control.");

    // Everyone: Modify
    const pubEveryone = publicFolder.acl.find(a => a.principal === 'Everyone');
    if (!pubEveryone) {
        errors.push("Public_Share: 'Everyone' group is missing.");
    } else if (!pubEveryone.permissions.includes('Modify')) {
        errors.push("Public_Share: 'Everyone' needs Modify access (Read + Write).");
    }


    // 3. Policies Folder Checks
    // Admins: Full Control
    const polAdmin = policiesFolder.acl.find(a => a.principal === 'Administrators');
    if (!polAdmin || !polAdmin.permissions.includes('Full Control')) errors.push("Company_Policies: Administrators should have Full Control.");

    // Everyone: Read & Execute ONLY (No Write, No Modify)
    const polEveryone = policiesFolder.acl.find(a => a.principal === 'Everyone');
    if (!polEveryone) {
        errors.push("Company_Policies: 'Everyone' group is missing.");
    } else {
        if (!polEveryone.permissions.includes('Read & Execute')) errors.push("Company_Policies: 'Everyone' must be able to Read.");
        if (polEveryone.permissions.includes('Write') || polEveryone.permissions.includes('Modify')) errors.push("Company_Policies: 'Everyone' should NOT have Write/Modify access.");
    }

    if (errors.length === 0) {
      setSuccess(true);
      setFeedback("Outstanding! You have correctly applied the Principle of Least Privilege. \n\n• HR Data is restricted to HR.\n• Public shares are collaborative.\n• Policies are protected from unauthorized changes.");
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
            <h2 className="text-xl font-bold text-gray-900">Basic Access Control Setup</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-180px)] min-h-[600px]">
          
          {/* Left Column: Folder Tree */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <i className="fas fa-folder-tree text-yellow-500"></i> File System
                </h3>
            </div>
            <div className="p-2 space-y-1 overflow-y-auto flex-grow">
                {folders.map(folder => (
                    <button
                        key={folder.id}
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${selectedFolderId === folder.id ? 'bg-blue-50 border-blue-200 text-blue-700 border' : 'hover:bg-gray-50 border border-transparent'}`}
                    >
                        <i className={`fas fa-folder ${selectedFolderId === folder.id ? 'text-yellow-500' : 'text-yellow-400'}`}></i>
                        <span className="font-medium text-sm">{folder.name}</span>
                    </button>
                ))}
            </div>
            <div className="p-4 border-t border-gray-100 bg-yellow-50 rounded-b-xl">
                <p className="text-xs text-yellow-800 leading-relaxed">
                    <strong>Objective:</strong><br/>
                    {activeFolder.description}
                </p>
            </div>
          </div>

          {/* Right Column: Permissions Dialog */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
             {/* Dialog Header */}
             <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">Permissions for {activeFolder.name}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1">{activeFolder.path}</p>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <i className="fas fa-shield-alt text-gray-500"></i>
                </div>
             </div>

             {/* Principals List */}
             <div className="p-4 border-b border-gray-200 flex-grow flex flex-col">
                <p className="text-sm text-gray-600 mb-2">Group or user names:</p>
                <div className="border border-gray-300 bg-white h-32 overflow-y-auto mb-2">
                    {activeFolder.acl.map(entry => (
                        <div 
                            key={entry.principal}
                            onClick={() => setSelectedPrincipal(entry.principal)}
                            className={`flex items-center gap-2 px-3 py-1 cursor-pointer text-sm ${selectedPrincipal === entry.principal ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
                        >
                            <i className={`fas ${entry.principal === 'Administrators' ? 'fa-users-cog' : entry.principal === 'Everyone' ? 'fa-globe' : 'fa-users'} text-xs ${selectedPrincipal === entry.principal ? 'text-white' : 'text-gray-400'}`}></i>
                            {entry.principal}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsAddingUser(true)}
                        className="px-4 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm text-gray-700 font-medium transition-colors"
                    >
                        Add...
                    </button>
                    <button 
                        onClick={handleRemovePrincipal}
                        disabled={!selectedPrincipal}
                        className="px-4 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-sm text-gray-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Remove
                    </button>
                </div>

                {/* Add User Modal */}
                {isAddingUser && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-20">
                        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-300 w-64 animate-fadeIn">
                            <h4 className="font-bold text-sm mb-3">Select User or Group</h4>
                            <div className="space-y-1 mb-4">
                                {AVAILABLE_PRINCIPALS.map(p => (
                                    <button 
                                        key={p}
                                        onClick={() => handleAddPrincipal(p)}
                                        disabled={activeFolder.acl.some(a => a.principal === p)}
                                        className="w-full text-left px-2 py-1 text-sm hover:bg-blue-50 disabled:opacity-50 disabled:bg-transparent disabled:text-gray-400"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setIsAddingUser(false)} className="w-full py-1 bg-gray-100 text-xs border rounded hover:bg-gray-200">Cancel</button>
                        </div>
                    </div>
                )}
             </div>

             {/* Permissions Checkboxes */}
             <div className="p-4 bg-gray-50 flex-grow flex flex-col">
                <p className="text-sm text-gray-600 mb-2">
                    Permissions for <span className="font-semibold">{selectedPrincipal || '...'}</span>
                </p>
                <div className="border border-gray-300 bg-white flex-grow overflow-hidden flex flex-col">
                    <div className="flex border-b border-gray-200 bg-gray-50">
                        <div className="flex-grow px-2 py-1 text-xs text-gray-500">Permission</div>
                        <div className="w-16 text-center px-2 py-1 text-xs text-gray-500 border-l border-gray-200">Allow</div>
                        <div className="w-16 text-center px-2 py-1 text-xs text-gray-500 border-l border-gray-200">Deny</div>
                    </div>
                    <div className="overflow-y-auto">
                        {ALL_PERMISSIONS.map(permission => {
                            const isChecked = activeACL?.permissions.includes(permission) || false;
                            const isDisabled = !selectedPrincipal;
                            return (
                                <div key={permission} className="flex items-center border-b border-gray-100 last:border-0 hover:bg-gray-50 h-7 group">
                                    <div className="flex-grow px-2 text-sm text-gray-700">{permission}</div>
                                    <div className="w-16 flex justify-center items-center border-l border-gray-100 h-full bg-white group-hover:bg-gray-50">
                                        <input 
                                            type="checkbox" 
                                            checked={isChecked} 
                                            onChange={() => togglePermission(permission)}
                                            disabled={isDisabled}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="w-16 flex justify-center items-center border-l border-gray-100 h-full bg-gray-50">
                                        <input type="checkbox" disabled className="rounded border-gray-300 bg-gray-200 text-gray-400 h-4 w-4 cursor-not-allowed opacity-50" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
             </div>

             {/* Footer */}
             <div className="p-4 bg-gray-100 border-t border-gray-200 flex justify-between items-center">
                <div className="text-xs text-gray-400">
                    NTFS Permissions Simulator
                </div>
                <button 
                    onClick={handleSubmit} 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-6 rounded shadow-sm transition-colors"
                >
                    Apply Changes
                </button>
             </div>
          </div>
        </div>
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
                        {success ? 'Configuration Correct!' : 'Audit Failed'}
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
