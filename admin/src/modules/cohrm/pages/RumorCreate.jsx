/**
 * RumorCreate - Formulaire de création de rumeur
 * Validation, carte GPS, selects en cascade, upload photos
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ArrowLeft, Save, Plus, MapPin, Navigation, Upload,
  X, Image, AlertCircle, CheckCircle,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import useCohrmStore from '../stores/cohrmStore';
import { createRumor, createExtendedRumor } from '../services/cohrmApi';
import { validateRumor as validateRumorData } from '../utils/validators';
import {
  SOURCE_OPTIONS,
  PRIORITY_OPTIONS,
  REGIONS_CAMEROON,
  SPECIES_CODES,
  SYMPTOM_CODES,
  RUMOR_CATEGORIES,
  COHRM_COLORS,
} from '../utils/constants';
import { LoadingSpinner } from '../components/shared';
import { toast } from 'react-toastify';

const SPECIES_OPTIONS = Object.entries(SPECIES_CODES).map(([code, info]) => ({
  value: code,
  label: `${code} - ${info.label}`,
}));

const SYMPTOM_OPTIONS = Object.entries(SYMPTOM_CODES).map(([code, info]) => ({
  value: code,
  label: `${code} - ${info.label}`,
}));

// Marqueur personnalisé pour le formulaire
const formMarkerIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="44">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
      fill="${COHRM_COLORS.accent}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="#fff"/>
  </svg>`,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  className: '',
});

// Sous-composant : Marqueur déplaçable
const DraggableMarker = ({ position, onPositionChange }) => {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        onPositionChange([lat, lng]);
      }
    },
  };

  if (!position[0] && !position[1]) return null;

  return (
    <Marker
      draggable
      position={position}
      ref={markerRef}
      eventHandlers={eventHandlers}
      icon={formMarkerIcon}
    />
  );
};

const INITIAL_FORM = {
  title: '',
  description: '',
  source: 'direct',
  region: '',
  department: '',
  district: '',
  location: '',
  latitude: '',
  longitude: '',
  species: '',
  symptoms: [],
  affected_count: '',
  dead_count: '',
  priority: 'medium',
  category: '',
  reporter_name: '',
  reporter_phone: '',
};

const RumorCreate = ({
  isDark = false,
  user,
  editMode = false,
  initialData = null,
  onSubmit,
}) => {
  const { setActivePage, fetchRumors } = useCohrmStore();

  const [form, setForm] = useState(() => {
    if (editMode && initialData) {
      return {
        ...INITIAL_FORM,
        ...initialData,
        symptoms: initialData.symptoms
          ? (typeof initialData.symptoms === 'string'
            ? initialData.symptoms.split(',').map(s => s.trim()).filter(Boolean)
            : initialData.symptoms)
          : [],
        affected_count: initialData.affected_count ?? '',
        dead_count: initialData.dead_count ?? '',
        latitude: initialData.latitude ?? '',
        longitude: initialData.longitude ?? '',
      };
    }
    return { ...INITIAL_FORM };
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveAndNew, setSaveAndNew] = useState(false);

  // Update form when initialData changes (edit mode)
  useEffect(() => {
    if (editMode && initialData) {
      setForm({
        ...INITIAL_FORM,
        ...initialData,
        symptoms: initialData.symptoms
          ? (typeof initialData.symptoms === 'string'
            ? initialData.symptoms.split(',').map(s => s.trim()).filter(Boolean)
            : initialData.symptoms)
          : [],
        affected_count: initialData.affected_count ?? '',
        dead_count: initialData.dead_count ?? '',
        latitude: initialData.latitude ?? '',
        longitude: initialData.longitude ?? '',
      });
    }
  }, [editMode, initialData]);

  // Mise à jour d'un champ
  const setField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }, [errors]);

  // Toggle symptôme
  const toggleSymptom = (code) => {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(code)
        ? prev.symptoms.filter(s => s !== code)
        : [...prev.symptoms, code],
    }));
  };

  // Mise à jour position GPS
  const handlePositionChange = ([lat, lng]) => {
    setForm(prev => ({
      ...prev,
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
    }));
  };

  // Géolocalisation navigateur
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handlePositionChange([pos.coords.latitude, pos.coords.longitude]);
        toast.success('Position obtenue');
      },
      (err) => {
        toast.error('Impossible d\'obtenir votre position');
      },
      { enableHighAccuracy: true }
    );
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (!form.title || form.title.trim().length < 3) {
      newErrors.title = 'Le titre doit contenir au moins 3 caractères';
    }
    if (form.title && form.title.length > 200) {
      newErrors.title = 'Le titre ne doit pas dépasser 200 caractères';
    }
    if (!form.description || form.description.trim().length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }
    if (!form.region) {
      newErrors.region = 'La région est requise';
    }
    if (!form.source) {
      newErrors.source = 'La source est requise';
    }
    if (!form.priority) {
      newErrors.priority = 'La priorité est requise';
    }
    if (form.dead_count && form.affected_count &&
      parseInt(form.dead_count) > parseInt(form.affected_count)) {
      newErrors.dead_count = 'Les décès ne peuvent pas dépasser le nombre de cas';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission
  const handleSubmit = async (createAnother = false) => {
    if (!validate()) {
      toast.error('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setSaving(true);
    setSaveAndNew(createAnother);

    try {
      const payload = {
        ...form,
        symptoms: form.symptoms.join(','),
        affected_count: form.affected_count ? parseInt(form.affected_count) : null,
        dead_count: form.dead_count ? parseInt(form.dead_count) : null,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };

      if (editMode && onSubmit) {
        await onSubmit(payload);
      } else {
        await createExtendedRumor(payload);
        toast.success('Rumeur créée avec succès');
        fetchRumors();

        if (createAnother) {
          setForm({ ...INITIAL_FORM });
          setErrors({});
        } else {
          setActivePage('rumors');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  // Position carte
  const mapPosition = (form.latitude && form.longitude)
    ? [parseFloat(form.latitude), parseFloat(form.longitude)]
    : [0, 0];
  const hasPosition = form.latitude && form.longitude;

  // Styles
  const s = {
    page: { padding: 0, maxWidth: 900 },
    backBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 14px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: 'transparent',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
      marginBottom: 20,
      fontFamily: 'inherit',
    },
    title: {
      fontSize: 22,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 24,
    },
    card: {
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      padding: 24,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    row: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: 16,
      marginBottom: 16,
    },
    row2: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
      marginBottom: 16,
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      marginBottom: 12,
    },
    label: {
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? '#e2e8f0' : '#374151',
    },
    required: {
      color: '#E74C3C',
      marginLeft: 2,
    },
    input: {
      padding: '10px 14px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 14,
      outline: 'none',
      fontFamily: 'inherit',
      transition: 'border-color 0.2s',
      width: '100%',
      boxSizing: 'border-box',
    },
    inputError: {
      borderColor: '#E74C3C',
    },
    textarea: {
      padding: '10px 14px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 14,
      outline: 'none',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: 100,
      lineHeight: 1.6,
      width: '100%',
      boxSizing: 'border-box',
    },
    select: {
      padding: '10px 14px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 14,
      outline: 'none',
      fontFamily: 'inherit',
      cursor: 'pointer',
      width: '100%',
      boxSizing: 'border-box',
    },
    error: {
      fontSize: 12,
      color: '#E74C3C',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    hint: {
      fontSize: 11,
      color: isDark ? '#64748b' : '#9CA3AF',
      marginTop: 2,
    },
    // Symptômes tags
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
    },
    tag: (isSelected) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '6px 12px',
      borderRadius: 20,
      border: isSelected
        ? `1px solid ${COHRM_COLORS.primary}`
        : (isDark ? '1px solid #334155' : '1px solid #D1D5DB'),
      backgroundColor: isSelected
        ? (isDark ? '#1B4F7230' : '#EBF5FB')
        : 'transparent',
      color: isSelected
        ? COHRM_COLORS.primary
        : (isDark ? '#94a3b8' : '#6B7280'),
      fontSize: 12,
      fontWeight: isSelected ? 600 : 400,
      cursor: 'pointer',
      transition: 'all 0.15s',
      userSelect: 'none',
    }),
    // Carte GPS
    mapWrapper: {
      borderRadius: 10,
      overflow: 'hidden',
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      height: 280,
      marginBottom: 12,
    },
    gpsRow: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-end',
    },
    geoBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 16px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: 'transparent',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      fontFamily: 'inherit',
    },
    // Actions
    actions: {
      display: 'flex',
      gap: 10,
      justifyContent: 'flex-end',
      paddingTop: 16,
      borderTop: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      marginTop: 8,
    },
    cancelBtn: {
      padding: '10px 20px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: 'transparent',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
    saveBtn: (variant) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 20px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: variant === 'secondary'
        ? (isDark ? '#334155' : '#E5E7EB')
        : COHRM_COLORS.primary,
      color: variant === 'secondary'
        ? (isDark ? '#e2e8f0' : '#374151')
        : '#fff',
      fontSize: 14,
      fontWeight: 600,
      cursor: saving ? 'wait' : 'pointer',
      opacity: saving ? 0.7 : 1,
      fontFamily: 'inherit',
    }),
    charCount: {
      fontSize: 11,
      color: isDark ? '#64748b' : '#9CA3AF',
      textAlign: 'right',
      marginTop: 2,
    },
  };

  return (
    <div style={s.page}>
      {/* Retour */}
      <button style={s.backBtn} onClick={() => setActivePage('rumors')}>
        <ArrowLeft size={16} /> Retour aux rumeurs
      </button>

      <h1 style={s.title}>
        {editMode ? 'Modifier la rumeur' : 'Nouvelle rumeur'}
      </h1>

      {/* ===== Section 1 : Informations principales ===== */}
      <div style={s.card}>
        <div style={s.sectionTitle}>
          <AlertCircle size={18} color={COHRM_COLORS.primary} />
          Informations principales
        </div>

        {/* Titre */}
        <div style={s.field}>
          <label style={s.label}>
            Titre <span style={s.required}>*</span>
          </label>
          <input
            style={{ ...s.input, ...(errors.title ? s.inputError : {}) }}
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="Titre de la rumeur..."
            maxLength={200}
          />
          <div style={s.charCount}>{form.title.length}/200</div>
          {errors.title && (
            <div style={s.error}><AlertCircle size={12} /> {errors.title}</div>
          )}
        </div>

        {/* Description */}
        <div style={s.field}>
          <label style={s.label}>
            Description <span style={s.required}>*</span>
          </label>
          <textarea
            style={{ ...s.textarea, ...(errors.description ? s.inputError : {}) }}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Description détaillée de la rumeur..."
          />
          {errors.description && (
            <div style={s.error}><AlertCircle size={12} /> {errors.description}</div>
          )}
        </div>

        <div style={s.row}>
          {/* Source */}
          <div style={s.field}>
            <label style={s.label}>
              Source <span style={s.required}>*</span>
            </label>
            <select
              style={{ ...s.select, ...(errors.source ? s.inputError : {}) }}
              value={form.source}
              onChange={(e) => setField('source', e.target.value)}
            >
              <option value="">-- Sélectionner --</option>
              {SOURCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.source && (
              <div style={s.error}><AlertCircle size={12} /> {errors.source}</div>
            )}
          </div>

          {/* Priorité */}
          <div style={s.field}>
            <label style={s.label}>
              Priorité <span style={s.required}>*</span>
            </label>
            <select
              style={{ ...s.select, ...(errors.priority ? s.inputError : {}) }}
              value={form.priority}
              onChange={(e) => setField('priority', e.target.value)}
            >
              {PRIORITY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.priority && (
              <div style={s.error}><AlertCircle size={12} /> {errors.priority}</div>
            )}
          </div>

          {/* Catégorie */}
          <div style={s.field}>
            <label style={s.label}>Catégorie</label>
            <select
              style={s.select}
              value={form.category}
              onChange={(e) => setField('category', e.target.value)}
            >
              <option value="">-- Sélectionner --</option>
              {RUMOR_CATEGORIES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ===== Section 2 : Localisation ===== */}
      <div style={s.card}>
        <div style={s.sectionTitle}>
          <MapPin size={18} color={COHRM_COLORS.primary} />
          Localisation
        </div>

        <div style={s.row}>
          {/* Région */}
          <div style={s.field}>
            <label style={s.label}>
              Région <span style={s.required}>*</span>
            </label>
            <select
              style={{ ...s.select, ...(errors.region ? s.inputError : {}) }}
              value={form.region}
              onChange={(e) => {
                setField('region', e.target.value);
                setField('department', '');
                setField('district', '');
              }}
            >
              <option value="">-- Sélectionner --</option>
              {REGIONS_CAMEROON.map(r => (
                <option key={r.code} value={r.name}>{r.name}</option>
              ))}
            </select>
            {errors.region && (
              <div style={s.error}><AlertCircle size={12} /> {errors.region}</div>
            )}
          </div>

          {/* Département */}
          <div style={s.field}>
            <label style={s.label}>Département</label>
            <input
              style={s.input}
              value={form.department}
              onChange={(e) => setField('department', e.target.value)}
              placeholder="Département..."
            />
          </div>

          {/* District */}
          <div style={s.field}>
            <label style={s.label}>District</label>
            <input
              style={s.input}
              value={form.district}
              onChange={(e) => setField('district', e.target.value)}
              placeholder="District sanitaire..."
            />
          </div>
        </div>

        {/* Localité */}
        <div style={s.field}>
          <label style={s.label}>Localité / Adresse</label>
          <input
            style={s.input}
            value={form.location}
            onChange={(e) => setField('location', e.target.value)}
            placeholder="Nom du village, quartier, adresse..."
          />
        </div>

        {/* Carte GPS */}
        <div style={s.field}>
          <label style={s.label}>Position GPS</label>
          <div style={s.hint}>Cliquez sur la carte ou déplacez le marqueur pour définir la position</div>
        </div>

        <div style={s.mapWrapper}>
          <MapContainer
            center={hasPosition ? mapPosition : [7.3697, 12.3547]}
            zoom={hasPosition ? 10 : 6}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url={isDark
                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              }
            />
            <DraggableMarker
              position={hasPosition ? mapPosition : [0, 0]}
              onPositionChange={handlePositionChange}
            />
          </MapContainer>
        </div>

        <div style={s.gpsRow}>
          <div style={{ ...s.field, flex: 1, marginBottom: 0 }}>
            <label style={s.label}>Latitude</label>
            <input
              style={s.input}
              type="number"
              step="0.000001"
              value={form.latitude}
              onChange={(e) => setField('latitude', e.target.value)}
              placeholder="ex: 7.3697"
            />
          </div>
          <div style={{ ...s.field, flex: 1, marginBottom: 0 }}>
            <label style={s.label}>Longitude</label>
            <input
              style={s.input}
              type="number"
              step="0.000001"
              value={form.longitude}
              onChange={(e) => setField('longitude', e.target.value)}
              placeholder="ex: 12.3547"
            />
          </div>
          <button style={s.geoBtn} onClick={handleGeolocate} type="button">
            <Navigation size={14} />
            Ma position
          </button>
        </div>
      </div>

      {/* ===== Section 3 : Détails sanitaires ===== */}
      <div style={s.card}>
        <div style={s.sectionTitle}>
          <AlertCircle size={18} color={COHRM_COLORS.primary} />
          Détails sanitaires
        </div>

        <div style={s.row}>
          {/* Espèce */}
          <div style={s.field}>
            <label style={s.label}>Espèce concernée</label>
            <select
              style={s.select}
              value={form.species}
              onChange={(e) => setField('species', e.target.value)}
            >
              <option value="">-- Sélectionner --</option>
              {SPECIES_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Nombre de cas */}
          <div style={s.field}>
            <label style={s.label}>Nombre de cas</label>
            <input
              style={s.input}
              type="number"
              min="0"
              value={form.affected_count}
              onChange={(e) => setField('affected_count', e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Nombre de décès */}
          <div style={s.field}>
            <label style={s.label}>Nombre de décès</label>
            <input
              style={{ ...s.input, ...(errors.dead_count ? s.inputError : {}) }}
              type="number"
              min="0"
              value={form.dead_count}
              onChange={(e) => setField('dead_count', e.target.value)}
              placeholder="0"
            />
            {errors.dead_count && (
              <div style={s.error}><AlertCircle size={12} /> {errors.dead_count}</div>
            )}
          </div>
        </div>

        {/* Symptômes */}
        <div style={s.field}>
          <label style={s.label}>
            Symptômes observés
            {form.symptoms.length > 0 && (
              <span style={{ fontWeight: 400, color: isDark ? '#64748b' : '#9CA3AF', marginLeft: 8 }}>
                ({form.symptoms.length} sélectionné{form.symptoms.length > 1 ? 's' : ''})
              </span>
            )}
          </label>
          <div style={s.tagsContainer}>
            {SYMPTOM_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                style={s.tag(form.symptoms.includes(value))}
                onClick={() => toggleSymptom(value)}
              >
                {form.symptoms.includes(value) && <CheckCircle size={12} />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== Section 4 : Rapporteur ===== */}
      <div style={s.card}>
        <div style={s.sectionTitle}>
          <AlertCircle size={18} color={COHRM_COLORS.primary} />
          Informations du rapporteur (optionnel)
        </div>

        <div style={s.row2}>
          <div style={s.field}>
            <label style={s.label}>Nom du rapporteur</label>
            <input
              style={s.input}
              value={form.reporter_name}
              onChange={(e) => setField('reporter_name', e.target.value)}
              placeholder="Nom complet..."
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Téléphone</label>
            <input
              style={s.input}
              value={form.reporter_phone}
              onChange={(e) => setField('reporter_phone', e.target.value)}
              placeholder="+237 6XX XXX XXX"
            />
          </div>
        </div>
      </div>

      {/* ===== Actions ===== */}
      <div style={s.card}>
        <div style={s.actions}>
          <button
            style={s.cancelBtn}
            onClick={() => setActivePage('rumors')}
            disabled={saving}
          >
            Annuler
          </button>

          {!editMode && (
            <button
              style={s.saveBtn('secondary')}
              onClick={() => handleSubmit(true)}
              disabled={saving}
            >
              <Save size={14} />
              Enregistrer & Créer une autre
            </button>
          )}

          <button
            style={s.saveBtn('primary')}
            onClick={() => handleSubmit(false)}
            disabled={saving}
          >
            {saving ? (
              '...'
            ) : (
              <>
                <Save size={14} />
                {editMode ? 'Enregistrer les modifications' : 'Enregistrer'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RumorCreate;
