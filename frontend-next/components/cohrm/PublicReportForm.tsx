'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Thermometer, Skull, Bug, Heart, Leaf, AlertTriangle,
  MapPin, Navigation, ChevronRight, ChevronLeft, Check, Camera,
  X, Upload, Phone, User, Shield, Send, Loader2,
  Info, CheckCircle2, PartyPopper,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type Language = 'fr' | 'en';

interface ReportFormData {
  event_type: string;
  region: string;
  department: string;
  district: string;
  locality: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  species: string[];
  symptoms: string[];
  affected_count: string;
  deaths_count: string;
  photos: File[];
  photoPreviews: string[];
  reporter_name: string;
  reporter_phone: string;
  anonymous: boolean;
  consent: boolean;
}

// ============================================
// TRANSLATIONS
// ============================================

const t = {
  fr: {
    pageTitle: 'Signaler un événement sanitaire',
    pageSubtitle: 'Aidez-nous à protéger la santé publique en signalant tout événement suspect',
    steps: ['Type', 'Localisation', 'Détails', 'Informations', 'Confirmation'],
    stepsLong: ['Type d\'événement', 'Localisation', 'Détails de l\'événement', 'Vos informations', 'Confirmation'],
    next: 'Suivant',
    previous: 'Précédent',
    submit: 'Envoyer le signalement',
    submitting: 'Envoi en cours...',
    modify: 'Modifier',
    // Step 1
    step1Title: 'Quel type d\'événement souhaitez-vous signaler ?',
    eventTypes: {
      MAL: { title: 'Maladie suspecte', desc: 'Cas de maladie inhabituelle observée' },
      MOR: { title: 'Mortalité anormale', desc: 'Décès multiples ou inhabituels' },
      EPI: { title: 'Épidémie suspectée', desc: 'Propagation rapide d\'une maladie' },
      ZOO: { title: 'Zoonose suspectée', desc: 'Transmission animal-humain suspectée' },
      INT: { title: 'Intoxication', desc: 'Empoisonnement alimentaire ou chimique' },
      ENV: { title: 'Événement environnemental', desc: 'Pollution, contamination de l\'eau...' },
    },
    // Step 2
    step2Title: 'Où l\'événement a-t-il été observé ?',
    region: 'Région',
    department: 'Département',
    district: 'District de santé',
    locality: 'Localité précise',
    localityPlaceholder: 'Village, quartier, lieu-dit...',
    selectRegion: 'Sélectionner une région',
    selectDepartment: 'Sélectionner un département',
    selectDistrict: 'Sélectionner un district',
    useGPS: 'Utiliser ma position GPS',
    gpsLoading: 'Localisation en cours...',
    gpsSuccess: 'Position détectée',
    gpsError: 'Impossible d\'obtenir votre position',
    orClickMap: 'Ou cliquez sur la carte',
    // Step 3
    step3Title: 'Décrivez l\'événement',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Décrivez ce que vous avez observé... (quand, quoi, combien, circonstances)',
    speciesLabel: 'Espèce(s) concernée(s)',
    symptomsLabel: 'Symptômes observés',
    affectedCount: 'Nombre approximatif de cas',
    deathsCount: 'Nombre de décès',
    photosLabel: 'Photos (max 3)',
    photosHint: 'Glissez vos photos ici ou cliquez pour parcourir',
    // Step 4
    step4Title: 'Vos coordonnées',
    step4Subtitle: 'Ces informations sont facultatives mais nous aident à vous recontacter si nécessaire',
    nameLabel: 'Votre nom',
    namePlaceholder: 'Nom et prénom (facultatif)',
    phoneLabel: 'Téléphone',
    phonePlaceholder: '+237 6XX XXX XXX',
    phoneHint: 'Pour vous recontacter si besoin',
    anonymousLabel: 'Signalement anonyme',
    anonymousHint: 'Votre identité ne sera pas enregistrée',
    consentLabel: 'J\'autorise le traitement de mes données dans le cadre de la surveillance sanitaire',
    consentRequired: 'Vous devez accepter les conditions pour envoyer',
    // Step 5
    step5Title: 'Récapitulatif de votre signalement',
    step5Subtitle: 'Vérifiez les informations avant d\'envoyer',
    sectionEvent: 'Type d\'événement',
    sectionLocation: 'Localisation',
    sectionDetails: 'Détails',
    sectionReporter: 'Rapporteur',
    anonymous: 'Anonyme',
    // Success
    successTitle: 'Signalement envoyé !',
    successMessage: 'Votre signalement a été reçu et sera traité dans les plus brefs délais.',
    successRef: 'Numéro de référence :',
    successNote: 'Conservez ce numéro pour le suivi de votre signalement.',
    newReport: 'Faire un nouveau signalement',
  },
  en: {
    pageTitle: 'Report a health event',
    pageSubtitle: 'Help us protect public health by reporting any suspicious event',
    steps: ['Type', 'Location', 'Details', 'Info', 'Confirmation'],
    stepsLong: ['Event type', 'Location', 'Event details', 'Your information', 'Confirmation'],
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit report',
    submitting: 'Submitting...',
    modify: 'Edit',
    step1Title: 'What type of event do you want to report?',
    eventTypes: {
      MAL: { title: 'Suspected disease', desc: 'Unusual illness observed' },
      MOR: { title: 'Abnormal mortality', desc: 'Multiple or unusual deaths' },
      EPI: { title: 'Suspected epidemic', desc: 'Rapid spread of disease' },
      ZOO: { title: 'Suspected zoonosis', desc: 'Suspected animal-human transmission' },
      INT: { title: 'Intoxication', desc: 'Food or chemical poisoning' },
      ENV: { title: 'Environmental event', desc: 'Pollution, water contamination...' },
    },
    step2Title: 'Where was the event observed?',
    region: 'Region',
    department: 'Department',
    district: 'Health district',
    locality: 'Precise locality',
    localityPlaceholder: 'Village, neighborhood, landmark...',
    selectRegion: 'Select a region',
    selectDepartment: 'Select a department',
    selectDistrict: 'Select a district',
    useGPS: 'Use my GPS location',
    gpsLoading: 'Getting location...',
    gpsSuccess: 'Location detected',
    gpsError: 'Unable to get your location',
    orClickMap: 'Or click on the map',
    step3Title: 'Describe the event',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Describe what you observed... (when, what, how many, circumstances)',
    speciesLabel: 'Affected species',
    symptomsLabel: 'Observed symptoms',
    affectedCount: 'Approximate number of cases',
    deathsCount: 'Number of deaths',
    photosLabel: 'Photos (max 3)',
    photosHint: 'Drag photos here or click to browse',
    step4Title: 'Your contact details',
    step4Subtitle: 'This information is optional but helps us follow up if needed',
    nameLabel: 'Your name',
    namePlaceholder: 'Full name (optional)',
    phoneLabel: 'Phone',
    phonePlaceholder: '+237 6XX XXX XXX',
    phoneHint: 'To contact you if needed',
    anonymousLabel: 'Anonymous report',
    anonymousHint: 'Your identity will not be recorded',
    consentLabel: 'I authorize the processing of my data for health surveillance purposes',
    consentRequired: 'You must accept the terms to submit',
    step5Title: 'Report summary',
    step5Subtitle: 'Review the information before submitting',
    sectionEvent: 'Event type',
    sectionLocation: 'Location',
    sectionDetails: 'Details',
    sectionReporter: 'Reporter',
    anonymous: 'Anonymous',
    successTitle: 'Report submitted!',
    successMessage: 'Your report has been received and will be processed promptly.',
    successRef: 'Reference number:',
    successNote: 'Keep this number to track your report.',
    newReport: 'Submit a new report',
  },
};

// ============================================
// DATA
// ============================================

const EVENT_TYPES = [
  { code: 'MAL', icon: Thermometer, color: '#E74C3C', bg: '#FDEDEC' },
  { code: 'MOR', icon: Skull, color: '#8E44AD', bg: '#F4ECF7' },
  { code: 'EPI', icon: Bug, color: '#E67E22', bg: '#FDF2E9' },
  { code: 'ZOO', icon: Heart, color: '#2980B9', bg: '#EBF5FB' },
  { code: 'INT', icon: AlertTriangle, color: '#F39C12', bg: '#FEF9E7' },
  { code: 'ENV', icon: Leaf, color: '#27AE60', bg: '#EAFAF1' },
];

const SPECIES = [
  { code: 'HUM', fr: 'Humain', en: 'Human', emoji: '\ud83e\uddd1' },
  { code: 'BOV', fr: 'Bovin', en: 'Bovine', emoji: '\ud83d\udc2e' },
  { code: 'OVI', fr: 'Ovin/Caprin', en: 'Sheep/Goat', emoji: '\ud83d\udc11' },
  { code: 'VOL', fr: 'Volaille', en: 'Poultry', emoji: '\ud83d\udc14' },
  { code: 'POR', fr: 'Porcin', en: 'Swine', emoji: '\ud83d\udc16' },
  { code: 'SAU', fr: 'Faune sauvage', en: 'Wildlife', emoji: '\ud83e\udd8c' },
  { code: 'CHI', fr: 'Chien/Chat', en: 'Dog/Cat', emoji: '\ud83d\udc15' },
  { code: 'AUT', fr: 'Autre', en: 'Other', emoji: '\u2753' },
];

const SYMPTOMS = [
  { code: 'FI', fr: 'Fi\u00e8vre', en: 'Fever', emoji: '\ud83e\ude79' },
  { code: 'VO', fr: 'Vomissements', en: 'Vomiting', emoji: '\ud83e\udd22' },
  { code: 'DI', fr: 'Diarrh\u00e9e', en: 'Diarrhea', emoji: '\ud83d\udca7' },
  { code: 'TO', fr: 'Toux', en: 'Cough', emoji: '\ud83e\udd27' },
  { code: 'ER', fr: '\u00c9ruption cutan\u00e9e', en: 'Skin rash', emoji: '\ud83d\udc46' },
  { code: 'HE', fr: 'H\u00e9morragie', en: 'Hemorrhage', emoji: '\ud83e\ude78' },
  { code: 'PA', fr: 'Paralysie', en: 'Paralysis', emoji: '\ud83e\uddbd' },
  { code: 'MO', fr: 'Mortalit\u00e9', en: 'Mortality', emoji: '\u2620\ufe0f' },
  { code: 'AB', fr: 'Avortement', en: 'Abortion', emoji: '\u26a0\ufe0f' },
  { code: 'RE', fr: 'Probl. respiratoires', en: 'Respiratory issues', emoji: '\ud83e\udec1' },
  { code: 'NE', fr: 'Sympt. neurologiques', en: 'Neurological', emoji: '\ud83e\udde0' },
  { code: 'OE', fr: 'Oed\u00e8mes', en: 'Edema', emoji: '\ud83d\udca6' },
];

const REGIONS = [
  {
    code: 'AD', name: 'Adamaoua', lat: 7.3167, lng: 13.5833,
    departments: ['Djerem', 'Faro-et-Deo', 'Mayo-Banyo', 'Mber\u00e9', 'Vina'],
  },
  {
    code: 'CE', name: 'Centre', lat: 3.8667, lng: 11.5167,
    departments: ['Haute-Sanaga', 'L\u00e9ki\u00e9', 'Mbam-et-Inoubou', 'Mbam-et-Kim', 'M\u00e9fou-et-Afamba', 'M\u00e9fou-et-Akono', 'Mfoundi', 'Nyong-et-Kell\u00e9', 'Nyong-et-Mfoumou', 'Nyong-et-So\'o'],
  },
  {
    code: 'ES', name: 'Est', lat: 4.5833, lng: 13.6833,
    departments: ['Boumba-et-Ngoko', 'Haut-Nyong', 'Kadey', 'Lom-et-Dj\u00e9rem'],
  },
  {
    code: 'EN', name: 'Extr\u00eame-Nord', lat: 10.5958, lng: 14.3159,
    departments: ['Diamar\u00e9', 'Logone-et-Chari', 'Mayo-Danay', 'Mayo-Kani', 'Mayo-Sava', 'Mayo-Tsanaga'],
  },
  {
    code: 'LT', name: 'Littoral', lat: 4.0511, lng: 9.7679,
    departments: ['Moungo', 'Nkam', 'Sanaga-Maritime', 'Wouri'],
  },
  {
    code: 'NO', name: 'Nord', lat: 9.3, lng: 13.4,
    departments: ['B\u00e9nou\u00e9', 'Faro', 'Mayo-Louti', 'Mayo-Rey'],
  },
  {
    code: 'NW', name: 'Nord-Ouest', lat: 5.9631, lng: 10.1591,
    departments: ['Boyo', 'Bui', 'Donga-Mantung', 'Menchum', 'Mezam', 'Momo', 'Ngo-Ketunjia'],
  },
  {
    code: 'OU', name: 'Ouest', lat: 5.4737, lng: 10.4176,
    departments: ['Bamboutos', 'Haut-Nkam', 'Hauts-Plateaux', 'Koung-Khi', 'M\u00e9noua', 'Mifi', 'Nd\u00e9', 'Noun'],
  },
  {
    code: 'SU', name: 'Sud', lat: 2.9, lng: 11.15,
    departments: ['Dja-et-Lobo', 'Mvila', 'Oc\u00e9an', 'Vallee-du-Ntem'],
  },
  {
    code: 'SW', name: 'Sud-Ouest', lat: 4.1597, lng: 9.2295,
    departments: ['Fako', 'Koup\u00e9-Manengouba', 'Lebialem', 'Manyu', 'Meme', 'Ndian'],
  },
];

const STORAGE_KEY = 'cohrm_report_draft';

// ============================================
// COMPONENT
// ============================================

export default function PublicReportForm({ lang }: { lang: Language }) {
  const labels = t[lang];
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<ReportFormData>({
    event_type: '',
    region: '',
    department: '',
    district: '',
    locality: '',
    latitude: null,
    longitude: null,
    description: '',
    species: [],
    symptoms: [],
    affected_count: '',
    deaths_count: '',
    photos: [],
    photoPreviews: [],
    reporter_name: '',
    reporter_phone: '',
    anonymous: false,
    consent: false,
  });

  // Restore from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm(prev => ({ ...prev, ...parsed, photos: [], photoPreviews: [] }));
        if (parsed.step) setStep(parsed.step);
      }
    } catch { /* ignore */ }
  }, []);

  // Auto-save to sessionStorage
  useEffect(() => {
    try {
      const { photos, photoPreviews, ...saveable } = form;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...saveable, step }));
    } catch { /* ignore */ }
  }, [form, step]);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const updateForm = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const toggleArrayItem = (field: 'species' | 'symptoms', code: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(code)
        ? prev[field].filter(c => c !== code)
        : [...prev[field], code],
    }));
  };

  // GPS
  const handleGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      return;
    }
    setGpsStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateForm('latitude', pos.coords.latitude);
        updateForm('longitude', pos.coords.longitude);
        setGpsStatus('success');
        // Try to find closest region
        let closest = REGIONS[0];
        let minDist = Infinity;
        for (const r of REGIONS) {
          const d = Math.hypot(r.lat - pos.coords.latitude, r.lng - pos.coords.longitude);
          if (d < minDist) { minDist = d; closest = r; }
        }
        if (!form.region) updateForm('region', closest.name);
      },
      () => setGpsStatus('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Photo upload
  const handlePhotoAdd = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 3 - form.photos.length);
    const newPreviews: string[] = [];
    newFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === newFiles.length) {
          setForm(prev => ({
            ...prev,
            photos: [...prev.photos, ...newFiles],
            photoPreviews: [...prev.photoPreviews, ...newPreviews],
          }));
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const removePhoto = (index: number) => {
    setForm(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      photoPreviews: prev.photoPreviews.filter((_, i) => i !== index),
    }));
  };

  // Validation
  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1 && !form.event_type) {
      newErrors.event_type = lang === 'fr' ? 'Choisissez un type' : 'Choose a type';
    }
    if (s === 2 && !form.region) {
      newErrors.region = lang === 'fr' ? 'Choisissez une r\u00e9gion' : 'Choose a region';
    }
    if (s === 3 && !form.description.trim()) {
      newErrors.description = lang === 'fr' ? 'Description requise' : 'Description required';
    }
    if (s === 4 && !form.consent) {
      newErrors.consent = labels.consentRequired;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) {
      setStep(s => Math.min(s + 1, 5));
      scrollToTop();
    }
  };

  const goPrev = () => {
    setStep(s => Math.max(s - 1, 1));
    scrollToTop();
  };

  const goToStep = (s: number) => {
    if (s < step) { setStep(s); scrollToTop(); }
  };

  // Submit
  const handleSubmit = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true);

    try {
      const selectedRegion = REGIONS.find(r => r.name === form.region);
      const eventLabel = labels.eventTypes[form.event_type as keyof typeof labels.eventTypes]?.title || form.event_type;

      const payload = {
        title: `[${form.event_type}] ${eventLabel} - ${form.region}`,
        description: form.description,
        source: 'web',
        region: form.region,
        location: [form.department, form.district, form.locality].filter(Boolean).join(', '),
        latitude: form.latitude || selectedRegion?.lat || null,
        longitude: form.longitude || selectedRegion?.lng || null,
        species: form.species.join(', '),
        symptoms: form.symptoms.join(', '),
        affected_count: form.affected_count ? parseInt(form.affected_count) : null,
        reporter_name: form.anonymous ? null : form.reporter_name || null,
        reporter_phone: form.anonymous ? null : form.reporter_phone || null,
        device_id: 'web-form',
        photos: form.photoPreviews.slice(0, 3),
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/cohrm/mobile/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setReferenceCode(data.data.code);
        setSubmitted(true);
        setShowConfetti(true);
        sessionStorage.removeItem(STORAGE_KEY);
        setTimeout(() => setShowConfetti(false), 4000);
      } else {
        setErrors({ submit: data.message || (lang === 'fr' ? 'Erreur lors de l\'envoi' : 'Submission error') });
      }
    } catch {
      setErrors({ submit: lang === 'fr' ? 'Erreur de connexion au serveur' : 'Server connection error' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      event_type: '', region: '', department: '', district: '', locality: '',
      latitude: null, longitude: null, description: '', species: [], symptoms: [],
      affected_count: '', deaths_count: '', photos: [], photoPreviews: [],
      reporter_name: '', reporter_phone: '', anonymous: false, consent: false,
    });
    setStep(1);
    setSubmitted(false);
    setReferenceCode('');
    setErrors({});
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const selectedRegionData = REGIONS.find(r => r.name === form.region);

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {showConfetti && <ConfettiEffect />}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center relative z-10">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{labels.successTitle}</h1>
          <p className="text-gray-600 mb-6">{labels.successMessage}</p>
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-emerald-700 mb-1">{labels.successRef}</p>
            <p className="text-2xl font-mono font-bold text-emerald-800 tracking-wider">{referenceCode}</p>
          </div>
          <p className="text-sm text-gray-500 mb-8">{labels.successNote}</p>
          <button
            onClick={resetForm}
            className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300"
          >
            {labels.newReport}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-emerald-50/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B4F72] to-[#2980B9] text-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-4 py-1.5 text-sm mb-4">
            <Shield className="w-4 h-4" />
            COHRM - One Health Cameroon
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{labels.pageTitle}</h1>
          <p className="text-blue-100 text-sm md:text-base">{labels.pageSubtitle}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => goToStep(s)}
                className={`flex items-center gap-1.5 transition-all duration-300 ${
                  s < step ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  s < step
                    ? 'bg-emerald-500 text-white'
                    : s === step
                    ? 'bg-[#1B4F72] text-white ring-4 ring-blue-100'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                <span className={`hidden md:block text-xs font-medium ${
                  s === step ? 'text-[#1B4F72]' : s < step ? 'text-emerald-600' : 'text-gray-400'
                }`}>
                  {labels.steps[s - 1]}
                </span>
              </button>
            ))}
          </div>
          {/* Progress line */}
          <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#1B4F72] to-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
        {/* Step 1: Event Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">{labels.step1Title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EVENT_TYPES.map(({ code, icon: Icon, color, bg }) => {
                const info = labels.eventTypes[code as keyof typeof labels.eventTypes];
                const selected = form.event_type === code;
                return (
                  <button
                    key={code}
                    onClick={() => updateForm('event_type', code)}
                    className={`relative p-4 md:p-5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
                      selected
                        ? 'border-[#1B4F72] bg-blue-50 shadow-md'
                        : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    {selected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-[#1B4F72] rounded-full flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: bg }}>
                      <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">{info.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{info.desc}</p>
                  </button>
                );
              })}
            </div>
            {errors.event_type && <p className="text-red-500 text-sm mt-2">{errors.event_type}</p>}
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{labels.step2Title}</h2>

            {/* GPS Button */}
            <button
              onClick={handleGPS}
              disabled={gpsStatus === 'loading'}
              className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border-2 border-dashed transition-all duration-200 ${
                gpsStatus === 'success'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : gpsStatus === 'error'
                  ? 'border-red-300 bg-red-50 text-red-600'
                  : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {gpsStatus === 'loading' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : gpsStatus === 'success' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Navigation className="w-5 h-5" />
              )}
              <span className="font-medium text-sm">
                {gpsStatus === 'loading' ? labels.gpsLoading
                  : gpsStatus === 'success' ? labels.gpsSuccess
                  : gpsStatus === 'error' ? labels.gpsError
                  : labels.useGPS}
              </span>
            </button>

            {/* Cascade selects */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{labels.region} *</label>
                <select
                  value={form.region}
                  onChange={(e) => {
                    updateForm('region', e.target.value);
                    updateForm('department', '');
                    updateForm('district', '');
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all appearance-none"
                >
                  <option value="">{labels.selectRegion}</option>
                  {REGIONS.map(r => (
                    <option key={r.code} value={r.name}>{r.name}</option>
                  ))}
                </select>
                {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
              </div>

              {selectedRegionData && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{labels.department}</label>
                  <select
                    value={form.department}
                    onChange={(e) => {
                      updateForm('department', e.target.value);
                      updateForm('district', '');
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all appearance-none"
                  >
                    <option value="">{labels.selectDepartment}</option>
                    {selectedRegionData.departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{labels.locality}</label>
                <input
                  type="text"
                  value={form.locality}
                  onChange={(e) => updateForm('locality', e.target.value)}
                  placeholder={labels.localityPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Mini map placeholder with coordinates display */}
            {(form.latitude && form.longitude) && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">GPS: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{labels.step3Title}</h2>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{labels.descriptionLabel} *</label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                placeholder={labels.descriptionPlaceholder}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400 resize-none"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Species */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{labels.speciesLabel}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SPECIES.map(({ code, fr, en, emoji }) => {
                  const selected = form.species.includes(code);
                  return (
                    <button
                      key={code}
                      onClick={() => toggleArrayItem('species', code)}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-200 active:scale-[0.97] ${
                        selected
                          ? 'border-[#1B4F72] bg-blue-50'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-xs font-medium text-gray-700">{lang === 'fr' ? fr : en}</span>
                      {selected && <Check className="w-3.5 h-3.5 text-[#1B4F72]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{labels.symptomsLabel}</label>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map(({ code, fr, en, emoji }) => {
                  const selected = form.symptoms.includes(code);
                  return (
                    <button
                      key={code}
                      onClick={() => toggleArrayItem('symptoms', code)}
                      className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-full border transition-all duration-200 text-sm active:scale-[0.97] ${
                        selected
                          ? 'border-[#1B4F72] bg-blue-50 text-[#1B4F72] font-medium'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span>{emoji}</span>
                      <span>{lang === 'fr' ? fr : en}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Counts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{labels.affectedCount}</label>
                <input
                  type="number"
                  min="0"
                  value={form.affected_count}
                  onChange={(e) => updateForm('affected_count', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{labels.deathsCount}</label>
                <input
                  type="number"
                  min="0"
                  value={form.deaths_count}
                  onChange={(e) => updateForm('deaths_count', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{labels.photosLabel}</label>
              <div className="flex gap-3 flex-wrap">
                {form.photoPreviews.map((preview, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {form.photos.length < 3 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handlePhotoAdd(e.dataTransfer.files);
                    }}
                    className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-gray-500 hover:border-gray-400 transition-all"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px]">{labels.photosHint.split(' ').slice(0, 2).join(' ')}</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handlePhotoAdd(e.target.files)}
              />
            </div>
          </div>
        )}

        {/* Step 4: Reporter Info */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">{labels.step4Title}</h2>
              <p className="text-sm text-gray-500 mt-1">{labels.step4Subtitle}</p>
            </div>

            {/* Anonymous toggle */}
            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-all">
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={(e) => updateForm('anonymous', e.target.checked)}
                className="w-5 h-5 rounded text-[#1B4F72] focus:ring-[#1B4F72] border-gray-300"
              />
              <div>
                <p className="font-medium text-gray-900 text-sm">{labels.anonymousLabel}</p>
                <p className="text-xs text-gray-500">{labels.anonymousHint}</p>
              </div>
            </label>

            {!form.anonymous && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{labels.nameLabel}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="text"
                      value={form.reporter_name}
                      onChange={(e) => updateForm('reporter_name', e.target.value)}
                      placeholder={labels.namePlaceholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{labels.phoneLabel}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                    <input
                      type="tel"
                      value={form.reporter_phone}
                      onChange={(e) => updateForm('reporter_phone', e.target.value)}
                      placeholder={labels.phonePlaceholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> {labels.phoneHint}
                  </p>
                </div>
              </div>
            )}

            {/* Consent */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              form.consent ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}>
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => updateForm('consent', e.target.checked)}
                className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 mt-0.5 flex-shrink-0"
              />
              <span className="text-sm text-gray-700">{labels.consentLabel}</span>
            </label>
            {errors.consent && <p className="text-red-500 text-xs">{errors.consent}</p>}
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">{labels.step5Title}</h2>
              <p className="text-sm text-gray-500 mt-1">{labels.step5Subtitle}</p>
            </div>

            {/* Event type summary */}
            <SummaryCard
              title={labels.sectionEvent}
              onEdit={() => goToStep(1)}
              editLabel={labels.modify}
            >
              <div className="flex items-center gap-3">
                {(() => {
                  const ev = EVENT_TYPES.find(e => e.code === form.event_type);
                  if (!ev) return null;
                  const Icon = ev.icon;
                  return (
                    <>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: ev.bg }}>
                        <Icon className="w-5 h-5" style={{ color: ev.color }} />
                      </div>
                      <span className="font-medium text-gray-900">
                        {labels.eventTypes[form.event_type as keyof typeof labels.eventTypes]?.title}
                      </span>
                    </>
                  );
                })()}
              </div>
            </SummaryCard>

            {/* Location summary */}
            <SummaryCard
              title={labels.sectionLocation}
              onEdit={() => goToStep(2)}
              editLabel={labels.modify}
            >
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400" />
                {[form.region, form.department, form.district, form.locality].filter(Boolean).join(' > ')}
              </div>
              {form.latitude && (
                <p className="text-xs text-gray-400 mt-1">GPS: {form.latitude.toFixed(4)}, {form.longitude?.toFixed(4)}</p>
              )}
            </SummaryCard>

            {/* Details summary */}
            <SummaryCard
              title={labels.sectionDetails}
              onEdit={() => goToStep(3)}
              editLabel={labels.modify}
            >
              <p className="text-sm text-gray-700 whitespace-pre-line">{form.description}</p>
              {form.species.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {form.species.map(s => {
                    const sp = SPECIES.find(x => x.code === s);
                    return sp && (
                      <span key={s} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {sp.emoji} {lang === 'fr' ? sp.fr : sp.en}
                      </span>
                    );
                  })}
                </div>
              )}
              {form.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.symptoms.map(s => {
                    const sy = SYMPTOMS.find(x => x.code === s);
                    return sy && (
                      <span key={s} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                        {sy.emoji} {lang === 'fr' ? sy.fr : sy.en}
                      </span>
                    );
                  })}
                </div>
              )}
              {(form.affected_count || form.deaths_count) && (
                <div className="flex gap-4 mt-3 text-sm">
                  {form.affected_count && (
                    <span className="text-gray-600">{labels.affectedCount}: <strong>{form.affected_count}</strong></span>
                  )}
                  {form.deaths_count && (
                    <span className="text-red-600">{labels.deathsCount}: <strong>{form.deaths_count}</strong></span>
                  )}
                </div>
              )}
              {form.photoPreviews.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {form.photoPreviews.map((p, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </SummaryCard>

            {/* Reporter summary */}
            <SummaryCard
              title={labels.sectionReporter}
              onEdit={() => goToStep(4)}
              editLabel={labels.modify}
            >
              {form.anonymous ? (
                <span className="text-sm text-gray-500 italic">{labels.anonymous}</span>
              ) : (
                <div className="text-sm text-gray-700 space-y-1">
                  {form.reporter_name && <p><User className="w-3.5 h-3.5 inline mr-1 text-gray-400" />{form.reporter_name}</p>}
                  {form.reporter_phone && <p><Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />{form.reporter_phone}</p>}
                  {!form.reporter_name && !form.reporter_phone && <p className="text-gray-400 italic">-</p>}
                </div>
              )}
            </SummaryCard>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {errors.submit}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={goPrev}
              className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium rounded-full border border-gray-200 hover:bg-gray-50 transition-all text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              {labels.previous}
            </button>
          ) : <div />}

          {step < 5 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#1B4F72] to-[#2980B9] text-white font-semibold rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all text-sm"
            >
              {labels.next}
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-emerald-500/25 transition-all text-sm disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {labels.submitting}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {labels.submit}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function SummaryCard({ title, onEdit, editLabel, children }: {
  title: string;
  onEdit: () => void;
  editLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
        <button
          onClick={onEdit}
          className="text-xs text-[#2980B9] hover:text-[#1B4F72] font-medium flex items-center gap-1 transition-colors"
        >
          {editLabel}
        </button>
      </div>
      {children}
    </div>
  );
}

function ConfettiEffect() {
  const colors = ['#27AE60', '#2980B9', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C', '#FCD116'];
  const particles = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: 0,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: 2,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
