/**
 * ActorForm - Formulaire de création/édition d'acteur COHRM
 *
 * Utilise React Hook Form pour la validation.
 * Cascade : Région → Département → District (texte libre)
 * Téléphone : format +237 avec masque
 * Canal de transmission : multi-select
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  ArrowLeft, Save, User, MapPin, Building2, Phone, Mail,
  Shield, Radio, Loader, AlertCircle, CheckCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import useCohrmStore from '../stores/cohrmStore';
import { getActor, createActor, updateActor } from '../services/cohrmApi';
import {
  COHRM_COLORS, REGIONS_CAMEROON, ACTOR_TYPES,
  VALIDATION_LEVELS, TRANSMISSION_CHANNELS,
} from '../utils/constants';
import { LoadingSpinner } from '../components/shared';

// Départements par région (Cameroun)
const DEPARTMENTS_BY_REGION = {
  'Adamaoua': ['Djérem', 'Faro-et-Déo', 'Mayo-Banyo', 'Mbéré', 'Vina'],
  'Centre': ['Haute-Sanaga', 'Lekié', 'Mbam-et-Inoubou', 'Mbam-et-Kim', 'Méfou-et-Afamba', 'Méfou-et-Akono', 'Mfoundi', 'Nyong-et-Kellé', 'Nyong-et-Mfoumou', 'Nyong-et-So\'o'],
  'Est': ['Boumba-et-Ngoko', 'Haut-Nyong', 'Kadey', 'Lom-et-Djérem'],
  'Extrême-Nord': ['Diamaré', 'Logone-et-Chari', 'Mayo-Danay', 'Mayo-Kani', 'Mayo-Sava', 'Mayo-Tsanaga'],
  'Littoral': ['Moungo', 'Nkam', 'Sanaga-Maritime', 'Wouri'],
  'Nord': ['Bénoué', 'Faro', 'Mayo-Louti', 'Mayo-Rey'],
  'Nord-Ouest': ['Boyo', 'Bui', 'Donga-Mantung', 'Menchum', 'Mezam', 'Momo', 'Ngo-Ketunjia'],
  'Ouest': ['Bamboutos', 'Haut-Nkam', 'Hauts-Plateaux', 'Koung-Khi', 'Ménoua', 'Mifi', 'Ndé', 'Noun'],
  'Sud': ['Dja-et-Lobo', 'Mvila', 'Océan', 'Vallée-du-Ntem'],
  'Sud-Ouest': ['Fako', 'Koupé-Manengouba', 'Lebialem', 'Manyu', 'Meme', 'Ndian'],
};

/**
 * @param {object} props
 * @param {boolean} props.isDark - Mode sombre
 * @param {object} props.user - Utilisateur connecté
 * @param {boolean} props.isEdit - Mode édition (vs création)
 */
const ActorForm = ({ isDark, user, isEdit = false }) => {
  const { selectedActorId, setActivePage } = useCohrmStore();
  const [loadingActor, setLoadingActor] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState(['system']);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      user_name: '',
      actor_level: '',
      actor_type: '',
      region: '',
      department: '',
      district: '',
      organization: '',
      role_in_org: '',
      phone: '',
      email: '',
    },
  });

  const watchLevel = watch('actor_level');
  const watchRegion = watch('region');

  // Charger l'acteur en mode édition
  useEffect(() => {
    if (isEdit && selectedActorId) {
      (async () => {
        setLoadingActor(true);
        try {
          const response = await getActor(selectedActorId);
          if (response.success && response.data) {
            const a = response.data;
            reset({
              user_name: a.user_name || '',
              actor_level: a.actor_level ? String(a.actor_level) : '',
              actor_type: a.actor_type || '',
              region: a.region || '',
              department: a.department || '',
              district: a.district || '',
              organization: a.organization || '',
              role_in_org: a.role_in_org || '',
              phone: a.phone || '',
              email: a.email || a.user_email || '',
            });
            if (a.transmission_channel) {
              setSelectedChannels(a.transmission_channel.split(',').map(c => c.trim()).filter(Boolean));
            }
          }
        } catch (err) {
          toast.error('Erreur lors du chargement de l\'acteur');
        } finally {
          setLoadingActor(false);
        }
      })();
    }
  }, [isEdit, selectedActorId, reset]);

  // Reset department quand region change
  useEffect(() => {
    if (!isEdit) {
      setValue('department', '');
    }
  }, [watchRegion, setValue, isEdit]);

  // Types d'acteurs pour le niveau sélectionné
  const actorTypesForLevel = ACTOR_TYPES[watchLevel] || [];

  // Départements pour la région sélectionnée
  const departmentsForRegion = DEPARTMENTS_BY_REGION[watchRegion] || [];

  // Soumission
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        actor_level: Number(data.actor_level),
        actor_type: data.actor_type,
        region: data.region,
        department: data.department,
        district: data.district,
        organization: data.organization,
        role_in_org: data.role_in_org,
        phone: data.phone,
        email: data.email,
        transmission_channel: selectedChannels.join(','),
      };

      if (isEdit && selectedActorId) {
        await updateActor(selectedActorId, payload);
        toast.success('Acteur mis à jour avec succès');
        setActivePage('actor-detail', { actorId: selectedActorId });
      } else {
        const response = await createActor(payload);
        toast.success('Acteur créé avec succès');
        if (response?.data?.id) {
          setActivePage('actor-detail', { actorId: response.data.id });
        } else {
          setActivePage('actors');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle channel
  const toggleChannel = (value) => {
    setSelectedChannels(prev =>
      prev.includes(value)
        ? prev.filter(c => c !== value)
        : [...prev, value]
    );
  };

  // Styles
  const s = {
    container: {
      maxWidth: 800,
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      marginBottom: 28,
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: 'transparent',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      cursor: 'pointer',
    },
    title: {
      fontSize: 22,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
    },
    subtitle: {
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      marginTop: 2,
    },
    card: {
      padding: 24,
      borderRadius: 16,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      marginBottom: 20,
    },
    sectionTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 16,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
      marginBottom: 20,
      paddingBottom: 12,
      borderBottom: isDark ? '1px solid #334155' : '1px solid #F3F4F6',
    },
    sectionIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? `${COHRM_COLORS.primary}30` : '#EBF5FB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    fieldGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: 20,
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    },
    fieldFull: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      gridColumn: '1 / -1',
    },
    label: {
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
    },
    required: {
      color: '#E74C3C',
      fontSize: 14,
    },
    input: (hasError) => ({
      padding: '10px 14px',
      borderRadius: 10,
      border: `1px solid ${hasError ? '#E74C3C' : (isDark ? '#334155' : '#D1D5DB')}`,
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontSize: 14,
      outline: 'none',
      transition: 'border-color 0.2s',
    }),
    select: (hasError) => ({
      padding: '10px 14px',
      borderRadius: 10,
      border: `1px solid ${hasError ? '#E74C3C' : (isDark ? '#334155' : '#D1D5DB')}`,
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontSize: 14,
      outline: 'none',
      cursor: 'pointer',
    }),
    error: {
      fontSize: 12,
      color: '#E74C3C',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    hint: {
      fontSize: 12,
      color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF',
      marginTop: 2,
    },
    // Niveau descriptions
    levelOption: (level, isSelected) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderRadius: 10,
      border: `2px solid ${isSelected ? (VALIDATION_LEVELS.find(v => v.level === level)?.color || '#D1D5DB') : (isDark ? '#334155' : '#E5E7EB')}`,
      backgroundColor: isSelected
        ? (isDark ? `${VALIDATION_LEVELS.find(v => v.level === level)?.color || '#1B4F72'}15` : `${VALIDATION_LEVELS.find(v => v.level === level)?.color || '#1B4F72'}10`)
        : 'transparent',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    levelBadge: (level) => {
      const info = VALIDATION_LEVELS.find(v => v.level === level);
      return {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: info?.color || '#95A5A6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 14,
        fontWeight: 700,
        flexShrink: 0,
      };
    },
    levelName: {
      fontSize: 14,
      fontWeight: 600,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
    },
    levelDesc: {
      fontSize: 12,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      marginTop: 2,
    },
    // Multi-select channels
    channelGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
    },
    channelChip: (isSelected) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 16px',
      borderRadius: 20,
      border: `1.5px solid ${isSelected ? COHRM_COLORS.primaryLight : (isDark ? '#334155' : '#D1D5DB')}`,
      backgroundColor: isSelected
        ? (isDark ? `${COHRM_COLORS.primaryLight}20` : '#EBF5FB')
        : 'transparent',
      color: isSelected ? COHRM_COLORS.primaryLight : (isDark ? COHRM_COLORS.darkMuted : '#6B7280'),
      fontSize: 13,
      fontWeight: isSelected ? 600 : 400,
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    // Phone input
    phoneWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: 0,
    },
    phonePrefix: {
      padding: '10px 12px',
      borderRadius: '10px 0 0 10px',
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      borderRight: 'none',
      backgroundColor: isDark ? '#334155' : '#F3F4F6',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontSize: 14,
      fontWeight: 600,
    },
    phoneInput: (hasError) => ({
      flex: 1,
      padding: '10px 14px',
      borderRadius: '0 10px 10px 0',
      border: `1px solid ${hasError ? '#E74C3C' : (isDark ? '#334155' : '#D1D5DB')}`,
      backgroundColor: isDark ? '#0f172a' : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontSize: 14,
      outline: 'none',
    }),
    // Actions
    actionsBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 8,
    },
    cancelBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '12px 24px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: 'transparent',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
    },
    submitBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '12px 28px',
      borderRadius: 10,
      border: 'none',
      backgroundColor: COHRM_COLORS.primary,
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      cursor: submitting ? 'wait' : 'pointer',
      opacity: submitting ? 0.7 : 1,
      transition: 'all 0.2s',
    },
  };

  if (loadingActor) {
    return <LoadingSpinner isDark={isDark} text="Chargement de l'acteur..." />;
  }

  return (
    <div style={s.container}>
      {/* En-tête */}
      <div style={s.header}>
        <button
          style={s.backBtn}
          onClick={() => {
            if (isEdit && selectedActorId) {
              setActivePage('actor-detail', { actorId: selectedActorId });
            } else {
              setActivePage('actors');
            }
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div style={s.title}>
            {isEdit ? 'Modifier l\'acteur' : 'Nouvel acteur'}
          </div>
          <div style={s.subtitle}>
            {isEdit ? 'Modifiez les informations de l\'acteur' : 'Ajoutez un nouvel intervenant au système COHRM'}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Section 1 : Identité */}
        <div style={s.card}>
          <div style={s.sectionTitle}>
            <div style={s.sectionIcon}>
              <User size={18} color={COHRM_COLORS.primaryLight} />
            </div>
            Identité
          </div>
          <div style={s.fieldGrid}>
            {/* Nom complet */}
            <div style={s.fieldFull}>
              <label style={s.label}>
                Nom complet <span style={s.required}>*</span>
              </label>
              <input
                style={s.input(!!errors.user_name)}
                placeholder="Prénom et nom de l'acteur"
                {...register('user_name', {
                  required: 'Le nom complet est requis',
                  minLength: { value: 3, message: 'Minimum 3 caractères' },
                })}
                onFocus={(e) => { e.target.style.borderColor = COHRM_COLORS.primaryLight; }}
                onBlur={(e) => { e.target.style.borderColor = errors.user_name ? '#E74C3C' : (isDark ? '#334155' : '#D1D5DB'); }}
              />
              {errors.user_name && (
                <div style={s.error}><AlertCircle size={12} /> {errors.user_name.message}</div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2 : Niveau et rôle */}
        <div style={s.card}>
          <div style={s.sectionTitle}>
            <div style={s.sectionIcon}>
              <Shield size={18} color={COHRM_COLORS.primaryLight} />
            </div>
            Niveau et rôle
          </div>

          {/* Sélection du niveau avec descriptions */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ ...s.label, marginBottom: 10 }}>
              Niveau de l'acteur <span style={s.required}>*</span>
            </label>
            <Controller
              name="actor_level"
              control={control}
              rules={{ required: 'Le niveau est requis' }}
              render={({ field }) => (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                  {VALIDATION_LEVELS.map(v => (
                    <div
                      key={v.level}
                      style={s.levelOption(v.level, field.value === String(v.level))}
                      onClick={() => {
                        field.onChange(String(v.level));
                        // Reset actor_type when level changes
                        setValue('actor_type', '');
                      }}
                    >
                      <div style={s.levelBadge(v.level)}>{v.level}</div>
                      <div>
                        <div style={s.levelName}>{v.name}</div>
                        <div style={s.levelDesc}>{v.role} — {v.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.actor_level && (
              <div style={s.error}><AlertCircle size={12} /> {errors.actor_level.message}</div>
            )}
          </div>

          <div style={s.fieldGrid}>
            {/* Type d'acteur */}
            <div style={s.field}>
              <label style={s.label}>
                Type d'acteur <span style={s.required}>*</span>
              </label>
              <select
                style={s.select(!!errors.actor_type)}
                {...register('actor_type', { required: 'Le type d\'acteur est requis' })}
                disabled={!watchLevel}
              >
                <option value="">{watchLevel ? 'Sélectionner un type' : 'Sélectionnez d\'abord un niveau'}</option>
                {actorTypesForLevel.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {errors.actor_type && (
                <div style={s.error}><AlertCircle size={12} /> {errors.actor_type.message}</div>
              )}
            </div>

            {/* Rôle/Fonction */}
            <div style={s.field}>
              <label style={s.label}>Rôle / Fonction</label>
              <input
                style={s.input(false)}
                placeholder="Ex: Chef de centre, Superviseur..."
                {...register('role_in_org')}
                onFocus={(e) => { e.target.style.borderColor = COHRM_COLORS.primaryLight; }}
                onBlur={(e) => { e.target.style.borderColor = isDark ? '#334155' : '#D1D5DB'; }}
              />
            </div>

            {/* Organisation */}
            <div style={s.field}>
              <label style={s.label}>Organisation</label>
              <input
                style={s.input(false)}
                placeholder="Ex: Ministère de la Santé, OMS..."
                {...register('organization')}
                onFocus={(e) => { e.target.style.borderColor = COHRM_COLORS.primaryLight; }}
                onBlur={(e) => { e.target.style.borderColor = isDark ? '#334155' : '#D1D5DB'; }}
              />
            </div>
          </div>
        </div>

        {/* Section 3 : Localisation */}
        <div style={s.card}>
          <div style={s.sectionTitle}>
            <div style={s.sectionIcon}>
              <MapPin size={18} color={COHRM_COLORS.primaryLight} />
            </div>
            Localisation
          </div>
          <div style={s.fieldGrid}>
            {/* Région */}
            <div style={s.field}>
              <label style={s.label}>Région</label>
              <select
                style={s.select(false)}
                {...register('region')}
              >
                <option value="">Sélectionner une région</option>
                {REGIONS_CAMEROON.map(r => (
                  <option key={r.code} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Département (cascade) */}
            <div style={s.field}>
              <label style={s.label}>Département</label>
              <select
                style={s.select(false)}
                {...register('department')}
                disabled={!watchRegion || departmentsForRegion.length === 0}
              >
                <option value="">{watchRegion ? 'Sélectionner un département' : 'Sélectionnez d\'abord une région'}</option>
                {departmentsForRegion.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div style={s.field}>
              <label style={s.label}>District</label>
              <input
                style={s.input(false)}
                placeholder="Nom du district de santé"
                {...register('district')}
                onFocus={(e) => { e.target.style.borderColor = COHRM_COLORS.primaryLight; }}
                onBlur={(e) => { e.target.style.borderColor = isDark ? '#334155' : '#D1D5DB'; }}
              />
            </div>
          </div>
        </div>

        {/* Section 4 : Contact */}
        <div style={s.card}>
          <div style={s.sectionTitle}>
            <div style={s.sectionIcon}>
              <Phone size={18} color={COHRM_COLORS.primaryLight} />
            </div>
            Contact
          </div>
          <div style={s.fieldGrid}>
            {/* Téléphone */}
            <div style={s.field}>
              <label style={s.label}>Téléphone</label>
              <div style={s.phoneWrapper}>
                <span style={s.phonePrefix}>+237</span>
                <input
                  style={s.phoneInput(!!errors.phone)}
                  placeholder="6XX XXX XXX"
                  {...register('phone', {
                    pattern: {
                      value: /^(\+237)?[0-9\s]{9,15}$/,
                      message: 'Numéro de téléphone invalide',
                    },
                  })}
                  onFocus={(e) => { e.target.style.borderColor = COHRM_COLORS.primaryLight; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.phone ? '#E74C3C' : (isDark ? '#334155' : '#D1D5DB'); }}
                  onChange={(e) => {
                    // Format masque : garder seulement chiffres et espaces
                    let val = e.target.value.replace(/[^\d\s+]/g, '');
                    e.target.value = val;
                    register('phone').onChange(e);
                  }}
                />
              </div>
              {errors.phone && (
                <div style={s.error}><AlertCircle size={12} /> {errors.phone.message}</div>
              )}
              <div style={s.hint}>Format : 6XX XXX XXX (9 chiffres)</div>
            </div>

            {/* Email */}
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input
                style={s.input(!!errors.email)}
                type="email"
                placeholder="acteur@exemple.com"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Adresse email invalide',
                  },
                })}
                onFocus={(e) => { e.target.style.borderColor = COHRM_COLORS.primaryLight; }}
                onBlur={(e) => { e.target.style.borderColor = errors.email ? '#E74C3C' : (isDark ? '#334155' : '#D1D5DB'); }}
              />
              {errors.email && (
                <div style={s.error}><AlertCircle size={12} /> {errors.email.message}</div>
              )}
            </div>
          </div>
        </div>

        {/* Section 5 : Canal de transmission */}
        <div style={s.card}>
          <div style={s.sectionTitle}>
            <div style={s.sectionIcon}>
              <Radio size={18} color={COHRM_COLORS.primaryLight} />
            </div>
            Canal de transmission
          </div>
          <div style={s.hint}>
            Sélectionnez un ou plusieurs canaux par lesquels cet acteur recevra les notifications et alertes.
          </div>
          <div style={{ ...s.channelGrid, marginTop: 12 }}>
            {TRANSMISSION_CHANNELS.map(ch => (
              <button
                key={ch.value}
                type="button"
                style={s.channelChip(selectedChannels.includes(ch.value))}
                onClick={() => toggleChannel(ch.value)}
              >
                {selectedChannels.includes(ch.value) && <CheckCircle size={14} />}
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Barre d'actions */}
        <div style={s.actionsBar}>
          <button
            type="button"
            style={s.cancelBtn}
            onClick={() => {
              if (isEdit && selectedActorId) {
                setActivePage('actor-detail', { actorId: selectedActorId });
              } else {
                setActivePage('actors');
              }
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            style={s.submitBtn}
            disabled={submitting}
          >
            {submitting ? (
              <Loader size={16} style={{ animation: 'cohrmSpin 0.6s linear infinite' }} />
            ) : (
              <Save size={16} />
            )}
            {isEdit ? 'Enregistrer' : 'Créer l\'acteur'}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes cohrmSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ActorForm;
