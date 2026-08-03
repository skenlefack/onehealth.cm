/**
 * DusscLayout — Layout principal du module DUSS-C
 * Sidebar de navigation + zone de contenu
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, HelpCircle, Layout, AlertTriangle, TrendingUp, Settings, ChevronLeft, ChevronRight, Brain } from 'lucide-react';
import useDusscStore from '../stores/dusscStore';
import { DUSSC_COLORS, DUSSC_NAV_ITEMS } from '../utils/constants';

const ICONS = { BarChart3, HelpCircle, Layout, AlertTriangle, TrendingUp, Settings };

const DusscLayout = ({ isDark, user, onBack, children }) => {
  const { t } = useTranslation('dussc');
  const { activePage, setActivePage, sidebarCollapsed, toggleSidebar } = useDusscStore();

  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      background: isDark ? '#1a1a2e' : '#f5f7f5',
    },
    sidebar: {
      width: sidebarCollapsed ? 60 : 240,
      background: isDark ? '#16213e' : DUSSC_COLORS.primaryDark,
      transition: 'width 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
    },
    logo: {
      padding: sidebarCollapsed ? '16px 8px' : '20px 16px',
      borderBottom: `1px solid ${isDark ? '#ffffff15' : '#ffffff20'}`,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
    },
    logoIcon: {
      width: 36, height: 36, borderRadius: 8,
      background: DUSSC_COLORS.primaryLight,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    logoText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 700,
      lineHeight: 1.2,
      opacity: sidebarCollapsed ? 0 : 1,
      transition: 'opacity 0.2s',
      whiteSpace: 'nowrap',
    },
    nav: {
      flex: 1,
      padding: '12px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    navItem: (active) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: sidebarCollapsed ? '10px 0' : '10px 12px',
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
      borderRadius: 8,
      background: active ? (isDark ? '#ffffff15' : '#ffffff20') : 'transparent',
      color: active ? '#fff' : '#ffffffaa',
      fontSize: 13,
      fontWeight: active ? 600 : 400,
      cursor: 'pointer',
      border: 'none',
      width: '100%',
      textAlign: 'left',
      transition: 'background 0.15s',
    }),
    backBtn: {
      padding: sidebarCollapsed ? '12px 0' : '12px 16px',
      borderTop: `1px solid ${isDark ? '#ffffff15' : '#ffffff20'}`,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
      color: '#ffffff80',
      fontSize: 12,
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      width: '100%',
    },
    collapseBtn: {
      padding: '8px',
      borderTop: `1px solid ${isDark ? '#ffffff15' : '#ffffff20'}`,
      display: 'flex',
      justifyContent: 'center',
      color: '#ffffff60',
      cursor: 'pointer',
      border: 'none',
      background: 'none',
      width: '100%',
    },
    main: {
      flex: 1,
      overflow: 'auto',
    },
    header: {
      padding: '16px 24px',
      background: isDark ? '#16213e' : '#fff',
      borderBottom: `1px solid ${isDark ? '#ffffff10' : '#e8ece8'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 700,
      color: isDark ? '#fff' : DUSSC_COLORS.encre,
    },
    content: {
      padding: 24,
    },
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <Brain size={20} color="#fff" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <div style={styles.logoText}>DUSS-C</div>
              <div style={{ ...styles.logoText, fontSize: 10, fontWeight: 400, opacity: 0.6 }}>
                Défi Une Seule Santé
              </div>
            </div>
          )}
        </div>

        <div style={styles.nav}>
          {DUSSC_NAV_ITEMS.map((item) => {
            const Icon = ICONS[item.icon] || HelpCircle;
            return (
              <button
                key={item.key}
                style={styles.navItem(activePage === item.key)}
                onClick={() => setActivePage(item.key)}
                title={sidebarCollapsed ? t(`nav.${item.key}`) : undefined}
              >
                <Icon size={18} />
                {!sidebarCollapsed && <span>{t(`nav.${item.key}`)}</span>}
              </button>
            );
          })}
        </div>

        {onBack && (
          <button style={styles.backBtn} onClick={onBack}>
            <ChevronLeft size={16} />
            {!sidebarCollapsed && <span>{t('nav.backToAdmin')}</span>}
          </button>
        )}

        <button style={styles.collapseBtn} onClick={toggleSidebar}>
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Main content */}
      <div style={styles.main}>
        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DusscLayout;
