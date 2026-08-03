/**
 * DusscQuestions - Page de gestion de la banque de questions DUSS-C
 * Liste paginee avec filtres, import/export CSV
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HelpCircle, Search, Filter, Upload, Download,
  Plus, Eye, Edit, ChevronLeft, ChevronRight, X, FileUp, RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import useDusscStore from '../stores/dusscStore';
import { importQuestions, exportQuestions } from '../services/dusscApi';
import {
  QUESTION_STATUS, NIVEAU_OPTIONS, TYPE_ITEM_OPTIONS,
  MODULE_COLORS, DUSSC_COLORS,
} from '../utils/constants';

const DusscQuestions = ({ isDark = false, user }) => {
  const { t } = useTranslation('dussc');
  const {
    questions, modules, loading, pagination, filters,
    fetchQuestions, fetchModules, setFilters, setPage,
    resetFilters, navigateToQuestion, setActivePage,
  } = useDusscStore();

  // Import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState(null);
  const fileInputRef = useRef(null);

  // Local search debounce
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const searchTimer = useRef(null);

  // Charger les donnees au montage
  useEffect(() => {
    fetchQuestions();
    fetchModules();
  }, []); // eslint-disable-line

  // Recharger quand les filtres changent
  useEffect(() => {
    fetchQuestions();
  }, [filters]); // eslint-disable-line

  // Debounce search input
  const handleSearchChange = useCallback((value) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters({ search: value });
    }, 400);
  }, [setFilters]);

  // Export CSV
  const handleExport = async () => {
    try {
      const response = await exportQuestions(filters);
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dussc_questions_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(t('common.export') + ' - OK');
    } catch (err) {
      toast.error(err.message || t('common.error'));
    }
  };

  // Import CSV
  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportReport(null);
    try {
      const { data } = await importQuestions(importFile);
      const report = data.data || data;
      setImportReport(report);
      toast.success(
        t('questions.importSuccess', {
          imported: report.imported || 0,
          skipped: report.skipped || 0,
          errors: report.errors || 0,
        })
      );
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || t('common.error'));
    } finally {
      setImporting(false);
    }
  };

  // Close import modal
  const closeImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
    setImportReport(null);
  };

  // Truncate text helper
  const truncate = (text, max = 80) => {
    if (!text) return '—';
    return text.length > max ? text.substring(0, max) + '...' : text;
  };

  // Find module label
  const getModuleLabel = (code) => {
    const mod = modules.find((m) => m.code === code);
    return mod ? mod.code : code || '—';
  };

  // Status badge
  const getStatusConfig = (status) => {
    return QUESTION_STATUS[status] || { label: status, color: '#95A5A6' };
  };

  // Niveau badge
  const getNiveauConfig = (niveau) => {
    return NIVEAU_OPTIONS.find((n) => n.value === niveau) || { label: niveau, color: '#95A5A6' };
  };

  // Type label
  const getTypeLabel = (type) => {
    const opt = TYPE_ITEM_OPTIONS.find((t) => t.value === type);
    return opt ? opt.label : type || '—';
  };

  // Pagination helpers
  const totalPages = pagination.pages || Math.ceil((pagination.total || 0) / (pagination.limit || 20));
  const currentPage = filters.page || pagination.page || 1;

  // ─── Styles ───
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
      flexDirection: 'column',
      gap: 4,
    },
    titleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    },
    pageTitle: {
      fontSize: 22,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      margin: 0,
    },
    subtitle: {
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#6B7280',
      margin: 0,
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    },
    primaryBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px 18px',
      borderRadius: 10,
      border: 'none',
      background: `linear-gradient(135deg, ${DUSSC_COLORS.primary} 0%, ${DUSSC_COLORS.primaryLight} 100%)`,
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontFamily: 'inherit',
    },
    secondaryBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '9px 14px',
      borderRadius: 10,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontFamily: 'inherit',
    },

    // Filters
    filterBar: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      marginBottom: 16,
      padding: '12px 16px',
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    searchWrapper: {
      position: 'relative',
      flex: '1 1 220px',
      maxWidth: 300,
    },
    searchIcon: {
      position: 'absolute',
      left: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      color: isDark ? '#64748b' : '#9CA3AF',
      pointerEvents: 'none',
    },
    searchInput: {
      width: '100%',
      padding: '8px 12px 8px 34px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      color: isDark ? '#e2e8f0' : '#1f2937',
      fontSize: 13,
      outline: 'none',
      fontFamily: 'inherit',
    },
    select: {
      padding: '8px 12px',
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      color: isDark ? '#e2e8f0' : '#1f2937',
      fontSize: 13,
      outline: 'none',
      fontFamily: 'inherit',
      cursor: 'pointer',
      minWidth: 130,
    },
    resetBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '8px 12px',
      borderRadius: 8,
      border: 'none',
      backgroundColor: isDark ? '#334155' : '#F3F4F6',
      color: isDark ? '#94a3b8' : '#6B7280',
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: 'inherit',
    },

    // Table
    tableWrapper: {
      borderRadius: 12,
      overflow: 'hidden',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: isDark ? '#1e293b' : '#fff',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13,
    },
    th: {
      padding: '12px 14px',
      textAlign: 'left',
      fontSize: 12,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: isDark ? '#94a3b8' : '#6B7280',
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      whiteSpace: 'nowrap',
    },
    tr: {
      cursor: 'pointer',
      transition: 'background-color 0.15s',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #F3F4F6',
    },
    td: {
      padding: '10px 14px',
      color: isDark ? '#e2e8f0' : '#374151',
      verticalAlign: 'middle',
    },
    badge: (color, bg) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      color: color || '#fff',
      backgroundColor: bg || '#95A5A6',
      whiteSpace: 'nowrap',
    }),
    moduleBadge: (code) => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      color: '#fff',
      backgroundColor: MODULE_COLORS[code] || '#95A5A6',
      whiteSpace: 'nowrap',
    }),
    actionBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 30,
      height: 30,
      borderRadius: 6,
      border: 'none',
      backgroundColor: 'transparent',
      color: isDark ? '#94a3b8' : '#6B7280',
      cursor: 'pointer',
      transition: 'all 0.15s',
    },

    // Pagination
    paginationBar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderTop: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
    },
    paginationInfo: {
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#6B7280',
    },
    paginationControls: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },
    pageBtn: (disabled) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 34,
      height: 34,
      borderRadius: 8,
      border: isDark ? '1px solid #334155' : '1px solid #D1D5DB',
      backgroundColor: disabled
        ? (isDark ? '#1e293b' : '#F9FAFB')
        : (isDark ? '#334155' : '#fff'),
      color: disabled
        ? (isDark ? '#475569' : '#D1D5DB')
        : (isDark ? '#e2e8f0' : '#374151'),
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontFamily: 'inherit',
      fontSize: 13,
      fontWeight: 500,
    }),
    pageLabel: {
      fontSize: 13,
      fontWeight: 500,
      color: isDark ? '#e2e8f0' : '#374151',
      padding: '0 8px',
    },

    // Loading & Empty
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      color: isDark ? '#94a3b8' : '#6B7280',
    },
    spinner: {
      width: 36,
      height: 36,
      border: `3px solid ${isDark ? '#334155' : '#E5E7EB'}`,
      borderTopColor: DUSSC_COLORS.primaryLight,
      borderRadius: '50%',
      animation: 'dussc-spin 0.8s linear infinite',
      marginBottom: 12,
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center',
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: isDark ? '#334155' : '#F3F4F6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: isDark ? '#e2e8f0' : '#374151',
      marginBottom: 6,
    },
    emptySubtitle: {
      fontSize: 13,
      color: isDark ? '#94a3b8' : '#6B7280',
    },

    // Modal
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      width: '90%',
      maxWidth: 500,
      borderRadius: 16,
      backgroundColor: isDark ? '#1e293b' : '#fff',
      border: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      overflow: 'hidden',
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderBottom: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: isDark ? '#e2e8f0' : '#1f2937',
      margin: 0,
    },
    modalClose: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 32,
      height: 32,
      borderRadius: 8,
      border: 'none',
      backgroundColor: 'transparent',
      color: isDark ? '#94a3b8' : '#6B7280',
      cursor: 'pointer',
    },
    modalBody: {
      padding: '20px',
    },
    fileInput: {
      width: '100%',
      padding: '12px',
      borderRadius: 10,
      border: `2px dashed ${isDark ? '#334155' : '#D1D5DB'}`,
      backgroundColor: isDark ? '#0f172a' : '#F9FAFB',
      color: isDark ? '#e2e8f0' : '#374151',
      fontSize: 13,
      cursor: 'pointer',
      fontFamily: 'inherit',
    },
    modalFooter: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8,
      padding: '12px 20px',
      borderTop: isDark ? '1px solid #334155' : '1px solid #E5E7EB',
    },
    report: {
      marginTop: 16,
      padding: '12px 16px',
      borderRadius: 10,
      backgroundColor: isDark ? '#0f172a' : '#F0FDF4',
      border: `1px solid ${isDark ? '#334155' : '#BBF7D0'}`,
      fontSize: 13,
      color: isDark ? '#e2e8f0' : '#374151',
    },
    reportLine: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '4px 0',
    },
  };

  return (
    <div style={s.page}>
      {/* Spinner keyframes */}
      <style>{`@keyframes dussc-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.titleSection}>
          <div style={s.titleRow}>
            <HelpCircle size={22} color={DUSSC_COLORS.primaryLight} />
            <h1 style={s.pageTitle}>{t('questions.title')}</h1>
          </div>
          <p style={s.subtitle}>{t('questions.subtitle')}</p>
        </div>

        <div style={s.headerActions}>
          <button
            style={s.secondaryBtn}
            onClick={() => setActivePage('question-import')}
          >
            <Upload size={15} />
            {t('questions.import')}
          </button>
          <button
            style={s.secondaryBtn}
            onClick={handleExport}
          >
            <Download size={15} />
            {t('questions.export')}
          </button>
          <button
            style={s.primaryBtn}
            onClick={() => setActivePage('question-create')}
          >
            <Plus size={16} />
            {t('questions.create')}
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div style={s.filterBar}>
        <div style={s.searchWrapper}>
          <Search size={15} style={s.searchIcon} />
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={s.searchInput}
          />
        </div>

        <select
          style={s.select}
          value={filters.module || ''}
          onChange={(e) => setFilters({ module: e.target.value })}
        >
          <option value="">{t('questions.module')} - {t('common.all')}</option>
          {modules.map((mod) => (
            <option key={mod.code} value={mod.code}>
              {mod.code} - {mod.titre_fr || mod.titre}
            </option>
          ))}
        </select>

        <select
          style={s.select}
          value={filters.statut || ''}
          onChange={(e) => setFilters({ statut: e.target.value })}
        >
          <option value="">{t('common.status')} - {t('common.all')}</option>
          {Object.entries(QUESTION_STATUS).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>

        <select
          style={s.select}
          value={filters.niveau || ''}
          onChange={(e) => setFilters({ niveau: e.target.value })}
        >
          <option value="">{t('questions.niveau')} - {t('common.all')}</option>
          {NIVEAU_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button
          style={s.resetBtn}
          onClick={() => {
            resetFilters();
            setSearchInput('');
          }}
        >
          <X size={13} />
          Reset
        </button>
      </div>

      {/* Table */}
      <div style={s.tableWrapper}>
        {loading ? (
          <div style={s.loadingContainer}>
            <div style={s.spinner} />
            <span>{t('common.loading')}</span>
          </div>
        ) : questions.length === 0 ? (
          <div style={s.emptyState}>
            <div style={s.emptyIcon}>
              <HelpCircle size={28} color={isDark ? '#64748b' : '#9CA3AF'} />
            </div>
            <div style={s.emptyTitle}>{t('questions.noQuestions')}</div>
            <div style={s.emptySubtitle}>{t('questions.addFirst')}</div>
          </div>
        ) : (
          <>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={{ ...s.th, width: 60 }}>{t('questions.id')}</th>
                  <th style={{ ...s.th, width: 90 }}>{t('questions.module')}</th>
                  <th style={s.th}>{t('questions.enonce')}</th>
                  <th style={{ ...s.th, width: 110 }}>{t('questions.niveau')}</th>
                  <th style={{ ...s.th, width: 130 }}>{t('questions.statut')}</th>
                  <th style={{ ...s.th, width: 100 }}>{t('questions.type')}</th>
                  <th style={{ ...s.th, width: 60 }}>{t('questions.version')}</th>
                  <th style={{ ...s.th, width: 80 }}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => {
                  const statusCfg = getStatusConfig(q.statut);
                  const niveauCfg = getNiveauConfig(q.niveau);
                  return (
                    <tr
                      key={q.id_question || q.id}
                      style={s.tr}
                      onClick={() => navigateToQuestion(q.id_question || q.id)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F9FAFB';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={s.td}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#94a3b8' : '#6B7280' }}>
                          {q.id_question || q.id}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={s.moduleBadge(q.module)}>
                          {getModuleLabel(q.module)}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontWeight: 500, color: isDark ? '#e2e8f0' : '#1f2937' }}>
                          {truncate(q.enonce_fr || q.enonce, 80)}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={s.badge('#fff', niveauCfg.color)}>
                          {niveauCfg.label}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={s.badge('#fff', statusCfg.color)}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6B7280' }}>
                          {getTypeLabel(q.type_item || q.type)}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#6B7280', textAlign: 'center', display: 'block' }}>
                          v{q.version || 1}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', gap: 2 }} onClick={(e) => e.stopPropagation()}>
                          <button
                            style={s.actionBtn}
                            title={t('common.details')}
                            onClick={() => navigateToQuestion(q.id_question || q.id)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F3F4F6';
                              e.currentTarget.style.color = DUSSC_COLORS.primaryLight;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = isDark ? '#94a3b8' : '#6B7280';
                            }}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            style={s.actionBtn}
                            title={t('common.edit')}
                            onClick={() => {
                              useDusscStore.setState({
                                activePage: 'question-edit',
                                selectedQuestionId: q.id_question || q.id,
                              });
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F3F4F6';
                              e.currentTarget.style.color = DUSSC_COLORS.accent;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = isDark ? '#94a3b8' : '#6B7280';
                            }}
                          >
                            <Edit size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            <div style={s.paginationBar}>
              <span style={s.paginationInfo}>
                {pagination.total || 0} question{(pagination.total || 0) !== 1 ? 's' : ''}
              </span>
              <div style={s.paginationControls}>
                <button
                  style={s.pageBtn(currentPage <= 1)}
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={s.pageLabel}>
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  style={s.pageBtn(currentPage >= totalPages)}
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Import CSV → navigates to dedicated page */}
    </div>
  );
};

export default DusscQuestions;
