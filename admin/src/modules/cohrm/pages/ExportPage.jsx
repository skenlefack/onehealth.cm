/**
 * ExportPage - Page d'export des donnees COHRM
 *
 * Fonctionnalites :
 * - Selection du format (JSON ou CSV)
 * - Filtres par statut et plage de dates
 * - Selection des colonnes a exporter
 * - Previsualisation des donnees (5 premieres lignes)
 * - Export JSON (telechargement blob) ou CSV (nouvel onglet)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download, FileText, FileJson, Filter, Calendar,
  CheckSquare, Square, Eye, Loader, RefreshCw,
  Table, AlertCircle,
} from 'lucide-react';
import { exportData, exportPreview, downloadCSV } from '../services/cohrmApi';
import { COHRM_COLORS, STATUS_OPTIONS } from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/formatters';
import { LoadingSpinner, EmptyState } from '../components/shared';
import { toast } from 'react-toastify';

// ============================================
// COLONNES DISPONIBLES POUR L'EXPORT
// ============================================
const EXPORT_COLUMNS = [
  { key: 'code', label: 'Code reference' },
  { key: 'title', label: 'Titre' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Statut' },
  { key: 'priority', label: 'Priorite' },
  { key: 'source', label: 'Source' },
  { key: 'region', label: 'Region' },
  { key: 'location', label: 'Localisation' },
  { key: 'species', label: 'Espece' },
  { key: 'symptoms', label: 'Symptomes' },
  { key: 'affected_count', label: 'Cas signales' },
  { key: 'deaths_count', label: 'Deces' },
  { key: 'risk_level', label: 'Niveau de risque' },
  { key: 'reporter_name', label: 'Rapporteur' },
  { key: 'reporter_phone', label: 'Telephone' },
  { key: 'created_at', label: 'Date de creation' },
  { key: 'updated_at', label: 'Derniere mise a jour' },
];

/**
 * @param {object} props
 * @param {boolean} props.isDark - Mode sombre
 * @param {object} props.user - Utilisateur connecte
 */
const ExportPage = ({ isDark, user }) => {
  // ============================================
  // STATE
  // ============================================
  const [format, setFormat] = useState('json');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedColumns, setSelectedColumns] = useState(
    EXPORT_COLUMNS.map((col) => col.key)
  );
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hoveredFormat, setHoveredFormat] = useState(null);
  const [hoveredColumn, setHoveredColumn] = useState(null);

  // ============================================
  // STYLES
  // ============================================
  const styles = {
    container: {
      padding: '0 0 40px 0',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 28,
    },
    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      background: `linear-gradient(135deg, ${COHRM_COLORS.primary}, ${COHRM_COLORS.primaryLight})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 700,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
      margin: 0,
    },
    headerSubtitle: {
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      marginTop: 2,
    },
    card: {
      backgroundColor: isDark ? COHRM_COLORS.darkCard : '#FFFFFF',
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#E5E7EB'}`,
      borderRadius: 12,
      padding: 24,
      marginBottom: 20,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: 600,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    formatRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
      marginBottom: 20,
    },
    formatCard: (isSelected, isHovered) => ({
      backgroundColor: isSelected
        ? isDark
          ? `${COHRM_COLORS.primary}20`
          : `${COHRM_COLORS.primary}08`
        : isDark
          ? COHRM_COLORS.darkCard
          : '#FFFFFF',
      border: `2px solid ${
        isSelected
          ? COHRM_COLORS.primaryLight
          : isHovered
            ? isDark
              ? COHRM_COLORS.darkBorder
              : '#D1D5DB'
            : isDark
              ? COHRM_COLORS.darkBorder
              : '#E5E7EB'
      }`,
      borderRadius: 12,
      padding: 20,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      transform: isHovered ? 'translateY(-1px)' : 'none',
    }),
    formatIconWrapper: (isSelected) => ({
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: isSelected
        ? isDark
          ? `${COHRM_COLORS.primaryLight}30`
          : `${COHRM_COLORS.primaryLight}15`
        : isDark
          ? `${COHRM_COLORS.darkBorder}`
          : '#F3F4F6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }),
    formatLabel: (isSelected) => ({
      fontSize: 16,
      fontWeight: 600,
      color: isSelected
        ? COHRM_COLORS.primaryLight
        : isDark
          ? COHRM_COLORS.darkText
          : '#1f2937',
      marginBottom: 2,
    }),
    formatDesc: {
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 16,
      alignItems: 'end',
    },
    fieldLabel: {
      display: 'block',
      fontSize: 13,
      fontWeight: 500,
      color: isDark ? COHRM_COLORS.darkMuted : '#374151',
      marginBottom: 6,
    },
    select: {
      width: '100%',
      padding: '9px 12px',
      borderRadius: 8,
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#D1D5DB'}`,
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#FFFFFF',
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
      fontSize: 14,
      outline: 'none',
      appearance: 'auto',
    },
    input: {
      width: '100%',
      padding: '9px 12px',
      borderRadius: 8,
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#D1D5DB'}`,
      backgroundColor: isDark ? COHRM_COLORS.darkBg : '#FFFFFF',
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
      fontSize: 14,
      outline: 'none',
      boxSizing: 'border-box',
    },
    resetButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '9px 16px',
      borderRadius: 8,
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#D1D5DB'}`,
      backgroundColor: 'transparent',
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
      marginTop: 16,
    },
    columnsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 8,
    },
    columnCheckbox: (isSelected, isHovered) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      borderRadius: 8,
      backgroundColor: isSelected
        ? isDark
          ? `${COHRM_COLORS.primaryLight}15`
          : `${COHRM_COLORS.primary}06`
        : isHovered
          ? isDark
            ? `${COHRM_COLORS.darkBorder}50`
            : '#F9FAFB'
          : 'transparent',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease',
      userSelect: 'none',
    }),
    columnLabel: (isSelected) => ({
      fontSize: 13,
      color: isSelected
        ? isDark
          ? COHRM_COLORS.darkText
          : '#1f2937'
        : isDark
          ? COHRM_COLORS.darkMuted
          : '#6B7280',
      fontWeight: isSelected ? 500 : 400,
    }),
    selectAllRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    selectAllButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      borderRadius: 6,
      border: 'none',
      backgroundColor: isDark ? `${COHRM_COLORS.primaryLight}20` : `${COHRM_COLORS.primary}08`,
      color: COHRM_COLORS.primaryLight,
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
    },
    selectedCount: {
      fontSize: 13,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
    },
    previewButton: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 20px',
      borderRadius: 8,
      border: `1px solid ${COHRM_COLORS.primaryLight}`,
      backgroundColor: 'transparent',
      color: COHRM_COLORS.primaryLight,
      fontSize: 14,
      fontWeight: 500,
      cursor: 'pointer',
      marginBottom: 16,
    },
    previewTable: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13,
    },
    previewTh: {
      textAlign: 'left',
      padding: '10px 12px',
      borderBottom: `2px solid ${isDark ? COHRM_COLORS.darkBorder : '#E5E7EB'}`,
      color: isDark ? COHRM_COLORS.darkMuted : '#6B7280',
      fontWeight: 600,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap',
    },
    previewTd: {
      padding: '10px 12px',
      borderBottom: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#F3F4F6'}`,
      color: isDark ? COHRM_COLORS.darkText : '#1f2937',
      maxWidth: 200,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    exportButton: (disabled) => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: '14px 32px',
      borderRadius: 10,
      border: 'none',
      background: disabled
        ? isDark
          ? COHRM_COLORS.darkBorder
          : '#D1D5DB'
        : `linear-gradient(135deg, ${COHRM_COLORS.primary}, ${COHRM_COLORS.primaryLight})`,
      color: disabled
        ? isDark
          ? COHRM_COLORS.darkMuted
          : '#9CA3AF'
        : '#FFFFFF',
      fontSize: 15,
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      width: '100%',
      transition: 'opacity 0.2s ease',
      opacity: disabled ? 0.7 : 1,
    }),
    infoBar: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 14px',
      borderRadius: 8,
      backgroundColor: isDark ? `${COHRM_COLORS.info}15` : `${COHRM_COLORS.info}10`,
      color: isDark ? '#93c5fd' : COHRM_COLORS.info,
      fontSize: 13,
      marginBottom: 16,
    },
    tableWrapper: {
      overflowX: 'auto',
      borderRadius: 8,
      border: `1px solid ${isDark ? COHRM_COLORS.darkBorder : '#E5E7EB'}`,
    },
  };

  // ============================================
  // HANDLERS
  // ============================================

  const buildFilterParams = useCallback(() => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    return params;
  }, [statusFilter, dateFrom, dateTo]);

  const handleResetFilters = () => {
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
    setPreviewData(null);
    setTotalCount(0);
  };

  const toggleColumn = (key) => {
    setSelectedColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleAllColumns = () => {
    if (selectedColumns.length === EXPORT_COLUMNS.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(EXPORT_COLUMNS.map((col) => col.key));
    }
  };

  const allSelected = selectedColumns.length === EXPORT_COLUMNS.length;

  const handlePreview = async () => {
    setPreviewLoading(true);
    try {
      const params = buildFilterParams();
      const response = await exportPreview(params);
      if (response.success) {
        const data = response.data || [];
        setPreviewData(data.slice(0, 5));
        setTotalCount(data.length);
        if (data.length === 0) {
          toast.info('Aucune donnee ne correspond aux filtres selectionnes.');
        }
      } else {
        toast.error('Erreur lors de la previsualisation.');
      }
    } catch (err) {
      console.error('Preview error:', err);
      toast.error(err.message || 'Erreur lors de la previsualisation.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      toast.warning('Veuillez selectionner au moins une colonne.');
      return;
    }

    setExportLoading(true);
    try {
      const params = {
        ...buildFilterParams(),
        format,
      };

      if (format === 'csv') {
        await downloadCSV(params);
        toast.success('Export CSV lance dans un nouvel onglet.');
      } else {
        const response = await exportPreview(params);
        if (response.success) {
          const data = response.data || [];
          if (data.length === 0) {
            toast.info('Aucune donnee a exporter.');
            setExportLoading(false);
            return;
          }

          // Filtrer les colonnes selectionnees
          const filteredData = data.map((row) => {
            const filteredRow = {};
            selectedColumns.forEach((key) => {
              filteredRow[key] = row[key] !== undefined ? row[key] : '';
            });
            return filteredRow;
          });

          // Creer et telecharger le blob JSON
          const blob = new Blob(
            [JSON.stringify(filteredData, null, 2)],
            { type: 'application/json' }
          );
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const now = new Date();
          const dateStr = now.toISOString().slice(0, 10);
          link.download = `cohrm-export-${dateStr}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success(`${filteredData.length} lignes exportees en JSON.`);
        } else {
          toast.error('Erreur lors de l\'export.');
        }
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error(err.message || 'Erreur lors de l\'export.');
    } finally {
      setExportLoading(false);
    }
  };

  // Format cell value for preview
  const formatCellValue = (key, value) => {
    if (value === null || value === undefined || value === '') return '\u2014';
    if (key === 'created_at' || key === 'updated_at') return formatDateTime(value);
    if (key === 'status') {
      const found = STATUS_OPTIONS.find((s) => s.value === value);
      return found ? found.label : value;
    }
    return String(value);
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Download size={22} color="#FFFFFF" />
        </div>
        <div>
          <h1 style={styles.headerTitle}>Export des donnees</h1>
          <div style={styles.headerSubtitle}>
            Exportez les rumeurs COHRM au format JSON ou CSV
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* SECTION 1 : FORMAT SELECTION   */}
      {/* ============================== */}
      <div style={styles.formatRow}>
        {/* JSON Card */}
        <div
          style={styles.formatCard(format === 'json', hoveredFormat === 'json')}
          onClick={() => setFormat('json')}
          onMouseEnter={() => setHoveredFormat('json')}
          onMouseLeave={() => setHoveredFormat(null)}
        >
          <div style={styles.formatIconWrapper(format === 'json')}>
            <FileJson
              size={24}
              color={
                format === 'json'
                  ? COHRM_COLORS.primaryLight
                  : isDark
                    ? COHRM_COLORS.darkMuted
                    : '#9CA3AF'
              }
            />
          </div>
          <div>
            <div style={styles.formatLabel(format === 'json')}>JSON</div>
            <div style={styles.formatDesc}>
              Format structure, ideal pour l'analyse
            </div>
          </div>
        </div>

        {/* CSV Card */}
        <div
          style={styles.formatCard(format === 'csv', hoveredFormat === 'csv')}
          onClick={() => setFormat('csv')}
          onMouseEnter={() => setHoveredFormat('csv')}
          onMouseLeave={() => setHoveredFormat(null)}
        >
          <div style={styles.formatIconWrapper(format === 'csv')}>
            <FileText
              size={24}
              color={
                format === 'csv'
                  ? COHRM_COLORS.primaryLight
                  : isDark
                    ? COHRM_COLORS.darkMuted
                    : '#9CA3AF'
              }
            />
          </div>
          <div>
            <div style={styles.formatLabel(format === 'csv')}>CSV</div>
            <div style={styles.formatDesc}>
              Compatible Excel et tableurs
            </div>
          </div>
        </div>
      </div>

      {/* ============================== */}
      {/* SECTION 2 : FILTERS            */}
      {/* ============================== */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          <Filter size={16} color={COHRM_COLORS.primaryLight} />
          Filtres
        </div>
        <div style={styles.filtersGrid}>
          {/* Status */}
          <div>
            <label style={styles.fieldLabel}>Statut</label>
            <select
              style={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div>
            <label style={styles.fieldLabel}>
              <Calendar
                size={13}
                style={{ marginRight: 4, verticalAlign: 'middle' }}
              />
              Date debut
            </label>
            <input
              type="date"
              style={styles.input}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          {/* Date to */}
          <div>
            <label style={styles.fieldLabel}>
              <Calendar
                size={13}
                style={{ marginRight: 4, verticalAlign: 'middle' }}
              />
              Date fin
            </label>
            <input
              type="date"
              style={styles.input}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Reset button */}
        {(statusFilter || dateFrom || dateTo) && (
          <button style={styles.resetButton} onClick={handleResetFilters}>
            <RefreshCw size={14} />
            Reinitialiser les filtres
          </button>
        )}
      </div>

      {/* ============================== */}
      {/* SECTION 3 : COLUMNS            */}
      {/* ============================== */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          <Table size={16} color={COHRM_COLORS.primaryLight} />
          Colonnes a exporter
        </div>

        {/* Select all / deselect all */}
        <div style={styles.selectAllRow}>
          <button style={styles.selectAllButton} onClick={toggleAllColumns}>
            {allSelected ? (
              <CheckSquare size={15} />
            ) : (
              <Square size={15} />
            )}
            {allSelected ? 'Tout deselectionner' : 'Tout selectionner'}
          </button>
          <span style={styles.selectedCount}>
            {selectedColumns.length} / {EXPORT_COLUMNS.length} colonnes
          </span>
        </div>

        {/* Columns grid */}
        <div style={styles.columnsGrid}>
          {EXPORT_COLUMNS.map((col) => {
            const isSelected = selectedColumns.includes(col.key);
            const isHovered = hoveredColumn === col.key;
            return (
              <div
                key={col.key}
                style={styles.columnCheckbox(isSelected, isHovered)}
                onClick={() => toggleColumn(col.key)}
                onMouseEnter={() => setHoveredColumn(col.key)}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                {isSelected ? (
                  <CheckSquare
                    size={16}
                    color={COHRM_COLORS.primaryLight}
                  />
                ) : (
                  <Square
                    size={16}
                    color={isDark ? COHRM_COLORS.darkMuted : '#D1D5DB'}
                  />
                )}
                <span style={styles.columnLabel(isSelected)}>
                  {col.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================== */}
      {/* SECTION 4 : PREVIEW            */}
      {/* ============================== */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          <Eye size={16} color={COHRM_COLORS.primaryLight} />
          Previsualisation
        </div>

        <button
          style={{
            ...styles.previewButton,
            opacity: previewLoading ? 0.7 : 1,
            cursor: previewLoading ? 'not-allowed' : 'pointer',
          }}
          onClick={handlePreview}
          disabled={previewLoading}
        >
          {previewLoading ? (
            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Eye size={16} />
          )}
          {previewLoading ? 'Chargement...' : 'Previsualiser'}
        </button>

        {/* Preview info bar */}
        {previewData && totalCount > 0 && (
          <div style={styles.infoBar}>
            <AlertCircle size={15} />
            {totalCount} ligne{totalCount > 1 ? 's' : ''} correspondent aux
            filtres. Affichage des {Math.min(5, previewData.length)} premieres.
          </div>
        )}

        {/* Preview loading */}
        {previewLoading && (
          <div style={{ padding: '30px 0', textAlign: 'center' }}>
            <LoadingSpinner isDark={isDark} />
          </div>
        )}

        {/* Preview empty */}
        {previewData && previewData.length === 0 && !previewLoading && (
          <EmptyState
            isDark={isDark}
            icon={Table}
            title="Aucune donnee"
            message="Aucune rumeur ne correspond aux filtres selectionnes."
          />
        )}

        {/* Preview table */}
        {previewData && previewData.length > 0 && !previewLoading && (
          <div style={styles.tableWrapper}>
            <table style={styles.previewTable}>
              <thead>
                <tr>
                  {EXPORT_COLUMNS.filter((col) =>
                    selectedColumns.includes(col.key)
                  ).map((col) => (
                    <th key={col.key} style={styles.previewTh}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      backgroundColor:
                        idx % 2 === 0
                          ? 'transparent'
                          : isDark
                            ? `${COHRM_COLORS.darkBorder}30`
                            : '#F9FAFB',
                    }}
                  >
                    {EXPORT_COLUMNS.filter((col) =>
                      selectedColumns.includes(col.key)
                    ).map((col) => (
                      <td key={col.key} style={styles.previewTd}>
                        {formatCellValue(col.key, row[col.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No preview yet */}
        {!previewData && !previewLoading && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 0',
              color: isDark ? COHRM_COLORS.darkMuted : '#9CA3AF',
              fontSize: 13,
            }}
          >
            Cliquez sur "Previsualiser" pour voir un apercu des donnees.
          </div>
        )}
      </div>

      {/* ============================== */}
      {/* SECTION 5 : EXPORT ACTION      */}
      {/* ============================== */}
      <div style={styles.card}>
        <button
          style={styles.exportButton(
            exportLoading || selectedColumns.length === 0
          )}
          onClick={handleExport}
          disabled={exportLoading || selectedColumns.length === 0}
        >
          {exportLoading ? (
            <Loader
              size={18}
              style={{ animation: 'spin 1s linear infinite' }}
            />
          ) : (
            <Download size={18} />
          )}
          {exportLoading
            ? 'Export en cours...'
            : `Exporter${totalCount > 0 ? ` ${totalCount} lignes` : ''} en ${format.toUpperCase()}`}
        </button>

        {selectedColumns.length === 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 12,
              color: COHRM_COLORS.warning,
              fontSize: 13,
            }}
          >
            <AlertCircle size={14} />
            Veuillez selectionner au moins une colonne pour exporter.
          </div>
        )}
      </div>

      {/* Spin keyframes (injected once) */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ExportPage;
