import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Streak from './pages/Streak';
import ExamSelection from './pages/ExamSelection';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import MemoryReview from './pages/MemoryReview';
import Scores from './pages/Scores';
import Improvement from './pages/Improvement';
import Settings from './pages/Settings';
import { useUIStore } from './store/uiStore';
import { useDataStore } from './store/dataStore';

export default function App() {
  const view = useUIStore((s) => s.view);
  const theme = useDataStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  return (
    <Layout>
      {view === 'home' && <Home />}
      {view === 'streak' && <Streak />}
      {view === 'exam-selection' && <ExamSelection />}
      {view === 'quiz' && <Quiz />}
      {view === 'result' && <Result />}
      {view === 'memory' && <MemoryReview />}
      {view === 'scores' && <Scores />}
      {view === 'improvement' && <Improvement />}
      {view === 'settings' && <Settings />}
    </Layout>
  );
}
