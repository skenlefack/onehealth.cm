/**
 * PlaceholderPage - Page temporaire pour les sections non encore implémentées
 * Sera remplacée par les vraies implémentations dans les phases suivantes
 */

import React from 'react';
import {
  Megaphone, CheckCircle, Map, Shield, MessageCircle,
  Globe, Users, Download, Settings, Plus, FileText,
  Radar, Activity, Edit2, AlertTriangle,
} from 'lucide-react';
import { COHRM_COLORS } from '../utils/constants';

const ICON_MAP = {
  rumors: Megaphone,
  'rumor-create': Plus,
  'rumor-detail': FileText,
  'rumor-edit': Edit2,
  validation: CheckCircle,
  map: Map,
  risk: Shield,
  sms: MessageCircle,
  scanner: Globe,
  actors: Users,
  'actor-create': Plus,
  'actor-detail': Users,
  export: Download,
  settings: Settings,
};

const LABEL_MAP = {
  rumors: 'Liste des rumeurs',
  'rumor-create': 'Créer une rumeur',
  'rumor-detail': 'Détail de la rumeur',
  'rumor-edit': 'Modifier la rumeur',
  validation: 'File de validation',
  map: 'Carte des rumeurs',
  risk: 'Tableau de risques',
  sms: 'Gestionnaire SMS',
  scanner: 'Scanner Web',
  actors: 'Gestion des acteurs',
  'actor-create': 'Créer un acteur',
  'actor-detail': 'Détail acteur',
  export: 'Export de données',
  settings: 'Paramètres COHRM',
};

const PlaceholderPage = ({ page, isDark }) => {
  const Icon = ICON_MAP[page] || Radar;
  const label = LABEL_MAP[page] || page;

  const s = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      textAlign: 'center',
    },
    iconWrapper: {
      width: 100,
      height: 100,
      borderRadius: 24,
      background: isDark
        ? `linear-gradient(135deg, ${COHRM_COLORS.primary}20, ${COHRM_COLORS.primaryLight}20)`
        : `linear-gradient(135deg, ${COHRM_COLORS.primary}10, ${COHRM_COLORS.primaryLight}10)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 22,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#94a3b8' : '#6B7280',
      maxWidth: 400,
      lineHeight: 1.6,
      marginBottom: 24,
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '8px 16px',
      borderRadius: 20,
      backgroundColor: isDark ? '#1B4F7220' : '#EBF5FB',
      color: isDark ? '#93c5fd' : COHRM_COLORS.primary,
      fontSize: 13,
      fontWeight: 600,
    },
  };

  return (
    <div style={s.container}>
      <div style={s.iconWrapper}>
        <Icon size={44} color={COHRM_COLORS.primaryLight} />
      </div>
      <div style={s.title}>{label}</div>
      <div style={s.subtitle}>
        Cette section sera implémentée dans la prochaine phase de développement.
        L'infrastructure et les API sont déjà prêtes.
      </div>
      <div style={s.badge}>
        <Activity size={14} />
        Phase 2 - En développement
      </div>
    </div>
  );
};

export default PlaceholderPage;
