/**
 * DusscQuestionImport — Page pleine d'import CSV
 */

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import useDusscStore from '../stores/dusscStore';
import * as dusscApi from '../services/dusscApi';
import { DUSSC_COLORS } from '../utils/constants';

const DusscQuestionImport = ({ isDark }) => {
  const { t } = useTranslation('dussc');
  const { setActivePage, fetchQuestions } = useDusscStore();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [report, setReport] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { data } = await dusscApi.importQuestions(file);
      setReport(data.data);
      toast.success(`${data.data.imported} questions importées`);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
    setUploading(false);
  };

  const s = {
    page: { maxWidth: 700, margin: '0 auto' },
    backBtn: {
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 0',
      border: 'none', background: 'none', color: DUSSC_COLORS.primary,
      fontSize: 14, fontWeight: 500, cursor: 'pointer', marginBottom: 16,
    },
    title: { fontSize: 22, fontWeight: 700, color: isDark ? '#fff' : DUSSC_COLORS.encre, marginBottom: 8 },
    subtitle: { fontSize: 14, color: isDark ? '#888' : '#999', marginBottom: 24, lineHeight: 1.6 },
    section: {
      background: isDark ? '#1e1e2e' : '#fff', borderRadius: 12, padding: 24,
      marginBottom: 20, border: `1px solid ${isDark ? '#333' : '#e8ece8'}`,
    },
    dropzone: {
      border: `2px dashed ${file ? DUSSC_COLORS.primary : (isDark ? '#444' : '#ccc')}`,
      borderRadius: 12, padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
      background: file ? `${DUSSC_COLORS.primary}08` : (isDark ? '#2a2a3e' : '#fafafa'),
      transition: 'all 0.2s',
    },
    fileInfo: {
      display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center',
      marginTop: 16,
    },
    actions: {
      display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20,
    },
    btn: (primary) => ({
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px',
      borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: primary && !file ? 'not-allowed' : 'pointer',
      border: primary ? 'none' : `1px solid ${isDark ? '#444' : '#ddd'}`,
      background: primary ? DUSSC_COLORS.primary : 'transparent',
      color: primary ? '#fff' : (isDark ? '#ccc' : '#555'),
      opacity: primary && !file ? 0.5 : 1,
    }),
    reportCard: (type) => ({
      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
      borderRadius: 10, marginBottom: 10,
      background: type === 'success' ? (isDark ? '#1e2e1e' : '#F1F6F1')
        : type === 'warning' ? (isDark ? '#2e2a1e' : '#FFF8E7')
        : (isDark ? '#2e1e1e' : '#FEF2F2'),
      border: `1px solid ${
        type === 'success' ? '#27AE6030' : type === 'warning' ? '#F39C1230' : '#E74C3C30'
      }`,
    }),
    reportNum: { fontSize: 28, fontWeight: 700 },
    reportLabel: { fontSize: 13, color: isDark ? '#aaa' : '#666' },
    formatInfo: {
      fontSize: 12, color: isDark ? '#888' : '#999', lineHeight: 1.8,
      marginTop: 20, padding: '16px 18px',
      background: isDark ? '#2a2a3e' : '#f8f9f8', borderRadius: 8,
    },
  };

  return (
    <div style={s.page}>
      <button style={s.backBtn} onClick={() => setActivePage('questions')}>
        <ArrowLeft size={16} /> Retour à la banque
      </button>

      <div style={s.title}>Importer des questions (CSV)</div>
      <div style={s.subtitle}>
        Importez un fichier CSV au format de la banque DUSS-C. Les questions existantes (même id_version) seront ignorées.
      </div>

      {!report ? (
        <div style={s.section}>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <div style={s.dropzone} onClick={() => fileRef.current?.click()}>
            <Upload size={40} color={file ? DUSSC_COLORS.primary : (isDark ? '#666' : '#bbb')} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: isDark ? '#ccc' : '#555', marginBottom: 4 }}>
              {file ? file.name : 'Cliquez pour sélectionner un fichier CSV'}
            </div>
            <div style={{ fontSize: 12, color: isDark ? '#888' : '#999' }}>
              {file ? `${(file.size / 1024).toFixed(1)} Ko` : 'Format : CSV avec en-têtes (39 colonnes)'}
            </div>
          </div>

          {file && (
            <div style={s.fileInfo}>
              <FileText size={20} color={DUSSC_COLORS.primary} />
              <span style={{ fontSize: 14, fontWeight: 500, color: isDark ? '#ddd' : '#333' }}>{file.name}</span>
              <button
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#E74C3C' }}
                onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
              >
                <XCircle size={18} />
              </button>
            </div>
          )}

          <div style={s.formatInfo}>
            <strong>Format attendu :</strong><br />
            Colonnes : id_question, id_version, version, date_creation, module, theme, type_item, niveau, public_cible, role_test, enonce_fr, options_fr, reponse_correcte, explication_fr, action_fr, idee_fausse_ciblee, enonce_en, options_en, explication_en, action_en, ...<br />
            <strong>Options :</strong> JSON array entre guillemets : ["Option A", "Option B", "Option C", "Option D"]<br />
            <strong>Public cible :</strong> séparé par ; (ex: A1;A2;C1)
          </div>

          <div style={s.actions}>
            <button style={s.btn(false)} onClick={() => setActivePage('questions')}>
              {t('common.cancel')}
            </button>
            <button style={s.btn(true)} onClick={handleUpload} disabled={!file || uploading}>
              <Upload size={16} /> {uploading ? 'Import en cours...' : 'Importer'}
            </button>
          </div>
        </div>
      ) : (
        /* ── Rapport d'import ── */
        <div style={s.section}>
          <div style={{ fontSize: 16, fontWeight: 700, color: isDark ? '#fff' : '#333', marginBottom: 20 }}>
            Rapport d'import
          </div>

          <div style={s.reportCard('success')}>
            <CheckCircle size={24} color="#27AE60" />
            <div>
              <div style={{ ...s.reportNum, color: '#27AE60' }}>{report.imported}</div>
              <div style={s.reportLabel}>questions importées</div>
            </div>
          </div>

          {report.skipped > 0 && (
            <div style={s.reportCard('warning')}>
              <AlertCircle size={24} color="#F39C12" />
              <div>
                <div style={{ ...s.reportNum, color: '#F39C12' }}>{report.skipped}</div>
                <div style={s.reportLabel}>ignorées (déjà existantes)</div>
              </div>
            </div>
          )}

          {report.errors?.length > 0 && (
            <div style={s.reportCard('error')}>
              <XCircle size={24} color="#E74C3C" />
              <div>
                <div style={{ ...s.reportNum, color: '#E74C3C' }}>{report.errors.length}</div>
                <div style={s.reportLabel}>erreurs</div>
              </div>
            </div>
          )}

          {report.errors?.length > 0 && (
            <div style={{ marginTop: 16, maxHeight: 200, overflow: 'auto', fontSize: 12, color: isDark ? '#aaa' : '#666' }}>
              {report.errors.map((e, i) => (
                <div key={i} style={{ padding: '4px 0', borderBottom: `1px solid ${isDark ? '#333' : '#f0f0f0'}` }}>
                  Ligne {e.line}: {e.error}
                </div>
              ))}
            </div>
          )}

          <div style={{ ...s.actions, marginTop: 24 }}>
            <button style={s.btn(true)} onClick={() => setActivePage('questions')}>
              Voir la banque de questions
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DusscQuestionImport;
