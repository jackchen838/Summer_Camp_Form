-- 家長聯絡登記資料表
-- 會以 student_id 關聯既有 student(id)，並建立查詢索引。

CREATE TABLE IF NOT EXISTS parent_contact_registrations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    event_year SMALLINT NOT NULL DEFAULT 2026,
    contact_0703 BOOLEAN NOT NULL DEFAULT FALSE COMMENT '7/3（五）是否需要家長聯絡',
    contact_0704 BOOLEAN NOT NULL DEFAULT FALSE COMMENT '7/4（六）是否需要家長聯絡',
    contact_0705 BOOLEAN NOT NULL DEFAULT FALSE COMMENT '7/5（日）是否需要家長聯絡',
    note VARCHAR(1000) DEFAULT '' COMMENT '備註',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_student_event_year (student_id, event_year),
    INDEX idx_parent_contact_student_id (student_id),
    INDEX idx_parent_contact_days (contact_0703, contact_0704, contact_0705),

    CONSTRAINT fk_parent_contact_student
        FOREIGN KEY (student_id) REFERENCES student(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
