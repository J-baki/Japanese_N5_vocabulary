import type { ReactNode } from 'react';
import { Flame, Trophy, Target, Brain, FileText, ListChecks, BookOpen, TrendingUp } from 'lucide-react';
import { Card, StatCard, Button, SectionTitle, Badge } from '../components/ui';
import { useProgressStore } from '../store/progressStore';
import { useMemoryStore } from '../store/memoryStore';
import { useUIStore } from '../store/uiStore';
import { overallAccuracy, computeLessonImprovements } from '../lib/stats';
import { formatSeconds, lessonLabel } from '../lib/format';

export default function Home() {
  const examHistory = useProgressStore((s) => s.examHistory);
  const streak = useProgressStore((s) => s.streak);
  const correctVocabIds = useProgressStore((s) => s.correctVocabIds);
  const lessonStats = useProgressStore((s) => s.lessonStats);
  const memoryItems = useMemoryStore((s) => s.items);
  const navigate = useUIStore((s) => s.navigate);
  const startQuizPage = () => navigate('exam-selection');

  const accuracy = overallAccuracy(examHistory);
  const lastExam = examHistory[0];
  const improvements = computeLessonImprovements(lessonStats)
    .filter((i) => i.improvement !== null)
    .sort((a, b) => (b.improvement ?? 0) - (a.improvement ?? 0))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Home Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Keep going! You're doing great.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={<Flame size={20} />}
          label="Current Streak"
          value={`${streak.current}`}
          sub="Days"
          tint="orange"
        />
        <StatCard
          icon={<Trophy size={20} />}
          label="Longest Streak"
          value={`${streak.longest}`}
          sub="Days"
          tint="purple"
        />
        <StatCard icon={<Target size={20} />} label="Overall Accuracy" value={`${accuracy}%`} tint="green" />
        <StatCard
          icon={<BookOpen size={20} />}
          label="Vocabulary Learned"
          value={correctVocabIds.length}
          sub="Words"
          tint="indigo"
        />
        <StatCard
          icon={<Brain size={20} />}
          label="Memory Items"
          value={Object.keys(memoryItems).length}
          sub="Items"
          tint="blue"
        />
        <StatCard
          icon={<FileText size={20} />}
          label="Last Exam Score"
          value={lastExam ? `${lastExam.accuracy}%` : '—'}
          tint="pink"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle
            action={
              <button onClick={() => navigate('scores')} className="text-xs font-semibold text-indigo-500 hover:underline">
                View All
              </button>
            }
          >
            Recent Exam
          </SectionTitle>
          {lastExam ? (
            <div className="space-y-3 text-sm">
              <Row label="Lessons" value={lessonLabel(lastExam.lessons)} />
              <Row label="Score" value={`${lastExam.score} / ${lastExam.totalQuestions}`} />
              <Row label="Accuracy" value={<Badge tone="green">{lastExam.accuracy}%</Badge>} />
              <Row label="Time Taken" value={formatSeconds(lastExam.timeSeconds)} />
              <Button className="mt-2 w-full" onClick={startQuizPage}>
                Start New Exam
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="text-sm text-slate-400">No exams taken yet. Start your first exam!</p>
              <Button onClick={startQuizPage}>Start New Exam</Button>
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle
            action={
              <button onClick={() => navigate('improvement')} className="text-xs font-semibold text-indigo-500 hover:underline">
                View All
              </button>
            }
          >
            Improvement Summary
          </SectionTitle>
          {improvements.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-2 font-medium">Lesson</th>
                  <th className="pb-2 font-medium">Previous</th>
                  <th className="pb-2 font-medium">Current</th>
                  <th className="pb-2 font-medium text-right">Improvement</th>
                </tr>
              </thead>
              <tbody>
                {improvements.map((i) => (
                  <tr key={i.lesson} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-2 font-medium">Lesson {i.lesson}</td>
                    <td className="py-2 text-slate-500">{i.previous}%</td>
                    <td className="py-2 text-slate-500">{i.current}%</td>
                    <td className="py-2 text-right">
                      <span className={`font-semibold ${(i.improvement ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {(i.improvement ?? 0) >= 0 ? '+' : ''}
                        {i.improvement}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">
              Complete the same lesson twice to see improvement trends.
            </p>
          )}
        </Card>
      </div>

      <Card>
        <SectionTitle>Quick Actions</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <QuickAction icon={<FileText size={18} />} label="Start Exam" onClick={() => navigate('exam-selection')} tint="indigo" />
          <QuickAction icon={<Brain size={18} />} label="Memory Review" onClick={() => navigate('memory')} tint="purple" />
          <QuickAction icon={<BookOpen size={18} />} label="View Lessons" onClick={() => navigate('exam-selection')} tint="green" />
          <QuickAction icon={<Flame size={18} />} label="Check Streak" onClick={() => navigate('streak')} tint="orange" />
          <QuickAction icon={<TrendingUp size={18} />} label="View Improvement" onClick={() => navigate('improvement')} tint="blue" />
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  onClick,
  tint,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tint: 'indigo' | 'purple' | 'green' | 'orange' | 'blue';
}) {
  const tints: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-3 py-3 text-left text-sm font-semibold transition hover:opacity-80 ${tints[tint]}`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      <ListChecks size={14} className="opacity-50" />
    </button>
  );
}
