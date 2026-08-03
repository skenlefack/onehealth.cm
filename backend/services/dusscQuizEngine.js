/**
 * DUSS-C Quiz Engine (v2 — optimisé)
 *
 * Deux modes :
 *  1. Template avec questions assignées (dussc_quiz_template_questions)
 *  2. Auto-select : sélection intelligente depuis la banque complète
 *     quand aucune question n'est assignée au template
 *
 * Optimisations :
 *  - Cache en mémoire des questions (TTL 5 min)
 *  - Cache du template actif
 *  - Requête unique pour évaluation + feedback
 *  - Batch-aware pour le scoring
 */

const db = require('../config/db');

// ── Cache en mémoire ──

let questionCache = null;
let questionCacheTime = 0;
let templateCache = null;
let templateCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedQuestions() {
  if (questionCache && Date.now() - questionCacheTime < CACHE_TTL) {
    return questionCache;
  }
  const [rows] = await db.query(`
    SELECT q.*, m.code as module_code, m.name_fr as module_name_fr, m.name_en as module_name_en
    FROM dussc_questions q
    JOIN dussc_modules m ON q.module_id = m.id
    WHERE q.is_current_version = 1
      AND q.statut IN ('publie', 'valide', 'revue_editoriale')
    ORDER BY q.id_question
  `);
  questionCache = rows;
  questionCacheTime = Date.now();
  return rows;
}

async function getCachedTemplate() {
  if (templateCache && Date.now() - templateCacheTime < CACHE_TTL) {
    return templateCache;
  }
  const [rows] = await db.query(
    'SELECT * FROM dussc_quiz_templates WHERE is_active = 1 LIMIT 1'
  );
  templateCache = rows[0] || null;
  templateCacheTime = Date.now();
  return templateCache;
}

/** Invalider le cache (après import, modification) */
function invalidateCache() {
  questionCache = null;
  templateCache = null;
}

// ── Build Quiz ──

/**
 * Construit un quiz pour un participant
 */
async function buildQuiz(lang = 'fr', profil = null) {
  const template = await getCachedTemplate();
  if (!template) throw new Error('Aucun template de quiz actif');

  const isFr = lang === 'fr';

  // Essayer le mode template_questions d'abord
  const [assignments] = await db.query(
    `SELECT COUNT(*) as c FROM dussc_quiz_template_questions WHERE template_id = ?`,
    [template.id]
  );

  let questions;
  if (assignments[0].c > 0) {
    questions = await buildFromAssignments(template, profil, isFr);
  } else {
    questions = await buildAutoSelect(template, profil, isFr);
  }

  return {
    template_id: template.id,
    template_code: template.code,
    lang,
    profil,
    total_questions: questions.length,
    show_progress_bar: !!template.show_progress_bar,
    require_consent: !!template.require_consent,
    questions,
  };
}

/**
 * Mode 1 : questions assignées manuellement au template
 */
async function buildFromAssignments(template, profil, isFr) {
  const [rows] = await db.query(
    `SELECT tq.bloc, tq.sort_order, tq.persona_filter, q.*,
       m.code as module_code, m.name_fr as module_name_fr, m.name_en as module_name_en
     FROM dussc_quiz_template_questions tq
     JOIN dussc_questions q ON tq.question_id = q.id
     JOIN dussc_modules m ON q.module_id = m.id
     WHERE tq.template_id = ?
       AND q.is_current_version = 1
       AND q.statut IN ('publie', 'valide', 'revue_editoriale')
     ORDER BY tq.bloc, tq.sort_order`,
    [template.id]
  );

  const blocs = { pre_test: [], tronc_commun: [], profil: [], post_test: [] };
  for (const r of rows) {
    if (r.bloc === 'profil' && profil && r.persona_filter) {
      const filter = typeof r.persona_filter === 'string' ? JSON.parse(r.persona_filter) : (r.persona_filter || []);
      if (filter.length > 0 && !filter.includes(profil)) continue;
    }
    blocs[r.bloc].push(r);
  }

  return assembleQuiz(blocs, template, isFr);
}

/**
 * Mode 2 : sélection automatique depuis la banque
 * Utilise role_test et public_cible pour constituer les blocs
 */
async function buildAutoSelect(template, profil, isFr) {
  const allQuestions = await getCachedQuestions();

  // Filtrer par profil si donné
  const matchesProfil = (q) => {
    if (!profil) return true;
    try {
      const raw = q.public_cible;
      const cibles = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
      return !Array.isArray(cibles) || cibles.length === 0 || cibles.includes(profil);
    } catch { return true; }
  };

  // Séparer par rôle de test
  const ancresPre = allQuestions.filter(q => q.role_test === 'ancre_pre');
  const ancresPost = allQuestions.filter(q => q.role_test === 'ancre_post');
  const courantes = allQuestions.filter(q => q.role_test === 'courante' && matchesProfil(q));

  // Mélanger les courantes pour varier les quiz
  const shuffledCourantes = shuffleArray([...courantes]);

  // Séparer tronc commun (grand_public) et profilé (intermédiaire + professionnel)
  const commonPool = shuffledCourantes.filter(q => q.niveau === 'grand_public');
  const profilePool = shuffledCourantes.filter(q => q.niveau !== 'grand_public');

  const blocs = {
    pre_test: shuffleArray([...ancresPre]).slice(0, template.pre_test_count),
    tronc_commun: commonPool.slice(0, template.common_count),
    profil: profilePool.length >= template.profile_count
      ? profilePool.slice(0, template.profile_count)
      : [...profilePool, ...commonPool.slice(template.common_count)].slice(0, template.profile_count),
    post_test: shuffleArray([...ancresPost]).slice(0, template.post_test_count),
  };

  return assembleQuiz(blocs, template, isFr);
}

/**
 * Assemble les blocs en quiz formaté pour le client
 */
function assembleQuiz(blocs, template, isFr) {
  let order = 0;

  const format = (q, bloc) => {
    order++;
    // MySQL JSON columns are already parsed — handle both cases
    const rawOpts = isFr ? q.options_fr : (q.options_en || q.options_fr);
    let optionsRaw;
    if (Array.isArray(rawOpts)) {
      optionsRaw = rawOpts;
    } else if (typeof rawOpts === 'string') {
      try { optionsRaw = JSON.parse(rawOpts); } catch { optionsRaw = [rawOpts]; }
    } else {
      optionsRaw = [];
    }

    let displayOptions = optionsRaw.map((text, idx) => ({
      letter: String.fromCharCode(65 + idx),
      text: String(text),
    }));

    if (template.randomize_options) {
      displayOptions = shuffleArray([...displayOptions]);
    }

    return {
      id: q.id,
      order,
      bloc,
      module_code: q.module_code,
      module_name: isFr ? q.module_name_fr : q.module_name_en,
      enonce: isFr ? q.enonce_fr : (q.enonce_en || q.enonce_fr),
      options: displayOptions,
      options_order: displayOptions.map(o => o.letter),
      show_feedback: bloc !== 'pre_test' && bloc !== 'post_test' && !!template.show_feedback,
    };
  };

  return [
    ...blocs.pre_test.map(q => format(q, 'pre_test')),
    ...blocs.tronc_commun.map(q => format(q, 'tronc_commun')),
    ...blocs.profil.map(q => format(q, 'profil')),
    ...blocs.post_test.map(q => format(q, 'post_test')),
  ];
}

// ── Évaluation ──

/**
 * Évalue une réponse et retourne le feedback
 */
async function evaluateResponse(questionId, answerGiven, lang = 'fr', bloc = 'tronc_commun') {
  // Essayer le cache d'abord
  const cached = questionCache?.find(q => q.id === questionId);
  let q;

  if (cached) {
    q = cached;
  } else {
    const [rows] = await db.query('SELECT * FROM dussc_questions WHERE id = ?', [questionId]);
    if (rows.length === 0) throw new Error('Question non trouvée');
    q = rows[0];
  }

  const isCorrect = answerGiven.toUpperCase() === q.reponse_correcte.toUpperCase();
  const isFr = lang === 'fr';
  const showFeedback = bloc !== 'pre_test' && bloc !== 'post_test';

  const result = { is_correct: isCorrect, correct_answer: q.reponse_correcte };

  if (showFeedback) {
    result.explication = isFr ? q.explication_fr : (q.explication_en || q.explication_fr);
    result.action = isFr ? q.action_fr : (q.action_en || q.action_fr);
    if (!isCorrect) {
      result.idee_fausse = isFr ? q.idee_fausse_ciblee_fr : (q.idee_fausse_ciblee_en || q.idee_fausse_ciblee_fr);
    }
  }

  return result;
}

// ── Scoring ──

/**
 * Calcule les scores d'une session complétée
 */
async function computeSessionScore(sessionId) {
  const [responses] = await db.query(
    `SELECT r.bloc, r.is_correct
     FROM dussc_responses r
     WHERE r.session_id = ?
     ORDER BY r.question_order`,
    [sessionId]
  );

  let scorePre = 0, countPre = 0;
  let scorePost = 0, countPost = 0;
  let scoreTotal = 0, countTotal = 0;

  for (const r of responses) {
    if (r.is_correct) scoreTotal++;
    countTotal++;
    if (r.bloc === 'pre_test') { if (r.is_correct) scorePre++; countPre++; }
    else if (r.bloc === 'post_test') { if (r.is_correct) scorePost++; countPost++; }
  }

  const gain = scorePost - scorePre;
  const pctPre = countPre > 0 ? Math.round((scorePre / countPre) * 100) : null;
  const pctPost = countPost > 0 ? Math.round((scorePost / countPost) * 100) : null;

  await db.query(
    `UPDATE dussc_sessions SET
       score_pre = ?, score_post = ?, gain = ?,
       pct_pre = ?, pct_post = ?,
       total_questions = ?, total_correct = ?
     WHERE id = ?`,
    [scorePre, scorePost, gain, pctPre, pctPost, countTotal, scoreTotal, sessionId]
  );

  return {
    score_pre: scorePre, score_post: scorePost, gain,
    pct_pre: pctPre, pct_post: pctPost,
    total_questions: countTotal, total_correct: scoreTotal,
    pct_total: countTotal > 0 ? Math.round((scoreTotal / countTotal) * 100) : 0,
  };
}

// ── Détection suspecte ──

async function detectSuspicious(sessionId) {
  const [sessions] = await db.query(
    'SELECT duration_seconds FROM dussc_sessions WHERE id = ?',
    [sessionId]
  );
  if (sessions.length === 0) return;

  const reasons = [];

  // Durée < 45s
  if (sessions[0].duration_seconds && sessions[0].duration_seconds < 45) {
    reasons.push(`Durée < 45s (${sessions[0].duration_seconds}s)`);
  }

  // Toutes réponses identiques
  const [responses] = await db.query(
    'SELECT answer_given FROM dussc_responses WHERE session_id = ? AND answer_given IS NOT NULL ORDER BY question_order',
    [sessionId]
  );
  if (responses.length >= 5) {
    const answers = responses.map(r => r.answer_given);
    if (answers.every(a => a === answers[0])) {
      reasons.push(`Toutes réponses identiques (${answers[0]})`);
    }
  }

  if (reasons.length > 0) {
    await db.query(
      'UPDATE dussc_sessions SET is_suspicious = 1, suspicious_reason = ? WHERE id = ?',
      [reasons.join('; '), sessionId]
    );
  }
}

// ── Utils ──

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

module.exports = {
  buildQuiz,
  evaluateResponse,
  computeSessionScore,
  detectSuspicious,
  invalidateCache,
};
