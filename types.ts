export enum DifficultyLevel {
  All = 'all',
  Foundational = 'foundational',
  Intermediate = 'intermediate',
  Advanced = 'advanced'
}

export interface PBQModule {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
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