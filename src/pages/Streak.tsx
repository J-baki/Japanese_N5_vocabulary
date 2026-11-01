import { Flame, Trophy, CalendarCheck, CalendarDays, Check } from 'lucide-react';
import { Card, StatCard, Button, SectionTitle } from '../components/ui';
import { useProgressStore } from '../store/progressStore';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function Streak() {
  const streak = useProgressStore((s) => s.streak);
  const checkIn = useProgressStore((s) => s.checkIn);
  const hasCheckedInToday = useProgressStore((s) => s.hasCheckedInToday());

  const handleCheckIn = () => {
    checkIn();
  };

  // Build a simple 7-week (49 day) activity grid ending today
  const days: { key: string; active: boolean }[] = [];
  const historySet = new Set(streak.history);
  const now = new Date();
  for (let i = 48; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, active: historySet.has(key) });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Streak Board</h1>
        <p className="text-slate-500 dark:text-slate-400">Consistency builds vocabulary. Keep the fire alive!</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<Flame size={20} />} label="Current Streak" value={streak.current} sub="Days" tint="orange" />
        <StatCard icon={<Trophy size={20} />} label="Longest Streak" value={streak.longest} sub="Days" tint="purple" />
        <StatCard icon={<CalendarCheck size={20} />} label="Total Active Days" value={streak.totalActiveDays} tint="green" />
        <StatCard
          icon={<CalendarDays size={20} />}
          label="Streak Started"
          value={streak.history[0] ? streak.history[0] : '—'}
          tint="blue"
        />
      </div>

      <Card className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg shadow-orange-200 dark:shadow-none">
          <Flame size={28} />
        </div>
        <div>
          <p className="text-3xl font-black">{streak.current} Day{streak.current !== 1 ? 's' : ''}</p>
          <p className="text-slate-400">Current Streak</p>
        </div>
        <Button onClick={handleCheckIn} disabled={hasCheckedInToday} className="w-full max-w-xs">
          {hasCheckedInToday ? (
            <>
              <Check size={16} /> Checked in today
            </>
          ) : (
            'Daily Check-in'
          )}
        </Button>
        {hasCheckedInToday && (
          <p className="text-xs text-slate-400">You've already checked in today. Come back tomorrow!</p>
        )}
      </Card>

      <Card>
        <SectionTitle>Activity (last 49 days)</SectionTitle>
        <div className="grid grid-cols-7 gap-1.5 sm:grid-cols-[repeat(49,minmax(0,1fr))]">
          {days.map((d) => (
            <div
              key={d.key}
              title={d.key}
              className={`aspect-square w-full rounded-md ${
                d.key === todayKey()
                  ? 'ring-2 ring-indigo-400 ring-offset-1 dark:ring-offset-slate-900'
                  : ''
              } ${d.active ? 'bg-orange-400' : 'bg-slate-100 dark:bg-slate-800'}`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
