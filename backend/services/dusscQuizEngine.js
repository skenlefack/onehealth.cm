/**
 * DUSS-C Quiz Engine
 * Moteur de composition et d'évaluation des quiz
 *
 * Responsabilités :
 * - Construire un parcours adapté au profil du participant
 * - Évaluer les réponses et fournir le feedback
 * - Calculer les scores (pré-test, post-test, gain)
 * - Détecter les sessions suspectes
 */

const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Construit un quiz pour un participant selon sa langue et son profil
 * @param {string} lang - Langue (fr/en)
 * @param {string} profil - Code persona (A1, B2, etc.)
 * @returns {Object} Quiz structuré avec blocs
 */
async function buildQuiz(lang = 'fr', profil = null) {
  // Charger le template actif
  const [templates] = await db.query(
    'SELECT * FROM dussc_quiz_templates WHERE is_active = 1 LIMIT 1'
  );

  if (templates.length === 0) {
    throw new Error('Aucun template de quiz actif');
  }

  const template = templates[0];
  const isFr = lang === 'fr';

  // Charger les questions assignées au template
  const [assignments] = await db.query(
    `SELECT tq.*, q.*,
       m.code as module_code, m.name_fr as module_name_fr, m.name_en as module_name_en
     FROM dussc_quiz_template_questions tq
     JOIN dussc_questions q ON tq.question_id = q.id
     JOIN dussc_modules m ON q.module_id = m.id
     WHERE tq.template_id = ?
       AND q.is_current_version = 1
       AND q.statut = 'publie'
     ORDER BY tq.bloc, tq.sort_order`,
    [template.id]
  );

  // Séparer par bloc
  const blocs = {
    pre_test: [],
    tronc_commun: [],
    profil: [],
    post_test: [],
  };

  for (const a of assignments) {
    // Filtrer les questions profilées si un profil est donné
    if (a.bloc === 'profil' && profil && a.persona_filter) {
      const filter = JSON.parse(a.persona_filter);
      if (filter.length > 0 && !filter.includes(profil)) {
        continue;
      }
    }
    blocs[a.bloc].push(a);
  }

  // Limiter le nombre de questions par bloc selon le template
  blocs.pre_test = blocs.pre_test.slice(0, template.pre_test_count);
  blocs.tronc_commun = blocs.tronc_commun.slice(0, template.common_count);
  blocs.profil = blocs.profil.slice(0, template.profile_count);
  blocs.post_test = blocs.post_test.slice(0, template.post_test_count);

  // Formatter les questions pour le client
  const formatQuestion = (q, bloc, order) => {
    const options = JSON.parse(isFr ? q.options_fr : q.options_en);
    let displayOptions = options.map((text, idx) => ({
      letter: String.fromCharCode(65 + idx),
      text,
    }));

    // Randomiser l'ordre des options si activé
    if (template.randomize_options) {
      const originalOrder = displayOptions.map(o => o.letter);
      displayOptions = shuffleArray([...displayOptions]);
      return {
        id: q.id,
        order,
        bloc,
        module_code: q.module_code,
        module_name: isFr ? q.module_name_fr : q.module_name_en,
        enonce: isFr ? q.enonce_fr : q.enonce_en,
        options: displayOptions,
        options_order: displayOptions.map(o => o.letter),
        original_order: originalOrder,
        show_feedback: bloc !== 'pre_test' && bloc !== 'post_test' && template.show_feedback,
      };
    }

    return {
      id: q.id,
      order,
      bloc,
      module_code: q.module_code,
      module_name: isFr ? q.module_name_fr : q.module_name_en,
      enonce: isFr ? q.enonce_fr : q.enonce_en,
      options: displayOptions,
      options_order: displayOptions.map(o => o.letter),
      show_feedback: bloc !== 'pre_test' && bloc !== 'post_test' && template.show_feedback,
    };
  };

  let order = 0;
  const questions = [
    ...blocs.pre_test.map(q => formatQuestion(q, 'pre_test', ++order)),
    ...blocs.tronc_commun.map(q => formatQuestion(q, 'tronc_commun', ++order)),
    ...blocs.profil.map(q => formatQuestion(q, 'profil', ++order)),
    ...blocs.post_test.map(q => formatQuestion(q, 'post_test', ++order)),
  ];

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
 * Évalue une réponse et retourne le feedback
 * @param {number} questionId - ID de la question
 * @param {string} answerGiven - Lettre choisie (A, B, C, D)
 * @param {string} lang - Langue
 * @param {string} bloc - Bloc du parcours
 * @returns {Object} Résultat de l'évaluation
 */
async function evaluateResponse(questionId, answerGiven, lang = 'fr', bloc = 'tronc_commun') {
  const [questions] = await db.query(
    'SELECT * FROM dussc_questions WHERE id = ?',
    [questionId]
  );

  if (questions.length === 0) {
    throw new Error('Question non trouvée');
  }

  const q = questions[0];
  const isCorrect = answerGiven.toUpperCase() === q.reponse_correcte.toUpperCase();
  const isFr = lang === 'fr';

  // Pas de feedback pour pré-test et post-test
  const showFeedback = bloc !== 'pre_test' && bloc !== 'post_test';

  const result = {
    is_correct: isCorrect,
    correct_answer: q.reponse_correcte,
  };

  if (showFeedback) {
    result.explication = isFr ? q.explication_fr : q.explication_en;
    result.action = isFr ? q.action_fr : q.action_en;
    if (!isCorrect) {
      result.idee_fausse = isFr ? q.idee_fausse_ciblee_fr : q.idee_fausse_ciblee_en;
    }
  }

  return result;
}

/**
 * Calcule les scores d'une session complétée
 * @param {number} sessionId - ID interne de la session
 * @returns {Object} Scores calculés
 */
async function computeSessionScore(sessionId) {
  // Charger toutes les réponses de la session
  const [responses] = await db.query(
    `SELECT r.*, q.role_test
     FROM dussc_responses r
     JOIN dussc_questions q ON r.question_id = q.id
     WHERE r.session_id = ?
     ORDER BY r.question_order`,
    [sessionId]
  );

  // Scores par bloc
  let scorePre = 0, countPre = 0;
  let scorePost = 0, countPost = 0;
  let scoreTotal = 0, countTotal = 0;

  for (const r of responses) {
    if (r.is_correct) scoreTotal++;
    countTotal++;

    if (r.bloc === 'pre_test') {
      if (r.is_correct) scorePre++;
      countPre++;
    } else if (r.bloc === 'post_test') {
      if (r.is_correct) scorePost++;
      countPost++;
    }
  }

  const gain = scorePost - scorePre;
  const pctPre = countPre > 0 ? Math.round((scorePre / countPre) * 100) : null;
  const pctPost = countPost > 0 ? Math.round((scorePost / countPost) * 100) : null;

  // Mettre à jour la session
  await db.query(
    `UPDATE dussc_sessions SET
       score_pre = ?, score_post = ?, gain = ?,
       pct_pre = ?, pct_post = ?,
       total_questions = ?, total_correct = ?
     WHERE id = ?`,
    [scorePre, scorePost, gain, pctPre, pctPost, countTotal, scoreTotal, sessionId]
  );

  return {
    score_pre: scorePre,
    score_post: scorePost,
    gain,
    pct_pre: pctPre,
    pct_post: pctPost,
    total_questions: countTotal,
    total_correct: scoreTotal,
    pct_total: countTotal > 0 ? Math.round((scoreTotal / countTotal) * 100) : 0,
  };
}

/**
 * Détecte et marque les sessions suspectes
 * @param {number} sessionId - ID de la session
 */
async function detectSuspicious(sessionId) {
  const [sessions] = await db.query(
    'SELECT * FROM dussc_sessions WHERE id = ?',
    [sessionId]
  );

  if (sessions.length === 0) return;
  const session = sessions[0];
  const reasons = [];

  // Règle 1 : durée totale < 45 secondes
  const [settings] = await db.query(
    "SELECT setting_value FROM dussc_settings WHERE setting_key = 'suspicious_min_duration_seconds'"
  );
  const minDuration = settings.length > 0 ? parseInt(settings[0].setting_value) : 45;

  if (session.duration_seconds && session.duration_seconds < minDuration) {
    reasons.push(`Durée < ${minDuration}s (${session.duration_seconds}s)`);
  }

  // Règle 2 : toutes les réponses identiques en position
  const [responses] = await db.query(
    'SELECT answer_given FROM dussc_responses WHERE session_id = ? AND answer_given IS NOT NULL ORDER BY question_order',
    [sessionId]
  );

  if (responses.length >= 5) {
    const answers = responses.map(r => r.answer_given);
    const allSame = answers.every(a => a === answers[0]);
    if (allSame) {
      reasons.push(`Toutes les réponses identiques (${answers[0]})`);
    }
  }

  if (reasons.length > 0) {
    await db.query(
      'UPDATE dussc_sessions SET is_suspicious = 1, suspicious_reason = ? WHERE id = ?',
      [reasons.join('; '), sessionId]
    );
  }
}

/**
 * Mélange un tableau (Fisher-Yates)
 */
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
};
