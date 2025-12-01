import React, { useState } from 'react';

interface AccessControlMatrixPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

type Permission = 'None' | 'Read' | 'Read/Write';

const ROLES = [
  { id: 'hr_manager', label: 'HR Manager', desc: 'Manages employee records' },
  { id: 'sales_rep', label: 'Sales Rep', desc: 'Generates client orders' },
  { id: 'it_admin', label: 'IT Admin', desc: 'Manages infrastructure' }
];

const RESOURCES = [
  { id: 'res_personnel', label: '\\\\Server\\Personnel_Records', type: 'Confidential' },
  { id: 'res_sales', label: '\\\\Server\\Sales_Data', type: 'Internal' },
  { id: 'res_public', label: '\\\\Server\\Public_Forms', type: 'Public' },
  { id: 'res_sys', label: '\\\\Server\\Sys_Configs', type: 'Restricted' }
];

const AccessControlMatrixPBQ: React.FC<AccessControlMatrixPBQProps> = ({ onComplete, onExit }) => {
  // Initialize grid with 'None'
  const initialGrid: Record<string, Permission> = {};
  ROLES.forEach(role => {
    RESOURCES.forEach(res => {
      initialGrid[`${role.id}-${res.id}`] = 'None';
    });
  });

  const [grid, setGrid] = useState<Record<string, Permission>>(initialGrid);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const cyclePermission = (roleId: string, resourceId: string) => {
    const key = `${roleId}-${resourceId}`;
    const current = grid[key];
    let next: Permission = 'None';
    
    if (current === 'None') next = 'Read';
    else if (current === 'Read') next = 'Read/Write';
    else next = 'None';

    setGrid(prev => ({ ...prev, [key]: next }));
  };

  const handleReset = () => {
    setGrid(initialGrid);
    setFeedback(null);
    setSuccess(false);
  };

  const getCellColor = (perm: Permission) => {
    switch(perm) {
        case 'Read': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Read/Write': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-50 text-gray-400 border-gray-100';
    }
  };

  const getIcon = (perm: Permission) => {
    switch(perm) {
        case 'Read': return 'fa-eye';
        case 'Read/Write': return 'fa-edit';
        default: return 'fa-ban';
    }
  };

  const handleSubmit = () => {
    const errors: string[] = [];

    // HR Manager Validation
    if (grid['hr_manager-res_personnel'] !== 'Read/Write') errors.push("HR Manager needs R/W access to Personnel Records.");
    if (grid['hr_manager-res_sales'] !== 'None') errors.push("HR Manager should NOT have access to Sales Data (Least Privilege).");
    if (grid['hr_manager-res_public'] !== 'Read') errors.push("HR Manager should have Read access to Public Forms.");
    if (grid['hr_manager-res_sys'] !== 'None') errors.push("HR Manager should NOT have access to System Configs.");

    // Sales Rep Validation
    if (grid['sales_rep-res_personnel'] !== 'None') errors.push("Sales Rep should NOT have access to Personnel Records.");
    if (grid['sales_rep-res_sales'] !== 'Read/Write') errors.push("Sales Rep needs R/W access to Sales Data.");
    if (grid['sales_rep-res_public'] !== 'Read') errors.push("Sales Rep should have Read access to Public Forms.");
    if (grid['sales_rep-res_sys'] !== 'None') errors.push("Sales Rep should NOT have access to System Configs.");

    // IT Admin Validation
    // IT Admin needs to manage configs, but shouldn't snoop in HR/Sales data unless authorized (Separation of Duties).
    if (grid['it_admin-res_personnel'] !== 'None') errors.push("IT Admin should NOT view content of Personnel Records (Separation of Duties).");
    if (grid['it_admin-res_sales'] !== 'None') errors.push("IT Admin should NOT view content of Sales Data (Separation of Duties).");
    if (grid['it_admin-res_sys'] !== 'Read/Write') errors.push("IT Admin needs R/W access to System Configs.");
    // IT Admin must be able to maintain public forms
    if (grid['it_admin-res_public'] !== 'Read/Write') errors.push("IT Admin should manage (R/W) Public Forms.");

    if (errors.length === 0) {
        setSuccess(true);
        setFeedback("Access Control Matrix Verified! \n\n• Principle of Least Privilege applied correctly.\n• Separation of Duties maintained for IT Admin.\n• Functional access granted where required.");
        onComplete(100);
    } else {
        setSuccess(false);
        setFeedback(errors.slice(0, 5).map(e => "• " + e).join("\n") + (errors.length > 5 ? "\n...and more." : ""));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      {/* Header */}
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm"><i className="fas fa-table"></i></div>
            <div><h2 className="text-xl font-bold text-gray-900">Access Control Matrix (RBAC)</h2><p className="text-xs text-gray-500">Security+ PBQ Simulation</p></div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 p-2 rounded-full"><i className="fas fa-times text-2xl"></i></button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-6xl mx-auto w-full">
         <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-6 bg-blue-50 border-b border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2">Scenario: Define Departmental Access</h3>
                <p className="text-sm text-blue-800">
                    Configure the access permissions for each role. Click the grid cells to cycle permissions (<strong className="text-gray-500">None</strong> → <strong className="text-yellow-600">Read</strong> → <strong className="text-green-600">Read/Write</strong>).
                </p>
                <p className="text-sm text-blue-800 mt-2 italic">
                    <strong>Note:</strong> Apply <em>Separation of Duties</em>. IT Admins manage infrastructure but should not access sensitive departmental content (HR/Sales).
                </p>
            </div>

            <div className="p-8 overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 text-left bg-gray-50 border-b-2 border-gray-200 w-1/4">
                                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-1">Resources</span>
                            </th>
                            {ROLES.map(role => (
                                <th key={role.id} className="p-4 text-center bg-gray-50 border-b-2 border-gray-200 w-1/4">
                                    <div className="font-bold text-gray-800">{role.label}</div>
                                    <div className="text-xs text-gray-500 font-normal">{role.desc}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {RESOURCES.map(res => (
                            <tr key={res.id} className="hover:bg-gray-50/50">
                                <td className="p-4 border-b border-gray-100">
                                    <div className="font-bold text-gray-700 font-mono text-sm">{res.label}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Type: <span className="font-semibold">{res.type}</span>
                                    </div>
                                </td>
                                {ROLES.map(role => {
                                    const key = `${role.id}-${res.id}`;
                                    const perm = grid[key];
                                    return (
                                        <td key={key} className="p-4 border-b border-gray-100 text-center">
                                            <button 
                                                onClick={() => cyclePermission(role.id, res.id)}
                                                className={`w-full py-3 px-2 rounded-lg border-2 transition-all duration-200 font-bold text-sm flex items-center justify-center gap-2 ${getCellColor(perm)}`}
                                            >
                                                <i className={`fas ${getIcon(perm)}`}></i>
                                                {perm}
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                 <button 
                    onClick={handleReset} 
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Reset Matrix
                </button>
                 <button 
                    onClick={handleSubmit} 
                    className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                >
                    <i className="fas fa-check-circle"></i> Validate Permissions
                </button>
            </div>
         </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white p-8 rounded-xl max-w-lg text-center shadow-2xl">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${success ? 'fa-check' : 'fa-times'} text-2xl`}></i>
                </div>
                <h3 className={`text-xl font-bold mb-4 ${success ? 'text-green-800' : 'text-red-800'}`}>{success ? 'Audit Passed' : 'Audit Failed'}</h3>
                <div className="text-left bg-gray-50 p-4 rounded border border-gray-200 text-sm mb-6 whitespace-pre-line text-gray-700">
                    {feedback}
                </div>
                <button onClick={() => success ? onExit() : setFeedback(null)} className={`px-6 py-2 text-white font-bold rounded shadow-md transition-colors ${success ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'}`}>
                    {success ? 'Return to Dashboard' : 'Modify Matrix'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AccessControlMatrixPBQ;