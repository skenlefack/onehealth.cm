/**
 * LoadingSpinner - Indicateur de chargement avec texte configurable
 */

import React from 'react';
import { Loader } from 'lucide-react';
import { COHRM_COLORS } from '../../utils/constants';

const LoadingSpinner = ({ text = 'Chargement...', size = 'md', isDark = false }) => {
  const sizes = {
    sm: { iconSize: 20, fontSize: 12, padding: 20 },
    md: { iconSize: 32, fontSize: 14, padding: 40 },
    lg: { iconSize: 48, fontSize: 16, padding: 80 },
    full: { iconSize: 48, fontSize: 16, padding: 0 },
  };

  const s = sizes[size] || sizes.md;
  const isFullScreen = size === 'full';

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: s.padding,
    ...(isFullScreen ? {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      zIndex: 100,
    } : {}),
  };

  const textStyle = {
    marginTop: 12,
    fontSize: s.fontSize,
    color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
    fontWeight: 500,
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes cohrmSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <Loader
        size={s.iconSize}
        style={{
          animation: 'cohrmSpin 1s linear infinite',
          color: COHRM_COLORS.primaryLight,
        }}
      />
      {text && <div style={textStyle}>{text}</div>}
    </div>
  );
};

export default LoadingSpinner;
