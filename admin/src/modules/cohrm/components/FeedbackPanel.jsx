/**
 * FeedbackPanel - Panneau de rétro-information COHRM
 *
 * Permet d'envoyer des feedbacks (rétro-informations) aux rapporteurs de rumeurs
 * et aux communautés, et affiche l'historique chronologique des feedbacks envoyés.
 *
 * Deux sections :
 *   1. Formulaire d'envoi de feedback (type, titre, message, canal, destinataire)
 *   2. Timeline chronologique des feedbacks précédents
 *
 * Props :
 *   - rumorId (number|string) : ID de la rumeur
 *   - rumor (object) : Données de la rumeur (reporter_name, reporter_phone, reporter_email, code)
 *   - isDark (boolean) : Mode sombre
 *   - user (object) : Utilisateur connecté
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Send, Mail, MessageCircle, Monitor, User, Users,
  Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp,
  Bold, Italic, Link, Eye, EyeOff, Loader, Inbox,
  RefreshCw,
} from 'lucide-react';
import { COHRM_COLORS, FEEDBACK_TYPES } from '../utils/constants';
import { formatDateTime, formatRelativeDate } from '../utils/formatters';
import { sendFeedback, getFeedbacks } from '../services/cohrmApi';
import { toast } from 'react-toastify';

// ============================================
// CONSTANTES LOCALES
// ============================================

const CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sms', label: 'SMS', icon: MessageCircle },
  { value: 'system', label: 'Systeme', icon: Monitor },
];

const STATUS_MAP = {
  sent: { label: 'Envoy\u00e9', color: '#27AE60', icon: CheckCircle },
  delivered: { label: 'Livr\u00e9', color: '#27AE60', icon: CheckCircle },
  pending: { label: 'En attente', color: '#F39C12', icon: Clock },
  queued: { label: 'En file', color: '#F39C12', icon: Clock },
  failed: { label: '\u00c9chou\u00e9', color: '#E74C3C', icon: XCircle },
  error: { label: 'Erreur', color: '#E74C3C', icon: XCircle },
};

const MESSAGE_TRUNCATE_LENGTH = 180;

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const FeedbackPanel = ({ rumorId, rumor = {}, isDark = false, user = {} }) => {
  // --- Form state ---
  const [feedbackType, setFeedbackType] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [channels, setChannels] = useState({ email: false, sms: false, system: true });
  const [recipientType, setRecipientType] = useState('reporter');
  const [submitting, setSubmitting] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // --- Timeline state ---
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});
  const [hoveredTooltip, setHoveredTooltip] = useState(null);

  const textareaRef = useRef(null);
  const tooltipTimeoutRef = useRef(null);

  // --- Load feedbacks on mount ---
  const loadFeedbacks = useCallback(async () => {
    setLoadingFeedbacks(true);
    try {
      const response = await getFeedbacks(rumorId);
      const data = response?.data || response || [];
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading feedbacks:', err);
      toast.error('Impossible de charger les r\u00e9tro-informations');
    } finally {
      setLoadingFeedbacks(false);
    }
  }, [rumorId]);

  useEffect(() => {
    if (rumorId) {
      loadFeedbacks();
    }
  }, [rumorId, loadFeedbacks]);

  // --- Formatting helpers ---
  const getFeedbackTypeInfo = (type) => {
    return FEEDBACK_TYPES.find(f => f.value === type) || { label: type || 'Inconnu', color: '#95A5A6' };
  };

  const getStatusInfo = (status) => {
    return STATUS_MAP[status] || STATUS_MAP.pending;
  };

  const getSelectedChannels = () => {
    return Object.entries(channels).filter(([, v]) => v).map(([k]) => k);
  };

  const getRecipientDisplay = () => {
    if (recipientType === 'reporter') {
      return rumor.reporter_name || 'Rapporteur original';
    }
    return 'Communaut\u00e9';
  };

  const getRecipientEmail = () => {
    if (recipientType === 'reporter') {
      return rumor.reporter_email || '';
    }
    return 'communaute@cohrm.cm';
  };

  const getRecipientPhone = () => {
    if (recipientType === 'reporter') {
      return rumor.reporter_phone || '';
    }
    return '';
  };

  const getSubjectLine = () => {
    const typeInfo = getFeedbackTypeInfo(feedbackType);
    const code = rumor.code || 'N/A';
    return `R\u00e9tro-information: ${typeInfo.label} - Ref ${code}`;
  };

  // --- Textarea formatting helpers ---
  const insertFormatting = (prefix, suffix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    const replacement = `${prefix}${selectedText || 'texte'}${suffix}`;

    const newMessage = message.substring(0, start) + replacement + message.substring(end);
    setMessage(newMessage);

    // Set cursor position after update
    setTimeout(() => {
      textarea.focus();
      const cursorPos = selectedText
        ? start + replacement.length
        : start + prefix.length;
      textarea.setSelectionRange(
        selectedText ? start + replacement.length : start + prefix.length,
        selectedText ? start + replacement.length : start + prefix.length + 5
      );
    }, 0);
  };

  const handleBold = () => insertFormatting('**', '**');
  const handleItalic = () => insertFormatting('*', '*');
  const handleLink = () => insertFormatting('[', '](url)');

  // --- Channel toggle ---
  const toggleChannel = (channel) => {
    setChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
  };

  // --- Toggle message expansion in timeline ---
  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- Tooltip hover for error messages ---
  const handleTooltipEnter = (id) => {
    clearTimeout(tooltipTimeoutRef.current);
    setHoveredTooltip(id);
  };

  const handleTooltipLeave = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setHoveredTooltip(null);
    }, 200);
  };

  // --- Submit feedback ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!feedbackType) {
      toast.warning('Veuillez s\u00e9lectionner un type de feedback');
      return;
    }
    if (!message.trim()) {
      toast.warning('Veuillez saisir un message');
      return;
    }
    const selectedChannels = getSelectedChannels();
    if (selectedChannels.length === 0) {
      toast.warning('Veuillez s\u00e9lectionner au moins un canal d\'envoi');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        recipient_type: recipientType,
        recipient_phone: getRecipientPhone(),
        recipient_email: getRecipientEmail(),
        feedback_type: feedbackType,
        message: title ? `[${title}]\n\n${message}` : message,
        channel: selectedChannels.join(','),
        actor_id: user?.actor_id || user?.id || null,
      };

      await sendFeedback(rumorId, payload);
      toast.success('R\u00e9tro-information envoy\u00e9e avec succ\u00e8s');

      // Reset form
      setFeedbackType('');
      setTitle('');
      setMessage('');
      setChannels({ email: false, sms: false, system: true });
      setRecipientType('reporter');
      setShowEmailPreview(false);

      // Reload timeline
      loadFeedbacks();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'envoi de la r\u00e9tro-information');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render formatted message preview (basic markdown) ---
  const renderFormattedMessage = (text) => {
    if (!text) return null;
    // Very basic markdown: bold, italic
    let formatted = text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: ' + COHRM_COLORS.primaryLight + '; text-decoration: underline;">$1</a>')
      .replace(/\n/g, '<br/>');
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // ============================================
  // STYLES
  // ============================================

  const s = {
    container: { padding: 0 },

    // --- Cards ---
    card: {
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : '#1F2937',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    cardTitleIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: isDark ? 'rgba(41, 128, 185, 0.15)' : '#EBF5FB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // --- Form elements ---
    label: {
      display: 'block',
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      marginBottom: 6,
    },
    input: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: 10,
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #D1D5DB',
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#1F2937',
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s',
    },
    textarea: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: '0 0 10px 10px',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #D1D5DB',
      borderTop: 'none',
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#1F2937',
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
      minHeight: 120,
      resize: 'vertical',
      fontFamily: 'inherit',
      lineHeight: 1.6,
    },
    formGroup: {
      marginBottom: 18,
    },
    select: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: 10,
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #D1D5DB',
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#1F2937',
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${isDark ? '%2394a3b8' : '%236B7280'}' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 14px center',
      paddingRight: 36,
    },

    // --- Formatting toolbar ---
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      padding: '6px 10px',
      borderRadius: '10px 10px 0 0',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #D1D5DB',
      borderBottom: 'none',
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#F9FAFB',
    },
    toolbarBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 6,
      border: 'none',
      backgroundColor: 'transparent',
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      cursor: 'pointer',
      transition: 'all 0.15s',
    },
    toolbarBtnHover: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
    },
    toolbarDivider: {
      width: 1,
      height: 20,
      backgroundColor: isDark ? COHRM_COLORS.darkBorder : '#D1D5DB',
      margin: '0 6px',
    },

    // --- Channel checkboxes ---
    channelGroup: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
    },
    channelOption: (checked) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 16px',
      borderRadius: 10,
      border: checked
        ? `2px solid ${COHRM_COLORS.primaryLight}`
        : isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #D1D5DB',
      backgroundColor: checked
        ? (isDark ? 'rgba(41, 128, 185, 0.12)' : '#EBF5FB')
        : (isDark ? COHRM_COLORS.darkBg : '#fff'),
      cursor: 'pointer',
      transition: 'all 0.2s',
      userSelect: 'none',
      flex: '1 1 120px',
      minWidth: 120,
    }),
    channelLabel: (checked) => ({
      fontSize: 13,
      fontWeight: checked ? 600 : 500,
      color: checked
        ? (isDark ? '#93c5fd' : COHRM_COLORS.primaryLight)
        : (isDark ? COHRM_COLORS.darkText : '#374151'),
    }),
    channelCheckbox: (checked) => ({
      width: 18,
      height: 18,
      borderRadius: 4,
      border: checked
        ? `2px solid ${COHRM_COLORS.primaryLight}`
        : isDark ? `2px solid ${COHRM_COLORS.darkBorder}` : '2px solid #D1D5DB',
      backgroundColor: checked ? COHRM_COLORS.primaryLight : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'all 0.15s',
    }),

    // --- Recipient radio ---
    radioGroup: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
    },
    radioOption: (selected) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 16px',
      borderRadius: 10,
      border: selected
        ? `2px solid ${COHRM_COLORS.primaryLight}`
        : isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #D1D5DB',
      backgroundColor: selected
        ? (isDark ? 'rgba(41, 128, 185, 0.12)' : '#EBF5FB')
        : (isDark ? COHRM_COLORS.darkBg : '#fff'),
      cursor: 'pointer',
      transition: 'all 0.2s',
      userSelect: 'none',
      flex: '1 1 200px',
    }),
    radioCircle: (selected) => ({
      width: 18,
      height: 18,
      borderRadius: '50%',
      border: selected
        ? `5px solid ${COHRM_COLORS.primaryLight}`
        : isDark ? `2px solid ${COHRM_COLORS.darkBorder}` : '2px solid #D1D5DB',
      backgroundColor: selected ? '#fff' : 'transparent',
      flexShrink: 0,
      transition: 'all 0.15s',
      boxSizing: 'border-box',
    }),
    radioLabel: (selected) => ({
      fontSize: 14,
      fontWeight: selected ? 600 : 500,
      color: selected
        ? (isDark ? '#93c5fd' : COHRM_COLORS.primary)
        : (isDark ? COHRM_COLORS.darkText : '#374151'),
    }),
    radioSub: {
      fontSize: 12,
      color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF',
      marginTop: 2,
    },

    // --- Email preview ---
    emailPreview: {
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#F9FAFB',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 12,
    },
    emailPreviewHeader: {
      padding: '14px 18px',
      backgroundColor: isDark ? '#1a2332' : '#fff',
      borderBottom: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
    },
    emailPreviewRow: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 6,
    },
    emailPreviewLabel: {
      fontSize: 12,
      fontWeight: 600,
      color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF',
      minWidth: 50,
      flexShrink: 0,
    },
    emailPreviewValue: {
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      wordBreak: 'break-word',
    },
    emailPreviewSubject: {
      fontSize: 14,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : '#1F2937',
    },
    emailPreviewBody: {
      padding: '18px',
      fontSize: 13,
      lineHeight: 1.7,
      color: isDark ? COHRM_COLORS.darkText : '#374151',
    },
    emailPreviewFooter: {
      padding: '10px 18px',
      borderTop: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      fontSize: 11,
      color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF',
      textAlign: 'center',
    },
    previewToggle: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: isDark ? 'rgba(41, 128, 185, 0.12)' : '#EBF5FB',
      color: isDark ? '#93c5fd' : COHRM_COLORS.primaryLight,
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: 10,
      transition: 'all 0.15s',
    },

    // --- Submit button ---
    submitBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      width: '100%',
      padding: '12px 24px',
      borderRadius: 10,
      border: 'none',
      backgroundColor: submitting ? (isDark ? '#334155' : '#D1D5DB') : COHRM_COLORS.primary,
      color: '#fff',
      fontSize: 15,
      fontWeight: 600,
      cursor: submitting ? 'not-allowed' : 'pointer',
      opacity: submitting ? 0.7 : 1,
      transition: 'all 0.2s',
    },

    // --- Timeline ---
    timeline: {
      position: 'relative',
      paddingLeft: 0,
    },
    timelineItem: {
      display: 'flex',
      gap: 16,
      position: 'relative',
      paddingBottom: 24,
    },
    timelineDotColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: 24,
      flexShrink: 0,
      paddingTop: 2,
    },
    timelineDot: (color) => ({
      width: 14,
      height: 14,
      borderRadius: '50%',
      backgroundColor: color,
      border: `3px solid ${isDark ? COHRM_COLORS.darkCard : '#fff'}`,
      boxShadow: `0 0 0 2px ${color}40`,
      flexShrink: 0,
      zIndex: 1,
    }),
    timelineLine: (isLast) => ({
      flex: 1,
      width: 2,
      backgroundColor: isLast ? 'transparent' : (isDark ? COHRM_COLORS.darkBorder : '#E5E7EB'),
      marginTop: 4,
    }),
    timelineContent: {
      flex: 1,
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#F9FAFB',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      borderRadius: 10,
      padding: '14px 16px',
    },
    timelineHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 8,
    },
    timelineTypeBadge: (color) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 10px',
      borderRadius: 20,
      backgroundColor: `${color}18`,
      color: color,
      fontSize: 12,
      fontWeight: 600,
    }),
    timelineDate: {
      fontSize: 12,
      color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF',
    },
    timelineSender: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    timelineSenderAvatar: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      backgroundColor: isDark ? '#334155' : '#E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timelineSenderName: {
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? COHRM_COLORS.darkText : '#374151',
    },
    timelineSenderType: {
      fontSize: 11,
      color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF',
      fontWeight: 500,
    },
    timelineMessage: {
      fontSize: 13,
      lineHeight: 1.6,
      color: isDark ? '#cbd5e1' : '#4B5563',
      marginBottom: 10,
      wordBreak: 'break-word',
    },
    timelineToggle: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      border: 'none',
      background: 'none',
      padding: 0,
      fontSize: 12,
      fontWeight: 600,
      color: COHRM_COLORS.primaryLight,
      cursor: 'pointer',
    },
    timelineFooter: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
    },
    channelBadges: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
    },
    channelBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 6,
      backgroundColor: isDark ? '#1e293b' : '#F3F4F6',
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      fontSize: 11,
      fontWeight: 500,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
    },
    statusBadge: (color) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      color: color,
      position: 'relative',
      cursor: 'default',
    }),
    tooltip: {
      position: 'absolute',
      bottom: '100%',
      right: 0,
      marginBottom: 6,
      padding: '8px 12px',
      borderRadius: 8,
      backgroundColor: isDark ? '#374151' : '#1F2937',
      color: '#fff',
      fontSize: 12,
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
      maxWidth: 280,
      zIndex: 100,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      pointerEvents: 'none',
    },

    // --- Empty state ---
    emptyState: {
      textAlign: 'center',
      padding: '40px 20px',
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      backgroundColor: isDark ? 'rgba(148, 163, 184, 0.1)' : '#F3F4F6',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: 600,
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      marginBottom: 6,
    },
    emptyDescription: {
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF',
      lineHeight: 1.5,
    },

    // --- Loader ---
    loader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF',
    },
    loaderSpin: {
      animation: 'cohrmSpin 1s linear infinite',
    },

    // --- Refresh button ---
    refreshBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 8,
      border: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #D1D5DB',
      backgroundColor: 'transparent',
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.15s',
    },

    // --- Feedback type select color dot ---
    typeDot: (color) => ({
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: color,
      marginRight: 8,
      verticalAlign: 'middle',
    }),
  };

  // ============================================
  // RENDER : FEEDBACK FORM
  // ============================================

  const renderForm = () => (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <div style={s.cardTitle}>
          <div style={s.cardTitleIcon}>
            <Send size={18} color={COHRM_COLORS.primaryLight} />
          </div>
          Envoyer une r{'\u00e9'}tro-information
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Type de feedback */}
        <div style={s.formGroup}>
          <label style={s.label}>Type de feedback *</label>
          <select
            style={s.select}
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value)}
          >
            <option value="">-- S{'\u00e9'}lectionner le type --</option>
            {FEEDBACK_TYPES.map(ft => (
              <option key={ft.value} value={ft.value}>{ft.label}</option>
            ))}
          </select>
          {feedbackType && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginTop: 6, fontSize: 12, color: getFeedbackTypeInfo(feedbackType).color,
              fontWeight: 600,
            }}>
              <span style={s.typeDot(getFeedbackTypeInfo(feedbackType).color)} />
              {getFeedbackTypeInfo(feedbackType).label}
            </div>
          )}
        </div>

        {/* Titre */}
        <div style={s.formGroup}>
          <label style={s.label}>Titre du feedback</label>
          <input
            type="text"
            style={s.input}
            placeholder="Ex: Confirmation de prise en charge"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
          />
        </div>

        {/* Message with toolbar */}
        <div style={s.formGroup}>
          <label style={s.label}>Message *</label>
          <div style={s.toolbar}>
            <button
              type="button"
              style={s.toolbarBtn}
              onClick={handleBold}
              title="Gras (**texte**)"
              onMouseEnter={(e) => Object.assign(e.target.style, s.toolbarBtnHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent' })}
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              style={s.toolbarBtn}
              onClick={handleItalic}
              title="Italique (*texte*)"
              onMouseEnter={(e) => Object.assign(e.target.style, s.toolbarBtnHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent' })}
            >
              <Italic size={16} />
            </button>
            <div style={s.toolbarDivider} />
            <button
              type="button"
              style={s.toolbarBtn}
              onClick={handleLink}
              title="Lien [texte](url)"
              onMouseEnter={(e) => Object.assign(e.target.style, s.toolbarBtnHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: 'transparent' })}
            >
              <Link size={16} />
            </button>
          </div>
          <textarea
            ref={textareaRef}
            style={s.textarea}
            placeholder="R{'\u00e9'}digez votre message de r{'\u00e9'}tro-information..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
          />
          <div style={{
            display: 'flex', justifyContent: 'flex-end',
            marginTop: 4, fontSize: 11,
            color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF',
          }}>
            {message.length} caract{'\u00e8'}res
          </div>
        </div>

        {/* Canal d'envoi */}
        <div style={s.formGroup}>
          <label style={s.label}>Canal d'envoi *</label>
          <div style={s.channelGroup}>
            {CHANNEL_OPTIONS.map(ch => {
              const Icon = ch.icon;
              const checked = channels[ch.value];
              return (
                <div
                  key={ch.value}
                  style={s.channelOption(checked)}
                  onClick={() => toggleChannel(ch.value)}
                  role="checkbox"
                  aria-checked={checked}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleChannel(ch.value); } }}
                >
                  <div style={s.channelCheckbox(checked)}>
                    {checked && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <Icon size={16} color={checked ? COHRM_COLORS.primaryLight : (isDark ? COHRM_COLORS.darkMuted : '#6B7280')} />
                  <span style={s.channelLabel(checked)}>{ch.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Destinataire */}
        <div style={s.formGroup}>
          <label style={s.label}>Destinataire</label>
          <div style={s.radioGroup}>
            {/* Rapporteur original */}
            <div
              style={s.radioOption(recipientType === 'reporter')}
              onClick={() => setRecipientType('reporter')}
              role="radio"
              aria-checked={recipientType === 'reporter'}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setRecipientType('reporter'); } }}
            >
              <div style={s.radioCircle(recipientType === 'reporter')} />
              <User size={18} color={recipientType === 'reporter' ? COHRM_COLORS.primaryLight : (isDark ? COHRM_COLORS.darkMuted : '#9CA3AF')} />
              <div>
                <div style={s.radioLabel(recipientType === 'reporter')}>Rapporteur original</div>
                <div style={s.radioSub}>
                  {rumor.reporter_name || 'Anonyme'}
                  {rumor.reporter_phone ? ` \u2014 ${rumor.reporter_phone}` : ''}
                </div>
              </div>
            </div>

            {/* Communaute */}
            <div
              style={s.radioOption(recipientType === 'community')}
              onClick={() => setRecipientType('community')}
              role="radio"
              aria-checked={recipientType === 'community'}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setRecipientType('community'); } }}
            >
              <div style={s.radioCircle(recipientType === 'community')} />
              <Users size={18} color={recipientType === 'community' ? COHRM_COLORS.primaryLight : (isDark ? COHRM_COLORS.darkMuted : '#9CA3AF')} />
              <div>
                <div style={s.radioLabel(recipientType === 'community')}>Communaut{'\u00e9'}</div>
                <div style={s.radioSub}>Diffusion communautaire</div>
              </div>
            </div>
          </div>
        </div>

        {/* Email preview */}
        {channels.email && (
          <div style={s.formGroup}>
            <button
              type="button"
              style={s.previewToggle}
              onClick={() => setShowEmailPreview(!showEmailPreview)}
            >
              {showEmailPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showEmailPreview ? 'Masquer l\'aper\u00e7u' : 'Aper\u00e7u de l\'email'}
            </button>

            {showEmailPreview && (
              <div style={s.emailPreview}>
                <div style={s.emailPreviewHeader}>
                  <div style={s.emailPreviewRow}>
                    <span style={s.emailPreviewLabel}>De :</span>
                    <span style={s.emailPreviewValue}>COHRM - One Health Cameroon</span>
                  </div>
                  <div style={s.emailPreviewRow}>
                    <span style={s.emailPreviewLabel}>{'\u00c0'} :</span>
                    <span style={s.emailPreviewValue}>
                      {recipientType === 'reporter'
                        ? (rumor.reporter_email || 'Aucun email disponible')
                        : 'communaut\u00e9'}
                    </span>
                  </div>
                  <div style={{ ...s.emailPreviewRow, marginBottom: 0 }}>
                    <span style={s.emailPreviewLabel}>Objet :</span>
                    <span style={s.emailPreviewSubject}>{getSubjectLine()}</span>
                  </div>
                </div>
                <div style={s.emailPreviewBody}>
                  {title && (
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: isDark ? COHRM_COLORS.darkText : '#1F2937' }}>
                      {title}
                    </div>
                  )}
                  {message
                    ? renderFormattedMessage(message)
                    : <span style={{ color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF', fontStyle: 'italic' }}>Votre message appara{'\u00ee'}tra ici...</span>
                  }
                </div>
                <div style={s.emailPreviewFooter}>
                  Ce message a {'\u00e9'}t{'\u00e9'} envoy{'\u00e9'} automatiquement par la plateforme COHRM - Cameroon One Health Rumor Management
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          style={s.submitBtn}
          disabled={submitting}
          onMouseEnter={(e) => {
            if (!submitting) e.target.style.backgroundColor = COHRM_COLORS.primaryDark;
          }}
          onMouseLeave={(e) => {
            if (!submitting) e.target.style.backgroundColor = COHRM_COLORS.primary;
          }}
        >
          {submitting ? (
            <>
              <Loader size={18} style={s.loaderSpin} />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send size={18} />
              Envoyer la r{'\u00e9'}tro-information
            </>
          )}
        </button>
      </form>
    </div>
  );

  // ============================================
  // RENDER : FEEDBACK TIMELINE
  // ============================================

  const renderChannelBadge = (channelStr) => {
    if (!channelStr) return null;
    const channelList = channelStr.split(',').map(c => c.trim()).filter(Boolean);
    const iconMap = { email: Mail, sms: MessageCircle, system: Monitor };
    const labelMap = { email: 'Email', sms: 'SMS', system: 'Syst\u00e8me' };

    return (
      <div style={s.channelBadges}>
        {channelList.map(ch => {
          const Icon = iconMap[ch] || Monitor;
          return (
            <span key={ch} style={s.channelBadge}>
              <Icon size={11} />
              {labelMap[ch] || ch}
            </span>
          );
        })}
      </div>
    );
  };

  const renderStatusBadge = (feedback) => {
    const info = getStatusInfo(feedback.status);
    const StatusIcon = info.icon;
    const hasError = feedback.status === 'failed' || feedback.status === 'error';

    return (
      <span
        style={{ ...s.statusBadge(info.color), cursor: hasError ? 'help' : 'default' }}
        onMouseEnter={() => hasError && handleTooltipEnter(feedback.id)}
        onMouseLeave={() => hasError && handleTooltipLeave()}
      >
        <StatusIcon size={13} />
        {info.label}
        {hasError && hoveredTooltip === feedback.id && feedback.error_message && (
          <div style={s.tooltip}>
            {feedback.error_message}
          </div>
        )}
      </span>
    );
  };

  const renderTimeline = () => {
    // Sort most recent first
    const sorted = [...feedbacks].sort((a, b) =>
      new Date(b.created_at || b.sent_at) - new Date(a.created_at || a.sent_at)
    );

    return (
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div style={s.cardTitle}>
            <div style={s.cardTitleIcon}>
              <Clock size={18} color={COHRM_COLORS.primaryLight} />
            </div>
            Historique des r{'\u00e9'}tro-informations
            {feedbacks.length > 0 && (
              <span style={{
                padding: '2px 10px',
                borderRadius: 20,
                backgroundColor: isDark ? 'rgba(41, 128, 185, 0.15)' : '#EBF5FB',
                color: COHRM_COLORS.primaryLight,
                fontSize: 12,
                fontWeight: 700,
              }}>
                {feedbacks.length}
              </span>
            )}
          </div>
          <button
            style={s.refreshBtn}
            onClick={loadFeedbacks}
            disabled={loadingFeedbacks}
            title="Actualiser"
          >
            <RefreshCw
              size={14}
              style={loadingFeedbacks ? s.loaderSpin : undefined}
            />
            Actualiser
          </button>
        </div>

        {loadingFeedbacks && feedbacks.length === 0 ? (
          <div style={s.loader}>
            <Loader size={24} style={s.loaderSpin} />
          </div>
        ) : feedbacks.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <Inbox size={28} color={isDark ? COHRM_COLORS.darkMuted : '#9CA3AF'} />
            </div>
            <div style={s.emptyTitle}>Aucune r{'\u00e9'}tro-information</div>
            <div style={s.emptyDescription}>
              Aucun feedback n'a encore {'\u00e9'}t{'\u00e9'} envoy{'\u00e9'} pour cette rumeur.<br />
              Utilisez le formulaire ci-dessus pour envoyer la premi{'\u00e8'}re r{'\u00e9'}tro-information.
            </div>
          </div>
        ) : (
          <div style={s.timeline}>
            {sorted.map((fb, idx) => {
              const typeInfo = getFeedbackTypeInfo(fb.feedback_type);
              const isLast = idx === sorted.length - 1;
              const isExpanded = expandedItems[fb.id];
              const fbMessage = fb.message || '';
              const needsTruncate = fbMessage.length > MESSAGE_TRUNCATE_LENGTH;
              const displayMessage = needsTruncate && !isExpanded
                ? fbMessage.substring(0, MESSAGE_TRUNCATE_LENGTH) + '...'
                : fbMessage;

              return (
                <div key={fb.id || idx} style={s.timelineItem}>
                  {/* Dot column */}
                  <div style={s.timelineDotColumn}>
                    <div style={s.timelineDot(typeInfo.color)} />
                    <div style={s.timelineLine(isLast)} />
                  </div>

                  {/* Content */}
                  <div style={s.timelineContent}>
                    {/* Header: type badge + date */}
                    <div style={s.timelineHeader}>
                      <span style={s.timelineTypeBadge(typeInfo.color)}>
                        <span style={s.typeDot(typeInfo.color)} />
                        {typeInfo.label}
                      </span>
                      <span style={s.timelineDate}>
                        {formatDateTime(fb.created_at || fb.sent_at)}
                        {' \u2014 '}
                        {formatRelativeDate(fb.created_at || fb.sent_at)}
                      </span>
                    </div>

                    {/* Sender */}
                    {(fb.sender_name || fb.sender_actor_type) && (
                      <div style={s.timelineSender}>
                        <div style={s.timelineSenderAvatar}>
                          <User size={13} color={isDark ? COHRM_COLORS.darkMuted : '#6B7280'} />
                        </div>
                        <span style={s.timelineSenderName}>{fb.sender_name || 'Syst\u00e8me'}</span>
                        {fb.sender_actor_type && (
                          <span style={s.timelineSenderType}>{'\u2014'} {fb.sender_actor_type}</span>
                        )}
                      </div>
                    )}

                    {/* Message */}
                    <div style={s.timelineMessage}>
                      {renderFormattedMessage(displayMessage)}
                      {needsTruncate && (
                        <div style={{ marginTop: 4 }}>
                          <button
                            type="button"
                            style={s.timelineToggle}
                            onClick={() => toggleExpanded(fb.id)}
                          >
                            {isExpanded ? (
                              <>Voir moins <ChevronUp size={14} /></>
                            ) : (
                              <>Voir plus <ChevronDown size={14} /></>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Footer: channels + status */}
                    <div style={s.timelineFooter}>
                      {renderChannelBadge(fb.channel)}
                      {renderStatusBadge(fb)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // RENDER PRINCIPAL
  // ============================================

  return (
    <>
      <style>{`
        @keyframes cohrmSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={s.container}>
        {renderForm()}
        {renderTimeline()}
      </div>
    </>
  );
};

export default FeedbackPanel;
