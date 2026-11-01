export interface VocabItem {
  id: string;
  lesson: number;
  japanese: string;
  bengali: string;
}

export type Direction = 'bn-jp' | 'jp-bn' | 'mixed';

export type AnswerResult = 'correct' | 'incorrect' | 'skipped';

export interface QuestionOption {
  vocabId: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  vocab: VocabItem;
  direction: 'bn-jp' | 'jp-bn';
  options: QuestionOption[];
}

export interface AnsweredQuestion {
  question: QuizQuestion;
  result: AnswerResult;
  selected?: QuestionOption;
  timeMs: number;
}

export interface ExamRecord {
  id: string;
  date: string; // ISO
  lessons: number[];
  direction: Direction;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  skipped: number;
  accuracy: number;
  score: number;
  timeSeconds: number;
  answers: {
    vocabId: string;
    lesson: number;
    result: AnswerResult;
    selectedText?: string;
    correctText: string;
    questionText: string;
    direction: 'bn-jp' | 'jp-bn';
  }[];
}

export interface LessonHistoryEntry {
  date: string;
  accuracy: number;
  correct: number;
  incorrect: number;
  skipped: number;
  total: number;
  timeSeconds: number;
}

export interface MemoryEntry {
  vocabId: string;
  lesson: number;
  timesCorrect: number;
  timesIncorrect: number;
  timesSkipped: number;
  totalAttempts: number;
  lastTestedDate: string;
  lastResult: AnswerResult;
  addedDate: string;
}

export interface StreakState {
  current: number;
  longest: number;
  totalActiveDays: number;
  lastCheckinDate: string | null;
  history: string[];
}

export type Theme = 'light' | 'dark';

export type LessonSelectionMode = 'single' | 'multiple' | 'all';
