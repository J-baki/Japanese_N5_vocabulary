import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, Badge, EmptyState } from '../components/ui';
import { useProgressStore } from '../store/progressStore';
import { computeLessonImprovements } from '../lib/stats';
import { formatSeconds } from '../lib/format';

export default function Improvement() {
  const lessonStats = useProgressStore((s) => s.lessonStats);
  const [sortBy, setSortBy] = useState<'lesson' | 'improvement' | 'accuracy'>('lesson');

  const data = computeLessonImprovements(lessonStats);

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<TrendingUp size={22} />}
        title="No improvement data yet"
        description="Complete the same lesson at least twice to see how your accuracy improves over time."
      />
    );
  }

  const sorted = [...data].sort((a, b) => {
    if (sortBy === 'improvement') return (b.improvement ?? -999) - (a.improvement ?? -999);
    if (sortBy === 'accuracy') return b.current - a.current;
    return a.lesson - b.lesson;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Improvement Statistics</h1>
          <p className="text-slate-500 dark:text-slate-400">Compare previous vs. current performance lesson by lesson.</p>
        </div>
        <div className="flex gap-1.5">
          {(['lesson', 'improvement', 'accuracy'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold capitalize transition ${
                sortBy === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              Sort by {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {sorted.map((item) => (
          <Card key={item.lesson}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold">Lesson {item.lesson}</p>
                <p className="text-xs text-slate-400">
                  {item.attempts} attempt{item.attempts !== 1 ? 's' : ''} · avg time {formatSeconds(item.avgTimeSeconds)}
                </p>
              </div>
              <ImprovementBadge value={item.improvement} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Stat label="Previous" value={item.previous !== null ? `${item.previous}%` : '—'} />
              <Stat label="Current" value={`${item.current}%`} highlight />
              <Stat label="Best Score" value={`${item.bestScore}%`} />
              <Stat label="Correct" value={item.correct} tone="green" />
              <Stat label="Incorrect" value={item.incorrect} tone="red" />
            </div>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                style={{ width: `${item.current}%` }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ImprovementBadge({ value }: { value: number | null }) {
  if (value === null) return <Badge tone="slate">First attempt</Badge>;
  if (value > 0)
    return (
      <Badge tone="green">
        <TrendingUp size={12} className="mr-1 inline" /> +{value}%
      </Badge>
    );
  if (value < 0)
    return (
      <Badge tone="red">
        <TrendingDown size={12} className="mr-1 inline" /> {value}%
      </Badge>
    );
  return (
    <Badge tone="slate">
      <Minus size={12} className="mr-1 inline" /> No change
    </Badge>
  );
}

function Stat({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  tone?: 'green' | 'red';
}) {
  const toneClass = tone === 'green' ? 'text-emerald-500' : tone === 'red' ? 'text-rose-500' : '';
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 text-center dark:bg-slate-800/60">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`text-base font-bold ${highlight ? 'text-indigo-500' : toneClass}`}>{value}</p>
    </div>
  );
}
