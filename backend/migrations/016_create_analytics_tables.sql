-- Migration: Create analytics tables for website tracking
-- Date: 2026-07-09
-- Description: Privacy-first analytics - no cookies, no PII, visitor IDs are hashed

-- Individual page view events
CREATE TABLE IF NOT EXISTS analytics_pageviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    visitor_id VARCHAR(64) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    referrer VARCHAR(2048) DEFAULT NULL,
    title VARCHAR(512) DEFAULT NULL,
    country VARCHAR(2) DEFAULT NULL,
    city VARCHAR(128) DEFAULT NULL,
    browser VARCHAR(64) DEFAULT NULL,
    browser_version VARCHAR(32) DEFAULT NULL,
    os VARCHAR(64) DEFAULT NULL,
    device ENUM('desktop','mobile','tablet','unknown') DEFAULT 'unknown',
    screen VARCHAR(16) DEFAULT NULL,
    language VARCHAR(16) DEFAULT NULL,
    utm_source VARCHAR(256) DEFAULT NULL,
    utm_medium VARCHAR(256) DEFAULT NULL,
    utm_campaign VARCHAR(256) DEFAULT NULL,
    duration INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_apv_session (session_id),
    INDEX idx_apv_visitor (visitor_id),
    INDEX idx_apv_created (created_at),
    INDEX idx_apv_url (url(255)),
    INDEX idx_apv_created_url (created_at, url(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Aggregated session records
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL UNIQUE,
    visitor_id VARCHAR(64) NOT NULL,
    entry_page VARCHAR(2048) DEFAULT NULL,
    exit_page VARCHAR(2048) DEFAULT NULL,
    pageviews INT DEFAULT 1,
    duration INT DEFAULT 0,
    is_bounce TINYINT(1) DEFAULT 1,
    country VARCHAR(2) DEFAULT NULL,
    city VARCHAR(128) DEFAULT NULL,
    browser VARCHAR(64) DEFAULT NULL,
    os VARCHAR(64) DEFAULT NULL,
    device ENUM('desktop','mobile','tablet','unknown') DEFAULT 'unknown',
    utm_source VARCHAR(256) DEFAULT NULL,
    utm_medium VARCHAR(256) DEFAULT NULL,
    utm_campaign VARCHAR(256) DEFAULT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_as_visitor (visitor_id),
    INDEX idx_as_started (started_at),
    INDEX idx_as_country (country),
    INDEX idx_as_device (device)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Custom event tracking
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL,
    visitor_id VARCHAR(64) DEFAULT NULL,
    name VARCHAR(256) NOT NULL,
    data JSON DEFAULT NULL,
    url VARCHAR(2048) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ae_session_created (session_id, created_at),
    INDEX idx_ae_name (name(191)),
    INDEX idx_ae_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
