'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDusscPersonas, getDusscConsent } from '@/lib/api';
import { ChevronRight, Users, Loader2, Globe, CheckSquare, Square, QrCode, Download } from 'lucide-react';
import QRCode from 'qrcode';

/* ── Palette DUSS-C ── */
const C = {
  primary: '#2F5D3A',
  primaryLight: '#27AE60',
  accent: '#B4741F',
  paper: '#EAEFEB',
  encre: '#12333D',
  human: '#C0392B',
  animal: '#E67E22',
  plant: '#27AE60',
  environment: '#2980B9',
};

const PILLARS = [
  { color: C.human, fr: 'Humaine', en: 'Human' },
  { color: C.animal, fr: 'Animale', en: 'Animal' },
  { color: C.plant, fr: 'Végétale', en: 'Plant' },
  { color: C.environment, fr: 'Environnement', en: 'Environment' },
];

const FAMILY_META: Record<string, { fr: string; en: string; icon: string }> = {
  A: { fr: 'Grand public', en: 'General public', icon: '👥' },
  B: { fr: 'Professionnels exposés', en: 'Exposed professionals', icon: '🩺' },
  C: { fr: 'Jeunes et éducation', en: 'Youth & education', icon: '🎓' },
  D: { fr: 'Professionnels et relais', en: 'Professionals & relay', icon: '📡' },
};

const T = {
  fr: {
    title: 'Défi Une Seule Santé Cameroun',
    subtitle: 'Testez et renforcez vos connaissances sur les zoonoses, l\'hygiène, la sécurité alimentaire et l\'approche « Une Seule Santé » au Cameroun.',
    langToggle: 'English',
    consentTitle: 'Consentement',
    profileTitle: 'Choisissez votre profil',
    profileHint: 'Sélectionnez le profil qui vous correspond le mieux pour un quiz adapté.',
    acceptConsent: 'J\'ai lu et j\'accepte les conditions ci-dessus',
    cta: 'Commencer le défi',
    loading: 'Chargement…',
    error: 'Impossible de charger les données.',
    retry: 'Réessayer',
    selectProfile: 'Veuillez sélectionner un profil',
    qrTitle: 'Partagez le défi',
    qrDesc: 'Scannez ce QR code ou partagez le lien pour inviter d\'autres participants.',
    qrDownload: 'Télécharger le QR code',
    copyLink: 'Copier le lien',
    copied: 'Lien copié !',
    duration: '~7 minutes · 15 questions · bilingue FR/EN',
    features: ['Quiz interactif adapté à votre profil', 'Feedback immédiat à chaque question', 'Score et progression pré-test / post-test', 'Certificat de participation'],
  },
  en: {
    title: 'One Health Challenge Cameroon',
    subtitle: 'Test and strengthen your knowledge on zoonoses, hygiene, food safety and the One Health approach in Cameroon.',
    langToggle: 'Français',
    consentTitle: 'Consent',
    profileTitle: 'Choose your profile',
    profileHint: 'Select the profile that best describes you for a tailored quiz.',
    acceptConsent: 'I have read and accept the conditions above',
    cta: 'Start the Challenge',
    loading: 'Loading…',
    error: 'Unable to load data.',
    retry: 'Retry',
    selectProfile: 'Please select a profile',
    qrTitle: 'Share the challenge',
    qrDesc: 'Scan this QR code or share the link to invite other participants.',
    qrDownload: 'Download QR code',
    copyLink: 'Copy link',
    copied: 'Link copied!',
    duration: '~7 minutes · 15 questions · bilingual FR/EN',
    features: ['Interactive quiz tailored to your profile', 'Immediate feedback on each question', 'Pre-test / post-test score progression', 'Participation certificate'],
  },
};

interface Persona {
  code: string;
  name: string;
  family: string;
  description?: string;
}

export default function DefiLandingPage() {
  const router = useRouter();
  const params = useParams();
  const langParam = (params?.lang as string) || 'fr';

  const [lang, setLang] = useState<'fr' | 'en'>(langParam === 'en' ? 'en' : 'fr');
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [consentText, setConsentText] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const t = T[lang];
  const quizUrl = typeof window !== 'undefined' ? `${window.location.origin}/${lang}/defi` : `https://onehealth.cm/${lang}/defi`;

  // Fetch data
  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [pRes, cRes] = await Promise.all([getDusscPersonas(lang), getDusscConsent(lang)]);
      if (pRes.success && Array.isArray(pRes.data)) setPersonas(pRes.data as Persona[]);
      else throw new Error('p');
      if (cRes.success && cRes.data) {
        const raw = (cRes.data as any).text ?? cRes.data;
        setConsentText(typeof raw === 'string' ? raw : JSON.stringify(raw));
      } else throw new Error('c');
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [lang]);

  // QR Code
  useEffect(() => {
    QRCode.toDataURL(quizUrl, {
      width: 280,
      margin: 2,
      color: { dark: C.encre, light: '#ffffff' },
      errorCorrectionLevel: 'H',
    }).then(setQrDataUrl).catch(() => {});
  }, [quizUrl]);

  const toggleLang = () => {
    const next = lang === 'fr' ? 'en' : 'fr';
    setLang(next);
    setSelectedProfile(null);
    setConsentAccepted(false);
    window.history.replaceState(null, '', `/${next}/defi`);
  };

  const handleStart = () => {
    if (!selectedProfile || !consentAccepted) return;
    const uuid = crypto.randomUUID();
    sessionStorage.setItem('dussc_session_uuid', uuid);
    sessionStorage.setItem('dussc_lang', lang);
    sessionStorage.setItem('dussc_profil', selectedProfile);
    router.push(`/${lang}/defi/quiz?profil=${selectedProfile}`);
  };

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(quizUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'defi-une-seule-sante-qr.png';
    a.click();
  };

  // Group personas by family
  const grouped: Record<string, Persona[]> = { A: [], B: [], C: [], D: [] };
  for (const p of personas) {
    const fk = (p.family || p.code?.[0] || 'A').toUpperCase();
    if (grouped[fk]) grouped[fk].push(p);
    else grouped.A.push(p);
  }

  return (
    <main className="min-h-screen" style={{ background: C.paper }}>
      {/* Pillar rail */}
      <div className="flex h-2">
        {PILLARS.map(p => <div key={p.en} className="flex-1" style={{ background: p.color }} />)}
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Language toggle */}
        <div className="flex justify-end mb-6">
          <button onClick={toggleLang} className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium"
            style={{ background: C.encre, color: '#fff' }}>
            <Globe className="h-4 w-4" /> {t.langToggle}
          </button>
        </div>

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3" style={{ color: C.primary }}>
            {t.title}
          </h1>
          <p className="text-base max-w-xl mx-auto mb-4" style={{ color: C.encre }}>
            {t.subtitle}
          </p>
          <p className="text-sm font-medium" style={{ color: C.accent }}>{t.duration}</p>

          {/* Pillar badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {PILLARS.map(p => (
              <span key={p.en} className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ background: p.color }}>
                {lang === 'fr' ? p.fr : p.en}
              </span>
            ))}
          </div>

          {/* Features */}
          <div className="mt-6 grid grid-cols-2 gap-2 text-left max-w-md mx-auto">
            {t.features.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-xs" style={{ color: C.encre }}>
                <span style={{ color: C.primaryLight }}>✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </header>

        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: C.primary }} />
            <p style={{ color: C.encre }}>{t.loading}</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center py-20 gap-4">
            <p className="text-red-600 font-medium">{t.error}</p>
            <button onClick={loadData} className="rounded-lg px-5 py-2 text-sm font-medium text-white" style={{ background: C.accent }}>
              {t.retry}
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Consent */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-3" style={{ color: C.encre }}>{t.consentTitle}</h2>
              <div className="rounded-xl border p-4 text-sm leading-relaxed max-h-48 overflow-y-auto"
                style={{ background: '#fff', borderColor: '#d1d5db', color: C.encre }}>
                {consentText}
              </div>
              <label className="flex items-start gap-3 mt-3 cursor-pointer select-none">
                <button type="button" onClick={() => setConsentAccepted(!consentAccepted)} className="mt-0.5 flex-shrink-0">
                  {consentAccepted
                    ? <CheckSquare className="h-5 w-5" style={{ color: C.primary }} />
                    : <Square className="h-5 w-5 text-gray-400" />}
                </button>
                <span className="text-sm" style={{ color: C.encre }}>{t.acceptConsent}</span>
              </label>
            </section>

            {/* Profile selection */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold mb-1" style={{ color: C.encre }}>{t.profileTitle}</h2>
              <p className="text-sm mb-4" style={{ color: '#6b7280' }}>{t.profileHint}</p>

              <div className="space-y-5">
                {Object.entries(grouped).map(([fk, items]) => {
                  if (items.length === 0) return null;
                  const meta = FAMILY_META[fk];
                  return (
                    <div key={fk}>
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.accent }}>
                        {meta.icon} {lang === 'fr' ? meta.fr : meta.en}
                      </h3>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {items.map(p => {
                          const isSel = selectedProfile === p.code;
                          return (
                            <button key={p.code} onClick={() => setSelectedProfile(p.code)}
                              className="flex items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all"
                              style={{ background: isSel ? C.primary : '#fff', color: isSel ? '#fff' : C.encre, borderColor: isSel ? C.primary : '#d1d5db' }}>
                              <Users className="h-4 w-4 flex-shrink-0 opacity-70" />
                              <span>
                                <span className="font-mono text-xs opacity-60 mr-1.5">{p.code}</span>
                                {p.name}
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

            {/* CTA */}
            <div className="text-center mb-10">
              <button onClick={handleStart} disabled={!selectedProfile || !consentAccepted}
                className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-bold text-white shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: selectedProfile && consentAccepted ? C.primary : '#9ca3af' }}>
                {t.cta} <ChevronRight className="h-5 w-5" />
              </button>
              {!selectedProfile && consentAccepted && (
                <p className="text-xs mt-2 text-amber-600">{t.selectProfile}</p>
              )}
            </div>

            {/* QR Code section */}
            <section className="rounded-xl border p-6 text-center mb-8" style={{ background: '#fff', borderColor: '#d1d5db' }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <QrCode className="h-5 w-5" style={{ color: C.primary }} />
                <h2 className="text-lg font-semibold" style={{ color: C.encre }}>{t.qrTitle}</h2>
              </div>
              <p className="text-sm mb-4" style={{ color: '#6b7280' }}>{t.qrDesc}</p>

              {qrDataUrl && (
                <div className="inline-block p-3 rounded-xl mb-4" style={{ background: '#fff', border: `2px solid ${C.primary}20` }}>
                  <img src={qrDataUrl} alt="QR Code DUSS-C" width={200} height={200} className="mx-auto" />
                </div>
              )}

              <div className="text-xs font-mono mb-4 px-4 py-2 rounded-lg break-all" style={{ background: C.paper, color: C.encre }}>
                {quizUrl}
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={handleDownloadQR}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium border"
                  style={{ borderColor: C.primary, color: C.primary }}>
                  <Download className="h-4 w-4" /> {t.qrDownload}
                </button>
                <button onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white"
                  style={{ background: C.primary }}>
                  {copied ? '✓ ' + t.copied : t.copyLink}
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Bottom pillar rail */}
      <div className="flex h-2">
        {PILLARS.map(p => <div key={p.en} className="flex-1" style={{ background: p.color }} />)}
      </div>
    </main>
  );
}
