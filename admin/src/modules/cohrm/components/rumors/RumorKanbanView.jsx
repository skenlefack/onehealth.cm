/**
 * RumorKanbanView - Vue Kanban avec colonnes par statut et drag & drop
 */

import React, { useState, useRef } from 'react';
import { STATUS_OPTIONS, COHRM_COLORS } from '../../utils/constants';
import RumorCard from './RumorCard';
import { LoadingSpinner, EmptyState } from '../shared';

const RumorKanbanView = ({
  rumors = [],
  loading = false,
  onStatusChange,
  onRumorClick,
  isDark = false,
}) => {
  const [draggedRumor, setDraggedRumor] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const dragCounterRef = useRef({});

  // Grouper les rumeurs par statut
  const columns = STATUS_OPTIONS.map(status => ({
    ...status,
    rumors: rumors.filter(r => r.status === status.value),
  }));

  const handleDragStart = (e, rumor) => {
    setDraggedRumor(rumor);
    e.dataTransfer.effectAllowed = 'move';
    // Nécessaire pour Firefox
    e.dataTransfer.setData('text/plain', rumor.id);
  };

  const handleDragEnd = () => {
    setDraggedRumor(null);
    setDragOverColumn(null);
    dragCounterRef.current = {};
  };

  const handleDragEnter = (e, statusValue) => {
    e.preventDefault();
    if (!dragCounterRef.current[statusValue]) {
      dragCounterRef.current[statusValue] = 0;
    }
    dragCounterRef.current[statusValue]++;
    setDragOverColumn(statusValue);
  };

  const handleDragLeave = (statusValue) => {
    if (dragCounterRef.current[statusValue]) {
      dragCounterRef.current[statusValue]--;
    }
    if (dragCounterRef.current[statusValue] <= 0) {
      if (dragOverColumn === statusValue) {
        setDragOverColumn(null);
      }
      dragCounterRef.current[statusValue] = 0;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    dragCounterRef.current = {};
    if (draggedRumor && draggedRumor.status !== newStatus) {
      onStatusChange && onStatusChange(draggedRumor.id, newStatus);
    }
    setDraggedRumor(null);
  };

  const s = {
    container: {
      display: 'flex',
      gap: 12,
      overflowX: 'auto',
      padding: '4px 0 16px',
      minHeight: 400,
    },
    column: (color, isOver) => ({
      flex: '1 0 260px',
      minWidth: 260,
      maxWidth: 320,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 12,
      backgroundColor: isDark
        ? (isOver ? '#1e293b' : '#0f172a')
        : (isOver ? '#F0F4FF' : '#F9FAFB'),
      border: isOver
        ? `2px dashed ${color}`
        : (isDark ? '1px solid #334155' : '1px solid #E5E7EB'),
      transition: 'all 0.2s',
    }),
    columnHeader: (color) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 14px',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    }),
    columnTitle: (color) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#374151',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
    }),
    dot: (color) => ({
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: color,
    }),
    count: {
      fontSize: 12,
      fontWeight: 600,
      color: isDark ? '#94a3b8' : '#6B7280',
      backgroundColor: isDark ? '#334155' : '#E5E7EB',
      padding: '2px 8px',
      borderRadius: 10,
    },
    cardList: {
      flex: 1,
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 320px)',
    },
    emptyColumn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
      fontSize: 13,
      color: isDark ? '#64748b' : '#9CA3AF',
      fontStyle: 'italic',
    },
  };

  if (loading) {
    return <LoadingSpinner isDark={isDark} size="lg" />;
  }

  if (!rumors || rumors.length === 0) {
    return <EmptyState variant="empty" message="Aucune rumeur à afficher en mode Kanban" isDark={isDark} />;
  }

  return (
    <div style={s.container}>
      {columns.map((col) => {
        const isOver = dragOverColumn === col.value && draggedRumor?.status !== col.value;
        return (
          <div
            key={col.value}
            style={s.column(col.color, isOver)}
            onDragEnter={(e) => handleDragEnter(e, col.value)}
            onDragLeave={() => handleDragLeave(col.value)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.value)}
          >
            <div style={s.columnHeader(col.color)}>
              <div style={s.columnTitle(col.color)}>
                <span style={s.dot(col.color)} />
                {col.label}
              </div>
              <span style={s.count}>{col.rumors.length}</span>
            </div>

            <div style={s.cardList}>
              {col.rumors.length === 0 ? (
                <div style={s.emptyColumn}>
                  {draggedRumor ? 'Déposer ici' : 'Aucune rumeur'}
                </div>
              ) : (
                col.rumors.map((rumor) => (
                  <RumorCard
                    key={rumor.id}
                    rumor={rumor}
                    isDark={isDark}
                    compact
                    draggable
                    onClick={onRumorClick}
                    onDragStart={(e) => handleDragStart(e, rumor)}
                    onDragEnd={handleDragEnd}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RumorKanbanView;
