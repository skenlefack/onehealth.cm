/**
 * LanguageSwitcher - Toggle FR/EN pour le module COHRM
 *
 * Affiche un bouton toggle avec drapeau + code langue.
 * Changement instantané via i18next sans rechargement.
 * Persistance automatique dans localStorage (via i18next config).
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { COHRM_COLORS } from '../utils/constants';

// Drapeaux simples en SVG inline (évite les dépendances externes)
const FlagFR = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" style={{ borderRadius: 2, display: 'block' }}>
    <rect width="7" height="14" fill="#002395" />
    <rect x="7" width="6" height="14" fill="#FFFFFF" />
    <rect x="13" width="7" height="14" fill="#ED2939" />
  </svg>
);

const FlagEN = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" style={{ borderRadius: 2, display: 'block' }}>
    <rect width="20" height="14" fill="#012169" />
    <path d="M0,0 L20,14 M20,0 L0,14" stroke="#FFFFFF" strokeWidth="2.5" />
    <path d="M0,0 L20,14 M20,0 L0,14" stroke="#C8102E" strokeWidth="1.5" />
    <path d="M10,0 V14 M0,7 H20" stroke="#FFFFFF" strokeWidth="4" />
    <path d="M10,0 V14 M0,7 H20" stroke="#C8102E" strokeWidth="2.5" />
  </svg>
);

const LanguageSwitcher = ({ isDark }) => {
  const { i18n } = useTranslation('cohrm');
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'fr';

  const languages = [
    { code: 'fr', label: 'Français', shortLabel: 'FR', Flag: FlagFR },
    { code: 'en', label: 'English', shortLabel: 'EN', Flag: FlagEN },
  ];

  const currentLangObj = languages.find(l => l.code === currentLang) || languages[0];
  const otherLang = languages.find(l => l.code !== currentLang);

  const switchLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  const s = {
    container: {
      position: 'relative',
    },
    toggle: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 10px',
      borderRadius: 8,
      border: isDark ? '1px solid #475569' : '1px solid #E5E7EB',
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#fff',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? '#e2e8f0' : '#374151',
      transition: 'all 0.15s',
      outline: 'none',
    },
    toggleHover: {
      borderColor: COHRM_COLORS.primaryLight,
    },
    dropdown: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      right: 0,
      minWidth: 150,
      borderRadius: 10,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #475569' : '1px solid #E5E7EB',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      zIndex: 1000,
      overflow: 'hidden',
      animation: 'fadeIn 0.15s ease-out',
    },
    option: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 14px',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: isActive ? 600 : 400,
      color: isActive
        ? COHRM_COLORS.primaryLight
        : (isDark ? '#e2e8f0' : '#374151'),
      backgroundColor: isActive
        ? (isDark ? 'rgba(41, 128, 185, 0.1)' : '#EBF5FB')
        : 'transparent',
      transition: 'background-color 0.1s',
      border: 'none',
      width: '100%',
      textAlign: 'left',
    }),
    checkmark: {
      marginLeft: 'auto',
      fontSize: 14,
      color: COHRM_COLORS.primaryLight,
    },
    chevron: {
      width: 0,
      height: 0,
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      borderTop: `4px solid ${isDark ? '#94a3b8' : '#6B7280'}`,
      transition: 'transform 0.15s',
      transform: isOpen ? 'rotate(180deg)' : 'none',
    },
  };

  return (
    <div style={s.container}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <button
        style={s.toggle}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = COHRM_COLORS.primaryLight; }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = isDark ? '#475569' : '#E5E7EB';
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <currentLangObj.Flag />
        <span>{currentLangObj.shortLabel}</span>
        <div style={s.chevron} />
      </button>

      {isOpen && (
        <div style={s.dropdown}>
          {languages.map(({ code, label, Flag }) => {
            const isActive = code === currentLang;
            return (
              <button
                key={code}
                style={s.option(isActive)}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => switchLanguage(code)}
              >
                <Flag />
                <span>{label}</span>
                {isActive && <span style={s.checkmark}>&#10003;</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
