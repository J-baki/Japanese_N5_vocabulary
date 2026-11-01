import { create } from 'zustand';
import type { Direction, QuizQuestion, ExamRecord } from '../types';

export type View =
  | 'home'
  | 'streak'
  | 'exam-selection'
  | 'quiz'
  | 'result'
  | 'memory'
  | 'scores'
  | 'improvement'
  | 'settings';

export interface QuizConfig {
  lessons: number[];
  direction: Direction;
  count: number;
  sourceLabel: string; // e.g. "Lesson 1" or "Memory: Lesson 5" or "All Memory"
  isMemoryPractice?: boolean;
}

export interface PendingResult {
  exam: ExamRecord;
  questions: QuizQuestion[];
}

interface UIState {
  view: View;
  sidebarOpen: boolean;
  quizConfig: QuizConfig | null;
  lastResult: PendingResult | null;
  scoreDetail: ExamRecord | null;
  navigate: (v: View) => void;
  setSidebarOpen: (b: boolean) => void;
  startQuiz: (config: QuizConfig) => void;
  finishQuiz: (result: PendingResult) => void;
  viewScoreDetail: (exam: ExamRecord | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: 'home',
  sidebarOpen: false,
  quizConfig: null,
  lastResult: null,
  scoreDetail: null,
  navigate: (v) => set({ view: v, sidebarOpen: false }),
  setSidebarOpen: (b) => set({ sidebarOpen: b }),
  startQuiz: (config) => set({ quizConfig: config, view: 'quiz' }),
  finishQuiz: (result) => set({ lastResult: result, view: 'result' }),
  viewScoreDetail: (exam) => set({ scoreDetail: exam }),
}));
