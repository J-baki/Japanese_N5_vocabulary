import { useMemo, useState } from 'react';
import { Brain, Trash2, PlayCircle, ChevronLeft, XCircle, SkipForward, CheckCircle2 } from 'lucide-react';
import { Card, Button, Badge, SectionTitle, EmptyState } from '../components/ui';
import { useMemoryStore } from '../store/memoryStore';
import { useUIStore } from '../store/uiStore';
import { getVocabById } from '../data/vocabulary';
import { formatDate } from '../lib/format';

export default function MemoryReview() {
  const items = useMemoryStore((s) => s.items);
  const removeItem = useMemoryStore((s) => s.removeItem);
  const removeLesson = useMemoryStore((s) => s.removeLesson);
  const removeAll = useMemoryStore((s) => s.removeAll);
  const startQuiz = useUIStore((s) => s.startQuiz);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<number, string[]>();
    Object.values(items).forEach((it) => {
      const arr = map.get(it.lesson) ?? [];
      arr.push(it.vocabId);
      map.set(it.lesson, arr);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [items]);

  const totalCount = Object.keys(items).length;

  const practicePool = (vocabIds: string[], lesson: 'all' | number) => {
    if (vocabIds.length < 1) return;
    startQuiz({
      lessons: lesson === 'all' ? grouped.map((g) => g[0]) : [lesson],
      direction: 'mixed',
      count: vocabIds.length,
      sourceLabel: lesson === 'all' ? 'Memory Practice: All Lessons' : `Memory Practice: Lesson ${lesson}`,
      isMemoryPractice: true,
    });
  };

  if (totalCount === 0) {
    return (
      <EmptyState
        icon={<Brain size={22} />}
        title="Your memory box is empty"
        description="Incorrect and skipped answers from your exams will show up here for focused review."
      />
    );
  }

  if (selectedLesson !== null) {
    const ids = grouped.find((g) => g[0] === selectedLesson)?.[1] ?? [];
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-1 text-sm font-semibold text-indigo-500 hover:underline"
        >
          <ChevronLeft size={16} /> Back to Memory
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Lesson {selectedLesson} Memory</h1>
            <p className="text-slate-400">{ids.length} item(s) to review</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => practicePool(ids, selectedLesson)}>
              <PlayCircle size={16} /> Practice Lesson
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                removeLesson(selectedLesson);
                setSelectedLesson(null);
              }}
            >
              <Trash2 size={16} /> Delete Lesson Memory
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {ids.map((id) => {
            const entry = items[id];
            const vocab = getVocabById(id);
            return (
              <Card key={id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-bold">
                    {vocab?.japanese} <span className="text-base font-medium text-slate-400">— {vocab?.bengali}</span>
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>Last tested: {formatDate(entry.lastTestedDate)}</span>
                    <Badge tone={entry.lastResult === 'correct' ? 'green' : entry.lastResult === 'incorrect' ? 'red' : 'amber'}>
                      Last: {entry.lastResult}
                    </Badge>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={13} className="text-emerald-500" /> {entry.timesCorrect}
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle size={13} className="text-rose-500" /> {entry.timesIncorrect}
                    </span>
                    <span className="flex items-center gap-1">
                      <SkipForward size={13} className="text-amber-500" /> {entry.timesSkipped}
                    </span>
                    <span>Total attempts: {entry.totalAttempts}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(id)}
                  className="self-start rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10"
                  title="Delete this memory item"
                >
                  <Trash2 size={16} />
                </button>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Memory Review</h1>
          <p className="text-slate-500 dark:text-slate-400">Words you got wrong or skipped, organized by lesson.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => practicePool(Object.keys(items), 'all')}>
            <PlayCircle size={16} /> Practice All Memory
          </Button>
          <Button variant="danger" onClick={() => setConfirmAll(true)}>
            <Trash2 size={16} /> Delete All
          </Button>
        </div>
      </div>

      <Card>
        <SectionTitle>Total Memory Items: {totalCount}</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map(([lesson, ids]) => (
            <button
              key={lesson}
              onClick={() => setSelectedLesson(lesson)}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3.5 text-left transition hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10"
            >
              <span>
                <span className="block font-bold">Lesson {lesson}</span>
                <span className="block text-xs text-slate-400">{ids.length} item(s)</span>
              </span>
              <Badge tone="indigo">{ids.length}</Badge>
            </button>
          ))}
        </div>
      </Card>

      {confirmAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="max-w-sm space-y-4">
            <p className="font-bold">Delete all memory items?</p>
            <p className="text-sm text-slate-400">This will permanently remove all saved memory data. This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmAll(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  removeAll();
                  setConfirmAll(false);
                }}
              >
                Delete All
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
