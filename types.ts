export enum DifficultyLevel {
  All = 'all',
  Foundational = 'foundational',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
  PerformanceBasedLab = 'lab'
}

export type ModuleCategory = 'Network Security' | 'Endpoint Security' | 'Identity & Access' | 'GRC' | 'SOC Operations' | 'App Security' | 'Cryptography';

export interface PBQModule {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  category?: ModuleCategory; // New field for enterprise categorization
  icon?: string;
}

export interface PracticeQuestion {
  id: number;
  domain: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option (0-3)
  explanation: string;
}