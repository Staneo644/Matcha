CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    pseudo VARCHAR(100),
    birthday DATE,
    gender ENUM('M', 'W', 'O') DEFAULT 'O',
    orientation ENUM('M', 'W', 'O') DEFAULT 'O',
    bio TEXT,
    want_location BOOLEAN DEFAULT 0,
    location_latitude FLOAT(10, 6),
    location_longitude FLOAT(10, 6),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pictures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    data LONGBLOB NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS user_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE (user_id, tag_id)
);

CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    like_type ENUM('like', 'view', 'block') DEFAULT 'view',
    liker_id INT NOT NULL,
    liked_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (liker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (liked_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (liker_id, liked_id)
);

CREATE TABLE IF NOT EXISTS connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    number_message_unread_user1 INT DEFAULT 0,
    number_message_unread_user2 INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    connection_id INT NOT NULL,
    sender_id INT NOT NULL,
    body TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT IGNORE INTO tags (name)
VALUES
    ('geek'),
    ('nerd'),
    ('vin'),
    ('alcool'),
    ('bourgeois'),
    ('gauche forte'),
    ('droite conserva-triste'),
    ('coktail'),
    ('voyage'),
    ('musique'),
    ('sport'),
    ('cinéma'),
    ('lecture'),
    ('jeux vidéo'),
    ('manga'),
    ('anime'),
    ('série'),
    ('cuisine');

INSERT IGNORE INTO users 
(email, password_hash, pseudo, birthday, gender, orientation, bio, want_location, location_latitude, location_longitude)
VALUES
    ('A@example.com', '$2a$12$0jVuVGwMnjOCh4BvKsQB9.HbiKvMh93FsZ6RJyuuz1jGadTVxS2ba', 'A_user', '1990-01-01', 'M', 'O', 'This is a test user.', 1, 48.8566, 2.3522),
    ('B@example.com', '$2a$12$0jVuVGwMnjOCh4BvKsQB9.HbiKvMh93FsZ6RJyuuz1jGadTVxS2ba', 'B_user', '1992-01-01', 'W', 'M', 'This is a test user.', 1, 45.7264, 4.8801),
    ('C@example.com', '$2a$12$0jVuVGwMnjOCh4BvKsQB9.HbiKvMh93FsZ6RJyuuz1jGadTVxS2ba', 'C_user', '1996-01-01', 'O', 'O', 'This is a test user.', 1, 46.2045, 6.0467);

INSERT IGNORE INTO user_tags (user_id, tag_id)
VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (2, 1),
    (2, 2),
    (2, 6),
    (3, 1),
    (3, 3),
    (3, 9);