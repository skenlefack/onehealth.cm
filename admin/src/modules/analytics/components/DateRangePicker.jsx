import React, { useState } from 'react';

const PERIODS = [
  { value: 'today', label: "Aujourd'hui" },
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '90 jours' },
  { value: 'custom', label: 'Personnalisé' },
];

const DateRangePicker = ({ period, onPeriodChange, onCustomRange, isDark }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handlePeriodClick = (p) => {
    if (p === 'custom') {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onPeriodChange(p);
    }
  };

  const handleApplyCustom = () => {
    if (startDate && endDate) {
      onCustomRange(startDate, endDate);
    }
  };

  const s = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
    },
    pill: (isActive) => ({
      padding: '6px 14px',
      borderRadius: 20,
      border: 'none',
      cursor: 'pointer',
      fontSize: 13,
      fontWeight: isActive ? 600 : 400,
      backgroundColor: isActive ? '#8B5CF6' : isDark ? '#334155' : '#F3F4F6',
      color: isActive ? '#fff' : isDark ? '#CBD5E1' : '#4B5563',
      transition: 'all 0.15s',
    }),
    dateInput: {
      padding: '5px 10px',
      borderRadius: 8,
      border: isDark ? '1px solid #475569' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      color: isDark ? '#e2e8f0' : '#1f2937',
      fontSize: 13,
    },
    applyBtn: {
      padding: '5px 12px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: '#8B5CF6',
      color: '#fff',
      fontSize: 13,
      cursor: 'pointer',
      fontWeight: 600,
    },
  };

  return (
    <div style={s.container}>
      {PERIODS.map((p) => (
        <button
          key={p.value}
          style={s.pill(period === p.value)}
          onClick={() => handlePeriodClick(p.value)}
        >
          {p.label}
        </button>
      ))}
      {showCustom && (
        <>
          <input type="date" style={s.dateInput} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span style={{ color: isDark ? '#94a3b8' : '#6B7280', fontSize: 13 }}>→</span>
          <input type="date" style={s.dateInput} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <button style={s.applyBtn} onClick={handleApplyCustom}>Appliquer</button>
        </>
      )}
    </div>
  );
};

export default DateRangePicker;
