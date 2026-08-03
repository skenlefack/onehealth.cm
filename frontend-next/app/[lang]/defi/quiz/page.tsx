'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getDusscQuiz, createDusscSession, submitDusscResponse, completeDusscSession } from '@/lib/api';
import { Loader2, ChevronRight, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

/* ── Palette DUSS-C ── */
const C = {
  primary: '#2F5D3A',
  accent: '#B4741F',
  paper: '#EAEFEB',
  encre: '#12333D',
  human: '#C0392B',
  animal: '#E67E22',
  plant: '#27AE60',
  environment: '#2980B9',
};

const PILLARS = [
  { color: C.human, labelFr: 'Humaine', labelEn: 'Human' },
  { color: C.animal, labelFr: 'Animale', labelEn: 'Animal' },
  { color: C.plant, labelFr: 'Végétale', labelEn: 'Plant' },
  { color: C.environment, labelFr: 'Environnement', labelEn: 'Environment' },
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/* ── i18n literals ── */
const T = {
  fr: {
    loading: 'Chargement du quiz\u2026',
    errorLoad: 'Impossible de charger le quiz. Veuillez r\u00e9essayer.',
    retry: 'R\u00e9essayer',
    question: 'Question',
    of: 'sur',
    next: 'Suivant',
    finish: 'Terminer',
    correct: 'Bonne r\u00e9ponse\u202f!',
    incorrect: 'La bonne r\u00e9ponse \u00e9tait',
    misconception: 'Id\u00e9e fausse\u202f:',
    action: 'Ce qu\u2019il faut retenir\u202f:',
    selectOption: 'S\u00e9lectionnez une r\u00e9ponse',
    submitting: 'V\u00e9rification\u2026',
    demographicsTitle: 'Informations optionnelles',
    demographicsSubtitle: 'Ces informations sont anonymes et nous aident \u00e0 am\u00e9liorer le quiz.',
    region: 'R\u00e9gion',
    milieu: 'Milieu',
    trancheAge: 'Tranche d\u2019\u00e2ge',
    urban: 'Urbain',
    rural: 'Rural',
    periUrban: 'P\u00e9ri-urbain',
    skip: 'Passer',
    submit: 'Envoyer et voir mes r\u00e9sultats',
    completing: 'Finalisation\u2026',
    selectRegion: 'S\u00e9lectionnez une r\u00e9gion',
    selectAge: 'S\u00e9lectionnez',
  },
  en: {
    loading: 'Loading quiz\u2026',
    errorLoad: 'Unable to load the quiz. Please try again.',
    retry: 'Retry',
    question: 'Question',
    of: 'of',
    next: 'Next',
    finish: 'Finish',
    correct: 'Correct!',
    incorrect: 'The correct answer was',
    misconception: 'Common misconception:',
    action: 'Key takeaway:',
    selectOption: 'Select an answer',
    submitting: 'Checking\u2026',
    demographicsTitle: 'Optional information',
    demographicsSubtitle: 'This information is anonymous and helps us improve the quiz.',
    region: 'Region',
    milieu: 'Setting',
    trancheAge: 'Age range',
    urban: 'Urban',
    rural: 'Rural',
    periUrban: 'Peri-urban',
    skip: 'Skip',
    submit: 'Submit and see my results',
    completing: 'Finalizing\u2026',
    selectRegion: 'Select a region',
    selectAge: 'Select',
  },
};

const REGIONS_CM = [
  'Adamaoua', 'Centre', 'Est', 'Extr\u00eame-Nord',
  'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest',
];

const AGE_RANGES = ['<15', '15-24', '25-34', '35-44', '45-54', '55-64', '65+'];

/* ── Types ── */
interface QuizQuestion {
  id: number;
  question_id?: number;
  texte_fr?: string;
  texte_en?: string;
  text?: string;
  bloc: string;
  pilier?: string;
  options: { key: string; text: string }[] | string[];
  ordre?: number;
  [key: string]: unknown;
}

interface FeedbackData {
  is_correct: boolean;
  correct_answer: string;
  explication?: string;
  action?: string;
  idee_fausse?: string;
}

/* ════════════════════════════════════════════════════════
   Quiz Page Component
   ════════════════════════════════════════════════════════ */
export default function DefiQuizPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen" style={{ background: C.paper }}><Loader2 className="animate-spin" size={32} style={{ color: C.primary }} /></div>}>
      <DefiQuizPage />
    </Suspense>
  );
}

function DefiQuizPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const langParam = (params?.lang as string) || 'fr';
  const lang = (langParam === 'en' ? 'en' : 'fr') as 'fr' | 'en';
  const profil = searchParams.get('profil') || '';
  const t = T[lang];

  /* ── Quiz state ── */
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState(Date.now());
  const [sessionStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Page-level state ── */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uuid, setUuid] = useState('');
  const [showDemographics, setShowDemographics] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'in' | 'out' | ''>('');

  /* ── Demographics state ── */
  const [demoRegion, setDemoRegion] = useState('');
  const [demoMilieu, setDemoMilieu] = useState('');
  const [demoAge, setDemoAge] = useState('');

  const feedbackRef = useRef<HTMLDivElement>(null);

  /* ── Initialization ── */
  const initQuiz = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get or create UUID
      let sessionUuid = sessionStorage.getItem('dussc_session_uuid') || '';
      if (!sessionUuid) {
        sessionUuid = crypto.randomUUID();
        sessionStorage.setItem('dussc_session_uuid', sessionUuid);
      }
      setUuid(sessionUuid);

      const sessionProfil = profil || sessionStorage.getItem('dussc_profil') || '';

      // Create session and fetch quiz in parallel
      const [, quizRes] = await Promise.all([
        createDusscSession({
          uuid: sessionUuid,
          langue: lang,
          profil: sessionProfil,
          canal: 'web',
          consent: 'oui',
        }),
        getDusscQuiz(lang, sessionProfil),
      ]);

      if (!quizRes.success || !quizRes.data) {
        throw new Error('quiz_load_failed');
      }

      // Normalize questions array
      const rawQuestions = Array.isArray(quizRes.data)
        ? quizRes.data
        : (quizRes.data as any).questions || [];

      if (rawQuestions.length === 0) {
        throw new Error('no_questions');
      }

      setQuestions(rawQuestions);
      setStartTime(Date.now());
    } catch (err) {
      console.error('Quiz init error:', err);
      setError(t.errorLoad);
    } finally {
      setLoading(false);
    }
  }, [lang, profil, t.errorLoad]);

  useEffect(() => {
    initQuiz();
  }, [initQuiz]);

  /* ── Helpers ── */
  const currentQuestion = questions[currentIndex] ?? null;
  const isLastQuestion = currentIndex === questions.length - 1;
  const isFeedbackBloc = currentQuestion
    ? !['pre_test', 'post_test'].includes(currentQuestion.bloc?.toLowerCase?.() ?? '')
    : true;
  const questionId = currentQuestion?.question_id ?? currentQuestion?.id ?? 0;

  const getQuestionText = (q: QuizQuestion): string => {
    if (lang === 'en' && q.texte_en) return q.texte_en;
    if (q.texte_fr) return q.texte_fr;
    return (q.text as string) || '';
  };

  const getOptions = (q: QuizQuestion): { key: string; text: string }[] => {
    if (!q.options) return [];
    return q.options.map((opt, i) => {
      if (typeof opt === 'string') {
        return { key: OPTION_LETTERS[i] || String(i), text: opt };
      }
      return opt;
    });
  };

  const getBlocLabel = (bloc: string): string => {
    const labels: Record<string, Record<string, string>> = {
      pre_test: { fr: 'Pr\u00e9-test', en: 'Pre-test' },
      post_test: { fr: 'Post-test', en: 'Post-test' },
      apprentissage: { fr: 'Apprentissage', en: 'Learning' },
      sensibilisation: { fr: 'Sensibilisation', en: 'Awareness' },
    };
    const key = bloc?.toLowerCase?.() ?? '';
    return labels[key]?.[lang] ?? bloc ?? '';
  };

  const getPillarColor = (pilier?: string): string => {
    const map: Record<string, string> = {
      humaine: C.human,
      animale: C.animal,
      vegetale: C.plant,
      'v\u00e9g\u00e9tale': C.plant,
      environnement: C.environment,
      human: C.human,
      animal: C.animal,
      plant: C.plant,
      environment: C.environment,
    };
    return map[pilier?.toLowerCase?.() ?? ''] ?? C.primary;
  };

  /* ── Submit answer ── */
  const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitting || !currentQuestion) return;

    const durationMs = Date.now() - startTime;
    setIsSubmitting(true);

    try {
      const options = getOptions(currentQuestion);
      const res = await submitDusscResponse(uuid, {
        question_id: questionId,
        answer: selectedAnswer,
        bloc: currentQuestion.bloc || '',
        question_order: currentQuestion.ordre ?? currentIndex + 1,
        duration_ms: durationMs,
        lang,
        options_order: options.map((o) => o.key),
      });

      setAnsweredQuestions((prev) => new Set(prev).add(currentIndex));

      if (isFeedbackBloc && res.success && res.data) {
        setFeedback(res.data as FeedbackData);
        // Scroll to feedback after render
        setTimeout(() => {
          feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      } else {
        // No feedback for pre_test/post_test — auto-advance
        advanceQuestion();
      }
    } catch (err) {
      console.error('Submit error:', err);
      // Still advance on error to not block the user
      setAnsweredQuestions((prev) => new Set(prev).add(currentIndex));
      advanceQuestion();
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Advance to next question or finish ── */
  const advanceQuestion = useCallback(() => {
    if (isLastQuestion) {
      setShowDemographics(true);
      return;
    }
    setSlideDirection('out');
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setFeedback(null);
      setStartTime(Date.now());
      setSlideDirection('in');
      setTimeout(() => setSlideDirection(''), 300);
    }, 200);
  }, [isLastQuestion]);

  const handleNext = () => {
    if (feedback) {
      advanceQuestion();
    } else if (selectedAnswer && !answeredQuestions.has(currentIndex)) {
      handleSubmit();
    }
  };

  /* ── Complete session ── */
  const handleComplete = async (skipDemographics = false) => {
    setIsCompleting(true);
    const durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);

    try {
      const res = await completeDusscSession(uuid, {
        region: skipDemographics ? undefined : demoRegion || undefined,
        milieu: skipDemographics ? undefined : demoMilieu || undefined,
        tranche_age: skipDemographics ? undefined : demoAge || undefined,
        duration_seconds: durationSeconds,
      });

      if (res.success && res.data) {
        sessionStorage.setItem('dussc_results', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Complete error:', err);
    } finally {
      router.push(`/${lang}/defi/result`);
    }
  };

  /* ── Progress ── */
  const progress = questions.length > 0
    ? ((answeredQuestions.size) / questions.length) * 100
    : 0;

  /* ═══════════ Loading state ═══════════ */
  if (loading) {
    return (
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: C.paper }}>
        <PillarRail />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <Loader2 className="h-10 w-10 animate-spin" style={{ color: C.primary }} />
          <p className="text-base" style={{ color: C.encre }}>{t.loading}</p>
        </div>
        <PillarRail />
      </main>
    );
  }

  /* ═══════════ Error state ═══════════ */
  if (error) {
    return (
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: C.paper }}>
        <PillarRail />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-base text-center text-red-600 font-medium">{error}</p>
          <button
            onClick={initQuiz}
            className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: C.accent }}
          >
            {t.retry}
          </button>
        </div>
        <PillarRail />
      </main>
    );
  }

  /* ═══════════ Demographics form ═══════════ */
  if (showDemographics) {
    return (
      <main className="min-h-screen flex flex-col" style={{ backgroundColor: C.paper }}>
        <PillarRail />
        <div className="flex-1 mx-auto w-full max-w-lg px-4 py-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: C.primary }}>
            {t.demographicsTitle}
          </h2>
          <p className="text-sm mb-8" style={{ color: '#6b7280' }}>
            {t.demographicsSubtitle}
          </p>

          <div className="space-y-5">
            {/* Region */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: C.encre }}>
                {t.region}
              </label>
              <select
                value={demoRegion}
                onChange={(e) => setDemoRegion(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ minHeight: 44, color: C.encre, ['--tw-ring-color' as string]: C.primary }}
              >
                <option value="">{t.selectRegion}</option>
                {REGIONS_CM.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Milieu */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: C.encre }}>
                {t.milieu}
              </label>
              <div className="flex gap-2">
                {[
                  { val: 'urbain', label: t.urban },
                  { val: 'rural', label: t.rural },
                  { val: 'peri-urbain', label: t.periUrban },
                ].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setDemoMilieu(val)}
                    className="flex-1 rounded-lg border px-3 py-3 text-sm font-medium transition-colors"
                    style={{
                      minHeight: 44,
                      backgroundColor: demoMilieu === val ? C.primary : '#fff',
                      color: demoMilieu === val ? '#fff' : C.encre,
                      borderColor: demoMilieu === val ? C.primary : '#d1d5db',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age range */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: C.encre }}>
                {t.trancheAge}
              </label>
              <select
                value={demoAge}
                onChange={(e) => setDemoAge(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2"
                style={{ minHeight: 44, color: C.encre, ['--tw-ring-color' as string]: C.primary }}
              >
                <option value="">{t.selectAge}</option>
                {AGE_RANGES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-10 flex flex-col gap-3">
            <button
              onClick={() => handleComplete(false)}
              disabled={isCompleting}
              className="w-full rounded-xl px-6 py-3.5 text-base font-bold text-white shadow-md transition-opacity disabled:opacity-60"
              style={{ backgroundColor: C.primary, minHeight: 48 }}
            >
              {isCompleting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.completing}
                </span>
              ) : (
                t.submit
              )}
            </button>
            <button
              onClick={() => handleComplete(true)}
              disabled={isCompleting}
              className="w-full rounded-xl px-6 py-3 text-sm font-medium transition-opacity disabled:opacity-60"
              style={{ color: C.encre, minHeight: 44 }}
            >
              {t.skip}
            </button>
          </div>
        </div>
        <PillarRail />
      </main>
    );
  }

  /* ═══════════ Quiz question view ═══════════ */
  if (!currentQuestion) return null;

  const options = getOptions(currentQuestion);
  const questionText = getQuestionText(currentQuestion);
  const pillarColor = getPillarColor(currentQuestion.pilier as string | undefined);
  const blocLabel = getBlocLabel(currentQuestion.bloc);
  const hasAnswered = answeredQuestions.has(currentIndex);
  const canProceed = feedback !== null || (hasAnswered && !isFeedbackBloc);
  const buttonLabel = isLastQuestion
    ? (feedback ? t.finish : t.next)
    : t.next;

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: C.paper }}>
      {/* ── Progress bar ── */}
      <div className="w-full h-1.5" style={{ backgroundColor: '#d1d5db' }}>
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, backgroundColor: C.primary }}
        />
      </div>

      {/* ── Pillar rail ── */}
      <PillarRail />

      {/* ── Question counter ── */}
      <div className="mx-auto w-full max-w-lg px-4 pt-5 pb-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold" style={{ color: C.encre }}>
            {t.question} {currentIndex + 1} {t.of} {questions.length}
          </span>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: pillarColor }}
          >
            {blocLabel}
          </span>
        </div>
      </div>

      {/* ── Scrollable question area ── */}
      <div className="flex-1 overflow-y-auto pb-28">
        <div
          className={`mx-auto w-full max-w-lg px-4 transition-all duration-200 ${
            slideDirection === 'out'
              ? 'opacity-0 -translate-x-4'
              : slideDirection === 'in'
              ? 'opacity-0 translate-x-4 animate-slideIn'
              : 'opacity-100'
          }`}
        >
          {/* ── Question text ── */}
          <div className="mt-4 mb-6">
            <p
              className="text-lg font-semibold leading-relaxed"
              style={{ color: C.encre, fontFamily: 'Georgia, "Times New Roman", serif, system-ui' }}
            >
              {questionText}
            </p>
          </div>

          {/* ── Options ── */}
          <div className="space-y-3">
            {options.map((opt, i) => {
              const isSelected = selectedAnswer === opt.key;
              const isCorrectAnswer = feedback?.correct_answer === opt.key;
              const isWrongSelected = feedback && isSelected && !feedback.is_correct;
              const isCorrectHighlight = feedback && isCorrectAnswer;

              let borderColor = '#d1d5db';
              let bgColor = '#fff';
              let textColor = C.encre;

              if (feedback) {
                if (isCorrectHighlight) {
                  borderColor = '#16a34a';
                  bgColor = '#f0fdf4';
                } else if (isWrongSelected) {
                  borderColor = '#dc2626';
                  bgColor = '#fef2f2';
                }
              } else if (isSelected) {
                borderColor = C.primary;
                bgColor = '#f0f7f1';
              }

              return (
                <button
                  key={opt.key}
                  onClick={() => {
                    if (!hasAnswered) setSelectedAnswer(opt.key);
                  }}
                  disabled={hasAnswered}
                  className="w-full flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all"
                  style={{
                    minHeight: 44,
                    borderColor,
                    backgroundColor: bgColor,
                    color: textColor,
                    cursor: hasAnswered ? 'default' : 'pointer',
                    opacity: feedback && !isSelected && !isCorrectHighlight ? 0.5 : 1,
                  }}
                >
                  <span
                    className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: isSelected && !feedback ? C.primary : feedback && isCorrectHighlight ? '#16a34a' : feedback && isWrongSelected ? '#dc2626' : '#e5e7eb',
                      color: isSelected || (feedback && (isCorrectHighlight || isWrongSelected)) ? '#fff' : C.encre,
                    }}
                  >
                    {OPTION_LETTERS[i] || opt.key}
                  </span>
                  <span className="text-sm font-medium leading-snug pt-1">
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Feedback card ── */}
          {feedback && (
            <div
              ref={feedbackRef}
              className="mt-6 rounded-xl border-2 p-5 animate-fadeIn"
              style={{
                borderColor: feedback.is_correct ? '#16a34a' : C.accent,
                backgroundColor: feedback.is_correct ? '#f0fdf4' : '#fffbeb',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                {feedback.is_correct ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 flex-shrink-0" style={{ color: C.accent }} />
                )}
                <span
                  className="text-base font-bold"
                  style={{ color: feedback.is_correct ? '#16a34a' : C.accent }}
                >
                  {feedback.is_correct
                    ? t.correct
                    : `${t.incorrect} ${feedback.correct_answer}`}
                </span>
              </div>

              {feedback.explication && (
                <p className="text-sm leading-relaxed mb-3" style={{ color: C.encre }}>
                  {feedback.explication}
                </p>
              )}

              {!feedback.is_correct && feedback.idee_fausse && (
                <p className="text-sm leading-relaxed mb-3" style={{ color: '#92400e' }}>
                  <span className="font-semibold">{t.misconception}</span>{' '}
                  {feedback.idee_fausse}
                </p>
              )}

              {feedback.action && (
                <div
                  className="rounded-lg p-3 text-sm leading-relaxed"
                  style={{ backgroundColor: feedback.is_correct ? '#dcfce7' : '#fef3c7', color: C.encre }}
                >
                  <span className="font-semibold">{t.action}</span>{' '}
                  {feedback.action}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Fixed bottom bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t"
        style={{ backgroundColor: '#fff', borderColor: '#e5e7eb' }}
      >
        <div className="mx-auto max-w-lg px-4 py-3">
          {!hasAnswered && !selectedAnswer && (
            <p className="text-center text-xs mb-2" style={{ color: '#9ca3af' }}>
              {t.selectOption}
            </p>
          )}
          <button
            onClick={handleNext}
            disabled={(!selectedAnswer && !canProceed) || isSubmitting}
            className="w-full rounded-xl px-6 py-3.5 text-base font-bold text-white shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: (selectedAnswer || canProceed) && !isSubmitting ? C.primary : '#9ca3af',
              minHeight: 48,
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.submitting}
              </>
            ) : (
              <>
                {canProceed
                  ? (isLastQuestion ? t.finish : buttonLabel)
                  : buttonLabel}
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Inline animation styles ── */}
      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(1rem); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(0.5rem); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </main>
  );
}

/* ── Pillar Rail sub-component ── */
function PillarRail() {
  return (
    <div className="flex h-1.5">
      {PILLARS.map((p) => (
        <div key={p.labelEn} className="flex-1" style={{ backgroundColor: p.color }} />
      ))}
    </div>
  );
}
