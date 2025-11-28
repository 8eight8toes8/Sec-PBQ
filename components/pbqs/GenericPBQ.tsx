
import React, { useState } from 'react';

interface GenericPBQProps {
  id: string;
  title: string;
  scenario: string;
  objective: string;
  questions: {
    id: string;
    text: string;
    options: { value: string; label: string }[];
    correctValue: string;
    feedback: string;
  }[];
  onComplete: (score: number) => void;
  onExit: () => void;
}

const GenericPBQ: React.FC<GenericPBQProps> = ({ id, title, scenario, objective, questions, onComplete, onExit }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    const errors = [];

    questions.forEach(q => {
      if (answers[q.id] === q.correctValue) {
        correctCount++;
      } else {
        errors.push(`For "${q.text}": ${q.feedback}`);
      }
    });

    if (errors.length === 0) {
      setSuccess(true);
      setFeedback(`Excellent! You have successfully completed the ${title} module.`);
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
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <i className="fas fa-shield-alt"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">Security+ PBQ Simulation</p>
          </div>
        </div>
        <button
          onClick={onExit}
          className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-all"
          title="Exit Lab"
        >
          <i className="fas fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex-grow p-4 md:p-8 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-50/50 p-6 md:p-8 border-b border-blue-100">
            <p className="text-blue-900 text-lg leading-relaxed mb-4">{scenario}</p>
            <p className="text-blue-800 font-medium bg-blue-100/50 p-4 rounded-lg border border-blue-100">
              <strong>Objective:</strong> {objective}
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {questions.map((q) => (
              <div key={q.id} className="space-y-3">
                <label className="block text-lg font-bold text-gray-800">{q.text}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map(opt => (
                    <div
                      key={opt.value}
                      onClick={() => handleSelect(q.id, opt.value)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[q.id] === opt.value ? 'bg-blue-50 border-blue-600 shadow-sm' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[q.id] === opt.value ? 'border-blue-600' : 'border-gray-300'}`}>
                          {answers[q.id] === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>}
                        </div>
                        <span className="text-gray-700 font-medium">{opt.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 p-6 md:p-8 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 px-12 rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all w-full md:w-auto flex items-center justify-center gap-2"
            >
              <i className="fas fa-check-circle"></i> Submit
            </button>
          </div>

          {feedback && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className={`p-6 text-center border-b ${success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <i className={`fas ${success ? 'fa-shield-check' : 'fa-exclamation-circle'} text-3xl`}></i>
                  </div>
                  <h3 className={`text-2xl font-bold ${success ? 'text-green-800' : 'text-red-800'}`}>
                    {success ? 'Success!' : 'Incorrect Configuration'}
                  </h3>
                </div>
                <div className="p-8">
                  <div className="whitespace-pre-line text-lg leading-relaxed text-gray-700">{feedback}</div>
                </div>
                <div className="p-6 bg-gray-50 flex justify-center">
                  {success ? (
                    <button onClick={onExit} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                      Return to Dashboard
                    </button>
                  ) : (
                    <button onClick={() => setFeedback(null)} className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md">
                      Try Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenericPBQ;
