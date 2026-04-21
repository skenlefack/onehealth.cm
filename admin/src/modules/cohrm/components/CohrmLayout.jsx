/**
 * CohrmLayout - Layout principal du module COHRM
 *
 * Structure :
 * ┌──────────────┬─────────────────────────────────────────┐
 * │              │  Header (titre, breadcrumb, notifs)      │
 * │   Sidebar    ├─────────────────────────────────────────┤
 * │   (nav)      │  Contenu principal (children)            │
 * │              │                                          │
 * └──────────────┴─────────────────────────────────────────┘
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3, Megaphone, CheckCircle, Map, Shield, MessageCircle,
  Globe, Users, Download, Settings, Bell, ChevronLeft, Menu,
  ArrowLeft, Radar, Activity,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { COHRM_NAV_ITEMS, COHRM_COLORS } from '../utils/constants';
import { usePermissions } from '../hooks/usePermissions';
import useCohrmStore from '../stores/cohrmStore';
import LanguageSwitcher from './LanguageSwitcher';

// Mapping des noms d'icônes vers les composants Lucide
const ICON_MAP = {
  BarChart3, Megaphone, CheckCircle, Map, Shield, MessageCircle,
  Globe, Users, Download, Settings, Bell,
};

/**
 * @param {object} props
 * @param {React.ReactNode} props.children - Contenu de la page
 * @param {object} props.user - Utilisateur connecté
 * @param {boolean} props.isDark - Mode sombre
 * @param {function} props.onBack - Callback pour retourner au panel admin principal
 */
const CohrmLayout = ({ children, user, isDark, onBack }) => {
  const { t } = useTranslation('cohrm');
  const { userLevel, canView } = usePermissions(user);
  const {
    activePage,
    setActivePage,
    sidebarCollapsed,
    toggleSidebar,
    stats,
    fetchStats,
  } = useCohrmStore();

  const [hoveredNav, setHoveredNav] = useState(null);
  const [tooltipNav, setTooltipNav] = useState(null);

  // Charger les stats au montage (pour les badges compteurs)
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Largeurs du sidebar
  const SIDEBAR_WIDTH = sidebarCollapsed ? 64 : 260;

  // Traduction des labels de navigation
  const getNavLabel = (navId) => t(`nav.${navId}`, navId);

  // Trouver le label de la page active
  const currentNavItem = COHRM_NAV_ITEMS.find(item => item.id === activePage)
    || { id: 'dashboard', label: 'COHRM', icon: 'Radar' };
  const currentPageLabel = getNavLabel(currentNavItem.id);

  // ============================================
  // STYLES
  // ============================================

  const s = {
    layout: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#F1F5F9',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },

    // SIDEBAR
    sidebar: {
      width: SIDEBAR_WIDTH,
      minHeight: '100vh',
      backgroundColor: isDark ? '#0c1524' : COHRM_COLORS.primary,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 100,
      overflow: 'hidden',
    },
    sidebarHeader: {
      padding: sidebarCollapsed ? '20px 12px' : '20px 20px',
      borderBottom: `1px solid ${isDark ? '#1e293b' : 'rgba(255,255,255,0.1)'}`,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minHeight: 72,
    },
    logoIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: 'linear-gradient(135deg, #FF5722, #FF9800)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    logoText: {
      opacity: sidebarCollapsed ? 0 : 1,
      transition: 'opacity 0.2s',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
    logoTitle: {
      fontSize: 16,
      fontWeight: 800,
      color: '#fff',
      letterSpacing: '-0.3px',
    },
    logoSubtitle: {
      fontSize: 10,
      color: 'rgba(255,255,255,0.5)',
      letterSpacing: '1px',
      textTransform: 'uppercase',
    },

    // NAV
    nav: {
      flex: 1,
      padding: '12px 0',
      overflowY: 'auto',
      overflowX: 'hidden',
    },
    navSection: {
      padding: sidebarCollapsed ? '4px' : '4px 8px',
    },
    navItem: (isActive, isHovered) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: sidebarCollapsed ? '10px 0' : '10px 14px',
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
      borderRadius: 10,
      cursor: 'pointer',
      marginBottom: 2,
      backgroundColor: isActive
        ? 'rgba(255, 255, 255, 0.15)'
        : isHovered
          ? 'rgba(255, 255, 255, 0.08)'
          : 'transparent',
      color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.65)',
      fontWeight: isActive ? 600 : 400,
      fontSize: 14,
      transition: 'all 0.15s',
      position: 'relative',
      textDecoration: 'none',
      border: 'none',
      outline: 'none',
      width: '100%',
      textAlign: 'left',
    }),
    navIconWrapper: {
      width: 20,
      height: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    navLabel: {
      opacity: sidebarCollapsed ? 0 : 1,
      transition: 'opacity 0.15s',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      flex: 1,
    },
    navBadge: {
      minWidth: 20,
      height: 20,
      padding: '0 6px',
      borderRadius: 10,
      backgroundColor: '#FF5722',
      color: '#fff',
      fontSize: 11,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: sidebarCollapsed ? 0 : 1,
      transition: 'opacity 0.15s',
    },
    tooltip: {
      position: 'absolute',
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: 12,
      padding: '6px 12px',
      borderRadius: 8,
      backgroundColor: isDark ? '#334155' : '#1f2937',
      color: '#fff',
      fontSize: 13,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      zIndex: 200,
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    },

    // SIDEBAR FOOTER
    sidebarFooter: {
      padding: '12px',
      borderTop: `1px solid ${isDark ? '#1e293b' : 'rgba(255,255,255,0.1)'}`,
    },
    backBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: sidebarCollapsed ? '10px 0' : '10px 14px',
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
      width: '100%',
      borderRadius: 10,
      border: 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: 13,
      cursor: 'pointer',
      transition: 'all 0.15s',
    },
    collapseBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '8px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: 'transparent',
      color: 'rgba(255, 255, 255, 0.4)',
      cursor: 'pointer',
      marginTop: 8,
    },

    // MAIN CONTENT
    main: {
      flex: 1,
      marginLeft: SIDEBAR_WIDTH,
      transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    },

    // HEADER
    header: {
      height: 64,
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      borderBottom: isDark ? `1px solid ${COHRM_COLORS.darkBorder}` : '1px solid #E5E7EB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(8px)',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    },
    menuToggle: {
      display: 'none', // Visible seulement en mobile via media query
      padding: 8,
      borderRadius: 8,
      border: 'none',
      backgroundColor: 'transparent',
      color: isDark ? '#e2e8f0' : '#374151',
      cursor: 'pointer',
    },
    pageTitle: {
      fontSize: 18,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
    },
    breadcrumb: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      color: isDark ? '#64748b' : '#9CA3AF',
    },
    breadcrumbSep: {
      fontSize: 10,
    },
    breadcrumbActive: {
      color: isDark ? '#e2e8f0' : '#374151',
      fontWeight: 500,
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    notifBtn: {
      position: 'relative',
      padding: 8,
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: 'transparent',
      color: isDark ? '#94a3b8' : '#6B7280',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    notifBadge: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 16,
      height: 16,
      borderRadius: '50%',
      backgroundColor: '#FF5722',
      color: '#fff',
      fontSize: 9,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '6px 12px',
      borderRadius: 10,
      backgroundColor: isDark ? '#334155' : '#F3F4F6',
    },
    userAvatar: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${COHRM_COLORS.primary}, ${COHRM_COLORS.primaryLight})`,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      fontWeight: 700,
    },
    userName: {
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? '#e2e8f0' : '#374151',
    },
    userRole: {
      fontSize: 11,
      color: isDark ? '#64748b' : '#9CA3AF',
    },

    // CONTENT
    content: {
      flex: 1,
      padding: activePage === 'map' ? 0 : 28,
      maxWidth: activePage === 'map' ? '100%' : 1600,
      width: '100%',
      overflow: activePage === 'map' ? 'hidden' : undefined,
    },
  };

  // ============================================
  // RENDU
  // ============================================

  // Badge compteur pour la sidebar
  const getBadgeCount = (navId) => {
    if (!stats) return 0;
    if (navId === 'rumors') return stats.pending || 0;
    if (navId === 'validation') return stats.pending || 0;
    return 0;
  };

  // Initiales de l'utilisateur
  const userInitials = user
    ? `${(user.first_name || '')[0] || ''}${(user.last_name || '')[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  return (
    <div style={s.layout}>
      {/* ============== SIDEBAR ============== */}
      <aside style={s.sidebar}>
        {/* Logo */}
        <div style={s.sidebarHeader}>
          <div style={s.logoIcon}>
            <Radar size={20} color="#fff" />
          </div>
          <div style={s.logoText}>
            <div style={s.logoTitle}>{t('sidebar.title')}</div>
            <div style={s.logoSubtitle}>{t('sidebar.subtitle')}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={s.nav}>
          <div style={s.navSection}>
            {COHRM_NAV_ITEMS.filter(item => canView(item.id)).map((item) => {
              const Icon = ICON_MAP[item.icon] || Activity;
              const isActive = activePage === item.id;
              const isHovered = hoveredNav === item.id;
              const badgeCount = item.badge ? getBadgeCount(item.id) : 0;

              return (
                <button
                  key={item.id}
                  style={s.navItem(isActive, isHovered)}
                  onClick={() => setActivePage(item.id)}
                  onMouseEnter={() => {
                    setHoveredNav(item.id);
                    if (sidebarCollapsed) setTooltipNav(item.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredNav(null);
                    setTooltipNav(null);
                  }}
                >
                  <div style={s.navIconWrapper}>
                    <Icon size={18} />
                  </div>
                  <span style={s.navLabel}>{getNavLabel(item.id)}</span>
                  {badgeCount > 0 && (
                    <span style={s.navBadge}>{badgeCount}</span>
                  )}
                  {/* Tooltip en mode collapsed */}
                  {sidebarCollapsed && tooltipNav === item.id && (
                    <div style={s.tooltip}>{getNavLabel(item.id)}</div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer sidebar */}
        <div style={s.sidebarFooter}>
          {onBack && (
            <button
              style={s.backBtn}
              onClick={onBack}
              onMouseEnter={(e) => { e.target.style.backgroundColor = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
            >
              <ArrowLeft size={16} />
              {!sidebarCollapsed && <span>{t('nav.backAdmin')}</span>}
            </button>
          )}
          <button
            style={s.collapseBtn}
            onClick={toggleSidebar}
            title={sidebarCollapsed ? t('nav.expand') : t('nav.collapse')}
          >
            <ChevronLeft
              size={16}
              style={{
                transform: sidebarCollapsed ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          </button>
        </div>
      </aside>

      {/* ============== ZONE PRINCIPALE ============== */}
      <div style={s.main}>
        {/* Header */}
        <header style={s.header}>
          <div style={s.headerLeft}>
            <button style={s.menuToggle} onClick={toggleSidebar}>
              <Menu size={20} />
            </button>
            <div>
              <div style={s.pageTitle}>{currentPageLabel}</div>
              <div style={s.breadcrumb}>
                <span>COHRM</span>
                <span style={s.breadcrumbSep}>›</span>
                <span style={s.breadcrumbActive}>{currentPageLabel}</span>
              </div>
            </div>
          </div>
          <div style={s.headerRight}>
            {/* Language Switcher */}
            <LanguageSwitcher isDark={isDark} />
            {/* Notifications */}
            <button style={s.notifBtn}>
              <Bell size={18} />
              {stats?.alerts > 0 && (
                <span style={s.notifBadge}>{stats.alerts}</span>
              )}
            </button>
            {/* Info utilisateur */}
            <div style={s.userInfo}>
              <div style={s.userAvatar}>{userInitials}</div>
              {!sidebarCollapsed && (
                <div>
                  <div style={s.userName}>
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div style={s.userRole}>{t('sidebar.level', { level: userLevel })}</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenu */}
        <main style={s.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default CohrmLayout;
