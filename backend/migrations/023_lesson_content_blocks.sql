-- Migration 023: Leçons multi-contenus par blocs ordonnés
-- Date: 2026-11-02
-- Permet d'intégrer plusieurs ressources (texte, vidéo, PDF, PowerPoint, Word, Excel,
-- image, audio, intégration externe, fichiers, encadrés, accordéons, questions de contrôle)
-- dans une même leçon, dans l'ordre choisi par le formateur.

-- Blocs de contenu ordonnés (tableau JSON). Utilisé quand content_type = 'mixed'.
ALTER TABLE lessons ADD COLUMN content_blocks JSON NULL AFTER content_en;

-- Sections (blocs) déjà consultées par l'apprenant
ALTER TABLE lesson_progress ADD COLUMN completed_blocks JSON NULL AFTER progress_percent;
