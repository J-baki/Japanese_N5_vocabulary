import { useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, SkipForward, Home as HomeIcon, RotateCcw, Trophy } from 'lucide-react';
import { Card, Button, Badge, SectionTitle, EmptyState } from '../components/ui';
import { useUIStore } from '../store/uiStore';
import { formatSeconds } from '../lib/format';
import { getVocabById } from '../data/vocabulary';

export default function Result() {
  const lastResult = useUIStore((s) => s.lastResult);
  const navigate = useUIStore((s) => s.navigate);
  const startQuiz = useUIStore((s) => s.startQuiz);
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'skipped'>('all');

  if (!lastResult) {
    return (
      <EmptyState
        icon={<Trophy size={22} />}
        title="No exam result to show"
        description="Complete an exam to see your results here."
        action={<Button onClick={() => navigate('exam-selection')}>Start an Exam</Button>}
      />
    );
  }

  const { exam } = lastResult;
  const wrongAnswers = exam.answers.filter((a) => a.result === 'incorrect');
  const skippedAnswers = exam.answers.filter((a) => a.result === 'skipped');

  const filteredList =
    filter === 'all' ? [...wrongAnswers, ...skippedAnswers] : filter === 'incorrect' ? wrongAnswers : skippedAnswers;

  const practiceMistakes = () => {
    const ids = new Set([...wrongAnswers, ...skippedAnswers].map((a) => a.vocabId));
    const lessons = Array.from(new Set(exam.lessons));
    if (ids.size === 0) return;
    startQuiz({
      lessons,
      direction: exam.direction,
      count: ids.size,
      sourceLabel: 'Practice: Exam Mistakes',
      isMemoryPractice: true,
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15">
          <Trophy size={26} />
        </div>
        <h1 className="text-2xl font-extrabold">Exam Complete</h1>
        <p className="mt-1 text-4xl font-black tracking-tight">
          {exam.score} / {exam.totalQuestions}
        </p>
        <p className="mt-1 text-slate-400">Accuracy: {exam.accuracy}%</p>

        <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3">
          <MiniStat icon={<CheckCircle2 size={18} className="text-emerald-500" />} label="Correct" value={exam.correct} />
          <MiniStat icon={<XCircle size={18} className="text-rose-500" />} label="Incorrect" value={exam.incorrect} />
          <MiniStat icon={<SkipForward size={18} className="text-amber-500" />} label="Skipped" value={exam.skipped} />
        </div>
        <p className="mt-4 text-sm text-slate-400">Time: {formatSeconds(exam.timeSeconds)}</p>
        <p className="mt-1 text-xs text-slate-400">✓ Results saved to your exam history</p>
      </Card>

      <Card>
        <SectionTitle
          action={
            <div className="flex gap-1.5">
              {(['all', 'incorrect', 'skipped'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition ${
                    filter === f
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          }
        >
          Review Answers
        </SectionTitle>
        {filteredList.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Nothing to review — great job! 🎉</p>
        ) : (
          <div className="space-y-2">
            {filteredList.map((a, idx) => {
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
                  <div className="flex flex-wrap items-center gap-2">
                    {a.result === 'incorrect' && (
                      <Badge tone="red">Your answer: {a.selectedText}</Badge>
                    )}
                    <Badge tone="green">Correct: {a.correctText}</Badge>
                    <Badge tone={a.result === 'incorrect' ? 'red' : 'amber'}>{a.result}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button variant="secondary" onClick={practiceMistakes} disabled={wrongAnswers.length + skippedAnswers.length === 0}>
          <RotateCcw size={16} /> Practice Mistakes
        </Button>
        <Button variant="secondary" onClick={() => navigate('memory')}>
          View Memory
        </Button>
        <Button variant="secondary" onClick={() => navigate('exam-selection')}>
          New Exam
        </Button>
        <Button onClick={() => navigate('home')}>
          <HomeIcon size={16} /> Home
        </Button>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 py-3 dark:bg-slate-800/60">
      {icon}
      <span className="text-lg font-bold">{value}</span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}
