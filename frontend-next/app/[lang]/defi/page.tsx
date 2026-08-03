'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDusscPersonas, getDusscConsent } from '@/lib/api';
import { ChevronRight, Users, Loader2, Globe, CheckSquare, Square } from 'lucide-react';

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

/* ── Persona family metadata ── */
const FAMILY_META: Record<string, { fr: string; en: string; icon: string }> = {
  A: { fr: 'Grand public', en: 'General public', icon: '👥' },
  B: { fr: 'Professionnels de santé', en: 'Health professionals', icon: '🩺' },
  C: { fr: 'Jeunes & étudiants', en: 'Youth & students', icon: '🎓' },
  D: { fr: 'Professionnels / relais', en: 'Professionals / relay', icon: '📡' },
};

/* ── i18n literals ── */
const T = {
  fr: {
    title: 'Défi Une Seule Santé Cameroun',
    subtitle:
      'Testez vos connaissances sur les enjeux de santé humaine, animale, végétale et environnementale au Cameroun.',
    langToggle: 'English',
    consentTitle: 'Consentement',
    profileTitle: 'Choisissez votre profil',
    profileHint: 'Sélectionnez le profil qui vous correspond le mieux.',
    acceptConsent: "J'ai lu et j'accepte les conditions ci-dessus",
    cta: 'Commencer le défi',
    loading: 'Chargement…',
    errorLoad: 'Impossible de charger les données. Veuillez réessayer.',
    retry: 'Réessayer',
    selectProfile: 'Veuillez sélectionner un profil',
  },
  en: {
    title: 'One Health Challenge Cameroon',
    subtitle:
      'Test your knowledge on human, animal, plant and environmental health issues in Cameroon.',
    langToggle: 'Français',
    consentTitle: 'Consent',
    profileTitle: 'Choose your profile',
    profileHint: 'Select the profile that best describes you.',
    acceptConsent: 'I have read and accept the conditions above',
    cta: 'Start the Challenge',
    loading: 'Loading…',
    errorLoad: 'Unable to load data. Please try again.',
    retry: 'Retry',
    selectProfile: 'Please select a profile',
  },
};

/* ── Persona type ── */
interface Persona {
  code: string;
  label_fr: string;
  label_en: string;
  famille: string;
  [key: string]: unknown;
}

/* ════════════════════════════════════════════════════════
   Page component
   ════════════════════════════════════════════════════════ */
export default function DefiLandingPage() {
  const router = useRouter();
  const params = useParams();
  const langParam = (params?.lang as string) || 'fr';

  /* ── State ── */
  const [lang, setLang] = useState<'fr' | 'en'>(langParam === 'en' ? 'en' : 'fr');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [consentText, setConsentText] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const t = T[lang];

  /* ── Fetch data ── */
  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [personaRes, consentRes] = await Promise.all([
        getDusscPersonas(lang),
        getDusscConsent(lang),
      ]);

      if (personaRes.success && Array.isArray(personaRes.data)) {
        setPersonas(personaRes.data);
      } else {
        throw new Error('personas');
      }

      if (consentRes.success && consentRes.data) {
        const raw = (consentRes.data as any).text ?? consentRes.data;
        setConsentText(typeof raw === 'string' ? raw : JSON.stringify(raw));
      } else {
        throw new Error('consent');
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  /* ── Language toggle ── */
  const toggleLang = () => {
    const next = lang === 'fr' ? 'en' : 'fr';
    setLang(next);
    setSelectedProfile(null);
    setConsentAccepted(false);
    // Update URL without full reload
    window.history.replaceState(null, '', `/${next}/defi`);
  };

  /* ── Start quiz ── */
  const handleStart = () => {
    if (!selectedProfile || !consentAccepted) return;
    const uuid = crypto.randomUUID();
    sessionStorage.setItem('dussc_session_uuid', uuid);
    sessionStorage.setItem('dussc_lang', lang);
    sessionStorage.setItem('dussc_profil', selectedProfile);
    router.push(`/${lang}/defi/quiz?profil=${selectedProfile}`);
  };

  /* ── Group personas by family ── */
  const familyKeys = Object.keys(FAMILY_META);
  const grouped: Record<string, Persona[]> = {};
  for (const fk of familyKeys) grouped[fk] = [];
  for (const p of personas) {
    const fk = p.famille?.toUpperCase?.() || p.code?.[0]?.toUpperCase?.() || 'A';
    if (grouped[fk]) grouped[fk].push(p);
    else grouped['A'].push(p);
  }

  /* ═══════════ Render ═══════════ */

  return (
    <main className="min-h-screen" style={{ backgroundColor: C.paper }}>
      {/* ── Pillar rail ── */}
      <div className="flex h-2">
        {PILLARS.map((p) => (
          <div key={p.labelEn} className="flex-1" style={{ backgroundColor: p.color }} />
        ))}
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
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

        {/* ── Header ── */}
        <header className="text-center mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold leading-tight mb-4"
            style={{ color: C.primary }}
          >
            {t.title}
          </h1>
          <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: C.encre }}>
            {t.subtitle}
          </p>

          {/* Pillar badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {PILLARS.map((p) => (
              <span
                key={p.labelEn}
                className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: p.color }}
              >
                {lang === 'fr' ? p.labelFr : p.labelEn}
              </span>
            ))}
          </div>
        </header>

        {/* ── Loading / error ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: C.primary }} />
            <p style={{ color: C.encre }}>{t.loading}</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-red-600 font-medium">{t.errorLoad}</p>
            <button
              onClick={loadData}
              className="rounded-lg px-5 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: C.accent }}
            >
              {t.retry}
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── Consent section ── */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-3" style={{ color: C.encre }}>
                {t.consentTitle}
              </h2>
              <div
                className="rounded-xl border p-5 text-sm leading-relaxed max-h-56 overflow-y-auto"
                style={{
                  backgroundColor: '#fff',
                  borderColor: '#d1d5db',
                  color: C.encre,
                }}
                dangerouslySetInnerHTML={{ __html: consentText }}
              />

              {/* Accept checkbox */}
              <label className="flex items-start gap-3 mt-4 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => setConsentAccepted(!consentAccepted)}
                  className="mt-0.5 flex-shrink-0"
                  aria-label={t.acceptConsent}
                >
                  {consentAccepted ? (
                    <CheckSquare className="h-5 w-5" style={{ color: C.primary }} />
                  ) : (
                    <Square className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                <span className="text-sm" style={{ color: C.encre }}>
                  {t.acceptConsent}
                </span>
              </label>
            </section>

            {/* ── Profile selection ── */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-1" style={{ color: C.encre }}>
                {t.profileTitle}
              </h2>
              <p className="text-sm mb-5" style={{ color: '#6b7280' }}>
                {t.profileHint}
              </p>

              <div className="space-y-6">
                {familyKeys.map((fk) => {
                  const items = grouped[fk];
                  if (!items || items.length === 0) return null;
                  const meta = FAMILY_META[fk];

                  return (
                    <div key={fk}>
                      <h3
                        className="text-sm font-semibold uppercase tracking-wide mb-2"
                        style={{ color: C.accent }}
                      >
                        {meta.icon} {lang === 'fr' ? meta.fr : meta.en}
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {items.map((p) => {
                          const isSelected = selectedProfile === p.code;
                          const label = lang === 'fr' ? p.label_fr : p.label_en;
                          return (
                            <button
                              key={p.code}
                              onClick={() => setSelectedProfile(p.code)}
                              className="flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all"
                              style={{
                                backgroundColor: isSelected ? C.primary : '#fff',
                                color: isSelected ? '#fff' : C.encre,
                                borderColor: isSelected ? C.primary : '#d1d5db',
                              }}
                            >
                              <Users className="h-4 w-4 flex-shrink-0 opacity-70" />
                              <span>
                                <span className="font-mono text-xs opacity-60 mr-1.5">
                                  {p.code}
                                </span>
                                {label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── CTA ── */}
            <div className="text-center pb-6">
              <button
                onClick={handleStart}
                disabled={!selectedProfile || !consentAccepted}
                className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor:
                    selectedProfile && consentAccepted ? C.primary : '#9ca3af',
                }}
              >
                {t.cta}
                <ChevronRight className="h-5 w-5" />
              </button>

              {!selectedProfile && consentAccepted && (
                <p className="text-xs mt-2 text-amber-600">{t.selectProfile}</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Bottom pillar rail ── */}
      <div className="flex h-2">
        {PILLARS.map((p) => (
          <div key={p.labelEn} className="flex-1" style={{ backgroundColor: p.color }} />
        ))}
      </div>
    </main>
  );
}
