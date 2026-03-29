/**
 * RumorsList - Page principale de gestion des rumeurs
 * 3 modes : Tableau, Carte, Kanban
 * Actions en masse, filtres avancés, export
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus, Table, Map, Columns, Download, Trash2,
  RefreshCw, MoreHorizontal, ArrowUpDown,
} from 'lucide-react';
import useCohrmStore from '../stores/cohrmStore';
import { usePermissions } from '../hooks/usePermissions';
import { updateRumor, deleteRumor } from '../services/cohrmApi';
import { RumorFilters, RumorKanbanView, RumorMapView } from '../components/rumors';
import {
  DataTable,
  StatusBadge,
  PriorityBadge,
  RiskBadge,
  SourceBadge,
  ConfirmModal,
  LoadingSpinner,
} from '../components/shared';
import { formatRelativeDate, truncateText } from '../utils/formatters';
import { STATUS_OPTIONS, COHRM_COLORS } from '../utils/constants';
import { toast } from 'react-toastify';

// Clé localStorage pour le mode d'affichage
const VIEW_MODE_KEY = 'cohrm_rumors_view_mode';

const VIEW_MODES = [
  { id: 'table', label: 'Tableau', icon: Table },
  { id: 'map', label: 'Carte', icon: Map },
  { id: 'kanban', label: 'Kanban', icon: Columns },
];

const RumorsList = ({ isDark = false, user }) => {
  const {
    rumors,
    loading,
    pagination,
    filters,
    fetchRumors,
    setFilters,
    setPage,
    resetFilters,
    navigateToRumor,
    navigateToRumorEdit,
    setActivePage,
  } = useCohrmStore();

  const { canDelete, canEdit } = usePermissions(user);

  // État local
  const [viewMode, setViewMode] = useState(() => {
    try { return localStorage.getItem(VIEW_MODE_KEY) || 'table'; }
    catch { return 'table'; }
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // null = bulk, id = single
  const [actionLoading, setActionLoading] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [bulkStatusMenu, setBulkStatusMenu] = useState(false);

  // Charger les rumeurs au montage
  useEffect(() => {
    fetchRumors();
  }, []); // eslint-disable-line

  // Persister le mode de vue
  const handleViewChange = useCallback((mode) => {
    setViewMode(mode);
    try { localStorage.setItem(VIEW_MODE_KEY, mode); }
    catch { /* ignore */ }
  }, []);

  // Navigation vers détail
  const handleRumorClick = useCallback((rumor) => {
    navigateToRumor(rumor.id);
  }, [navigateToRumor]);

  // Suppression simple
  const handleDeleteClick = (e, rumorId) => {
    e.stopPropagation();
    setDeleteTarget(rumorId);
    setShowDeleteModal(true);
  };

  // Suppression confirmée
  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      if (deleteTarget) {
        // Suppression unique
        await deleteRumor(deleteTarget);
        toast.success('Rumeur supprimée');
      } else {
        // Suppression en masse
        await Promise.all(selectedIds.map(id => deleteRumor(id)));
        toast.success(`${selectedIds.length} rumeur(s) supprimée(s)`);
        setSelectedIds([]);
      }
      fetchRumors();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la suppression');
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // Changement de statut (kanban drag)
  const handleStatusChange = async (rumorId, newStatus) => {
    try {
      await updateRumor(rumorId, { status: newStatus });
      toast.success('Statut mis à jour');
      fetchRumors();
    } catch (err) {
      toast.error(err.message || 'Erreur lors du changement de statut');
    }
  };

  // Changement de statut en masse
  const handleBulkStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      await Promise.all(selectedIds.map(id => updateRumor(id, { status: newStatus })));
      toast.success(`Statut mis à jour pour ${selectedIds.length} rumeur(s)`);
      setSelectedIds([]);
      setBulkStatusMenu(false);
      setShowBulkMenu(false);
      fetchRumors();
    } catch (err) {
      toast.error(err.message || 'Erreur lors du changement de statut');
    } finally {
      setActionLoading(false);
    }
  };

  // Export sélection (CSV simple)
  const handleExportSelection = () => {
    const selected = rumors.filter(r => selectedIds.includes(r.id));
    const headers = ['ID', 'Code', 'Titre', 'Statut', 'Priorité', 'Source', 'Région', 'Date'];
    const rows = selected.map(r => [
      r.id, r.code || '', r.title, r.status, r.priority, r.source, r.region, r.created_at
    ]);
    const csv = [headers, ...rows].map(row => row.map(c => `"${(c || '').toString().replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rumeurs_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${selected.length} rumeur(s) exportée(s)`);
    setShowBulkMenu(false);
  };

  // Colonnes du tableau
  const columns = [
    {
      key: 'id',
      label: 'ID',
      width: 60,
      sortable: true,
      render: (val) => (
        <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#94a3b8' : '#6B7280' }}>
          #{val}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Titre',
      sortable: true,
      render: (val, row) => (
        <div>
          {row.code && (
            <div style={{ fontSize: 11, color: COHRM_COLORS.primaryLight, fontWeight: 500, marginBottom: 2 }}>
              {row.code}
            </div>
          )}
          <div style={{ fontWeight: 500, color: isDark ? '#e2e8f0' : '#1f2937' }}>
            {truncateText(val, 50)}
          </div>
        </div>
      ),
    },
    {
      key: 'source',
      label: 'Source',
      width: 130,
      sortable: true,
      render: (val) => <SourceBadge source={val} size="sm" />,
    },
    {
      key: 'region',
      label: 'Région',
      width: 120,
      sortable: true,
      render: (val) => (
        <span style={{ fontSize: 13 }}>{val || '—'}</span>
      ),
    },
    {
      key: 'priority',
      label: 'Priorité',
      width: 100,
      sortable: true,
      render: (val) => <PriorityBadge priority={val} size="sm" />,
    },
    {
      key: 'risk_level',
      label: 'Risque',
      width: 100,
      sortable: true,
      render: (val) => <RiskBadge riskLevel={val} size="sm" />,
    },
    {
      key: 'status',
      label: 'Statut',
      width: 130,
      sortable: true,
      render: (val) => <StatusBadge status={val} size="sm" />,
    },
    {
      key: 'created_at',
      label: 'Date',
      width: 100,
      sortable: true,
      render: (val) => (
        <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6B7280' }}>
          {formatRelativeDate(val)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 120,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
          <button
            style={s.actionBtn}
            title="Voir"
            onClick={() => navigateToRumor(row.id)}
          >
            Voir
          </button>
          {canEdit('rumors') && (
            <button
              style={s.actionBtn}
              title="Modifier"
              onClick={() => navigateToRumorEdit(row.id)}
            >
              Mod.
            </button>
          )}
          {canDelete('rumors') && (
            <button
              style={{ ...s.actionBtn, color: '#E74C3C' }}
              title="Supprimer"
              onClick={(e) => handleDeleteClick(e, row.id)}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ),
    },
  ];

  // Styles
  const s = {
    page: {
      padding: 0,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 20,
    },
    titleSection: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    newBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 18px',
      borderRadius: 10,
      border: 'none',
      background: `linear-gradient(135deg, ${COHRM_COLORS.primary} 0%, ${COHRM_COLORS.primaryLight} 100%)`,
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontFamily: 'inherit',
    },
    refreshBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 38,
      height: 38,
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: 'transparent',
      color: isDark ? '#94a3b8' : '#6B7280',
      cursor: 'pointer',
    },
    viewToggle: {
      display: 'flex',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      overflow: 'hidden',
    },
    viewBtn: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '8px 14px',
      border: 'none',
      backgroundColor: isActive
        ? (isDark ? COHRM_COLORS.primary : COHRM_COLORS.primary)
        : 'transparent',
      color: isActive ? '#fff' : (isDark ? '#94a3b8' : '#6B7280'),
      fontSize: 13,
      fontWeight: isActive ? 600 : 400,
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontFamily: 'inherit',
    }),
    bulkBar: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 16px',
      marginBottom: 12,
      borderRadius: 10,
      backgroundColor: isDark ? '#1B4F7215' : '#EBF5FB',
      border: `1px solid ${isDark ? '#1B4F7240' : '#BDD8F1'}`,
    },
    bulkText: {
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? '#93c5fd' : COHRM_COLORS.primary,
    },
    bulkBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '6px 12px',
      borderRadius: 6,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: 'transparent',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
    bulkDeleteBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '6px 12px',
      borderRadius: 6,
      border: '1px solid #FCA5A5',
      backgroundColor: '#FEE2E2',
      color: '#DC2626',
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
    statusDropdown: {
      position: 'relative',
      display: 'inline-block',
    },
    statusMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      zIndex: 100,
      marginTop: 4,
      minWidth: 180,
      borderRadius: 10,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      padding: 4,
    },
    statusMenuItem: (color) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      width: '100%',
      padding: '8px 12px',
      borderRadius: 6,
      border: 'none',
      backgroundColor: 'transparent',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      cursor: 'pointer',
      textAlign: 'left',
      fontFamily: 'inherit',
    }),
    statusDot: (color) => ({
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: color,
      flexShrink: 0,
    }),
    actionBtn: {
      padding: '4px 8px',
      borderRadius: 4,
      border: 'none',
      backgroundColor: 'transparent',
      color: COHRM_COLORS.primaryLight,
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      fontFamily: 'inherit',
    },
  };

  return (
    <div style={s.page}>
      {/* En-tête */}
      <div style={s.header}>
        <div style={s.titleSection}>
          <h1 style={s.pageTitle}>Rumeurs</h1>
        </div>

        <div style={s.headerActions}>
          {/* Toggle vue */}
          <div style={s.viewToggle}>
            {VIEW_MODES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                style={s.viewBtn(viewMode === id)}
                onClick={() => handleViewChange(id)}
                title={label}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <button
            style={s.refreshBtn}
            onClick={() => fetchRumors()}
            title="Rafraîchir"
          >
            <RefreshCw size={16} />
          </button>

          <button
            style={s.newBtn}
            onClick={() => setActivePage('rumor-create')}
          >
            <Plus size={16} />
            Nouvelle Rumeur
          </button>
        </div>
      </div>

      {/* Filtres */}
      <RumorFilters
        filters={filters}
        onFilterChange={setFilters}
        onReset={resetFilters}
        totalResults={pagination?.total || 0}
        isDark={isDark}
      />

      {/* Barre actions en masse */}
      {selectedIds.length > 0 && viewMode === 'table' && (
        <div style={s.bulkBar}>
          <span style={s.bulkText}>
            {selectedIds.length} sélectionnée{selectedIds.length > 1 ? 's' : ''}
          </span>

          <button style={s.bulkBtn} onClick={handleExportSelection}>
            <Download size={13} />
            Exporter
          </button>

          {/* Changer statut en masse */}
          <div style={s.statusDropdown}>
            <button
              style={s.bulkBtn}
              onClick={() => setBulkStatusMenu(!bulkStatusMenu)}
            >
              <ArrowUpDown size={13} />
              Changer statut
            </button>
            {bulkStatusMenu && (
              <div style={s.statusMenu}>
                {STATUS_OPTIONS.map((st) => (
                  <button
                    key={st.value}
                    style={s.statusMenuItem(st.color)}
                    onClick={() => handleBulkStatusChange(st.value)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F3F4F6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={s.statusDot(st.color)} />
                    {st.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {canDelete('rumors') && (
            <button
              style={s.bulkDeleteBtn}
              onClick={() => {
                setDeleteTarget(null);
                setShowDeleteModal(true);
              }}
            >
              <Trash2 size={13} />
              Supprimer
            </button>
          )}

          <button
            style={{ ...s.bulkBtn, marginLeft: 'auto' }}
            onClick={() => setSelectedIds([])}
          >
            <span style={{ fontSize: 11 }}>Tout désélectionner</span>
          </button>
        </div>
      )}

      {/* Contenu selon le mode */}
      {viewMode === 'table' && (
        <DataTable
          columns={columns}
          data={rumors}
          loading={loading}
          pagination={pagination}
          onPageChange={setPage}
          onRowClick={handleRumorClick}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          isDark={isDark}
          emptyMessage="Aucune rumeur ne correspond à vos critères"
        />
      )}

      {viewMode === 'map' && (
        <RumorMapView
          rumors={rumors}
          loading={loading}
          onRumorClick={handleRumorClick}
          isDark={isDark}
        />
      )}

      {viewMode === 'kanban' && (
        <RumorKanbanView
          rumors={rumors}
          loading={loading}
          onStatusChange={handleStatusChange}
          onRumorClick={handleRumorClick}
          isDark={isDark}
        />
      )}

      {/* Modale de suppression */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Supprimer la rumeur"
        message={
          deleteTarget
            ? 'Êtes-vous sûr de vouloir supprimer cette rumeur ? Cette action est irréversible.'
            : `Êtes-vous sûr de vouloir supprimer ${selectedIds.length} rumeur(s) ? Cette action est irréversible.`
        }
        confirmLabel="Supprimer"
        variant="danger"
        isDark={isDark}
        loading={actionLoading}
      />
    </div>
  );
};

export default RumorsList;
