import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, XCircle, SkipForward, X, Clock } from 'lucide-react';
import { Card, Button, ProgressBar, Badge } from '../components/ui';
import { useUIStore } from '../store/uiStore';
import { useProgressStore } from '../store/progressStore';
import { useMemoryStore } from '../store/memoryStore';
import { vocabByLesson } from '../data/vocabulary';
import { buildQuiz } from '../lib/quizEngine';
import { formatClock } from '../lib/format';
import type { AnswerResult, AnsweredQuestion, ExamRecord, QuestionOption } from '../types';

export default function Quiz() {
  const config = useUIStore((s) => s.quizConfig);
  const navigate = useUIStore((s) => s.navigate);
  const finishQuiz = useUIStore((s) => s.finishQuiz);
  const getRecentCombos = useProgressStore((s) => s.getRecentCombos);
  const recordDistractors = useProgressStore((s) => s.recordDistractors);
  const addExamResult = useProgressStore((s) => s.addExamResult);
  const recordMemory = useMemoryStore((s) => s.recordResult);

  const pool = useMemo(() => {
    if (!config) return [];
    return config.lessons.flatMap((l) => vocabByLesson[l] ?? []);
  }, [config]);

  const questions = useMemo(() => {
    if (!config || pool.length === 0) return [];
    return buildQuiz(pool, config.direction, config.count, getRecentCombos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, pool]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<QuestionOption | null>(null);
  const [answered, setAnswered] = useState(false);
  const [records, setRecords] = useState<AnsweredQuestion[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const questionStart = useRef(Date.now());
  const examStart = useRef(Date.now());

  useEffect(() => {
    // record distractor combo used for this question, once per question shown
    const q = questions[index];
    if (q) {
      const comboIds = q.options.filter((o) => !o.isCorrect).map((o) => o.vocabId);
      recordDistractors(q.vocab.id, comboIds);
      questionStart.current = Date.now();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, questions.length]);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - examStart.current) / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!config || questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-slate-500">No exam configured. Please select lessons first.</p>
        <Button onClick={() => navigate('exam-selection')}>Go to Exam Selection</Button>
      </div>
    );
  }

  const q = questions[index];
  const isLast = index === questions.length - 1;

  const commitAnswer = (result: AnswerResult, option?: QuestionOption) => {
    const timeMs = Date.now() - questionStart.current;
    const newRecord: AnsweredQuestion = { question: q, result, selected: option, timeMs };
    const nextRecords = [...records, newRecord];
    setRecords(nextRecords);
    recordMemory(q.vocab.id, q.vocab.lesson, result, new Date().toISOString());

    if (isLast) {
      finalize(nextRecords);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleSelect = (option: QuestionOption) => {
    if (answered) return;
    setSelected(option);
    setAnswered(true);
  };

  const handleNext = () => {
    if (!selected) return;
    commitAnswer(selected.isCorrect ? 'correct' : 'incorrect', selected);
  };

  const handleSkip = () => {
    commitAnswer('skipped');
  };

  const finalize = (finalRecords: AnsweredQuestion[]) => {
    const correct = finalRecords.filter((r) => r.result === 'correct').length;
    const incorrect = finalRecords.filter((r) => r.result === 'incorrect').length;
    const skipped = finalRecords.filter((r) => r.result === 'skipped').length;
    const total = finalRecords.length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const timeSeconds = Math.floor((Date.now() - examStart.current) / 1000);

    const exam: ExamRecord = {
      id: `exam-${Date.now()}`,
      date: new Date().toISOString(),
      lessons: config.lessons,
      direction: config.direction,
      totalQuestions: total,
      correct,
      incorrect,
      skipped,
      accuracy,
      score: correct,
      timeSeconds,
      answers: finalRecords.map((r) => ({
        vocabId: r.question.vocab.id,
        lesson: r.question.vocab.lesson,
        result: r.result,
        selectedText: r.selected?.text,
        correctText: r.question.direction === 'bn-jp' ? r.question.vocab.japanese : r.question.vocab.bengali,
        questionText: r.question.direction === 'bn-jp' ? r.question.vocab.bengali : r.question.vocab.japanese,
        direction: r.question.direction,
      })),
    };

    if (!config.isMemoryPractice) {
      addExamResult(exam);
    }
    finishQuiz({ exam, questions });
  };

  const questionPrompt = q.direction === 'bn-jp' ? q.vocab.bengali : q.vocab.japanese;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-400">{config.sourceLabel}</p>
          <p className="text-xs text-slate-400">
            Question {index + 1} / {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Clock size={14} /> {formatClock(elapsed)}
          </span>
          <button
            onClick={() => setShowExitConfirm(true)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <ProgressBar value={((index + (answered ? 1 : 0)) / questions.length) * 100} />

      <Card className="space-y-5">
        <div className="text-center">
          <Badge tone="indigo">{q.direction === 'bn-jp' ? 'Bengali → Japanese' : 'Japanese → Bengali'}</Badge>
          <p className="mt-4 text-xs uppercase tracking-widest text-slate-400">Question</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight">{questionPrompt}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {q.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            let style =
              'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10';
            if (answered) {
              if (opt.isCorrect) {
                style = 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
              } else if (selected?.vocabId === opt.vocabId) {
                style = 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300';
              } else {
                style = 'border-slate-200 opacity-50 dark:border-slate-700';
              }
            }
            return (
              <button
                key={opt.vocabId + i}
                onClick={() => handleSelect(opt)}
                disabled={answered}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-lg font-semibold transition ${style}`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 dark:bg-slate-800">
                  {letter}
                </span>
                <span className="flex-1">{opt.text}</span>
                {answered && opt.isCorrect && <CheckCircle2 size={20} className="text-emerald-500" />}
                {answered && !opt.isCorrect && selected?.vocabId === opt.vocabId && (
                  <XCircle size={20} className="text-rose-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="outline" onClick={handleSkip} disabled={answered}>
            <SkipForward size={16} /> Skip
          </Button>
          <Button onClick={handleNext} disabled={!answered} className="flex-1">
            {isLast ? 'Finish Exam' : 'Next Question'}
          </Button>
        </div>
      </Card>

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="max-w-sm space-y-4">
            <p className="font-bold">Exit this exam?</p>
            <p className="text-sm text-slate-400">Your progress on this exam will not be saved.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowExitConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => navigate('home')}>
                Exit
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
