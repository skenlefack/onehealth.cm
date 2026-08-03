'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDusscResult } from '@/lib/api';
import {
  Loader2,
  Globe,
  ArrowRight,
  Download,
  Share2,
  BookOpen,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';

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

/* ── Pillar rail ── */
const PILLARS = [
  { color: C.human, labelFr: 'Humaine', labelEn: 'Human' },
  { color: C.animal, labelFr: 'Animale', labelEn: 'Animal' },
  { color: C.plant, labelFr: 'Végétale', labelEn: 'Plant' },
  { color: C.environment, labelFr: 'Environnement', labelEn: 'Environment' },
];

/* ── i18n literals ── */
const T = {
  fr: {
    langToggle: 'English',
    loading: 'Chargement des résultats…',
    errorLoad: 'Impossible de charger les résultats.',
    errorNoSession: 'Aucune session trouvée. Veuillez relancer le défi.',
    retry: 'Réessayer',
    yourScore: 'Votre score',
    progression: 'Progression pré-test → post-test',
    preTest: 'Pré-test',
    postTest: 'Post-test',
    gain: 'Gain',
    points: 'points',
    whatYouLearned: 'Ce que vous avez appris',
    correctAnswer: 'Bonne réponse',
    action: 'Action',
    seeAll: 'Voir tout',
    seeLess: 'Réduire',
    downloadCert: 'Télécharger mon certificat',
    share: 'Partager',
    shareTitle: 'Défi Une Seule Santé Cameroun',
    shareText: "J'ai complété le Défi Une Seule Santé Cameroun !",
    linkCopied: 'Lien copié !',
    certComingSoon: 'Fonctionnalité à venir',
    deeperLearning: 'Approfondir sur OH E-Learning',
    retakeChallenge: 'Refaire le défi',
  },
  en: {
    langToggle: 'Français',
    loading: 'Loading results…',
    errorLoad: 'Unable to load results.',
    errorNoSession: 'No session found. Please restart the challenge.',
    retry: 'Retry',
    yourScore: 'Your Score',
    progression: 'Pre-test → Post-test Progression',
    preTest: 'Pre-test',
    postTest: 'Post-test',
    gain: 'Gain',
    points: 'points',
    whatYouLearned: 'What you learned',
    correctAnswer: 'Correct answer',
    action: 'Action',
    seeAll: 'See all',
    seeLess: 'Show less',
    downloadCert: 'Download my certificate',
    share: 'Share',
    shareTitle: 'One Health Challenge Cameroon',
    shareText: 'I completed the One Health Challenge Cameroon!',
    linkCopied: 'Link copied!',
    certComingSoon: 'Feature coming soon',
    deeperLearning: 'Go deeper on OH E-Learning',
    retakeChallenge: 'Retake the challenge',
  },
};

/* ── Types ── */
interface SessionData {
  uuid: string;
  score_pre: number;
  score_post: number;
  gain: number;
  pct_pre: number;
  pct_post: number;
  total_questions: number;
  total_correct: number;
  duration_seconds: number;
  completed_at: string;
}

interface ResponseData {
  is_correct: number;
  answer_given: string;
  enonce_fr: string;
  enonce_en: string;
  reponse_correcte: string;
  options_fr: string;
  options_en: string;
  explication_fr: string;
  explication_en: string;
  action_fr: string;
  action_en: string;
  [key: string]: unknown;
}

/* ── Circular Progress Component ── */
function CircularProgress({
  pct,
  revealed,
}: {
  pct: number;
  revealed: boolean;
}) {
  const size = 180;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const displayPct = revealed ? pct : 0;
  const offset = circumference - (displayPct / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#d1d5db"
        strokeWidth={stroke}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={pct >= 50 ? C.primary : C.accent}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
      />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════
   Page component
   ════════════════════════════════════════════════════════ */
export default function DefiResultPage() {
  const router = useRouter();
  const params = useParams();
  const langParam = (params?.lang as string) || 'fr';

  /* ── State ── */
  const [lang, setLang] = useState<'fr' | 'en'>(langParam === 'en' ? 'en' : 'fr');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData | null>(null);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [scoreRevealed, setScoreRevealed] = useState(false);
  const [showAllLessons, setShowAllLessons] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const t = T[lang];

  /* ── Load result ── */
  const loadResult = useCallback(async () => {
    setLoading(true);
    setError(null);
    setScoreRevealed(false);

    const uuid = sessionStorage.getItem('dussc_session_uuid');
    if (!uuid) {
      setError('no_session');
      setLoading(false);
      return;
    }

    try {
      const res = await getDusscResult(uuid);
      if (res.success && res.data) {
        setSession(res.data.session);
        setResponses(res.data.responses || []);
        // Trigger score reveal animation
        setTimeout(() => setScoreRevealed(true), 200);
      } else {
        setError('load');
      }
    } catch {
      setError('load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  /* ── Language toggle ── */
  const toggleLang = () => {
    const next = lang === 'fr' ? 'en' : 'fr';
    setLang(next);
    window.history.replaceState(null, '', `/${next}/defi/result`);
  };

  /* ── Toast ── */
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  /* ── Share ── */
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: t.shareTitle, text: t.shareText, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      showToast(t.linkCopied);
    }
  };

  /* ── Certificate placeholder ── */
  const handleCertificate = () => {
    showToast(t.certComingSoon);
  };

  /* ── Derived data ── */
  const pctTotal =
    session && session.total_questions > 0
      ? Math.round((session.total_correct / session.total_questions) * 100)
      : 0;

  const wrongResponses = responses.filter((r) => !r.is_correct);
  const lessonsToShow = showAllLessons ? wrongResponses : wrongResponses.slice(0, 5);

  /* ── Parse options JSON to get correct answer text ── */
  const getCorrectAnswerText = (r: ResponseData): string => {
    try {
      const optionsRaw = lang === 'fr' ? r.options_fr : r.options_en;
      if (!optionsRaw) return r.reponse_correcte;
      const options: Record<string, string> = JSON.parse(optionsRaw);
      return options[r.reponse_correcte] || r.reponse_correcte;
    } catch {
      return r.reponse_correcte;
    }
  };

  /* ═══════════ Render ═══════════ */

  return (
    <main className="min-h-screen" style={{ backgroundColor: C.paper }}>
      {/* ── Top pillar rail ── */}
      <div className="flex h-2">
        {PILLARS.map((p) => (
          <div key={p.labelEn} className="flex-1" style={{ backgroundColor: p.color }} />
        ))}
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* ── Language toggle ── */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleLang}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            style={{ backgroundColor: C.encre, color: '#fff' }}
          >
            <Globe className="h-4 w-4" />
            {t.langToggle}
          </button>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: C.primary }} />
            <p style={{ color: C.encre }}>{t.loading}</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <p className="text-red-600 font-medium">
              {error === 'no_session' ? t.errorNoSession : t.errorLoad}
            </p>
            {error === 'no_session' ? (
              <button
                onClick={() => router.push(`/${lang}/defi`)}
                className="rounded-lg px-5 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: C.primary }}
              >
                {t.retakeChallenge}
              </button>
            ) : (
              <button
                onClick={loadResult}
                className="rounded-lg px-5 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: C.accent }}
              >
                {t.retry}
              </button>
            )}
          </div>
        )}

        {/* ── Results ── */}
        {!loading && !error && session && (
          <div className="space-y-8">
            {/* ── 1. Score Hero ── */}
            <section className="flex flex-col items-center text-center">
              <div className="relative">
                <CircularProgress pct={pctTotal} revealed={scoreRevealed} />
                {/* Centered text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-4xl font-bold transition-all duration-1000"
                    style={{
                      color: C.primary,
                      opacity: scoreRevealed ? 1 : 0,
                      transform: scoreRevealed ? 'scale(1)' : 'scale(0.5)',
                    }}
                  >
                    {pctTotal}%
                  </span>
                </div>
              </div>

              <h1
                className="text-xl font-bold mt-4"
                style={{ color: C.primary }}
              >
                {t.yourScore}
              </h1>
              <p className="text-sm mt-1" style={{ color: C.encre }}>
                {session.total_correct} / {session.total_questions}
              </p>
            </section>

            {/* ── 2. Progression Card ── */}
            <section
              className="rounded-xl border p-6"
              style={{ backgroundColor: '#fff', borderColor: '#d1d5db' }}
            >
              <h2
                className="text-sm font-semibold uppercase tracking-wide mb-5 text-center"
                style={{ color: C.accent }}
              >
                {t.progression}
              </h2>

              <div className="flex items-center justify-center gap-4 sm:gap-8">
                {/* Pre-test */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
                    {t.preTest}
                  </span>
                  <span
                    className="text-3xl sm:text-4xl font-bold transition-all duration-700"
                    style={{
                      color: C.encre,
                      opacity: scoreRevealed ? 1 : 0,
                    }}
                  >
                    {session.score_pre ?? 0}
                  </span>
                </div>

                {/* Arrow */}
                <ArrowRight
                  className="h-6 w-6 flex-shrink-0 mt-4"
                  style={{ color: C.accent }}
                />

                {/* Post-test */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
                    {t.postTest}
                  </span>
                  <span
                    className="text-3xl sm:text-4xl font-bold transition-all duration-700 delay-300"
                    style={{
                      color: C.encre,
                      opacity: scoreRevealed ? 1 : 0,
                    }}
                  >
                    {session.score_post ?? 0}
                  </span>
                </div>
              </div>

              {/* Gain */}
              {session.gain !== null && session.gain !== undefined && (
                <div
                  className="mt-4 text-center transition-all duration-500 delay-500"
                  style={{ opacity: scoreRevealed ? 1 : 0 }}
                >
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-bold"
                    style={{
                      backgroundColor: session.gain >= 0 ? '#d1fae5' : '#fee2e2',
                      color: session.gain >= 0 ? '#065f46' : '#991b1b',
                    }}
                  >
                    {t.gain}: {session.gain >= 0 ? '+' : ''}{session.gain} {t.points}
                  </span>
                </div>
              )}
            </section>

            {/* ── 3. Key Messages Card ── */}
            {wrongResponses.length > 0 && (
              <section
                className="rounded-xl border p-6"
                style={{ backgroundColor: '#fff', borderColor: '#d1d5db' }}
              >
                <h2
                  className="text-lg font-semibold mb-4"
                  style={{ color: C.encre }}
                >
                  {t.whatYouLearned}
                </h2>

                <ul className="space-y-4">
                  {lessonsToShow.map((r, i) => {
                    const question = lang === 'fr' ? r.enonce_fr : r.enonce_en;
                    const correctText = getCorrectAnswerText(r);
                    const actionText = lang === 'fr' ? r.action_fr : r.action_en;

                    return (
                      <li
                        key={i}
                        className="rounded-lg border p-4 transition-all duration-300"
                        style={{
                          borderColor: '#e5e7eb',
                          backgroundColor: '#fafbfa',
                          opacity: scoreRevealed ? 1 : 0,
                          transform: scoreRevealed ? 'translateY(0)' : 'translateY(8px)',
                          transitionDelay: `${600 + i * 100}ms`,
                        }}
                      >
                        {/* Question */}
                        <div className="flex items-start gap-2 mb-2">
                          <XCircle
                            className="h-4 w-4 mt-0.5 flex-shrink-0"
                            style={{ color: C.human }}
                          />
                          <p className="text-sm font-medium" style={{ color: C.encre }}>
                            {question}
                          </p>
                        </div>

                        {/* Correct answer */}
                        <div className="flex items-start gap-2 ml-6 mb-1">
                          <CheckCircle
                            className="h-3.5 w-3.5 mt-0.5 flex-shrink-0"
                            style={{ color: C.plant }}
                          />
                          <p className="text-xs" style={{ color: '#374151' }}>
                            <span className="font-semibold">{t.correctAnswer}:</span>{' '}
                            {correctText}
                          </p>
                        </div>

                        {/* Action / instruction */}
                        {actionText && (
                          <div className="ml-6 mt-1">
                            <p className="text-xs italic" style={{ color: C.accent }}>
                              {t.action}: {actionText}
                            </p>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {/* Expand / collapse */}
                {wrongResponses.length > 5 && (
                  <button
                    onClick={() => setShowAllLessons(!showAllLessons)}
                    className="flex items-center gap-1 mx-auto mt-4 text-sm font-medium transition-colors"
                    style={{ color: C.primary }}
                  >
                    {showAllLessons ? (
                      <>
                        {t.seeLess} <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        {t.seeAll} ({wrongResponses.length}) <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </section>
            )}

            {/* ── 4. Actions ── */}
            <section className="space-y-3 pb-4">
              {/* Certificate */}
              <button
                onClick={handleCertificate}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow transition-all active:scale-[0.98]"
                style={{ backgroundColor: C.primary }}
              >
                <Download className="h-4 w-4" />
                {t.downloadCert}
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition-all active:scale-[0.98]"
                style={{ borderColor: C.primary, color: C.primary, backgroundColor: '#fff' }}
              >
                <Share2 className="h-4 w-4" />
                {t.share}
              </button>

              {/* E-Learning link */}
              <button
                onClick={() => router.push(`/${lang}/oh-elearning/courses`)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition-all active:scale-[0.98]"
                style={{ borderColor: C.accent, color: C.accent, backgroundColor: '#fff' }}
              >
                <BookOpen className="h-4 w-4" />
                {t.deeperLearning}
              </button>

              {/* Retake */}
              <button
                onClick={() => router.push(`/${lang}/defi`)}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium transition-all active:scale-[0.98]"
                style={{ color: C.encre }}
              >
                <RotateCcw className="h-4 w-4" />
                {t.retakeChallenge}
              </button>
            </section>
          </div>
        )}
      </div>

      {/* ── Bottom pillar rail ── */}
      <div className="flex h-2">
        {PILLARS.map((p) => (
          <div key={p.labelEn} className="flex-1" style={{ backgroundColor: p.color }} />
        ))}
      </div>

      {/* ── Toast ── */}
      {toastMsg && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all animate-bounce-in z-50"
          style={{ backgroundColor: C.encre }}
        >
          {toastMsg}
        </div>
      )}
    </main>
  );
}
