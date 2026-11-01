import type { ExamRecord, LessonHistoryEntry } from '../types';

export function overallAccuracy(examHistory: ExamRecord[]): number {
  if (examHistory.length === 0) return 0;
  const totalCorrect = examHistory.reduce((sum, e) => sum + e.correct, 0);
  const totalQ = examHistory.reduce((sum, e) => sum + e.totalQuestions, 0);
  if (totalQ === 0) return 0;
  return Math.round((totalCorrect / totalQ) * 100);
}

export interface LessonImprovement {
  lesson: number;
  previous: number | null;
  current: number;
  improvement: number | null;
  attempts: number;
  bestScore: number;
  correct: number;
  incorrect: number;
  skipped: number;
  avgTimeSeconds: number;
}

export function computeLessonImprovements(
  lessonStats: Record<number, LessonHistoryEntry[]>,
): LessonImprovement[] {
  return Object.entries(lessonStats)
    .map(([lessonStr, history]) => {
      const lesson = Number(lessonStr);
      if (history.length === 0) return null;
      const current = history[history.length - 1].accuracy;
      const previous = history.length > 1 ? history[history.length - 2].accuracy : null;
      const bestScore = Math.max(...history.map((h) => h.accuracy));
      const correct = history.reduce((s, h) => s + h.correct, 0);
      const incorrect = history.reduce((s, h) => s + h.incorrect, 0);
      const skipped = history.reduce((s, h) => s + h.skipped, 0);
      const avgTimeSeconds = Math.round(
        history.reduce((s, h) => s + h.timeSeconds, 0) / history.length,
      );
      return {
        lesson,
        previous,
        current,
        improvement: previous === null ? null : current - previous,
        attempts: history.length,
        bestScore,
        correct,
        incorrect,
        skipped,
        avgTimeSeconds,
      } as LessonImprovement;
    })
    .filter((x): x is LessonImprovement => x !== null)
    .sort((a, b) => a.lesson - b.lesson);
}
