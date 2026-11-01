import { useRef, useState } from 'react';
import {
  Sun,
  Moon,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  Info,
  Database,
} from 'lucide-react';
import { Card, Button, SectionTitle, Badge } from '../components/ui';
import { useDataStore } from '../store/dataStore';
import { useMemoryStore } from '../store/memoryStore';
import { useProgressStore } from '../store/progressStore';

export default function Settings() {
  const theme = useDataStore((s) => s.theme);
  const setTheme = useDataStore((s) => s.setTheme);
  const memoryItems = useMemoryStore((s) => s.items);
  const removeAllMemory = useMemoryStore((s) => s.removeAll);
  const progress = useProgressStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState<null | 'memory' | 'progress' | 'streak'>(null);
  const [message, setMessage] = useState<string | null>(null);

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      Voca_all_data: JSON.parse(localStorage.getItem('Voca_all_data') ?? '{}'),
      Voca_memory: JSON.parse(localStorage.getItem('Voca_memory') ?? '{}'),
      Voca_progress: JSON.parse(localStorage.getItem('Voca_progress') ?? '{}'),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Voca_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Backup file downloaded to your Downloads folder.');
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed.Voca_all_data) localStorage.setItem('Voca_all_data', JSON.stringify(parsed.Voca_all_data));
        if (parsed.Voca_memory) localStorage.setItem('Voca_memory', JSON.stringify(parsed.Voca_memory));
        if (parsed.Voca_progress) localStorage.setItem('Voca_progress', JSON.stringify(parsed.Voca_progress));
        setMessage('Data restored successfully. Reloading…');
        setTimeout(() => window.location.reload(), 900);
      } catch {
        setMessage('Could not read that file. Please choose a valid Voca backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your appearance, data, and preferences.</p>
      </div>

      <Card>
        <SectionTitle>Appearance</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-semibold transition ${
              theme === 'light'
                ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-500 dark:border-slate-700'
            }`}
          >
            <Sun size={18} /> Light Mode
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-semibold transition ${
              theme === 'dark'
                ? 'border-indigo-400 bg-indigo-500/15 text-indigo-300'
                : 'border-slate-200 text-slate-500 dark:border-slate-700'
            }`}
          >
            <Moon size={18} /> Dark Mode
          </button>
        </div>
      </Card>

      <Card>
        <SectionTitle>Data Storage</SectionTitle>
        <p className="mb-4 flex items-start gap-2 text-sm text-slate-400">
          <Info size={16} className="mt-0.5 shrink-0" />
          Voca saves your progress locally in this browser across three files: <b className="mx-1">Voca_all_data</b>
          (preferences), <b className="mx-1">Voca_memory</b> (mistakes &amp; skipped words), and
          <b className="mx-1">Voca_progress</b> (exam history, streaks &amp; improvement). Use Export to create a
          backup copy, and Import to restore it later — even after clearing your browser or moving to a new device.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={exportData}>
            <Download size={16} /> Export Backup
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Import Backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importData(f);
            }}
          />
        </div>
        {message && <p className="mt-3 text-sm text-indigo-500">{message}</p>}
      </Card>

      <Card>
        <SectionTitle>Memory Management</SectionTitle>
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/60">
          <span className="flex items-center gap-2">
            <Database size={16} className="text-slate-400" /> {Object.keys(memoryItems).length} items stored
          </span>
          <Button variant="danger" onClick={() => setConfirm('memory')} disabled={Object.keys(memoryItems).length === 0}>
            <Trash2 size={16} /> Delete All Memory
          </Button>
        </div>
      </Card>

      <Card>
        <SectionTitle>Progress &amp; Streak</SectionTitle>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/60">
            <span>Reset streak only (current: {progress.streak.current} days)</span>
            <Button variant="outline" onClick={() => setConfirm('streak')}>
              <RotateCcw size={16} /> Reset Streak
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800/60">
            <span>Reset all exam history, scores &amp; improvement stats</span>
            <Button variant="danger" onClick={() => setConfirm('progress')}>
              <Trash2 size={16} /> Reset All Progress
            </Button>
          </div>
        </div>
      </Card>

      <Card className="flex items-center gap-3 text-sm text-slate-400">
        <Badge tone="indigo">v1.0</Badge>
        Voca — Personal Japanese ⇄ Bengali vocabulary trainer. Learn → Test → Record Mistakes → Review → Retest → Improve.
      </Card>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="max-w-sm space-y-4">
            <p className="font-bold">
              {confirm === 'memory' && 'Delete all memory items?'}
              {confirm === 'streak' && 'Reset your streak?'}
              {confirm === 'progress' && 'Reset all progress data?'}
            </p>
            <p className="text-sm text-slate-400">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm === 'memory') removeAllMemory();
                  if (confirm === 'streak') progress.resetStreak();
                  if (confirm === 'progress') progress.resetAll();
                  setConfirm(null);
                }}
              >
                Confirm
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
