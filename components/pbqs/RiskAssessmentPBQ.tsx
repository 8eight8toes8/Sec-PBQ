
import React, { useState } from 'react';

interface RiskAssessmentPBQProps {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const SCENARIOS = {
  scenario1: {
    title: "Data Center Hardware Failure",
    description: "Your organization's primary data center contains critical servers worth $500,000. Historical data shows hardware failures occur approximately 3 times per year. When a failure occurs, it typically results in 40% of the server value being lost.",
    assetValue: 500000,
    exposureFactor: 0.40,
    aro: 3,
    controlCost: 75000,
    correctSLE: 200000,
    correctALE: 600000
  },
  scenario2: {
    title: "Ransomware Attack",
    description: "File servers contain data valued at $2,000,000. Industry reports indicate your sector experiences ransomware attacks once every 2 years (0.5/yr). A successful attack compromises 75% of data value.",
    assetValue: 2000000,
    exposureFactor: 0.75,
    aro: 0.5,
    controlCost: 120000,
    correctSLE: 1500000,
    correctALE: 750000
  }
};

const RiskAssessmentPBQ: React.FC<RiskAssessmentPBQProps> = ({ onComplete, onExit }) => {
  const [activeScenario, setActiveScenario] = useState<'scenario1' | 'scenario2'>('scenario1');
  const [inputs, setInputs] = useState({ sle: '', ale: '', recommendation: '' });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const scenario = SCENARIOS[activeScenario];

  const handleScenarioChange = (id: 'scenario1' | 'scenario2') => {
    setActiveScenario(id);
    setInputs({ sle: '', ale: '', recommendation: '' });
    setFeedback(null);
  };

  const handleSubmit = () => {
    const userSLE = parseFloat(inputs.sle);
    const userALE = parseFloat(inputs.ale);
    let score = 0;
    const feedbackLines = [];

    // Check SLE
    if (userSLE === scenario.correctSLE) {
        score += 40;
        feedbackLines.push("✓ SLE Calculation Correct");
    } else {
        feedbackLines.push(`✗ Incorrect SLE. Formula: AV ($${scenario.assetValue}) * EF (${scenario.exposureFactor})`);
    }

    // Check ALE
    if (userALE === scenario.correctALE) {
        score += 40;
        feedbackLines.push("✓ ALE Calculation Correct");
    } else {
        feedbackLines.push(`✗ Incorrect ALE. Formula: SLE * ARO (${scenario.aro})`);
    }

    // Check Recommendation
    const isViable = scenario.correctALE > scenario.controlCost;
    const correctRec = isViable ? 'yes' : 'no';
    
    if (inputs.recommendation === correctRec) {
        score += 20;
        feedbackLines.push("✓ Recommendation Correct");
    } else {
        feedbackLines.push(`✗ Incorrect Recommendation. ALE ($${scenario.correctALE}) vs Cost ($${scenario.controlCost})`);
    }

    setSuccess(score >= 80);
    setFeedback(`Score: ${score}/100\n\n${feedbackLines.join('\n')}`);
    if (score >= 80) onComplete(score);
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col animate-fadeIn overflow-y-auto">
      <div className="bg-white shadow-md p-4 sticky top-0 z-10 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-chart-pie"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Risk Assessment</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button onClick={onExit} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all">
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="flex gap-4 mb-6">
            <button 
                onClick={() => handleScenarioChange('scenario1')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${activeScenario === 'scenario1' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
                Scenario 1: Hardware
            </button>
            <button 
                onClick={() => handleScenarioChange('scenario2')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${activeScenario === 'scenario2' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
                Scenario 2: Ransomware
            </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-blue-50">
                <h3 className="text-xl font-bold text-blue-900 mb-2">{scenario.title}</h3>
                <p className="text-blue-800">{scenario.description}</p>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-gray-700 mb-3 border-b pb-2">Risk Data</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-gray-500">Asset Value (AV)</span>
                                <span className="font-mono font-bold text-gray-800">${scenario.assetValue.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500">Exposure Factor (EF)</span>
                                <span className="font-mono font-bold text-gray-800">{scenario.exposureFactor}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500">Annual Rate (ARO)</span>
                                <span className="font-mono font-bold text-gray-800">{scenario.aro}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500">Control Cost/Yr</span>
                                <span className="font-mono font-bold text-gray-800">${scenario.controlCost.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
                        <strong className="block mb-1">Formulas:</strong>
                        <p>SLE = Asset Value × Exposure Factor</p>
                        <p>ALE = SLE × ARO</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Calculate SLE ($)</label>
                        <input 
                            type="number" 
                            value={inputs.sle}
                            onChange={(e) => setInputs({...inputs, sle: e.target.value})}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter value..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Calculate ALE ($)</label>
                        <input 
                            type="number" 
                            value={inputs.ale}
                            onChange={(e) => setInputs({...inputs, ale: e.target.value})}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter value..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Recommendation</label>
                        <select 
                            value={inputs.recommendation}
                            onChange={(e) => setInputs({...inputs, recommendation: e.target.value})}
                            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select recommendation...</option>
                            <option value="yes">Implement Control (Cost Effective)</option>
                            <option value="no">Accept Risk (Control too expensive)</option>
                        </select>
                    </div>

                    <button 
                        onClick={handleSubmit}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md transition-all"
                    >
                        Submit Assessment
                    </button>
                </div>
            </div>
        </div>
      </div>

      {feedback && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${success ? 'fa-check' : 'fa-times'} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-4">{success ? 'Assessment Correct' : 'Incorrect Values'}</h3>
                <div className="whitespace-pre-line text-gray-600 mb-6">{feedback}</div>
                <button onClick={() => success ? onExit() : setFeedback(null)} className="w-full bg-blue-600 text-white font-bold py-2 rounded">
                    {success ? 'Finish' : 'Try Again'}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default RiskAssessmentPBQ;
