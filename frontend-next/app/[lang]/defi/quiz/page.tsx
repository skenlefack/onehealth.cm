'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { getDusscQuiz, createDusscSession, submitDusscResponse, completeDusscSession } from '@/lib/api';
import { Loader2, ChevronRight, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

/* ── Palette DUSS-C ── */
const C = {
  primary: '#2F5D3A',
  primaryLight: '#27AE60',
  accent: '#B4741F',
  paper: '#EAEFEB',
  encre: '#12333D',
  correct: '#16a34a',
  correctBg: '#f0fdf4',
  incorrect: '#B4741F',
  incorrectBg: '#fffbeb',
  human: '#C0392B',
  animal: '#E67E22',
  plant: '#27AE60',
  environment: '#2980B9',
};

const PILLARS = [
  { color: C.human, label: 'Humaine' },
  { color: C.animal, label: 'Animale' },
  { color: C.plant, label: 'Végétale' },
  { color: C.environment, label: 'Environnement' },
];

/* ── i18n ── */
const T = {
  fr: {
    loading: 'Chargement du quiz…',
    error: 'Impossible de charger le quiz.',
    retry: 'Réessayer',
    question: 'Question',
    of: 'sur',
    next: 'Suivant',
    finish: 'Terminer',
    correct: 'Bonne réponse !',
    incorrect: 'La bonne réponse était :',
    misconception: 'Idée fausse :',
    action: 'À retenir :',
    select: 'Sélectionnez une réponse',
    checking: 'Vérification…',
    demoTitle: 'Informations optionnelles',
    demoSubtitle: 'Anonymes — elles aident à améliorer les actions de sensibilisation.',
    region: 'Région',
    milieu: 'Milieu',
    age: "Tranche d'âge",
    urban: 'Urbain',
    rural: 'Rural',
    skip: 'Passer',
    submit: 'Voir mes résultats',
    completing: 'Finalisation…',
    selectRegion: '— Sélectionner —',
    selectAge: '— Sélectionner —',
    preTest: 'Pré-test',
    postTest: 'Post-test',
    troncCommun: 'Tronc commun',
    profil: 'Question profilée',
  },
  en: {
    loading: 'Loading quiz…',
    error: 'Unable to load the quiz.',
    retry: 'Retry',
    question: 'Question',
    of: 'of',
    next: 'Next',
    finish: 'Finish',
    correct: 'Correct!',
    incorrect: 'The correct answer was:',
    misconception: 'Common misconception:',
    action: 'Key takeaway:',
    select: 'Select an answer',
    checking: 'Checking…',
    demoTitle: 'Optional information',
    demoSubtitle: 'Anonymous — helps improve awareness activities.',
    region: 'Region',
    milieu: 'Setting',
    age: 'Age range',
    urban: 'Urban',
    rural: 'Rural',
    skip: 'Skip',
    submit: 'See my results',
    completing: 'Finalizing…',
    selectRegion: '— Select —',
    selectAge: '— Select —',
    preTest: 'Pre-test',
    postTest: 'Post-test',
    troncCommun: 'Common',
    profil: 'Profiled question',
  },
};

const REGIONS = [
  'Adamaoua', 'Centre', 'Est', 'Extrême-Nord',
  'Littoral', 'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest',
];

const AGES = ['10-14', '15-19', '20-24', '25-34', '35-44', '45-54', '55+'];

/* ── Types matching API response ── */
interface QuizOption {
  letter: string;
  text: string;
}

interface QuizQuestion {
  id: number;
  order: number;
  bloc: string;
  module_code: string;
  module_name: string;
  enonce: string;
  options: QuizOption[];
  options_order: string[];
  show_feedback: boolean;
}

interface Feedback {
  is_correct: boolean;
  correct_answer: string;
  explication?: string;
  action?: string;
  idee_fausse?: string;
}

/* ═══════ Page wrapper (Suspense for useSearchParams) ═══════ */
export default function DefiQuizPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ background: C.paper }}>
        <Loader2 className="animate-spin" size={32} style={{ color: C.primary }} />
      </div>
    }>
      <DefiQuizPage />
    </Suspense>
  );
}

/* ═══════ Main quiz component ═══════ */
function DefiQuizPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = ((params?.lang as string) === 'en' ? 'en' : 'fr') as 'fr' | 'en';
  const profil = searchParams.get('profil') || '';
  const t = T[lang];

  // State
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [questionStart, setQuestionStart] = useState(Date.now());
  const [sessionStart] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [uuid, setUuid] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Demographics
  const [dRegion, setDRegion] = useState('');
  const [dMilieu, setDMilieu] = useState('');
  const [dAge, setDAge] = useState('');

  const feedbackRef = useRef<HTMLDivElement>(null);

  // ── Init ──
  const init = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      let sid = sessionStorage.getItem('dussc_session_uuid') || '';
      if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem('dussc_session_uuid', sid); }
      setUuid(sid);

      const sProfil = profil || sessionStorage.getItem('dussc_profil') || '';

      const [, quizRes] = await Promise.all([
        createDusscSession({ uuid: sid, langue: lang, profil: sProfil, canal: 'web', consent: 'true' }),
        getDusscQuiz(lang, sProfil),
      ]);

      if (!quizRes.success) throw new Error('load');

      const raw = quizRes.data as any;
      const qs: QuizQuestion[] = raw?.questions || (Array.isArray(raw) ? raw : []);
      if (qs.length === 0) throw new Error('empty');

      setQuestions(qs);
      setQuestionStart(Date.now());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [lang, profil]);

  useEffect(() => { init(); }, [init]);

  // ── Current question ──
  const q = questions[idx] || null;
  const isLast = idx === questions.length - 1;
  const hasFeedback = q?.show_feedback !== false && q?.bloc !== 'pre_test' && q?.bloc !== 'post_test';

  // ── Submit answer ──
  const handleSubmit = async () => {
    if (!selected || submitting || !q) return;
    setSubmitting(true);

    try {
      const res = await submitDusscResponse(uuid, {
        question_id: q.id,
        answer: selected,
        bloc: q.bloc,
        question_order: q.order || idx + 1,
        duration_ms: Date.now() - questionStart,
        lang,
        options_order: q.options_order,
      });

      setAnswered(prev => new Set(prev).add(idx));

      if (hasFeedback && res.success && res.data) {
        setFeedback(res.data as Feedback);
        setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
      } else {
        // Pre/post-test: auto-advance
        advance();
      }
    } catch {
      setAnswered(prev => new Set(prev).add(idx));
      advance();
    } finally {
      setSubmitting(false);
    }
  };

  // ── Advance ──
  const advance = useCallback(() => {
    if (isLast) { setShowDemo(true); return; }
    setIdx(i => i + 1);
    setSelected(null);
    setFeedback(null);
    setQuestionStart(Date.now());
  }, [isLast]);

  const handleNext = () => {
    if (feedback) advance();
    else if (selected && !answered.has(idx)) handleSubmit();
  };

  // ── Complete ──
  const handleComplete = async (skip = false) => {
    setCompleting(true);
    try {
      const res = await completeDusscSession(uuid, {
        region: skip ? undefined : dRegion || undefined,
        milieu: skip ? undefined : dMilieu || undefined,
        tranche_age: skip ? undefined : dAge || undefined,
        duration_seconds: Math.round((Date.now() - sessionStart) / 1000),
      });
      if (res.success && res.data) sessionStorage.setItem('dussc_results', JSON.stringify(res.data));
    } catch {}
    router.push(`/${lang}/defi/result`);
  };

  const progress = questions.length > 0 ? (answered.size / questions.length) * 100 : 0;

  const blocLabel = (b: string) => {
    const map: Record<string, string> = { pre_test: t.preTest, post_test: t.postTest, tronc_commun: t.troncCommun, profil: t.profil };
    return map[b] || b;
  };

  // ═══ Loading ═══
  if (loading) return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: C.paper }}>
      <Loader2 className="h-10 w-10 animate-spin" style={{ color: C.primary }} />
      <p style={{ color: C.encre }}>{t.loading}</p>
    </main>
  );

  // ═══ Error ═══
  if (error) return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: C.paper }}>
      <AlertCircle className="h-10 w-10 text-red-500" />
      <p className="text-red-600 font-medium">{t.error}</p>
      <button onClick={init} className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white" style={{ background: C.accent }}>{t.retry}</button>
    </main>
  );

  // ═══ Demographics ═══
  if (showDemo) return (
    <main className="min-h-screen flex flex-col" style={{ background: C.paper }}>
      <PillarRail />
      <div className="flex-1 mx-auto w-full max-w-lg px-4 py-8">
        <h2 className="text-2xl font-bold mb-2" style={{ color: C.primary }}>{t.demoTitle}</h2>
        <p className="text-sm mb-8" style={{ color: '#6b7280' }}>{t.demoSubtitle}</p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: C.encre }}>{t.region}</label>
            <select value={dRegion} onChange={e => setDRegion(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm"
              style={{ minHeight: 44, color: C.encre }}>
              <option value="">{t.selectRegion}</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: C.encre }}>{t.milieu}</label>
            <div className="flex gap-2">
              {[{ v: 'urbain', l: t.urban }, { v: 'rural', l: t.rural }].map(({ v, l }) => (
                <button key={v} onClick={() => setDMilieu(v)}
                  className="flex-1 rounded-lg border px-3 py-3 text-sm font-medium"
                  style={{ minHeight: 44, background: dMilieu === v ? C.primary : '#fff', color: dMilieu === v ? '#fff' : C.encre, borderColor: dMilieu === v ? C.primary : '#d1d5db' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: C.encre }}>{t.age}</label>
            <select value={dAge} onChange={e => setDAge(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm"
              style={{ minHeight: 44, color: C.encre }}>
              <option value="">{t.selectAge}</option>
              {AGES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <button onClick={() => handleComplete(false)} disabled={completing}
            className="w-full rounded-xl px-6 py-3.5 text-base font-bold text-white shadow-md disabled:opacity-60"
            style={{ background: C.primary, minHeight: 48 }}>
            {completing ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{t.completing}</span> : t.submit}
          </button>
          <button onClick={() => handleComplete(true)} disabled={completing}
            className="w-full rounded-xl px-6 py-3 text-sm font-medium disabled:opacity-60"
            style={{ color: C.encre, minHeight: 44 }}>
            {t.skip}
          </button>
        </div>
      </div>
      <PillarRail />
    </main>
  );

  // ═══ No question ═══
  if (!q) return null;

  const hasAnsweredThis = answered.has(idx);
  const canProceed = feedback !== null || (hasAnsweredThis && !hasFeedback);

  // ═══ Quiz view ═══
  return (
    <main className="min-h-screen flex flex-col" style={{ background: C.paper }}>
      {/* Progress */}
      <div className="w-full h-1.5" style={{ background: '#d1d5db' }}>
        <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: C.primary }} />
      </div>
      <PillarRail />

      {/* Counter */}
      <div className="mx-auto w-full max-w-lg px-4 pt-5 pb-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold" style={{ color: C.encre }}>
            {t.question} {idx + 1} {t.of} {questions.length}
          </span>
          <span className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ background: C.primary }}>
            {blocLabel(q.bloc)}
          </span>
        </div>
      </div>

      {/* Question + options */}
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="mx-auto w-full max-w-lg px-4">
          {/* Module */}
          <div className="mt-2 mb-1">
            <span className="text-xs font-medium" style={{ color: C.accent }}>{q.module_code} — {q.module_name}</span>
          </div>

          {/* Enonce */}
          <div className="mb-6">
            <p className="text-lg font-semibold leading-relaxed" style={{ color: C.encre, fontFamily: 'Georgia, serif, system-ui' }}>
              {q.enonce}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt) => {
              const isSel = selected === opt.letter;
              const isCorrectAns = feedback?.correct_answer === opt.letter;
              const isWrongSel = feedback && isSel && !feedback.is_correct;

              let border = '#d1d5db';
              let bg = '#fff';
              if (feedback) {
                if (isCorrectAns) { border = C.correct; bg = C.correctBg; }
                else if (isWrongSel) { border = '#dc2626'; bg = '#fef2f2'; }
              } else if (isSel) {
                border = C.primary; bg = '#f0f7f1';
              }

              return (
                <button
                  key={opt.letter}
                  onClick={() => { if (!hasAnsweredThis) setSelected(opt.letter); }}
                  disabled={hasAnsweredThis}
                  className="w-full flex items-start gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-all"
                  style={{
                    minHeight: 52, borderColor: border, background: bg, color: C.encre,
                    cursor: hasAnsweredThis ? 'default' : 'pointer',
                    opacity: feedback && !isSel && !isCorrectAns ? 0.45 : 1,
                  }}
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                    style={{
                      background: (isSel && !feedback) ? C.primary : isCorrectAns ? C.correct : isWrongSel ? '#dc2626' : '#e5e7eb',
                      color: (isSel || (feedback && (isCorrectAns || isWrongSel))) ? '#fff' : C.encre,
                    }}>
                    {opt.letter}
                  </span>
                  <span className="text-sm font-medium leading-snug pt-1">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {feedback && (
            <div ref={feedbackRef} className="mt-6 rounded-xl border-2 p-5"
              style={{ borderColor: feedback.is_correct ? C.correct : C.accent, background: feedback.is_correct ? C.correctBg : C.incorrectBg }}>
              <div className="flex items-center gap-2 mb-3">
                {feedback.is_correct
                  ? <CheckCircle2 className="h-5 w-5 flex-shrink-0" style={{ color: C.correct }} />
                  : <XCircle className="h-5 w-5 flex-shrink-0" style={{ color: C.accent }} />}
                <span className="text-base font-bold" style={{ color: feedback.is_correct ? C.correct : C.accent }}>
                  {feedback.is_correct ? t.correct : `${t.incorrect} ${feedback.correct_answer}`}
                </span>
              </div>
              {feedback.explication && <p className="text-sm leading-relaxed mb-3" style={{ color: C.encre }}>{feedback.explication}</p>}
              {!feedback.is_correct && feedback.idee_fausse && (
                <p className="text-sm leading-relaxed mb-3 italic" style={{ color: '#92400e' }}>
                  <span className="font-semibold not-italic">{t.misconception}</span> « {feedback.idee_fausse} »
                </p>
              )}
              {feedback.action && (
                <div className="rounded-lg p-3 text-sm leading-relaxed" style={{ background: feedback.is_correct ? '#dcfce7' : '#fef3c7', color: C.encre }}>
                  <span className="font-semibold">{t.action}</span> {feedback.action}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white" style={{ borderColor: '#e5e7eb' }}>
        <div className="mx-auto max-w-lg px-4 py-3">
          {!hasAnsweredThis && !selected && (
            <p className="text-center text-xs mb-2" style={{ color: '#9ca3af' }}>{t.select}</p>
          )}
          <button
            onClick={handleNext}
            disabled={(!selected && !canProceed) || submitting}
            className="w-full rounded-xl px-6 py-3.5 text-base font-bold text-white shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: (selected || canProceed) && !submitting ? C.primary : '#9ca3af', minHeight: 48 }}>
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" />{t.checking}</>
              : <>{canProceed ? (isLast ? t.finish : t.next) : t.next}<ChevronRight className="h-5 w-5" /></>}
          </button>
        </div>
      </div>
    </main>
  );
}

function PillarRail() {
  return (
    <div className="flex h-1.5">
      {PILLARS.map(p => <div key={p.label} className="flex-1" style={{ background: p.color }} />)}
    </div>
  );
}
