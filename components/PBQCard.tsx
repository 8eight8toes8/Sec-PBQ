import React from 'react';
import { PBQModule, DifficultyLevel } from '../types';

interface PBQCardProps {
  module: PBQModule;
  onLaunch?: (id: string) => void;
}

const PBQCard: React.FC<PBQCardProps> = ({ module, onLaunch }) => {
  const getBadgeColor = (level: DifficultyLevel) => {
    switch (level) {
      case DifficultyLevel.Foundational:
        return 'bg-green-600';
      case DifficultyLevel.Intermediate:
        return 'bg-orange-500';
      case DifficultyLevel.Advanced:
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  const handleCardClick = () => {
    if (onLaunch) {
        onLaunch(module.id);
    } else {
        alert(`Launching ${module.title} simulator...`);
    }
  };

  return (
    <div 
      className="relative bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 cursor-pointer group flex flex-col h-full"
      onClick={handleCardClick}
    >
      {/* Difficulty Badge */}
      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wide z-10 ${getBadgeColor(module.difficulty)}`}>
        {module.difficulty}
      </span>

      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600 group-hover:scale-110 transition-transform duration-300">
          <i className={`fas ${module.icon || 'fa-cube'} text-xl`}></i>
        </div>
        <h3 className="text-lg font-bold text-gray-800 leading-tight pt-1 group-hover:text-blue-600 transition-colors">
          {module.title}
        </h3>
      </div>

      <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
        {module.description}
      </p>

      <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end items-center text-sm">
        <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
          Start Lab <i className="fas fa-arrow-right text-xs"></i>
        </span>
      </div>
    </div>
  );
};

export default PBQCard;