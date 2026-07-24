-- Database Schema for Personal Website & Admin Panel CMS

-- 1. Users Table (Admin authentication)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Site Settings Table
CREATE TABLE IF NOT EXISTS `site_settings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `setting_key` VARCHAR(50) UNIQUE NOT NULL,
    `value_id` TEXT,
    `value_en` TEXT,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Posts / Blog Table
CREATE TABLE IF NOT EXISTS `posts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(200) UNIQUE NOT NULL,
    `title_id` VARCHAR(255) NOT NULL,
    `title_en` VARCHAR(255) NOT NULL,
    `content_id` LONGTEXT NOT NULL,
    `content_en` LONGTEXT NOT NULL,
    `excerpt_id` TEXT,
    `excerpt_en` TEXT,
    `category` VARCHAR(100) NOT NULL,
    `read_time` VARCHAR(50) DEFAULT '5 min baca',
    `is_published` TINYINT(1) DEFAULT 1,
    `published_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Projects / Portfolio Table
CREATE TABLE IF NOT EXISTS `projects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(200) UNIQUE NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description_id` TEXT NOT NULL,
    `description_en` TEXT NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `tags` JSON NOT NULL,
    `project_url` VARCHAR(255),
    `github_url` VARCHAR(255),
    `is_featured` TINYINT(1) DEFAULT 0,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Experiences Table (About Page Timeline)
CREATE TABLE IF NOT EXISTS `experiences` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `role_id` VARCHAR(200) NOT NULL,
    `role_en` VARCHAR(200) NOT NULL,
    `company` VARCHAR(200) NOT NULL,
    `period` VARCHAR(100) NOT NULL,
    `description_id` TEXT,
    `description_en` TEXT,
    `sort_order` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Messages Table (Contact Inbox)
CREATE TABLE IF NOT EXISTS `messages` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `subject` VARCHAR(200),
    `message` TEXT NOT NULL,
    `is_read` TINYINT(1) DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Activity Logs Table (Security Audit Trail)
CREATE TABLE IF NOT EXISTS `activity_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `action` VARCHAR(100) NOT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `user_agent` TEXT NULL,
    `status` ENUM('SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
