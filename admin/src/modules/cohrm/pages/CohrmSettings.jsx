/**
 * CohrmSettings - Page de paramètres du système COHRM
 * Accès réservé aux utilisateurs de niveau 5 (Supervision centrale)
 *
 * 5 sections en accordéon :
 *   1. Général (nom, description, langue, logo)
 *   2. Thèmes / Catégories (CRUD + réordonnement)
 *   3. Types d'acteurs (par niveau 1-5)
 *   4. SMS Gateway (config + test)
 *   5. Notifications (toggles + heures silencieuses)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings, ChevronDown, ChevronUp, Save, Plus, Trash2, Edit2, GripVertical,
  Globe, Palette, Users, MessageCircle, Bell, Server, Check, X, Loader,
  AlertTriangle, Send, Phone, Mail, RefreshCw
} from 'lucide-react';
import { getSettings, updateSettings, getThemes, createTheme, updateTheme, deleteTheme, reorderThemes, testSMSGateway, getActorTypes } from '../services/cohrmApi';
import { COHRM_COLORS, FEEDBACK_TYPES, TRANSMISSION_CHANNELS } from '../utils/constants';
import { ConfirmModal } from '../components/shared';
import { toast } from 'react-toastify';

// ============================================
// PREDEFINED THEME COLORS
// ============================================
const THEME_COLOR_OPTIONS = [
  '#E74C3C', '#E67E22', '#F39C12', '#27AE60', '#2ECC71',
  '#1ABC9C', '#3498DB', '#2980B9', '#9B59B6', '#8E44AD',
  '#34495E', '#2C3E50', '#95A5A6', '#7F8C8D', '#1B4F72',
  '#FF5722', '#FF9800', '#CDDC39', '#009688', '#607D8B',
];

// ============================================
// TOGGLE SWITCH COMPONENT
// ============================================
const ToggleSwitch = ({ checked, onChange, isDark, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: 'none',
        backgroundColor: checked ? COHRM_COLORS.primary : (isDark ? '#475569' : '#D1D5DB'),
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s ease',
        flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: '#fff',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const CohrmSettings = ({ isDark, user }) => {
  // ---- State: accordion ----
  const [openSection, setOpenSection] = useState('general');

  // ---- State: loading ----
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(null);

  // ---- State: settings (flat key-value) ----
  const [settings, setSettings] = useState({});
  const [originalSettings, setOriginalSettings] = useState({});

  // ---- State: themes ----
  const [themes, setThemes] = useState([]);
  const [groupedThemes, setGroupedThemes] = useState({});
  const [themeForm, setThemeForm] = useState(null); // null = hidden, object = editing/creating
  const [editingThemeId, setEditingThemeId] = useState(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // ---- State: actor types ----
  const [actorTypes, setActorTypes] = useState({ 1: [], 2: [], 3: [], 4: [], 5: [] });
  const [newActorInputs, setNewActorInputs] = useState({ 1: '', 2: '', 3: '', 4: '', 5: '' });

  // ---- State: SMS test ----
  const [smsTestPhone, setSmsTestPhone] = useState('');
  const [smsTestMessage, setSmsTestMessage] = useState('Test COHRM SMS Gateway');
  const [smsTestResult, setSmsTestResult] = useState(null);
  const [sendingTest, setSendingTest] = useState(false);

  // ---- State: confirm modal ----
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // ============================================
  // DATA LOADING
  // ============================================
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, themesRes, actorTypesRes] = await Promise.all([
        getSettings(),
        getThemes(),
        getActorTypes(),
      ]);

      if (settingsRes?.success && settingsRes.data) {
        setSettings(settingsRes.data);
        setOriginalSettings(settingsRes.data);
      }

      if (themesRes?.success && themesRes.data) {
        setThemes(themesRes.data.themes || []);
        setGroupedThemes(themesRes.data.grouped || {});
      }

      if (actorTypesRes?.success && actorTypesRes.data) {
        const types = { 1: [], 2: [], 3: [], 4: [], 5: [] };
        if (Array.isArray(actorTypesRes.data)) {
          actorTypesRes.data.forEach((t) => {
            if (types[t.level]) {
              types[t.level].push(t);
            }
          });
        } else if (typeof actorTypesRes.data === 'object') {
          Object.keys(actorTypesRes.data).forEach((lvl) => {
            types[lvl] = actorTypesRes.data[lvl] || [];
          });
        }
        setActorTypes(types);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des paramètres');
      console.error('Settings load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ============================================
  // SETTINGS HELPERS
  // ============================================
  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async (keys) => {
    const data = {};
    keys.forEach((k) => {
      if (settings[k] !== undefined) data[k] = settings[k];
    });

    const sectionName = keys[0] || 'settings';
    setSavingSection(sectionName);
    try {
      await updateSettings(data);
      setOriginalSettings((prev) => ({ ...prev, ...data }));
      toast.success('Paramètres enregistrés avec succès');
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
      console.error('Settings save error:', err);
    } finally {
      setSavingSection(null);
    }
  };

  // ============================================
  // THEME HELPERS
  // ============================================
  const emptyThemeForm = () => ({
    label_fr: '',
    label_en: '',
    category: '',
    newCategory: '',
    description: '',
    color: THEME_COLOR_OPTIONS[0],
    icon: 'AlertCircle',
  });

  const openThemeCreate = () => {
    setEditingThemeId(null);
    setThemeForm(emptyThemeForm());
  };

  const openThemeEdit = (theme) => {
    setEditingThemeId(theme.id);
    setThemeForm({
      label_fr: theme.label_fr || '',
      label_en: theme.label_en || '',
      category: theme.category || '',
      newCategory: '',
      description: theme.description || '',
      color: theme.color || THEME_COLOR_OPTIONS[0],
      icon: theme.icon || 'AlertCircle',
    });
  };

  const cancelThemeForm = () => {
    setEditingThemeId(null);
    setThemeForm(null);
  };

  const saveTheme = async () => {
    if (!themeForm) return;
    const { label_fr, label_en, newCategory, category, description, color, icon } = themeForm;
    if (!label_fr.trim()) {
      toast.warning('Le libellé français est requis');
      return;
    }

    const finalCategory = newCategory.trim() || category;
    if (!finalCategory) {
      toast.warning('La catégorie est requise');
      return;
    }

    const payload = { label_fr: label_fr.trim(), label_en: label_en.trim(), category: finalCategory, description, color, icon };

    setSavingSection('theme');
    try {
      if (editingThemeId) {
        await updateTheme(editingThemeId, payload);
        toast.success('Thème mis à jour');
      } else {
        await createTheme(payload);
        toast.success('Thème créé');
      }
      cancelThemeForm();
      // Reload themes
      const themesRes = await getThemes();
      if (themesRes?.success && themesRes.data) {
        setThemes(themesRes.data.themes || []);
        setGroupedThemes(themesRes.data.grouped || {});
      }
    } catch (err) {
      toast.error(editingThemeId ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
    } finally {
      setSavingSection(null);
    }
  };

  const confirmDeleteTheme = (theme) => {
    setConfirmModal({
      isOpen: true,
      title: 'Supprimer le thème',
      message: `Voulez-vous vraiment supprimer le thème "${theme.label_fr}" ? Cette action est irréversible.`,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await deleteTheme(theme.id);
          toast.success('Thème supprimé');
          const themesRes = await getThemes();
          if (themesRes?.success && themesRes.data) {
            setThemes(themesRes.data.themes || []);
            setGroupedThemes(themesRes.data.grouped || {});
          }
        } catch (err) {
          toast.error('Erreur lors de la suppression');
        }
      },
    });
  };

  const moveTheme = (index, direction) => {
    const updated = [...themes];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    setThemes(updated);
    setOrderChanged(true);
  };

  const saveThemeOrder = async () => {
    const order = themes.map((t, i) => ({ id: t.id, display_order: i + 1 }));
    setSavingOrder(true);
    try {
      await reorderThemes(order);
      setOrderChanged(false);
      toast.success('Ordre des thèmes enregistré');
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde de l\'ordre');
    } finally {
      setSavingOrder(false);
    }
  };

  // ============================================
  // ACTOR TYPES HELPERS
  // ============================================
  const addActorType = (level) => {
    const label = newActorInputs[level]?.trim();
    if (!label) return;
    const value = label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    setActorTypes((prev) => ({
      ...prev,
      [level]: [...(prev[level] || []), { value, label }],
    }));
    setNewActorInputs((prev) => ({ ...prev, [level]: '' }));
  };

  const removeActorType = (level, index) => {
    setActorTypes((prev) => ({
      ...prev,
      [level]: prev[level].filter((_, i) => i !== index),
    }));
  };

  const saveActorTypes = async () => {
    setSavingSection('actor_types');
    try {
      await updateSettings({ actor_types: JSON.stringify(actorTypes) });
      toast.success('Types d\'acteurs enregistrés');
    } catch (err) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSavingSection(null);
    }
  };

  // ============================================
  // SMS TEST
  // ============================================
  const handleTestSMS = async () => {
    if (!smsTestPhone.trim()) {
      toast.warning('Veuillez entrer un numéro de téléphone');
      return;
    }
    setSendingTest(true);
    setSmsTestResult(null);
    try {
      const res = await testSMSGateway({ phone: smsTestPhone.trim(), message: smsTestMessage.trim() });
      setSmsTestResult({ success: true, message: res?.message || 'SMS envoyé avec succès' });
    } catch (err) {
      setSmsTestResult({ success: false, message: err?.message || 'Échec de l\'envoi' });
    } finally {
      setSendingTest(false);
    }
  };

  // ============================================
  // ACCORDION TOGGLE
  // ============================================
  const toggleSection = (sectionId) => {
    setOpenSection((prev) => (prev === sectionId ? null : sectionId));
  };

  // ============================================
  // EXISTING CATEGORIES (for theme category dropdown)
  // ============================================
  const existingCategories = Object.keys(groupedThemes);

  // ============================================
  // SMS CODES (read-only list from constants)
  // ============================================
  const smsCodeSections = [
    { title: 'Symptômes', codes: ['FI', 'VO', 'DI', 'TO', 'ER', 'HE', 'PA', 'MO', 'AB', 'RE', 'NE', 'OE'] },
    { title: 'Espèces', codes: ['HUM', 'BOV', 'OVI', 'VOL', 'POR', 'SAU', 'CHI', 'AUT'] },
    { title: 'Événements', codes: ['MAL', 'MOR', 'EPI', 'ZOO', 'INT', 'ENV'] },
  ];

  // ============================================
  // STYLES
  // ============================================
  const s = {
    container: {
      padding: '24px',
      maxWidth: 900,
      margin: '0 auto',
    },
    pageHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      marginBottom: 28,
    },
    pageTitle: {
      fontSize: 24,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : COHRM_COLORS.dark,
      margin: 0,
    },
    pageSubtitle: {
      fontSize: 14,
      color: isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted,
      margin: 0,
      marginTop: 4,
    },
    // Accordion section wrapper
    section: (isOpen) => ({
      borderRadius: 12,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#E5E7EB'}`,
      borderLeft: isOpen ? `4px solid ${COHRM_COLORS.primary}` : `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#E5E7EB'}`,
      marginBottom: 12,
      overflow: 'hidden',
      transition: 'border-left 0.2s ease',
    }),
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '16px 20px',
      cursor: 'pointer',
      userSelect: 'none',
    },
    sectionIcon: (isOpen) => ({
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: isOpen
        ? (isDark ? 'rgba(41, 128, 185, 0.2)' : 'rgba(27, 79, 114, 0.08)')
        : (isDark ? 'rgba(148, 163, 184, 0.1)' : '#F3F4F6'),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }),
    sectionTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: isDark ? COHRM_COLORS.darkText : COHRM_COLORS.dark,
      flex: 1,
    },
    badge: {
      backgroundColor: isDark ? 'rgba(41, 128, 185, 0.2)' : 'rgba(27, 79, 114, 0.08)',
      color: COHRM_COLORS.primaryLight,
      fontSize: 12,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 10,
    },
    sectionBody: (isOpen) => ({
      maxHeight: isOpen ? 5000 : 0,
      overflow: 'hidden',
      transition: 'max-height 0.35s ease',
    }),
    sectionContent: {
      padding: '4px 20px 20px',
    },
    // Form elements
    formGroup: {
      marginBottom: 16,
    },
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
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#D1D5DB'}`,
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
      fontSize: 14,
      outline: 'none',
      transition: 'border-color 0.15s',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: 10,
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#D1D5DB'}`,
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
      fontSize: 14,
      outline: 'none',
      resize: 'vertical',
      minHeight: 80,
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    select: {
      width: '100%',
      padding: '10px 14px',
      borderRadius: 10,
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#D1D5DB'}`,
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
      fontSize: 14,
      outline: 'none',
      cursor: 'pointer',
      boxSizing: 'border-box',
    },
    // Buttons
    btnPrimary: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 16px',
      borderRadius: 10,
      border: 'none',
      backgroundColor: COHRM_COLORS.primary,
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'background-color 0.15s',
    },
    btnOutline: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 16px',
      borderRadius: 10,
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#D1D5DB'}`,
      backgroundColor: 'transparent',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
    },
    btnDanger: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: isDark ? 'rgba(231, 76, 60, 0.15)' : '#FEE2E2',
      color: COHRM_COLORS.danger,
      fontSize: 13,
      fontWeight: 600,
      cursor: 'pointer',
    },
    btnSmall: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '6px 10px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: isDark ? 'rgba(41, 128, 185, 0.15)' : 'rgba(27, 79, 114, 0.06)',
      color: COHRM_COLORS.primaryLight,
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
    },
    btnIcon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 8,
      border: 'none',
      backgroundColor: 'transparent',
      color: isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted,
      cursor: 'pointer',
      padding: 0,
    },
    // Divider
    divider: {
      borderTop: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#E5E7EB'}`,
      margin: '16px 0',
    },
    // Theme items
    themeItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      borderRadius: 10,
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#F9FAFB',
      marginBottom: 6,
    },
    colorDot: (color) => ({
      width: 14,
      height: 14,
      borderRadius: '50%',
      backgroundColor: color || COHRM_COLORS.muted,
      flexShrink: 0,
      border: `2px solid ${isDark ? COHRM_COLORS.darkBorder : '#fff'}`,
      boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
    }),
    categoryTag: {
      fontSize: 11,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 6,
      backgroundColor: isDark ? 'rgba(41, 128, 185, 0.15)' : 'rgba(41, 128, 185, 0.1)',
      color: COHRM_COLORS.primaryLight,
      whiteSpace: 'nowrap',
    },
    // Actor chip
    chip: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 20,
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#F3F4F6',
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontSize: 13,
      fontWeight: 500,
      marginRight: 6,
      marginBottom: 6,
    },
    chipRemove: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 18,
      height: 18,
      borderRadius: '50%',
      border: 'none',
      backgroundColor: isDark ? 'rgba(231, 76, 60, 0.2)' : 'rgba(231, 76, 60, 0.1)',
      color: COHRM_COLORS.danger,
      cursor: 'pointer',
      padding: 0,
      fontSize: 12,
    },
    // Color grid
    colorGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 6,
    },
    colorSwatch: (color, selected) => ({
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: color,
      border: selected ? '3px solid #fff' : '2px solid transparent',
      boxShadow: selected ? `0 0 0 2px ${COHRM_COLORS.primary}` : 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    // Toggle row
    toggleRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#F3F4F6'}`,
    },
    toggleLabel: {
      fontSize: 14,
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      fontWeight: 500,
    },
    // Logo preview
    logoPreview: {
      width: 80,
      height: 80,
      borderRadius: 10,
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#E5E7EB'}`,
      objectFit: 'contain',
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#F9FAFB',
      marginTop: 8,
    },
    // SMS test result
    resultBox: (success) => ({
      padding: '12px 16px',
      borderRadius: 10,
      backgroundColor: success
        ? (isDark ? 'rgba(39, 174, 96, 0.12)' : '#EAFAF1')
        : (isDark ? 'rgba(231, 76, 60, 0.12)' : '#FDEDEC'),
      color: success ? COHRM_COLORS.success : COHRM_COLORS.danger,
      fontSize: 14,
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
    }),
    // Level header in actors section
    levelHeader: (color) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
      marginTop: 16,
    }),
    levelBadge: (color) => ({
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: color,
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }),
    levelTitle: {
      fontSize: 14,
      fontWeight: 600,
      color: isDark ? COHRM_COLORS.darkText : '#374151',
    },
    // Inline form for themes
    inlineForm: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#F9FAFB',
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#E5E7EB'}`,
      marginBottom: 16,
    },
    formRow: {
      display: 'flex',
      gap: 12,
      marginBottom: 12,
    },
    formCol: {
      flex: 1,
    },
    // SMS code list
    codeItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 8,
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#F3F4F6',
      fontSize: 12,
      fontWeight: 500,
      color: isDark ? COHRM_COLORS.darkText : '#374151',
      marginRight: 6,
      marginBottom: 6,
    },
    codeLabel: {
      fontWeight: 700,
      color: COHRM_COLORS.primaryLight,
    },
    // Spinner
    spinner: {
      display: 'inline-block',
      width: 18,
      height: 18,
      border: `2px solid ${isDark ? COHRM_COLORS.darkBorder : '#E5E7EB'}`,
      borderTopColor: COHRM_COLORS.primary,
      borderRadius: '50%',
      animation: 'cohrmSettingsSpin 0.6s linear infinite',
    },
    // Category group header
    categoryGroupHeader: {
      fontSize: 13,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginTop: 16,
      marginBottom: 8,
    },
    // Add actor inline
    addActorRow: {
      display: 'flex',
      gap: 8,
      marginTop: 8,
    },
    addActorInput: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: 8,
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#D1D5DB'}`,
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
      fontSize: 13,
      outline: 'none',
      boxSizing: 'border-box',
    },
    // Quiet hours row
    timeRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginTop: 8,
    },
    timeInput: {
      padding: '10px 14px',
      borderRadius: 10,
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#D1D5DB'}`,
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#fff',
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
      fontSize: 14,
      outline: 'none',
      width: 130,
      boxSizing: 'border-box',
    },
    timeLabel: {
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted,
      fontWeight: 500,
    },
  };

  // ============================================
  // SECTION DEFINITIONS
  // ============================================
  const SECTIONS = [
    { id: 'general', title: 'Général', Icon: Globe },
    { id: 'themes', title: 'Thèmes / Catégories', Icon: Palette, badgeCount: themes.length },
    { id: 'actors', title: 'Types d\'acteurs', Icon: Users, badgeCount: Object.values(actorTypes).flat().length },
    { id: 'sms', title: 'SMS Gateway', Icon: MessageCircle },
    { id: 'notifications', title: 'Notifications', Icon: Bell },
  ];

  // ============================================
  // VALIDATION LEVELS (for actor types display)
  // ============================================
  const LEVEL_COLORS = ['#3498DB', '#2ECC71', '#F39C12', '#E67E22', '#E74C3C'];
  const LEVEL_NAMES = [
    'Collecte communautaire',
    'Vérification',
    'Évaluation des risques',
    'Coordination régionale',
    'Supervision centrale',
  ];

  // ============================================
  // PERMISSION CHECK
  // ============================================
  if (user?.cohrm_level < 5) {
    return (
      <div style={{ ...s.container, textAlign: 'center', paddingTop: 60 }}>
        <AlertTriangle size={48} color={COHRM_COLORS.warning} style={{ marginBottom: 16 }} />
        <h2 style={{ color: isDark ? COHRM_COLORS.darkText : COHRM_COLORS.dark, fontSize: 20, fontWeight: 700 }}>
          Accès refusé
        </h2>
        <p style={{ color: isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted, fontSize: 14 }}>
          Les paramètres du système sont réservés aux superviseurs nationaux (niveau 5).
        </p>
      </div>
    );
  }

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div style={{ ...s.container, textAlign: 'center', paddingTop: 80 }}>
        <style>{`@keyframes cohrmSettingsSpin { to { transform: rotate(360deg); } }`}</style>
        <div style={s.spinner} />
        <p style={{ color: isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted, marginTop: 16, fontSize: 14 }}>
          Chargement des paramètres...
        </p>
      </div>
    );
  }

  // ============================================
  // RENDER SECTION CONTENT
  // ============================================
  const renderGeneral = () => (
    <div style={s.sectionContent}>
      {/* Nom du système */}
      <div style={s.formGroup}>
        <label style={s.label}>Nom du système</label>
        <input
          type="text"
          style={s.input}
          value={settings.system_name || ''}
          onChange={(e) => updateSetting('system_name', e.target.value)}
          placeholder="COHRM - Cameroon One Health Rumor Management"
        />
      </div>

      {/* Description */}
      <div style={s.formGroup}>
        <label style={s.label}>Description</label>
        <textarea
          style={s.textarea}
          value={settings.system_description || ''}
          onChange={(e) => updateSetting('system_description', e.target.value)}
          placeholder="Système de gestion et suivi des rumeurs sanitaires One Health au Cameroun"
          rows={3}
        />
      </div>

      {/* Langue par défaut */}
      <div style={s.formGroup}>
        <label style={s.label}>Langue par défaut</label>
        <select
          style={s.select}
          value={settings.default_language || 'fr'}
          onChange={(e) => updateSetting('default_language', e.target.value)}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Logo URL */}
      <div style={s.formGroup}>
        <label style={s.label}>Logo URL</label>
        <input
          type="text"
          style={s.input}
          value={settings.logo_url || ''}
          onChange={(e) => updateSetting('logo_url', e.target.value)}
          placeholder="https://example.com/logo.png"
        />
        {settings.logo_url && (
          <img
            src={settings.logo_url}
            alt="Logo preview"
            style={s.logoPreview}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
      </div>

      {/* Save */}
      <button
        style={{
          ...s.btnPrimary,
          opacity: savingSection === 'system_name' ? 0.7 : 1,
        }}
        onClick={() => saveSettings(['system_name', 'system_description', 'default_language', 'logo_url'])}
        disabled={savingSection === 'system_name'}
      >
        {savingSection === 'system_name' ? <Loader size={16} className="spin" /> : <Save size={16} />}
        Enregistrer
      </button>
    </div>
  );

  const renderThemes = () => (
    <div style={s.sectionContent}>
      {/* Inline theme form (create or edit) */}
      {themeForm && (
        <div style={s.inlineForm}>
          <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? COHRM_COLORS.darkText : COHRM_COLORS.dark, marginBottom: 12 }}>
            {editingThemeId ? 'Modifier le thème' : 'Nouveau thème'}
          </div>

          <div style={s.formRow}>
            <div style={s.formCol}>
              <label style={s.label}>Libellé (FR) *</label>
              <input
                type="text"
                style={s.input}
                value={themeForm.label_fr}
                onChange={(e) => setThemeForm((f) => ({ ...f, label_fr: e.target.value }))}
                placeholder="Santé humaine"
              />
            </div>
            <div style={s.formCol}>
              <label style={s.label}>Libellé (EN)</label>
              <input
                type="text"
                style={s.input}
                value={themeForm.label_en}
                onChange={(e) => setThemeForm((f) => ({ ...f, label_en: e.target.value }))}
                placeholder="Human health"
              />
            </div>
          </div>

          <div style={s.formRow}>
            <div style={s.formCol}>
              <label style={s.label}>Catégorie *</label>
              {existingCategories.length > 0 ? (
                <select
                  style={s.select}
                  value={themeForm.category}
                  onChange={(e) => setThemeForm((f) => ({ ...f, category: e.target.value }))}
                >
                  <option value="">-- Sélectionner ou créer --</option>
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  style={s.input}
                  value={themeForm.newCategory}
                  onChange={(e) => setThemeForm((f) => ({ ...f, newCategory: e.target.value }))}
                  placeholder="Nouvelle catégorie"
                />
              )}
            </div>
            <div style={s.formCol}>
              <label style={s.label}>Nouvelle catégorie</label>
              <input
                type="text"
                style={s.input}
                value={themeForm.newCategory}
                onChange={(e) => setThemeForm((f) => ({ ...f, newCategory: e.target.value }))}
                placeholder="Remplace la sélection ci-dessus"
              />
            </div>
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Description</label>
            <input
              type="text"
              style={s.input}
              value={themeForm.description}
              onChange={(e) => setThemeForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description courte du thème"
            />
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Nom d'icône</label>
            <input
              type="text"
              style={s.input}
              value={themeForm.icon}
              onChange={(e) => setThemeForm((f) => ({ ...f, icon: e.target.value }))}
              placeholder="AlertCircle, Heart, Bug, Leaf..."
            />
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Couleur</label>
            <div style={s.colorGrid}>
              {THEME_COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  style={s.colorSwatch(c, themeForm.color === c)}
                  onClick={() => setThemeForm((f) => ({ ...f, color: c }))}
                >
                  {themeForm.color === c && <Check size={14} color="#fff" />}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button style={s.btnOutline} onClick={cancelThemeForm}>
              <X size={16} /> Annuler
            </button>
            <button
              style={{ ...s.btnPrimary, opacity: savingSection === 'theme' ? 0.7 : 1 }}
              onClick={saveTheme}
              disabled={savingSection === 'theme'}
            >
              {savingSection === 'theme' ? <Loader size={16} /> : <Save size={16} />}
              {editingThemeId ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!themeForm && (
        <button style={{ ...s.btnPrimary, marginBottom: 16 }} onClick={openThemeCreate}>
          <Plus size={16} /> Ajouter un thème
        </button>
      )}

      {/* Theme list grouped by category */}
      {Object.keys(groupedThemes).length > 0 ? (
        Object.entries(groupedThemes).map(([category, catThemes]) => (
          <div key={category}>
            <div style={s.categoryGroupHeader}>{category}</div>
            {catThemes.map((theme) => {
              const globalIndex = themes.findIndex((t) => t.id === theme.id);
              return (
                <div key={theme.id} style={s.themeItem}>
                  {/* Reorder buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button
                      style={{ ...s.btnIcon, width: 22, height: 22 }}
                      onClick={() => moveTheme(globalIndex, -1)}
                      disabled={globalIndex === 0}
                      title="Monter"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      style={{ ...s.btnIcon, width: 22, height: 22 }}
                      onClick={() => moveTheme(globalIndex, 1)}
                      disabled={globalIndex === themes.length - 1}
                      title="Descendre"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  <GripVertical size={16} color={isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted} />
                  <div style={s.colorDot(theme.color)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? COHRM_COLORS.darkText : '#1f2937' }}>
                      {theme.label_fr}
                    </div>
                    {theme.label_en && (
                      <div style={{ fontSize: 12, color: isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted }}>
                        {theme.label_en}
                      </div>
                    )}
                  </div>
                  <span style={s.categoryTag}>{theme.category}</span>
                  <button
                    style={s.btnIcon}
                    onClick={() => openThemeEdit(theme)}
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    style={{ ...s.btnIcon, color: COHRM_COLORS.danger }}
                    onClick={() => confirmDeleteTheme(theme)}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        ))
      ) : (
        <div style={{ textAlign: 'center', padding: 20, color: isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted, fontSize: 14 }}>
          Aucun thème configuré
        </div>
      )}

      {/* Save order */}
      {orderChanged && (
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            style={{ ...s.btnPrimary, opacity: savingOrder ? 0.7 : 1 }}
            onClick={saveThemeOrder}
            disabled={savingOrder}
          >
            {savingOrder ? <Loader size={16} /> : <Save size={16} />}
            Enregistrer l'ordre
          </button>
        </div>
      )}
    </div>
  );

  const renderActors = () => (
    <div style={s.sectionContent}>
      {[1, 2, 3, 4, 5].map((level) => (
        <div key={level}>
          <div style={s.levelHeader(LEVEL_COLORS[level - 1])}>
            <div style={s.levelBadge(LEVEL_COLORS[level - 1])}>{level}</div>
            <div style={s.levelTitle}>{LEVEL_NAMES[level - 1]}</div>
          </div>

          <div style={{ paddingLeft: 38 }}>
            {/* Existing chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {(actorTypes[level] || []).map((actor, idx) => (
                <span key={idx} style={s.chip}>
                  {actor.label}
                  <button
                    style={s.chipRemove}
                    onClick={() => removeActorType(level, idx)}
                    title="Retirer"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {(actorTypes[level] || []).length === 0 && (
                <span style={{ fontSize: 13, color: isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted, fontStyle: 'italic' }}>
                  Aucun type défini
                </span>
              )}
            </div>

            {/* Add new */}
            <div style={s.addActorRow}>
              <input
                type="text"
                style={s.addActorInput}
                value={newActorInputs[level] || ''}
                onChange={(e) => setNewActorInputs((prev) => ({ ...prev, [level]: e.target.value }))}
                placeholder="Nouveau type d'acteur..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addActorType(level);
                }}
              />
              <button style={s.btnSmall} onClick={() => addActorType(level)}>
                <Plus size={14} /> Ajouter
              </button>
            </div>
          </div>

          {level < 5 && <div style={s.divider} />}
        </div>
      ))}

      {/* Save */}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          style={{ ...s.btnPrimary, opacity: savingSection === 'actor_types' ? 0.7 : 1 }}
          onClick={saveActorTypes}
          disabled={savingSection === 'actor_types'}
        >
          {savingSection === 'actor_types' ? <Loader size={16} /> : <Save size={16} />}
          Enregistrer
        </button>
      </div>
    </div>
  );

  const renderSMS = () => (
    <div style={s.sectionContent}>
      {/* Gateway URL */}
      <div style={s.formGroup}>
        <label style={s.label}>
          <Server size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Gateway URL
        </label>
        <input
          type="text"
          style={s.input}
          value={settings.sms_gateway_url || ''}
          onChange={(e) => updateSetting('sms_gateway_url', e.target.value)}
          placeholder="https://sms-gateway.example.com/api/send"
        />
      </div>

      {/* API Key */}
      <div style={s.formGroup}>
        <label style={s.label}>Clé API</label>
        <input
          type="password"
          style={s.input}
          value={settings.sms_api_key || ''}
          onChange={(e) => updateSetting('sms_api_key', e.target.value)}
          placeholder="sk_live_..."
        />
      </div>

      {/* Sender */}
      <div style={s.formGroup}>
        <label style={s.label}>
          <Phone size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Numéro expéditeur
        </label>
        <input
          type="text"
          style={s.input}
          value={settings.sms_sender_number || ''}
          onChange={(e) => updateSetting('sms_sender_number', e.target.value)}
          placeholder="+237600000000"
        />
      </div>

      {/* Save SMS config */}
      <button
        style={{
          ...s.btnPrimary,
          opacity: savingSection === 'sms_gateway_url' ? 0.7 : 1,
          marginBottom: 20,
        }}
        onClick={() => saveSettings(['sms_gateway_url', 'sms_api_key', 'sms_sender_number'])}
        disabled={savingSection === 'sms_gateway_url'}
      >
        {savingSection === 'sms_gateway_url' ? <Loader size={16} /> : <Save size={16} />}
        Enregistrer la configuration
      </button>

      <div style={s.divider} />

      {/* SMS Codes (read-only) */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? COHRM_COLORS.darkText : COHRM_COLORS.dark, marginBottom: 12 }}>
          Codes SMS configurés
        </div>
        {smsCodeSections.map(({ title, codes }) => (
          <div key={title} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {title}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {codes.map((code) => (
                <span key={code} style={s.codeItem}>
                  <span style={s.codeLabel}>{code}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={s.divider} />

      {/* Test SMS */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? COHRM_COLORS.darkText : COHRM_COLORS.dark, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Send size={16} />
          Tester l'envoi SMS
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>Numéro de téléphone</label>
          <input
            type="text"
            style={s.input}
            value={smsTestPhone}
            onChange={(e) => setSmsTestPhone(e.target.value)}
            placeholder="+237691234567"
          />
        </div>

        <div style={s.formGroup}>
          <label style={s.label}>Message de test</label>
          <input
            type="text"
            style={s.input}
            value={smsTestMessage}
            onChange={(e) => setSmsTestMessage(e.target.value)}
          />
        </div>

        <button
          style={{
            ...s.btnPrimary,
            backgroundColor: COHRM_COLORS.success,
            opacity: sendingTest ? 0.7 : 1,
          }}
          onClick={handleTestSMS}
          disabled={sendingTest}
        >
          {sendingTest ? <Loader size={16} /> : <Send size={16} />}
          Envoyer le test
        </button>

        {smsTestResult && (
          <div style={s.resultBox(smsTestResult.success)}>
            {smsTestResult.success ? <Check size={18} /> : <X size={18} />}
            {smsTestResult.message}
          </div>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => {
    const toggles = [
      { key: 'notify_new_rumor', label: 'Notification nouvelle rumeur', defaultVal: true },
      { key: 'notify_escalation', label: 'Notification escalade', defaultVal: true },
      { key: 'notify_validation', label: 'Notification validation', defaultVal: true },
      { key: 'notify_rejection', label: 'Notification rejet', defaultVal: true },
      { key: 'notify_risk_assessment', label: 'Notification évaluation risque', defaultVal: true },
      { key: 'notify_feedback', label: 'Notification rétro-information', defaultVal: true },
    ];

    const getBool = (key, defaultVal) => {
      const val = settings[key];
      if (val === undefined || val === null) return defaultVal;
      if (typeof val === 'boolean') return val;
      if (val === 'true' || val === '1' || val === 1) return true;
      if (val === 'false' || val === '0' || val === 0) return false;
      return defaultVal;
    };

    return (
      <div style={s.sectionContent}>
        {/* Toggle switches */}
        {toggles.map(({ key, label, defaultVal }) => (
          <div key={key} style={s.toggleRow}>
            <span style={s.toggleLabel}>{label}</span>
            <ToggleSwitch
              isDark={isDark}
              checked={getBool(key, defaultVal)}
              onChange={(val) => updateSetting(key, val)}
            />
          </div>
        ))}

        <div style={{ ...s.divider, marginTop: 20 }} />

        {/* Reminder delay */}
        <div style={s.formGroup}>
          <label style={s.label}>Délai de rappel (heures)</label>
          <input
            type="number"
            style={{ ...s.input, width: 120 }}
            value={settings.reminder_delay_hours ?? 24}
            onChange={(e) => updateSetting('reminder_delay_hours', parseInt(e.target.value, 10) || 0)}
            min={1}
            max={168}
          />
        </div>

        {/* Quiet hours */}
        <div style={s.formGroup}>
          <label style={s.label}>Heures silencieuses</label>
          <div style={s.timeRow}>
            <span style={s.timeLabel}>De</span>
            <input
              type="time"
              style={s.timeInput}
              value={settings.quiet_hours_start || '22:00'}
              onChange={(e) => updateSetting('quiet_hours_start', e.target.value)}
            />
            <span style={s.timeLabel}>à</span>
            <input
              type="time"
              style={s.timeInput}
              value={settings.quiet_hours_end || '07:00'}
              onChange={(e) => updateSetting('quiet_hours_end', e.target.value)}
            />
          </div>
        </div>

        {/* Save */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            style={{
              ...s.btnPrimary,
              opacity: savingSection === 'notify_new_rumor' ? 0.7 : 1,
            }}
            onClick={() => saveSettings([
              'notify_new_rumor', 'notify_escalation', 'notify_validation',
              'notify_rejection', 'notify_risk_assessment', 'notify_feedback',
              'reminder_delay_hours', 'quiet_hours_start', 'quiet_hours_end',
            ])}
            disabled={savingSection === 'notify_new_rumor'}
          >
            {savingSection === 'notify_new_rumor' ? <Loader size={16} /> : <Save size={16} />}
            Enregistrer
          </button>
        </div>
      </div>
    );
  };

  const sectionRenderers = {
    general: renderGeneral,
    themes: renderThemes,
    actors: renderActors,
    sms: renderSMS,
    notifications: renderNotifications,
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={s.container}>
      <style>{`@keyframes cohrmSettingsSpin { to { transform: rotate(360deg); } }`}</style>

      {/* Page header */}
      <div style={s.pageHeader}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: isDark ? 'rgba(27, 79, 114, 0.2)' : 'rgba(27, 79, 114, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Settings size={24} color={COHRM_COLORS.primary} />
        </div>
        <div>
          <h1 style={s.pageTitle}>Paramètres COHRM</h1>
          <p style={s.pageSubtitle}>Configuration du système de gestion des rumeurs</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            style={s.btnOutline}
            onClick={loadData}
            title="Recharger les paramètres"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Accordion sections */}
      {SECTIONS.map(({ id, title, Icon, badgeCount }) => {
        const isOpen = openSection === id;
        return (
          <div key={id} style={s.section(isOpen)}>
            {/* Header */}
            <div
              style={s.sectionHeader}
              onClick={() => toggleSection(id)}
            >
              <div style={s.sectionIcon(isOpen)}>
                <Icon size={20} color={isOpen ? COHRM_COLORS.primary : (isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted)} />
              </div>
              <div style={s.sectionTitle}>{title}</div>
              {badgeCount !== undefined && badgeCount > 0 && (
                <span style={s.badge}>{badgeCount}</span>
              )}
              {isOpen
                ? <ChevronUp size={20} color={isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted} />
                : <ChevronDown size={20} color={isDark ? COHRM_COLORS.darkMuted : COHRM_COLORS.muted} />
              }
            </div>

            {/* Body */}
            <div style={s.sectionBody(isOpen)}>
              {sectionRenderers[id]()}
            </div>
          </div>
        );
      })}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDark={isDark}
        variant="danger"
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
      />
    </div>
  );
};

export default CohrmSettings;
