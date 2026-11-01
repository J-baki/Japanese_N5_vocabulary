import type { Direction, QuestionOption, QuizQuestion, VocabItem } from '../types';
import { vocabulary } from '../data/vocabulary';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDirection(direction: Direction): 'bn-jp' | 'jp-bn' {
  if (direction === 'mixed') return Math.random() < 0.5 ? 'bn-jp' : 'jp-bn';
  return direction;
}

/**
 * Choose 3 distractors for a given vocab item, preferring the local pool but
 * falling back to the full vocabulary database when the pool is too small.
 * Avoids repeating the exact same distractor combination as recent history
 * whenever alternatives exist.
 */
function pickDistractors(
  target: VocabItem,
  pool: VocabItem[],
  recentCombos: string[][],
): VocabItem[] {
  const candidates = pool.filter((v) => v.id !== target.id);
  const source = candidates.length >= 3 ? candidates : vocabulary.filter((v) => v.id !== target.id);

  const recentSets = new Set(recentCombos.map((combo) => [...combo].sort().join('|')));

  let best: VocabItem[] | null = null;
  for (let attempt = 0; attempt < 12; attempt++) {
    const shuffled = shuffle(source).slice(0, 3);
    if (shuffled.length < 3) {
      best = shuffled;
      break;
    }
    const key = shuffled
      .map((v) => v.id)
      .sort()
      .join('|');
    if (!recentSets.has(key)) {
      best = shuffled;
      break;
    }
    if (!best) best = shuffled;
  }
  return best ?? shuffle(source).slice(0, 3);
}

export function buildQuestion(
  target: VocabItem,
  pool: VocabItem[],
  direction: Direction,
  recentCombos: string[][],
): QuizQuestion {
  const qDirection = pickDirection(direction);
  const distractors = pickDistractors(target, pool, recentCombos);

  const makeOption = (v: VocabItem, isCorrect: boolean): QuestionOption => ({
    vocabId: v.id,
    text: qDirection === 'bn-jp' ? v.japanese : v.bengali,
    isCorrect,
  });

  const options = shuffle([
    makeOption(target, true),
    ...distractors.map((d) => makeOption(d, false)),
  ]);

  return { vocab: target, direction: qDirection, options };
}

export function buildQuiz(
  pool: VocabItem[],
  direction: Direction,
  count: number,
  recentComboLookup: (vocabId: string) => string[][],
): QuizQuestion[] {
  const chosen = shuffle(pool).slice(0, Math.min(count, pool.length));
  return chosen.map((v) => buildQuestion(v, pool, direction, recentComboLookup(v.id)));
}
