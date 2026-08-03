/**
 * DUSS-C Analytics Service
 * Calcul des statistiques et indices psychométriques
 *
 * Responsabilités :
 * - Agrégation hebdomadaire
 * - Indices psychométriques par question
 * - 4 vues du tableau de bord
 * - Suspension automatique des questions expirées
 */

const db = require('../config/db');

// ============================================
// VUE 1 — PILOTAGE OPÉRATIONNEL
// ============================================

/**
 * Données de pilotage opérationnel
 */
async function getOverviewDashboard(filters = {}) {
  const whereClause = buildDateFilter(filters);

  // Compteurs principaux
  const [totals] = await db.query(`
    SELECT
      COUNT(*) as total_sessions,
      SUM(CASE WHEN statut_achevement = 'complet' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN statut_achevement = 'abandonne' THEN 1 ELSE 0 END) as abandoned,
      SUM(CASE WHEN is_suspicious = 1 THEN 1 ELSE 0 END) as suspicious,
      SUM(CASE WHEN canal = 'assiste' THEN 1 ELSE 0 END) as assisted,
      ROUND(AVG(duration_seconds), 0) as avg_duration
    FROM dussc_sessions
    ${whereClause.sql}
  `, whereClause.params);

  // Par canal
  const [byCanal] = await db.query(`
    SELECT canal, COUNT(*) as count
    FROM dussc_sessions ${whereClause.sql}
    GROUP BY canal ORDER BY count DESC
  `, whereClause.params);

  // Par région
  const [byRegion] = await db.query(`
    SELECT region, COUNT(*) as count,
      ROUND(AVG(CASE WHEN statut_achevement = 'complet' THEN pct_post END), 1) as avg_score
    FROM dussc_sessions ${whereClause.sql}
    AND region IS NOT NULL
    GROUP BY region ORDER BY count DESC
  `, whereClause.params);

  // Par profil
  const [byProfil] = await db.query(`
    SELECT profil, COUNT(*) as count
    FROM dussc_sessions ${whereClause.sql}
    AND profil IS NOT NULL
    GROUP BY profil ORDER BY count DESC
  `, whereClause.params);

  // Tendance journalière (30 derniers jours)
  const [daily] = await db.query(`
    SELECT DATE(started_at) as day, COUNT(*) as count
    FROM dussc_sessions ${whereClause.sql}
    GROUP BY DATE(started_at)
    ORDER BY day DESC LIMIT 30
  `, whereClause.params);

  const stats = totals[0] || {};
  return {
    total_sessions: stats.total_sessions || 0,
    completed: stats.completed || 0,
    abandoned: stats.abandoned || 0,
    suspicious: stats.suspicious || 0,
    assisted: stats.assisted || 0,
    avg_duration: stats.avg_duration || 0,
    completion_rate: stats.total_sessions > 0
      ? Math.round((stats.completed / stats.total_sessions) * 100)
      : 0,
    by_canal: byCanal,
    by_region: byRegion,
    by_profil: byProfil,
    daily_trend: daily.reverse(),
  };
}

// ============================================
// VUE 2 — APPRENTISSAGE
// ============================================

/**
 * Données d'apprentissage (scores, progression)
 */
async function getLearningDashboard(filters = {}) {
  const whereClause = buildDateFilter(filters);

  // Scores moyens (sessions complètes, non suspectes)
  const [scores] = await db.query(`
    SELECT
      ROUND(AVG(pct_pre), 1) as avg_pct_pre,
      ROUND(AVG(pct_post), 1) as avg_pct_post,
      ROUND(AVG(gain), 2) as avg_gain,
      ROUND(AVG(CASE WHEN gain > 0 THEN gain END), 2) as avg_positive_gain,
      COUNT(*) as n_complete
    FROM dussc_sessions
    ${whereClause.sql}
    AND statut_achevement = 'complet'
    AND is_suspicious = 0
  `, whereClause.params);

  // Top 10 questions les plus échouées
  const [topFailed] = await db.query(`
    SELECT
      r.question_id, q.id_question, q.enonce_fr,
      m.code as module_code,
      COUNT(*) as n_answers,
      SUM(CASE WHEN r.is_correct = 0 THEN 1 ELSE 0 END) as n_wrong,
      ROUND(SUM(CASE WHEN r.is_correct = 0 THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) as error_rate
    FROM dussc_responses r
    JOIN dussc_questions q ON r.question_id = q.id
    JOIN dussc_modules m ON q.module_id = m.id
    JOIN dussc_sessions s ON r.session_id = s.id
    WHERE s.is_suspicious = 0
    GROUP BY r.question_id, q.id_question, q.enonce_fr, m.code
    HAVING n_answers >= 10
    ORDER BY error_rate DESC
    LIMIT 10
  `);

  // Score moyen par module
  const [byModule] = await db.query(`
    SELECT
      m.code, m.name_fr,
      ROUND(AVG(CASE WHEN r.is_correct = 1 THEN 100 ELSE 0 END), 1) as avg_score,
      COUNT(*) as n_responses
    FROM dussc_responses r
    JOIN dussc_questions q ON r.question_id = q.id
    JOIN dussc_modules m ON q.module_id = m.id
    JOIN dussc_sessions s ON r.session_id = s.id
    WHERE s.is_suspicious = 0 AND r.bloc IN ('tronc_commun', 'profil')
    GROUP BY m.code, m.name_fr
    ORDER BY m.code
  `);

  return {
    ...(scores[0] || {}),
    top_failed_questions: topFailed,
    by_module: byModule,
  };
}

// ============================================
// VUE 3 — CARTOGRAPHIE DES DÉFICITS
// ============================================

/**
 * Cartographie des déficits de connaissances par région
 */
async function getMapDashboard(filters = {}) {
  // Score moyen par région et module
  const [regionModule] = await db.query(`
    SELECT
      s.region,
      m.code as module_code,
      ROUND(AVG(CASE WHEN r.is_correct = 1 THEN 100 ELSE 0 END), 1) as avg_score,
      COUNT(DISTINCT s.id) as n_sessions
    FROM dussc_responses r
    JOIN dussc_sessions s ON r.session_id = s.id
    JOIN dussc_questions q ON r.question_id = q.id
    JOIN dussc_modules m ON q.module_id = m.id
    WHERE s.statut_achevement = 'complet'
      AND s.is_suspicious = 0
      AND s.region IS NOT NULL
    GROUP BY s.region, m.code
    ORDER BY s.region, m.code
  `);

  // Score moyen par région (global)
  const [regionGlobal] = await db.query(`
    SELECT
      region,
      ROUND(AVG(pct_post), 1) as avg_score,
      COUNT(*) as n_sessions,
      ROUND(AVG(gain), 2) as avg_gain
    FROM dussc_sessions
    WHERE statut_achevement = 'complet'
      AND is_suspicious = 0
      AND region IS NOT NULL
    GROUP BY region
    ORDER BY avg_score ASC
  `);

  // Top idées fausses par région
  const [misconceptions] = await db.query(`
    SELECT
      s.region,
      q.idee_fausse_ciblee_fr as misconception,
      COUNT(*) as n_chosen,
      ROUND(COUNT(*) / (SELECT COUNT(*) FROM dussc_responses r2
        JOIN dussc_sessions s2 ON r2.session_id = s2.id
        WHERE s2.region = s.region AND r2.question_id = r.question_id) * 100, 1) as rate
    FROM dussc_responses r
    JOIN dussc_sessions s ON r.session_id = s.id
    JOIN dussc_questions q ON r.question_id = q.id
    WHERE r.is_correct = 0
      AND s.is_suspicious = 0
      AND s.region IS NOT NULL
      AND q.idee_fausse_ciblee_fr IS NOT NULL
    GROUP BY s.region, q.idee_fausse_ciblee_fr, r.question_id
    ORDER BY n_chosen DESC
    LIMIT 30
  `);

  return {
    by_region: regionGlobal,
    region_module_matrix: regionModule,
    top_misconceptions: misconceptions,
  };
}

// ============================================
// VUE 4 — PLAIDOYER
// ============================================

/**
 * Vue plaidoyer : 3 chiffres clés
 */
async function getAdvocacyDashboard() {
  const [stats] = await db.query(`
    SELECT
      COUNT(*) as total_sessions,
      ROUND(AVG(gain), 1) as avg_gain,
      ROUND(AVG(pct_post), 1) as avg_pct_post
    FROM dussc_sessions
    WHERE statut_achevement = 'complet'
      AND is_suspicious = 0
  `);

  const [questions] = await db.query(
    'SELECT COUNT(*) as count FROM dussc_questions WHERE is_current_version = 1'
  );

  const [completion] = await db.query(`
    SELECT
      ROUND(SUM(CASE WHEN statut_achevement = 'complet' THEN 1 ELSE 0 END) / COUNT(*) * 100, 1) as completion_rate
    FROM dussc_sessions
  `);

  const s = stats[0] || {};
  return {
    total_sessions: s.total_sessions || 0,
    avg_gain: s.avg_gain || 0,
    avg_pct_post: s.avg_pct_post || 0,
    total_questions: questions[0]?.count || 0,
    completion_rate: completion[0]?.completion_rate || 0,
  };
}

// ============================================
// PSYCHOMÉTRIE
// ============================================

/**
 * Calcule les indices psychométriques pour une question
 */
async function computeQuestionPsychometrics(questionId) {
  // Distribution des réponses
  const [dist] = await db.query(`
    SELECT
      answer_given,
      COUNT(*) as count,
      AVG(duration_ms) as avg_duration
    FROM dussc_responses r
    JOIN dussc_sessions s ON r.session_id = s.id
    WHERE r.question_id = ?
      AND s.is_suspicious = 0
      AND r.answer_given IS NOT NULL
    GROUP BY answer_given
  `, [questionId]);

  if (dist.length === 0) return null;

  const total = dist.reduce((sum, d) => sum + d.count, 0);
  const [question] = await db.query(
    'SELECT reponse_correcte FROM dussc_questions WHERE id = ?',
    [questionId]
  );

  if (question.length === 0) return null;

  const correctAnswer = question[0].reponse_correcte;
  const correctDist = dist.find(d => d.answer_given === correctAnswer);
  const nCorrect = correctDist ? correctDist.count : 0;
  const difficultyIndex = total > 0 ? nCorrect / total : 0;

  // Distracteur dominant (le plus choisi parmi les mauvaises réponses)
  const distractors = dist.filter(d => d.answer_given !== correctAnswer);
  const dominantDistractor = distractors.length > 0
    ? distractors.reduce((max, d) => d.count > max.count ? d : max, distractors[0])
    : null;

  // Distribution par lettre
  const distMap = { A: 0, B: 0, C: 0, D: 0 };
  for (const d of dist) {
    if (distMap.hasOwnProperty(d.answer_given)) {
      distMap[d.answer_given] = d.count;
    }
  }

  // Temps moyen
  const avgDuration = dist.reduce((sum, d) => sum + (d.avg_duration || 0) * d.count, 0) / total;

  // Mettre à jour la question
  await db.query(
    `UPDATE dussc_questions SET
       indice_difficulte = ?, indice_discrimination = NULL,
       distracteur_dominant = ?, n_observations = ?,
       date_calcul_psy = NOW()
     WHERE id = ?`,
    [
      Math.round(difficultyIndex * 10000) / 10000,
      dominantDistractor?.answer_given || null,
      total,
      questionId,
    ]
  );

  return {
    question_id: questionId,
    n_observations: total,
    difficulty_index: Math.round(difficultyIndex * 10000) / 10000,
    dominant_distractor: dominantDistractor?.answer_given || null,
    distribution: distMap,
    avg_duration_ms: Math.round(avgDuration),
  };
}

/**
 * Calcule les psychométries pour toutes les questions publiées
 */
async function computeAllPsychometrics() {
  const [settings] = await db.query(
    "SELECT setting_value FROM dussc_settings WHERE setting_key = 'min_observations_psychometrics'"
  );
  const minObs = settings.length > 0 ? parseInt(settings[0].setting_value) : 100;

  const [questions] = await db.query(`
    SELECT q.id FROM dussc_questions q
    WHERE q.is_current_version = 1 AND q.statut = 'publie'
    AND (SELECT COUNT(*) FROM dussc_responses r
         JOIN dussc_sessions s ON r.session_id = s.id
         WHERE r.question_id = q.id AND s.is_suspicious = 0) >= ?
  `, [minObs]);

  const results = [];
  for (const q of questions) {
    const result = await computeQuestionPsychometrics(q.id);
    if (result) results.push(result);
  }
  return results;
}

// ============================================
// STATS HEBDOMADAIRES
// ============================================

/**
 * Calcule et stocke les statistiques hebdomadaires
 */
async function computeWeeklyStats(weekStart = null) {
  if (!weekStart) {
    // Lundi de la semaine passée
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() - 6);
    weekStart = d.toISOString().split('T')[0];
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

  const filters = { date_start: weekStart, date_end: weekEndStr };
  const overview = await getOverviewDashboard(filters);
  const learning = await getLearningDashboard(filters);

  // Courbe d'abandon
  const [abandonCurve] = await db.query(`
    SELECT screen_abandon, COUNT(*) as count
    FROM dussc_sessions
    WHERE statut_achevement = 'abandonne'
      AND started_at BETWEEN ? AND ?
      AND screen_abandon IS NOT NULL
    GROUP BY screen_abandon
    ORDER BY screen_abandon
  `, [weekStart, weekEndStr + ' 23:59:59']);

  // Insérer ou mettre à jour
  await db.query(
    `INSERT INTO dussc_weekly_stats (
      week_start, week_end,
      total_sessions, completed_sessions, abandoned_sessions,
      suspicious_sessions, assisted_sessions, completion_rate,
      stats_by_canal, stats_by_region, stats_by_profil,
      stats_by_langue, stats_by_sexe,
      avg_score_pre, avg_score_post, avg_gain, avg_pct_post,
      median_duration_seconds,
      top_failed_questions, abandon_curve, computed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      total_sessions = VALUES(total_sessions),
      completed_sessions = VALUES(completed_sessions),
      abandoned_sessions = VALUES(abandoned_sessions),
      suspicious_sessions = VALUES(suspicious_sessions),
      assisted_sessions = VALUES(assisted_sessions),
      completion_rate = VALUES(completion_rate),
      stats_by_canal = VALUES(stats_by_canal),
      stats_by_region = VALUES(stats_by_region),
      stats_by_profil = VALUES(stats_by_profil),
      avg_score_pre = VALUES(avg_score_pre),
      avg_score_post = VALUES(avg_score_post),
      avg_gain = VALUES(avg_gain),
      avg_pct_post = VALUES(avg_pct_post),
      top_failed_questions = VALUES(top_failed_questions),
      abandon_curve = VALUES(abandon_curve),
      computed_at = NOW()`,
    [
      weekStart, weekEndStr,
      overview.total_sessions, overview.completed, overview.abandoned,
      overview.suspicious, overview.assisted, overview.completion_rate,
      JSON.stringify(Object.fromEntries(overview.by_canal.map(c => [c.canal, c.count]))),
      JSON.stringify(Object.fromEntries(overview.by_region.map(r => [r.region, r.count]))),
      JSON.stringify(Object.fromEntries(overview.by_profil.map(p => [p.profil, p.count]))),
      null, null,
      learning.avg_pct_pre || null,
      learning.avg_pct_post || null,
      learning.avg_gain || null,
      learning.avg_pct_post || null,
      overview.avg_duration,
      JSON.stringify(learning.top_failed_questions?.slice(0, 10) || []),
      JSON.stringify(abandonCurve),
    ]
  );

  return { week_start: weekStart, week_end: weekEndStr, ...overview };
}

// ============================================
// SUSPENSION AUTOMATIQUE
// ============================================

/**
 * Suspend automatiquement les questions dont la date de révision est dépassée
 */
async function autoSuspendExpiredQuestions() {
  const [settings] = await db.query(
    "SELECT setting_value FROM dussc_settings WHERE setting_key = 'auto_suspend_expired_revision'"
  );

  if (settings.length > 0 && settings[0].setting_value === '0') {
    return { suspended: 0 };
  }

  const [result] = await db.query(`
    UPDATE dussc_questions
    SET statut = 'suspendu',
        motif_suspension = 'Suspension automatique : date de révision dépassée'
    WHERE is_current_version = 1
      AND statut = 'publie'
      AND date_revision_prevue IS NOT NULL
      AND date_revision_prevue < CURDATE()
  `);

  return { suspended: result.affectedRows || 0 };
}

// ============================================
// HELPERS
// ============================================

function buildDateFilter(filters) {
  let sql = 'WHERE 1=1';
  const params = [];

  if (filters.date_start) {
    sql += ' AND started_at >= ?';
    params.push(filters.date_start);
  }
  if (filters.date_end) {
    sql += ' AND started_at <= ?';
    params.push(filters.date_end + ' 23:59:59');
  }
  if (filters.region) {
    sql += ' AND region = ?';
    params.push(filters.region);
  }
  if (filters.canal) {
    sql += ' AND canal = ?';
    params.push(filters.canal);
  }
  if (filters.profil) {
    sql += ' AND profil = ?';
    params.push(filters.profil);
  }

  return { sql, params };
}

module.exports = {
  getOverviewDashboard,
  getLearningDashboard,
  getMapDashboard,
  getAdvocacyDashboard,
  computeQuestionPsychometrics,
  computeAllPsychometrics,
  computeWeeklyStats,
  autoSuspendExpiredQuestions,
};
