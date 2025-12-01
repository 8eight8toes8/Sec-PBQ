
import React, { useState, useEffect } from 'react';
import { PracticeQuestion } from '../types';

interface QuizResult {
    questionId: number;
    correct: boolean;
}

interface QuizInterfaceProps {
  questions: PracticeQuestion[];
  onExit: (results?: QuizResult[]) => void;
}

const QuizInterface: React.FC<QuizInterfaceProps> = ({ questions, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  
  // Results Filter State
  const [showIncorrectOnly, setShowIncorrectOnly] = useState(false);

  // Timer
  useEffect(() => {
    if (showResults) return;
    const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [showResults]);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    // Update score
    if (index === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }

    // Track answer
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = index;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Compile Results for Parent
  const compileResults = (): QuizResult[] => {
      return questions.map((q, idx) => ({
          questionId: q.id,
          correct: userAnswers[idx] === q.correctAnswer
      }));
  };

  if (showResults) {
    const results = compileResults();
    
    // Filter logic for display
    const visibleQuestions = showIncorrectOnly 
        ? questions.map((q, i) => ({ q, i, correct: results[i].correct })).filter(item => !item.correct)
        : questions.map((q, i) => ({ q, i, correct: results[i].correct }));

    return (
      <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 flex flex-col max-h-[90vh] border border-gray-200 animate-fadeIn">
          {/* Result Header */}
          <div className="text-center mb-8 flex-shrink-0">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <i className="fas fa-clipboard-check text-3xl"></i>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-1">Quiz Results</h2>
            <p className="text-gray-500">Security+ Practice Session</p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8 flex-shrink-0">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 text-center">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Score</p>
              <p className="text-4xl font-bold text-green-600">{Math.round((score / questions.length) * 100)}%</p>
              <p className="text-sm text-gray-600 font-medium mt-1">{score} / {questions.length} Correct</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 text-center">
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Time</p>
              <p className="text-4xl font-bold text-purple-600 font-mono">{formatTime(elapsedTime)}</p>
              <p className="text-sm text-gray-600 font-medium mt-1">Avg {(elapsedTime / questions.length).toFixed(1)}s / question</p>
            </div>
          </div>

          {/* Detailed Review Section */}
          <div className="flex-grow overflow-y-auto pr-2 mb-6 custom-scrollbar">
            <div className="flex justify-between items-center mb-4 border-b pb-2 sticky top-0 bg-white z-10">
                <h3 className="text-lg font-bold text-gray-800">Detailed Review</h3>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                        type="checkbox" 
                        checked={showIncorrectOnly}
                        onChange={(e) => setShowIncorrectOnly(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 font-medium">Show Incorrect Only</span>
                </label>
            </div>

            {visibleQuestions.length === 0 && showIncorrectOnly && (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <i className="fas fa-check-circle text-4xl text-green-400 mb-2"></i>
                    <p>No incorrect answers to display. Well done!</p>
                </div>
            )}

            <div className="space-y-4">
              {visibleQuestions.map(({ q, i, correct }) => {
                const userAnswer = userAnswers[i];
                
                return (
                  <div key={q.id} className={`p-4 rounded-xl border-2 ${correct ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                    <div className="flex items-start gap-3 mb-2">
                      <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold ${correct ? 'bg-green-500' : 'bg-red-500'}`}>
                        <i className={`fas ${correct ? 'fa-check' : 'fa-times'}`}></i>
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm text-gray-500 font-mono mb-1">{q.domain}</p>
                        <p className="font-bold text-gray-800">{q.question}</p>
                      </div>
                    </div>

                    <div className="ml-9 space-y-2 text-sm">
                      {!correct && (
                        <div className="flex items-center gap-2 text-red-700 bg-red-100/50 p-2 rounded">
                          <span className="font-bold text-xs uppercase w-16 flex-shrink-0">Your Answer:</span>
                          <span>{userAnswer !== null ? q.options[userAnswer] : 'Skipped'}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-green-700 bg-green-100/50 p-2 rounded">
                        <span className="font-bold text-xs uppercase w-16 flex-shrink-0">Correct:</span>
                        <span>{q.options[q.correctAnswer]}</span>
                      </div>
                      <div className="mt-2 text-gray-600 bg-white p-3 rounded border border-gray-200 italic text-xs leading-relaxed">
                        <strong className="not-italic text-gray-700 block mb-1 font-bold flex items-center gap-1"><i className="fas fa-info-circle text-blue-500"></i> Explanation:</strong> 
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => onExit(compileResults())}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 flex-shrink-0"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-gray-200">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-bold shadow-sm">
              Q{currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-200 px-2 py-1 rounded">
              {currentQuestion.domain}
            </span>
          </div>
          <div className="font-mono text-gray-600 font-semibold flex items-center gap-2 bg-white px-3 py-1 rounded border border-gray-200">
            <i className="fas fa-clock text-blue-500"></i> {formatTime(elapsedTime)}
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 leading-snug">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              let optionClass = "border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50";
              let icon = <span className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs font-bold text-gray-400 mr-3">{String.fromCharCode(65 + idx)}</span>;

              if (isAnswered) {
                if (idx === currentQuestion.correctAnswer) {
                  optionClass = "border-2 border-green-500 bg-green-50 text-green-900";
                  icon = <i className="fas fa-check-circle text-green-500 text-xl mr-3"></i>;
                } else if (idx === selectedOption) {
                  optionClass = "border-2 border-red-500 bg-red-50 text-red-900";
                  icon = <i className="fas fa-times-circle text-red-500 text-xl mr-3"></i>;
                } else {
                  optionClass = "border-2 border-gray-100 opacity-50";
                }
              } else if (selectedOption === idx) {
                 optionClass = "border-2 border-blue-500 bg-blue-50";
                 icon = <span className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-500 mr-3">{String.fromCharCode(65 + idx)}</span>;
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(idx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center ${optionClass}`}
                >
                  {icon}
                  <span className="text-base font-medium">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className={`mt-6 p-5 rounded-xl border ${selectedOption === currentQuestion.correctAnswer ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'} animate-fadeIn`}>
              <h4 className={`text-sm font-bold uppercase mb-2 flex items-center gap-2 ${selectedOption === currentQuestion.correctAnswer ? 'text-green-800' : 'text-blue-800'}`}>
                <i className={`fas ${selectedOption === currentQuestion.correctAnswer ? 'fa-check' : 'fa-info-circle'}`}></i> 
                {selectedOption === currentQuestion.correctAnswer ? 'Correct!' : 'Explanation'}
              </h4>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <button 
            onClick={() => onExit()}
            className="text-gray-500 hover:text-gray-800 font-semibold text-sm flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            <i className="fas fa-times"></i> Quit
          </button>
          
          <button 
            onClick={handleNext}
            disabled={!isAnswered}
            className={`
              px-6 py-2.5 rounded-lg font-bold text-white transition-all flex items-center gap-2 shadow-md
              ${isAnswered 
                ? 'bg-blue-600 hover:bg-blue-700 transform hover:-translate-y-0.5' 
                : 'bg-gray-300 cursor-not-allowed'}
            `}
          >
            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} 
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizInterface;
