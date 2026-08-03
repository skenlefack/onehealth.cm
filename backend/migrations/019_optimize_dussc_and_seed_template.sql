-- =====================================================
-- Migration 019: Optimisations DUSS-C + template par défaut
-- =====================================================

-- Index composites pour les requêtes fréquentes
ALTER TABLE dussc_questions ADD INDEX idx_current_statut (is_current_version, statut);
ALTER TABLE dussc_questions ADD INDEX idx_current_module (is_current_version, module_id);
ALTER TABLE dussc_questions ADD INDEX idx_module_role (module_id, role_test, is_current_version);

ALTER TABLE dussc_responses ADD INDEX idx_session_bloc (session_id, bloc);
ALTER TABLE dussc_responses ADD INDEX idx_question_correct (question_id, is_correct);

ALTER TABLE dussc_sessions ADD INDEX idx_complete_nosuspect (statut_achevement, is_suspicious);
ALTER TABLE dussc_sessions ADD INDEX idx_region_complete (region, statut_achevement);
ALTER TABLE dussc_sessions ADD INDEX idx_started_complete (started_at, statut_achevement);

-- Template de quiz par défaut (pilote)
INSERT INTO dussc_quiz_templates (
  code, name_fr, name_en, description_fr, description_en,
  pre_test_count, common_count, profile_count, post_test_count,
  randomize_options, show_feedback, show_feedback_pretest,
  show_progress_bar, require_consent, is_active, published_at
) VALUES (
  'PILOT-2026-V1',
  'Parcours pilote DUSS-C',
  'DUSS-C Pilot Quiz',
  'Parcours standard du pilote : 3 pré-test + 4 tronc commun + 5 profilées + 3 post-test = 15 questions',
  'Standard pilot quiz: 3 pre-test + 4 common + 5 profiled + 3 post-test = 15 questions',
  3, 4, 5, 3,
  1, 1, 0,
  1, 1, 1, NOW()
);
