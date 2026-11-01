import { useState } from 'react';
import { BarChart3, ChevronLeft, CheckCircle2, XCircle, SkipForward } from 'lucide-react';
import { Card, Badge, EmptyState, SectionTitle } from '../components/ui';
import { useProgressStore } from '../store/progressStore';
import { formatDateTime, formatSeconds, lessonLabel } from '../lib/format';
import { getVocabById } from '../data/vocabulary';
import type { ExamRecord } from '../types';

export default function Scores() {
  const examHistory = useProgressStore((s) => s.examHistory);
  const [detail, setDetail] = useState<ExamRecord | null>(null);

  if (examHistory.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 size={22} />}
        title="No exam history yet"
        description="Complete an exam to start building your score history."
      />
    );
  }

  if (detail) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setDetail(null)}
          className="flex items-center gap-1 text-sm font-semibold text-indigo-500 hover:underline"
        >
          <ChevronLeft size={16} /> Back to Scores
        </button>
        <div>
          <h1 className="text-2xl font-extrabold">{lessonLabel(detail.lessons)}</h1>
          <p className="text-slate-400">{formatDateTime(detail.date)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Score" value={`${detail.score}/${detail.totalQuestions}`} />
          <MiniStat label="Accuracy" value={`${detail.accuracy}%`} />
          <MiniStat label="Time" value={formatSeconds(detail.timeSeconds)} />
          <MiniStat label="Direction" value={detail.direction} />
        </div>
        <Card>
          <SectionTitle>Answers</SectionTitle>
          <div className="space-y-2">
            {detail.answers.map((a, idx) => {
              const vocab = getVocabById(a.vocabId);
              return (
                <div
                  key={idx}
                  className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"
                >
                  <div>
                    <p className="font-semibold">
                      {vocab?.japanese} <span className="text-slate-400">— {vocab?.bengali}</span>
                    </p>
                    <p className="text-xs text-slate-400">Lesson {a.lesson}</p>
                  </div>
                  <Badge tone={a.result === 'correct' ? 'green' : a.result === 'incorrect' ? 'red' : 'amber'}>
                    {a.result}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Exam Scores</h1>
        <p className="text-slate-500 dark:text-slate-400">Your complete exam history, most recent first.</p>
      </div>

      <div className="space-y-3">
        {examHistory.map((exam) => (
          <Card key={exam.id} className="cursor-pointer transition hover:border-indigo-300 dark:hover:border-indigo-500" >
            <button onClick={() => setDetail(exam)} className="flex w-full flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">{lessonLabel(exam.lessons)}</p>
                <p className="text-xs text-slate-400">{formatDateTime(exam.date)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 size={14} /> {exam.correct}
                </span>
                <span className="flex items-center gap-1 text-rose-500">
                  <XCircle size={14} /> {exam.incorrect}
                </span>
                <span className="flex items-center gap-1 text-amber-500">
                  <SkipForward size={14} /> {exam.skipped}
                </span>
                <Badge tone="indigo">{exam.accuracy}%</Badge>
                <span className="text-slate-400">{formatSeconds(exam.timeSeconds)}</span>
              </div>
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold capitalize">{value}</p>
    </Card>
  );
}
