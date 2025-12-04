import React from 'react';
import { DifficultyLevel } from '../types';

interface FilterTabsProps {
  currentFilter: DifficultyLevel;
  onFilterChange: (level: DifficultyLevel) => void;
  counts: Record<DifficultyLevel, number>;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ currentFilter, onFilterChange, counts }) => {
  const tabs = [
    { id: DifficultyLevel.All, label: 'All Levels', icon: 'fa-layer-group', activeColor: 'bg-blue-600' },
    { id: DifficultyLevel.Foundational, label: 'Foundational', icon: 'fa-cube', activeColor: 'bg-green-600' },
    { id: DifficultyLevel.Intermediate, label: 'Intermediate', icon: 'fa-bolt', activeColor: 'bg-orange-500' },
    { id: DifficultyLevel.Advanced, label: 'Advanced', icon: 'fa-dragon', activeColor: 'bg-red-600' },
    { id: DifficultyLevel.PerformanceBasedLab, label: 'Labs', icon: 'fa-flask', activeColor: 'bg-purple-600' },
  ];

  return (
    <div className="bg-gray-100 p-1.5 rounded-xl flex flex-wrap sm:flex-nowrap gap-2 mb-8 shadow-inner border border-gray-200">
      {tabs.map((tab) => {
        const isActive = currentFilter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onFilterChange(tab.id)}
            className={`
              relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
              ${isActive 
                ? 'bg-white text-gray-800 shadow-sm ring-1 ring-black/5 translate-y-0' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/60'
              }
            `}
          >
            {/* Active Indicator Dot */}
            <span className={`
                w-2 h-2 rounded-full mr-1 transition-all duration-300 delay-75 hidden sm:block
                ${isActive ? `${tab.activeColor} scale-100 opacity-100` : 'bg-transparent scale-0 opacity-0 w-0 mr-0'}
            `}></span>

            <i className={`fas ${tab.icon} ${isActive ? 'opacity-100' : 'opacity-60'} transition-opacity duration-300`}></i>
            <span className="whitespace-nowrap">{tab.label}</span>
            
            <span className={`
              ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold transition-colors duration-300
              ${isActive ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-400'}
            `}>
              {counts[tab.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;