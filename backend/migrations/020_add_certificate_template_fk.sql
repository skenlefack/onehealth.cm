-- Add template_id foreign key to certificates table
-- Links certificates to their design template

-- Add column if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'certificates';
SET @columnname = 'template_id';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = @columnname) > 0,
  'SELECT 1',
  'ALTER TABLE certificates ADD COLUMN template_id INT NULL AFTER enrollable_id'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add foreign key (safe: will fail silently if already exists, handled by migration runner)
ALTER TABLE certificates
  ADD CONSTRAINT fk_certificates_template
  FOREIGN KEY (template_id) REFERENCES certificate_templates(id)
  ON DELETE SET NULL;
