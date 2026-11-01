import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExamRecord, LessonHistoryEntry, StreakState } from '../types';

function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function isYesterday(dateKey: string, ref: Date): boolean {
  const y = new Date(ref);
  y.setDate(y.getDate() - 1);
  return todayKey(y) === dateKey;
}

// "Voca_progress" — exam history, streak, lesson improvement stats.
interface ProgressState {
  examHistory: ExamRecord[];
  lessonStats: Record<number, LessonHistoryEntry[]>;
  streak: StreakState;
  correctVocabIds: string[];
  distractorHistory: Record<string, string[][]>;

  addExamResult: (exam: ExamRecord) => void;
  recordDistractors: (vocabId: string, combo: string[]) => void;
  getRecentCombos: (vocabId: string) => string[][];
  checkIn: () => boolean; // returns true if streak was incremented
  hasCheckedInToday: () => boolean;
  resetStreak: () => void;
  resetAll: () => void;
}

const initialStreak: StreakState = {
  current: 0,
  longest: 0,
  totalActiveDays: 0,
  lastCheckinDate: null,
  history: [],
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      examHistory: [],
      lessonStats: {},
      streak: initialStreak,
      correctVocabIds: [],
      distractorHistory: {},

      addExamResult: (exam) => {
        const state = get();
        const examHistory = [exam, ...state.examHistory].slice(0, 300);

        // Update lesson-by-lesson stats
        const lessonStats = { ...state.lessonStats };
        const lessonsInExam = Array.from(new Set(exam.answers.map((a) => a.lesson)));
        for (const lesson of lessonsInExam) {
          const lessonAnswers = exam.answers.filter((a) => a.lesson === lesson);
          const correct = lessonAnswers.filter((a) => a.result === 'correct').length;
          const incorrect = lessonAnswers.filter((a) => a.result === 'incorrect').length;
          const skipped = lessonAnswers.filter((a) => a.result === 'skipped').length;
          const total = lessonAnswers.length;
          const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
          const proportionalTime = Math.round((exam.timeSeconds * total) / exam.totalQuestions);
          const entry: LessonHistoryEntry = {
            date: exam.date,
            accuracy,
            correct,
            incorrect,
            skipped,
            total,
            timeSeconds: proportionalTime,
          };
          lessonStats[lesson] = [...(lessonStats[lesson] ?? []), entry];
        }

        // Track distinct vocab ever answered correctly
        const correctIds = new Set(state.correctVocabIds);
        exam.answers.filter((a) => a.result === 'correct').forEach((a) => correctIds.add(a.vocabId));

        // Streak: completing an exam counts as the daily check-in action
        const streak = applyCheckIn(state.streak);

        set({
          examHistory,
          lessonStats,
          correctVocabIds: Array.from(correctIds),
          streak,
        });
      },

      recordDistractors: (vocabId, combo) => {
        const distractorHistory = { ...get().distractorHistory };
        const existing = distractorHistory[vocabId] ?? [];
        distractorHistory[vocabId] = [...existing, combo].slice(-6);
        set({ distractorHistory });
      },

      getRecentCombos: (vocabId) => get().distractorHistory[vocabId] ?? [],

      checkIn: () => {
        const state = get();
        const already = state.streak.lastCheckinDate === todayKey();
        if (already) return false;
        set({ streak: applyCheckIn(state.streak) });
        return true;
      },

      hasCheckedInToday: () => get().streak.lastCheckinDate === todayKey(),

      resetStreak: () => set({ streak: initialStreak }),

      resetAll: () =>
        set({
          examHistory: [],
          lessonStats: {},
          streak: initialStreak,
          correctVocabIds: [],
          distractorHistory: {},
        }),
    }),
    { name: 'Voca_progress' },
  ),
);

function applyCheckIn(streak: StreakState): StreakState {
  const today = todayKey();
  if (streak.lastCheckinDate === today) return streak;

  const continuing = streak.lastCheckinDate ? isYesterday(streak.lastCheckinDate, new Date()) : false;
  const current = continuing ? streak.current + 1 : 1;
  const longest = Math.max(streak.longest, current);
  const history = [...streak.history, today].slice(-400);

  return {
    current,
    longest,
    totalActiveDays: streak.totalActiveDays + 1,
    lastCheckinDate: today,
    history,
  };
}
