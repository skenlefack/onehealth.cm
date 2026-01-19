-- ============================================
-- TEMPLATES DE CERTIFICATS
-- ============================================

CREATE TABLE IF NOT EXISTS certificate_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    -- Design
    background_image VARCHAR(500),
    background_color VARCHAR(20) DEFAULT '#ffffff',
    -- Logo
    logo_url VARCHAR(500),
    logo_position ENUM('top-left', 'top-center', 'top-right') DEFAULT 'top-center',
    logo_width INT DEFAULT 150,
    -- Titre
    title_text VARCHAR(255) DEFAULT 'CERTIFICAT DE RÉUSSITE',
    title_font VARCHAR(100) DEFAULT 'serif',
    title_size INT DEFAULT 36,
    title_color VARCHAR(20) DEFAULT '#1a365d',
    -- Corps
    body_font VARCHAR(100) DEFAULT 'sans-serif',
    body_color VARCHAR(20) DEFAULT '#2d3748',
    -- Bordure
    border_style ENUM('none', 'simple', 'double', 'ornate', 'gold') DEFAULT 'ornate',
    border_color VARCHAR(20) DEFAULT '#c5a572',
    border_width INT DEFAULT 10,
    -- Signataire
    signatory_name VARCHAR(255),
    signatory_title VARCHAR(255),
    signatory_signature VARCHAR(500),
    show_signature BOOLEAN DEFAULT TRUE,
    -- QR Code
    show_qr_code BOOLEAN DEFAULT TRUE,
    qr_position ENUM('bottom-left', 'bottom-right') DEFAULT 'bottom-right',
    -- Options
    show_score BOOLEAN DEFAULT TRUE,
    show_date BOOLEAN DEFAULT TRUE,
    show_hours BOOLEAN DEFAULT TRUE,
    -- Statut
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    -- Métadonnées
    custom_css TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_default (is_default),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insérer les templates par défaut
INSERT IGNORE INTO certificate_templates (name, slug, description, border_style, is_default, is_active) VALUES
('Classique', 'classic', 'Template classique avec bordure dorée ornée', 'ornate', TRUE, TRUE),
('Moderne', 'modern', 'Design épuré et minimaliste', 'simple', FALSE, TRUE),
('Professionnel', 'professional', 'Style corporate sobre', 'double', FALSE, TRUE),
('Académique', 'academic', 'Style universitaire traditionnel', 'ornate', FALSE, TRUE);

-- Ajouter une colonne template_id aux certificats (ignorer si existe déjà)
-- ALTER TABLE certificates ADD COLUMN template_id INT NULL;
-- ALTER TABLE certificates ADD CONSTRAINT fk_cert_template FOREIGN KEY (template_id) REFERENCES certificate_templates(id) ON DELETE SET NULL;
