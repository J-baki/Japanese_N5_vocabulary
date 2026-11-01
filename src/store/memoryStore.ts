import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AnswerResult, MemoryEntry } from '../types';

// "Voca_memory" — incorrect / skipped vocabulary with full performance history.
interface MemoryState {
  items: Record<string, MemoryEntry>;
  recordResult: (vocabId: string, lesson: number, result: AnswerResult, date: string) => void;
  removeItem: (vocabId: string) => void;
  removeLesson: (lesson: number) => void;
  removeAll: () => void;
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set, get) => ({
      items: {},
      recordResult: (vocabId, lesson, result, date) => {
        const items = { ...get().items };
        const existing = items[vocabId];

        if (result === 'correct' && !existing) {
          // Only track full records once something has gone wrong at least once.
          return;
        }

        const base: MemoryEntry = existing ?? {
          vocabId,
          lesson,
          timesCorrect: 0,
          timesIncorrect: 0,
          timesSkipped: 0,
          totalAttempts: 0,
          lastTestedDate: date,
          lastResult: result,
          addedDate: date,
        };

        const updated: MemoryEntry = {
          ...base,
          timesCorrect: base.timesCorrect + (result === 'correct' ? 1 : 0),
          timesIncorrect: base.timesIncorrect + (result === 'incorrect' ? 1 : 0),
          timesSkipped: base.timesSkipped + (result === 'skipped' ? 1 : 0),
          totalAttempts: base.totalAttempts + 1,
          lastTestedDate: date,
          lastResult: result,
        };

        items[vocabId] = updated;
        set({ items });
      },
      removeItem: (vocabId) => {
        const items = { ...get().items };
        delete items[vocabId];
        set({ items });
      },
      removeLesson: (lesson) => {
        const items = Object.fromEntries(
          Object.entries(get().items).filter(([, v]) => v.lesson !== lesson),
        );
        set({ items });
      },
      removeAll: () => set({ items: {} }),
    }),
    { name: 'Voca_memory' },
  ),
);
