/**
 * RumorDetail - Page de détail d'une rumeur
 * Layout 2 colonnes (70/30) avec système d'onglets
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  ArrowLeft, MapPin, Clock, User, Phone, Hash, Layers,
  MessageCircle, FileText, Shield, CheckCircle, AlertTriangle,
  Send, Lock, Globe, Edit, Trash2, ChevronUp, ChevronRight,
  Activity, Eye, Calendar, Users, Bug, Heart,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import useCohrmStore from '../stores/cohrmStore';
import { usePermissions } from '../hooks/usePermissions';
import {
  addNote, deleteRumor, validateRumor,
  getValidations, getFeedbacks,
} from '../services/cohrmApi';
import {
  StatusBadge, PriorityBadge, RiskBadge, SourceBadge,
  LoadingSpinner, EmptyState, ConfirmModal,
} from '../components/shared';
import {
  formatDate, formatDateTime, formatRelativeDate,
  formatLocation, formatStatus, formatPriority,
  formatRiskLevel, formatSource, formatCategory,
  truncateText, formatNumber,
} from '../utils/formatters';
import {
  COHRM_COLORS, SYMPTOM_CODES, SPECIES_CODES,
  VALIDATION_LEVELS, STATUS_OPTIONS,
} from '../utils/constants';
import { toast } from 'react-toastify';
import FeedbackPanel from '../components/FeedbackPanel';

const TABS = [
  { id: 'info', label: 'Informations', icon: FileText },
  { id: 'validation', label: 'Validation', icon: CheckCircle },
  { id: 'risk', label: 'Risque', icon: Shield },
  { id: 'notes', label: 'Notes', icon: MessageCircle },
  { id: 'feedback', label: 'Rétro-info', icon: Send },
  { id: 'history', label: 'Historique', icon: Activity },
];

// Icône marqueur personnalisée
const detailMarkerIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="44">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
      fill="${COHRM_COLORS.primary}" stroke="#fff" stroke-width="1.5"/>
    <circle cx="12" cy="12" r="5" fill="#fff"/>
  </svg>`,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -40],
  className: '',
});

const RumorDetail = ({ isDark = false, user }) => {
  const {
    currentRumor: rumor,
    loadingRumor,
    selectedRumorId,
    fetchRumor,
    clearCurrentRumor,
    setActivePage,
    navigateToRumorEdit,
    fetchRumors,
  } = useCohrmStore();

  const { canEdit, canDelete, canValidate, userLevel } = usePermissions(user);

  const [activeTab, setActiveTab] = useState('info');
  const [noteContent, setNoteContent] = useState('');
  const [notePrivate, setNotePrivate] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [validations, setValidations] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // Charger la rumeur
  useEffect(() => {
    if (selectedRumorId) {
      fetchRumor(selectedRumorId);
    }
    return () => clearCurrentRumor();
  }, [selectedRumorId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Charger validations et feedbacks quand on change d'onglet
  useEffect(() => {
    if (!selectedRumorId) return;
    if (activeTab === 'validation') {
      getValidations(selectedRumorId).then(res => {
        if (res.success) setValidations(res.data || []);
      }).catch(() => {});
    }
    if (activeTab === 'feedback') {
      getFeedbacks(selectedRumorId).then(res => {
        if (res.success) setFeedbacks(res.data || []);
      }).catch(() => {});
    }
  }, [activeTab, selectedRumorId]);

  // Ajouter une note
  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    setNoteLoading(true);
    try {
      await addNote(selectedRumorId, {
        content: noteContent.trim(),
        is_private: notePrivate ? 1 : 0,
      });
      toast.success('Note ajoutée');
      setNoteContent('');
      setNotePrivate(false);
      fetchRumor(selectedRumorId);
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'ajout');
    } finally {
      setNoteLoading(false);
    }
  };

  // Supprimer la rumeur
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteRumor(selectedRumorId);
      toast.success('Rumeur supprimée');
      setActivePage('rumors');
      fetchRumors();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Symptômes parsés
  const getSymptoms = () => {
    if (!rumor?.symptoms) return [];
    return rumor.symptoms.split(',').map(s => s.trim()).filter(Boolean).map(code => ({
      code,
      label: SYMPTOM_CODES[code]?.label || code,
    }));
  };

  // Espèce formatée
  const getSpecies = () => {
    if (!rumor?.species) return null;
    const info = SPECIES_CODES[rumor.species];
    return info ? `${rumor.species} - ${info.label}` : rumor.species;
  };

  // Styles
  const s = {
    page: { padding: 0 },
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
    layout: {
      display: 'flex',
      gap: 20,
      alignItems: 'flex-start',
    },
    main: {
      flex: '0 0 70%',
      maxWidth: '70%',
      minWidth: 0,
    },
    sidebar: {
      flex: '0 0 28%',
      maxWidth: '28%',
      position: 'sticky',
      top: 20,
    },
    card: {
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      overflow: 'hidden',
      marginBottom: 16,
    },
    cardHeader: {
      padding: '20px 24px 0',
    },
    cardBody: {
      padding: '16px 24px 24px',
    },
    sideCard: {
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      overflow: 'hidden',
      marginBottom: 12,
    },
    sideCardTitle: {
      fontSize: 13,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      padding: '12px 16px',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #F3F4F6',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
    },
    sideCardBody: {
      padding: 16,
    },
    titleRow: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 16,
    },
    rumorTitle: {
      fontSize: 22,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      lineHeight: 1.3,
      flex: 1,
    },
    badges: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 16,
    },
    tabs: {
      display: 'flex',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      gap: 0,
      overflowX: 'auto',
    },
    tab: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '12px 18px',
      border: 'none',
      borderBottom: isActive ? `2px solid ${COHRM_COLORS.primary}` : '2px solid transparent',
      backgroundColor: 'transparent',
      color: isActive ? COHRM_COLORS.primary : (isDark ? '#94a3b8' : '#6B7280'),
      fontSize: 13,
      fontWeight: isActive ? 600 : 400,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s',
      fontFamily: 'inherit',
    }),
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: 16,
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    },
    infoLabel: {
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: isDark ? '#64748b' : '#9CA3AF',
    },
    infoValue: {
      fontSize: 14,
      color: isDark ? '#e2e8f0' : '#374151',
      fontWeight: 500,
    },
    description: {
      fontSize: 14,
      lineHeight: 1.8,
      color: isDark ? '#cbd5e1' : '#4B5563',
      marginBottom: 20,
      whiteSpace: 'pre-wrap',
    },
    chip: {
      display: 'inline-flex',
      padding: '3px 10px',
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 500,
      backgroundColor: isDark ? '#334155' : '#F3F4F6',
      color: isDark ? '#e2e8f0' : '#374151',
      marginRight: 4,
      marginBottom: 4,
    },
    // Notes
    notesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },
    noteItem: (isPrivate) => ({
      padding: 14,
      borderRadius: 10,
      backgroundColor: isPrivate
        ? (isDark ? '#1e1e2e' : '#F8F9FA')
        : (isDark ? '#0f1729' : '#EBF5FB'),
      border: isPrivate
        ? (isDark ? '1px solid #334155' : '1px solid #E5E7EB')
        : (isDark ? '1px solid #1B4F7240' : '1px solid #BDD8F1'),
    }),
    noteHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    noteAuthor: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      backgroundColor: COHRM_COLORS.primary,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
    },
    noteText: {
      fontSize: 13,
      lineHeight: 1.6,
      color: isDark ? '#cbd5e1' : '#4B5563',
      whiteSpace: 'pre-wrap',
    },
    noteForm: {
      marginTop: 16,
      padding: 16,
      borderRadius: 10,
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    textarea: {
      width: '100%',
      minHeight: 80,
      padding: 12,
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      lineHeight: 1.5,
      resize: 'vertical',
      outline: 'none',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    noteActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    togglePrivate: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      color: isDark ? '#94a3b8' : '#6B7280',
      cursor: 'pointer',
      userSelect: 'none',
    },
    sendBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 16px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: COHRM_COLORS.primary,
      color: '#fff',
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      opacity: noteContent.trim() ? 1 : 0.5,
      fontFamily: 'inherit',
    },
    // Historique
    timeline: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      position: 'relative',
    },
    timelineItem: {
      display: 'flex',
      gap: 12,
      padding: '12px 0',
      borderLeft: `2px solid ${isDark ? '#334155' : '#E5E7EB'}`,
      marginLeft: 8,
      paddingLeft: 20,
      position: 'relative',
    },
    timelineDot: {
      position: 'absolute',
      left: -6,
      top: 16,
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: COHRM_COLORS.primaryLight,
      border: `2px solid ${isDark ? '#1e293b' : '#fff'}`,
    },
    timelineContent: {
      flex: 1,
    },
    timelineAction: {
      fontSize: 13,
      fontWeight: 500,
      color: isDark ? '#e2e8f0' : '#1f2937',
    },
    timelineDetail: {
      fontSize: 12,
      color: isDark ? '#94a3b8' : '#6B7280',
      marginTop: 2,
    },
    timelineMeta: {
      fontSize: 11,
      color: isDark ? '#64748b' : '#9CA3AF',
      marginTop: 4,
    },
    // Sidebar
    geoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 0',
      fontSize: 13,
      color: isDark ? '#cbd5e1' : '#4B5563',
    },
    actionBtn: (variant) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      width: '100%',
      padding: '10px 14px',
      borderRadius: 8,
      border: variant === 'danger'
        ? '1px solid #FCA5A5'
        : (isDark ? '1px solid #334155' : '1px solid #D1D5DB'),
      backgroundColor: variant === 'primary'
        ? COHRM_COLORS.primary
        : variant === 'danger'
          ? '#FEE2E2'
          : 'transparent',
      color: variant === 'primary'
        ? '#fff'
        : variant === 'danger'
          ? '#DC2626'
          : (isDark ? '#e2e8f0' : '#374151'),
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
      marginBottom: 6,
      fontFamily: 'inherit',
    }),
    mapContainer: {
      height: 180,
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 12,
    },
    // Validation
    validationItem: {
      padding: 14,
      borderRadius: 10,
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      marginBottom: 10,
    },
    validationHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    levelBadge: (color) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 10px',
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 600,
      backgroundColor: `${color}20`,
      color: color,
    }),
  };

  // Loading
  if (loadingRumor) {
    return <LoadingSpinner isDark={isDark} size="lg" />;
  }

  if (!rumor) {
    return (
      <div style={s.page}>
        <button style={s.backBtn} onClick={() => setActivePage('rumors')}>
          <ArrowLeft size={16} /> Retour aux rumeurs
        </button>
        <EmptyState variant="error" message="Rumeur non trouvée" isDark={isDark} />
      </div>
    );
  }

  const symptoms = getSymptoms();
  const species = getSpecies();
  const hasCoords = rumor.latitude && rumor.longitude;

  // Rendu de l'onglet actif
  const renderTab = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div style={s.cardBody}>
            {/* Description */}
            <div style={s.description}>
              {rumor.description || 'Aucune description'}
            </div>

            {/* Grille infos */}
            <div style={s.infoGrid}>
              <div style={s.infoItem}>
                <span style={s.infoLabel}>Source</span>
                <SourceBadge source={rumor.source} />
              </div>
              <div style={s.infoItem}>
                <span style={s.infoLabel}>Date de création</span>
                <span style={s.infoValue}>{formatDateTime(rumor.created_at)}</span>
              </div>
              <div style={s.infoItem}>
                <span style={s.infoLabel}>Dernière mise à jour</span>
                <span style={s.infoValue}>{formatDateTime(rumor.updated_at)}</span>
              </div>
              <div style={s.infoItem}>
                <span style={s.infoLabel}>Espèce</span>
                <span style={s.infoValue}>{species || '—'}</span>
              </div>
              <div style={s.infoItem}>
                <span style={s.infoLabel}>Nombre de cas</span>
                <span style={s.infoValue}>{formatNumber(rumor.affected_count)}</span>
              </div>
              <div style={s.infoItem}>
                <span style={s.infoLabel}>Nombre de décès</span>
                <span style={s.infoValue}>{formatNumber(rumor.dead_count)}</span>
              </div>
              <div style={s.infoItem}>
                <span style={s.infoLabel}>Catégorie</span>
                <span style={s.infoValue}>{formatCategory(rumor.category)?.label || '—'}</span>
              </div>
              {rumor.reporter_name && (
                <div style={s.infoItem}>
                  <span style={s.infoLabel}>Rapporteur</span>
                  <span style={s.infoValue}>
                    {rumor.reporter_name}
                    {rumor.reporter_phone && ` (${rumor.reporter_phone})`}
                  </span>
                </div>
              )}
            </div>

            {/* Symptômes */}
            {symptoms.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ ...s.infoLabel, marginBottom: 8 }}>Symptômes</div>
                <div>
                  {symptoms.map(({ code, label }) => (
                    <span key={code} style={s.chip}>{code} - {label}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'validation':
        return (
          <div style={s.cardBody}>
            {validations.length === 0 ? (
              <EmptyState
                variant="empty"
                message="Aucune validation enregistrée"
                isDark={isDark}
              />
            ) : (
              <div>
                {validations.map((v, idx) => {
                  const level = VALIDATION_LEVELS.find(l => l.level === v.validation_level);
                  return (
                    <div key={v.id || idx} style={s.validationItem}>
                      <div style={s.validationHeader}>
                        <span style={s.levelBadge(level?.color || '#95A5A6')}>
                          Niveau {v.validation_level} - {level?.name || 'Inconnu'}
                        </span>
                        <span style={{ fontSize: 11, color: isDark ? '#64748b' : '#9CA3AF' }}>
                          {formatDateTime(v.created_at)}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: isDark ? '#e2e8f0' : '#374151', fontWeight: 500, marginBottom: 4 }}>
                        {v.action_type === 'validate' ? 'Validée' : v.action_type === 'reject' ? 'Rejetée' : v.action_type}
                        {v.user_name && ` par ${v.user_name}`}
                      </div>
                      {v.notes && (
                        <div style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6B7280', whiteSpace: 'pre-wrap' }}>
                          {v.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'risk':
        return (
          <div style={s.cardBody}>
            <div style={{ marginBottom: 16 }}>
              <div style={s.infoLabel}>Niveau de risque actuel</div>
              <div style={{ marginTop: 8 }}>
                <RiskBadge riskLevel={rumor.risk_level} size="lg" />
              </div>
            </div>
            {rumor.risk_description && (
              <div style={{ marginBottom: 16 }}>
                <div style={s.infoLabel}>Description du risque</div>
                <div style={{ ...s.description, marginTop: 6, marginBottom: 0 }}>
                  {rumor.risk_description}
                </div>
              </div>
            )}
            {!rumor.risk_level || rumor.risk_level === 'unknown' ? (
              <EmptyState
                variant="empty"
                message="Aucune évaluation de risque effectuée"
                isDark={isDark}
              />
            ) : null}
          </div>
        );

      case 'notes':
        return (
          <div style={s.cardBody}>
            {/* Liste des notes */}
            <div style={s.notesList}>
              {(!rumor.notes || rumor.notes.length === 0) ? (
                <EmptyState
                  variant="empty"
                  message="Aucune note pour cette rumeur"
                  isDark={isDark}
                />
              ) : (
                rumor.notes.map((note) => (
                  <div key={note.id} style={s.noteItem(note.is_private)}>
                    <div style={s.noteHeader}>
                      <div style={s.noteAuthor}>
                        <div style={s.avatar}>
                          {(note.user_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#e2e8f0' : '#1f2937' }}>
                            {note.user_name || 'Utilisateur'}
                          </div>
                          <div style={{ fontSize: 11, color: isDark ? '#64748b' : '#9CA3AF' }}>
                            {formatRelativeDate(note.created_at)}
                          </div>
                        </div>
                      </div>
                      {note.is_private ? (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 11, color: isDark ? '#64748b' : '#9CA3AF',
                        }}>
                          <Lock size={12} /> Privée
                        </span>
                      ) : (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontSize: 11, color: '#3498DB',
                        }}>
                          <Globe size={12} /> Publique
                        </span>
                      )}
                    </div>
                    <div style={s.noteText}>{note.content}</div>
                  </div>
                ))
              )}
            </div>

            {/* Formulaire d'ajout */}
            <div style={s.noteForm}>
              <textarea
                style={s.textarea}
                placeholder="Ajouter une note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <div style={s.noteActions}>
                <label style={s.togglePrivate}>
                  <input
                    type="checkbox"
                    checked={notePrivate}
                    onChange={(e) => setNotePrivate(e.target.checked)}
                    style={{ accentColor: COHRM_COLORS.primary }}
                  />
                  {notePrivate ? <Lock size={13} /> : <Globe size={13} />}
                  {notePrivate ? 'Note privée' : 'Note publique'}
                </label>
                <button
                  style={s.sendBtn}
                  onClick={handleAddNote}
                  disabled={!noteContent.trim() || noteLoading}
                >
                  {noteLoading ? '...' : <><Send size={14} /> Envoyer</>}
                </button>
              </div>
            </div>
          </div>
        );

      case 'feedback':
        return (
          <FeedbackPanel
            rumorId={selectedRumorId}
            rumor={rumor}
            isDark={isDark}
            user={user}
          />
        );

      case 'history':
        return (
          <div style={s.cardBody}>
            {(!rumor.history || rumor.history.length === 0) ? (
              <EmptyState
                variant="empty"
                message="Aucun historique"
                isDark={isDark}
              />
            ) : (
              <div style={s.timeline}>
                {[...rumor.history].reverse().map((entry, idx) => (
                  <div key={entry.id || idx} style={s.timelineItem}>
                    <div style={s.timelineDot} />
                    <div style={s.timelineContent}>
                      <div style={s.timelineAction}>
                        {entry.action === 'created' ? 'Rumeur créée' :
                         entry.action === 'status_change' ? 'Changement de statut' :
                         entry.action === 'updated' ? 'Mise à jour' :
                         entry.action}
                      </div>
                      {entry.details && (
                        <div style={s.timelineDetail}>{entry.details}</div>
                      )}
                      <div style={s.timelineMeta}>
                        {entry.user_name || 'Système'} • {formatRelativeDate(entry.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={s.page}>
      {/* Retour */}
      <button style={s.backBtn} onClick={() => setActivePage('rumors')}>
        <ArrowLeft size={16} /> Retour aux rumeurs
      </button>

      <div style={s.layout}>
        {/* ===== Colonne principale (70%) ===== */}
        <div style={s.main}>
          <div style={s.card}>
            {/* En-tête */}
            <div style={s.cardHeader}>
              <div style={s.titleRow}>
                <div>
                  {rumor.code && (
                    <div style={{
                      fontSize: 12, fontWeight: 600, color: COHRM_COLORS.primaryLight,
                      marginBottom: 6, letterSpacing: '0.3px',
                    }}>
                      {rumor.code}
                    </div>
                  )}
                  <h1 style={s.rumorTitle}>{rumor.title}</h1>
                </div>
              </div>

              {/* Badges */}
              <div style={s.badges}>
                <StatusBadge status={rumor.status} size="md" />
                <PriorityBadge priority={rumor.priority} size="md" />
                <RiskBadge riskLevel={rumor.risk_level} size="md" />
                <SourceBadge source={rumor.source} size="md" />
              </div>

              {/* Onglets */}
              <div style={s.tabs}>
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    style={s.tab(activeTab === id)}
                    onClick={() => setActiveTab(id)}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenu onglet */}
            {renderTab()}
          </div>
        </div>

        {/* ===== Sidebar (30%) ===== */}
        <div style={s.sidebar}>
          {/* Mini carte */}
          {hasCoords && (
            <div style={s.sideCard}>
              <div style={s.sideCardTitle}>Localisation</div>
              <div style={s.mapContainer}>
                <MapContainer
                  center={[rumor.latitude, rumor.longitude]}
                  zoom={10}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                  dragging={false}
                  zoomControl={false}
                >
                  <TileLayer
                    url={isDark
                      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    }
                  />
                  <Marker
                    position={[rumor.latitude, rumor.longitude]}
                    icon={detailMarkerIcon}
                  />
                </MapContainer>
              </div>
            </div>
          )}

          {/* Infos géographiques */}
          <div style={s.sideCard}>
            <div style={s.sideCardTitle}>Géographie</div>
            <div style={s.sideCardBody}>
              {rumor.region && (
                <div style={s.geoItem}>
                  <MapPin size={14} color={COHRM_COLORS.primaryLight} />
                  Région: {rumor.region}
                </div>
              )}
              {rumor.department && (
                <div style={s.geoItem}>
                  <ChevronRight size={14} color={isDark ? '#64748b' : '#9CA3AF'} />
                  Département: {rumor.department}
                </div>
              )}
              {rumor.district && (
                <div style={s.geoItem}>
                  <ChevronRight size={14} color={isDark ? '#64748b' : '#9CA3AF'} />
                  District: {rumor.district}
                </div>
              )}
              {rumor.location && (
                <div style={s.geoItem}>
                  <ChevronRight size={14} color={isDark ? '#64748b' : '#9CA3AF'} />
                  Localité: {rumor.location}
                </div>
              )}
              {hasCoords && (
                <div style={{
                  ...s.geoItem,
                  fontSize: 11,
                  color: isDark ? '#64748b' : '#9CA3AF',
                  marginTop: 4,
                }}>
                  GPS: {rumor.latitude?.toFixed(4)}, {rumor.longitude?.toFixed(4)}
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div style={s.sideCard}>
            <div style={s.sideCardTitle}>Actions</div>
            <div style={s.sideCardBody}>
              {canEdit('rumors') && (
                <button
                  style={s.actionBtn('primary')}
                  onClick={() => navigateToRumorEdit(selectedRumorId)}
                >
                  <Edit size={14} /> Modifier
                </button>
              )}
              {canEdit('rumors') && (
                <button
                  style={s.actionBtn()}
                  onClick={() => setActiveTab('validation')}
                >
                  <CheckCircle size={14} /> Valider
                </button>
              )}
              {canDelete('rumors') && (
                <button
                  style={s.actionBtn('danger')}
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 size={14} /> Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modale suppression */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer la rumeur"
        message={`Êtes-vous sûr de vouloir supprimer "${truncateText(rumor.title, 40)}" ? Cette action est irréversible et supprimera toutes les notes et l'historique associés.`}
        confirmLabel="Supprimer"
        variant="danger"
        isDark={isDark}
        loading={deleteLoading}
      />
    </div>
  );
};

export default RumorDetail;
