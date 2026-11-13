USE fishery_db;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    phone VARCHAR(20) DEFAULT NULL,

    password VARCHAR(255) NOT NULL,

    role ENUM('admin', 'dealer', 'customer')
        NOT NULL DEFAULT 'customer',

    status ENUM('active', 'pending', 'rejected', 'blocked')
        NOT NULL DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_role (role),

    INDEX idx_users_status (status)
);