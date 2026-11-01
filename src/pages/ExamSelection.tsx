import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Clock, Languages, ListOrdered, PlayCircle, BookOpenCheck } from 'lucide-react';
import { Card, Button, SectionTitle, Badge } from '../components/ui';
import { lessonList, vocabByLesson } from '../data/vocabulary';
import { useUIStore } from '../store/uiStore';
import type { Direction, LessonSelectionMode } from '../types';
import { useDataStore } from '../store/dataStore';

export default function ExamSelection() {
  const [mode, setMode] = useState<LessonSelectionMode>('single');
  const [selected, setSelected] = useState<number[]>([1]);
  const defaultDirection = useDataStore((s) => s.defaultDirection);
  const [direction, setDirection] = useState<Direction>(defaultDirection === 'mixed' ? 'bn-jp' : defaultDirection);
  const [countOption, setCountOption] = useState<'10' | '20' | '30' | 'all'>('20');
  const startQuiz = useUIStore((s) => s.startQuiz);

  const lessons = mode === 'all' ? lessonList.map((l) => l.number) : selected;

  const poolSize = useMemo(
    () => lessons.reduce((sum, l) => sum + (vocabByLesson[l]?.length ?? 0), 0),
    [lessons],
  );

  const estimatedMinutes = useMemo(
    () => lessons.reduce((sum, l) => sum + (lessonList.find((x) => x.number === l)?.estimatedMinutes ?? 0), 0),
    [lessons],
  );

  const toggleLesson = (n: number) => {
    if (mode === 'single') {
      setSelected([n]);
    } else {
      setSelected((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n].sort((a, b) => a - b)));
    }
  };

  const countValue = countOption === 'all' ? poolSize : Math.min(Number(countOption), poolSize);

  const canStart = lessons.length > 0 && poolSize >= 4;

  const handleStart = () => {
    if (!canStart) return;
    startQuiz({
      lessons,
      direction,
      count: countValue,
      sourceLabel: mode === 'all' ? 'All Lessons' : lessons.length === 1 ? `Lesson ${lessons[0]}` : `Lessons ${lessons.join(', ')}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Start an Exam</h1>
        <p className="text-slate-500 dark:text-slate-400">Choose lessons, direction, and question count.</p>
      </div>

      <Card>
        <SectionTitle>1. Choose Lessons</SectionTitle>
        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ['single', 'Single Lesson'],
              ['multiple', 'Multiple Lessons'],
              ['all', 'All Lessons'],
            ] as [LessonSelectionMode, string][]
          ).map(([m, label]) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                if (m === 'single') setSelected((prev) => [prev[0] ?? 1]);
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                mode === m
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode !== 'all' ? (
          <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-4">
            {lessonList.map((l) => {
              const active = selected.includes(l.number);
              return (
                <button
                  key={l.number}
                  onClick={() => toggleLesson(l.number)}
                  className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                  }`}
                >
                  <span>
                    <span className="block font-semibold">Lesson {l.number}</span>
                    <span className="block text-xs text-slate-400">{l.wordCount} words</span>
                  </span>
                  {active ? <CheckCircle2 size={18} className="text-indigo-500" /> : <Circle size={18} className="text-slate-300" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <BookOpenCheck size={18} />
            All {lessonList.length} lessons selected ({lessonList.reduce((s, l) => s + l.wordCount, 0)} words total)
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/60">
          <span className="font-semibold">Selected:</span>
          {lessons.length > 0 ? (
            lessons.map((l) => (
              <Badge key={l} tone="indigo">
                Lesson {l}
              </Badge>
            ))
          ) : (
            <span className="text-slate-400">None yet</span>
          )}
          <span className="ml-auto flex items-center gap-1 text-slate-500">
            <ListOrdered size={14} /> {poolSize} words
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock size={14} /> ~{estimatedMinutes} min
          </span>
        </div>
      </Card>

      <Card>
        <SectionTitle>2. Question Direction</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DirectionOption
            active={direction === 'bn-jp'}
            title="Bengali → Japanese"
            example={{ q: 'শিক্ষক', options: ['せんせい', 'がくせい', 'いしゃ', 'かいしゃいん'] }}
            onClick={() => setDirection('bn-jp')}
          />
          <DirectionOption
            active={direction === 'jp-bn'}
            title="Japanese → Bengali"
            example={{ q: 'せんせい', options: ['ছাত্র', 'ডাক্তার', 'শিক্ষক', 'কোম্পানির কর্মচারী'] }}
            onClick={() => setDirection('jp-bn')}
          />
        </div>
        <button
          onClick={() => setDirection('mixed')}
          className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            direction === 'mixed'
              ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-300'
              : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700'
          }`}
        >
          <Languages size={16} /> Mixed (random direction each question)
        </button>
      </Card>

      <Card>
        <SectionTitle>3. Number of Questions</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {(['10', '20', '30', 'all'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCountOption(c)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                countOption === c
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {c === 'all' ? `All (${poolSize})` : c}
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          {canStart
            ? `Ready: ${countValue} questions from ${lessons.length} lesson${lessons.length > 1 ? 's' : ''}.`
            : 'Select at least one lesson with 4+ words to start.'}
        </p>
        <Button onClick={handleStart} disabled={!canStart} className="sm:w-56">
          <PlayCircle size={18} /> Start Exam
        </Button>
      </div>
    </div>
  );
}

function DirectionOption({
  active,
  title,
  example,
  onClick,
}: {
  active: boolean;
  title: string;
  example: { q: string; options: string[] };
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-500/15'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-bold">{title}</span>
        {active ? <CheckCircle2 size={18} className="text-indigo-500" /> : <Circle size={18} className="text-slate-300" />}
      </div>
      <p className="text-xs text-slate-400">Question:</p>
      <p className="mb-2 font-semibold">{example.q}</p>
      <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
        {example.options.map((o, i) => (
          <span key={o}>
            {String.fromCharCode(65 + i)}. {o}
          </span>
        ))}
      </div>
    </button>
  );
}
