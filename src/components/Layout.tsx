import type { ReactNode } from 'react';
import {
  Home,
  Flame,
  ListChecks,
  Brain,
  BarChart3,
  TrendingUp,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  BookOpenText,
} from 'lucide-react';
import { useUIStore, type View } from '../store/uiStore';
import { useDataStore } from '../store/dataStore';
import { useMemoryStore } from '../store/memoryStore';

const NAV_ITEMS: { id: View; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'streak', label: 'Streak', icon: Flame },
  { id: 'exam-selection', label: 'Exam Selection', icon: ListChecks },
  { id: 'memory', label: 'Memory Review', icon: Brain },
  { id: 'scores', label: 'Scores', icon: BarChart3 },
  { id: 'improvement', label: 'Improvement Statistics', icon: TrendingUp },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children }: { children: ReactNode }) {
  const view = useUIStore((s) => s.view);
  const navigate = useUIStore((s) => s.navigate);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const theme = useDataStore((s) => s.theme);
  const toggleTheme = useDataStore((s) => s.toggleTheme);
  const memoryCount = Object.keys(useMemoryStore((s) => s.items)).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        {/* Sidebar - desktop */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900 lg:flex">
          <SidebarContent
            view={view}
            navigate={navigate}
            theme={theme}
            toggleTheme={toggleTheme}
            memoryCount={memoryCount}
          />
        </aside>

        {/* Sidebar - mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 flex justify-end">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
              <SidebarContent
                view={view}
                navigate={navigate}
                theme={theme}
                toggleTheme={toggleTheme}
                memoryCount={memoryCount}
              />
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 font-bold">
              <BookOpenText size={20} className="text-indigo-500" />
              Voca
            </div>
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  view,
  navigate,
  theme,
  toggleTheme,
  memoryCount,
}: {
  view: View;
  navigate: (v: View) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  memoryCount: number;
}) {
  return (
    <>
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200 dark:shadow-none">
          <BookOpenText size={18} />
        </div>
        <span className="text-lg font-bold tracking-tight">Voca</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon size={18} />
                {item.label}
              </span>
              {item.id === 'memory' && memoryCount > 0 && (
                <span className="rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {memoryCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
          <span className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Sun size={16} className={theme === 'light' ? 'text-amber-500' : 'text-slate-400'} />
            Theme
          </span>
          <button
            onClick={toggleTheme}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'
            }`}
            aria-label="Toggle theme"
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <Moon size={16} className={theme === 'dark' ? 'text-indigo-400' : 'text-slate-400'} />
        </div>
      </div>
    </>
  );
}
