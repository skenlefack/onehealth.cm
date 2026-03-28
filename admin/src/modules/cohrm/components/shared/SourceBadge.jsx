/**
 * SourceBadge - Badge pour la source d'une rumeur
 */

import React from 'react';
import {
  Phone, MapPin, MessageCircle, Smartphone, Globe, Radar, Share2, Radio, AlertCircle,
} from 'lucide-react';
import { formatSource } from '../../utils/formatters';

const SOURCE_ICONS = {
  direct: Phone,
  field: MapPin,
  sms: MessageCircle,
  mobile: Smartphone,
  web: Globe,
  scanner: Radar,
  social_media: Share2,
  media: Radio,
};

const SOURCE_COLORS = {
  direct: '#3498DB',
  field: '#27AE60',
  sms: '#9B59B6',
  mobile: '#E67E22',
  web: '#1ABC9C',
  scanner: '#E74C3C',
  social_media: '#2980B9',
  media: '#F39C12',
};

const SourceBadge = ({ source, size = 'md' }) => {
  const info = formatSource(source);
  const Icon = SOURCE_ICONS[source] || AlertCircle;
  const color = SOURCE_COLORS[source] || '#95A5A6';

  const sizes = {
    sm: { fontSize: 11, padding: '2px 8px', iconSize: 12, gap: 4 },
    md: { fontSize: 12, padding: '4px 10px', iconSize: 14, gap: 5 },
    lg: { fontSize: 14, padding: '6px 14px', iconSize: 16, gap: 6 },
  };

  const s = sizes[size] || sizes.md;

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: s.gap,
    padding: s.padding,
    borderRadius: 20,
    fontSize: s.fontSize,
    fontWeight: 500,
    color: color,
    backgroundColor: `${color}10`,
    border: `1px solid ${color}20`,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  };

  return (
    <span style={style}>
      <Icon size={s.iconSize} />
      {info.label}
    </span>
  );
};

export default SourceBadge;
