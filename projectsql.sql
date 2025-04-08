CREATE DATABASE COP4710;

CREATE TABLE Location (
    location_ID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    latitude REAL,
    longitude REAL
);

CREATE TABLE Universities (
    university_ID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location_ID INT REFERENCES Location(location_ID),
    description TEXT,
    num_of_students INT
);

CREATE TABLE Users (
    UID INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
	name VARCHAR(100),
    user_type ENUM('student', 'admin', 'superadmin') NOT NULL DEFAULT 'student',
    university_ID INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (university_ID) REFERENCES Universities(university_ID) ON DELETE SET NULL
);

CREATE TABLE SuperAdmins (
    UID INT PRIMARY KEY,
    FOREIGN KEY (UID) REFERENCES Users(UID) ON DELETE CASCADE
);

CREATE TABLE Admins (
    UID INT PRIMARY KEY,
    FOREIGN KEY (UID) REFERENCES Users(UID) ON DELETE CASCADE
);

CREATE TABLE Events (
    event_ID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    event_category VARCHAR(100),
    description TEXT,
    event_time TIME NOT NULL,
    event_date DATE NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    location_ID INT,
    university_ID INT,
    ISA_type ENUM('RSO', 'Private', 'Public') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by_UID INT,
    FOREIGN KEY (location_ID) REFERENCES Location(location_ID),
    FOREIGN KEY (university_ID) REFERENCES Universities(university_ID),
    FOREIGN KEY (created_by_UID) REFERENCES Users(UID)
);

-- Trigger to prevent overlapping events if they occur at same location and within 1 hour of each other
DELIMITER $$

CREATE TRIGGER PreventOverlappingEvents
BEFORE INSERT ON Events
FOR EACH ROW
BEGIN
    DECLARE conflict_count INT;

    SELECT COUNT(*) INTO conflict_count
    FROM Events
    WHERE location_ID = NEW.location_ID
      AND event_date = NEW.event_date
      AND ABS(TIMESTAMPDIFF(MINUTE, event_time, NEW.event_time)) < 60;

    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Another event exists at this location within 1 hour of the specified time.';
    END IF;
END$$

DELIMITER ;

CREATE TABLE Comments (
    comment_ID INT PRIMARY KEY AUTO_INCREMENT,
    event_ID INT,
    user_ID INT,
    text TEXT,
    rating INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_ID) REFERENCES Events(event_ID) ON DELETE CASCADE,
    FOREIGN KEY (user_ID) REFERENCES Users(UID) ON DELETE CASCADE,
    CHECK (rating BETWEEN 1 AND 5)
);

CREATE TABLE RSOs (
    RSO_ID INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    university_ID INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_ID INT,
    status VARCHAR(100) DEFAULT 'inactive',
    FOREIGN KEY (university_ID) REFERENCES Universities(university_ID) ON DELETE CASCADE,
    FOREIGN KEY (admin_ID) REFERENCES Users(UID)
);

CREATE TABLE RSO_Members (
    RSO_ID INT,
    user_ID INT,
    PRIMARY KEY (RSO_ID, user_ID),
    FOREIGN KEY (RSO_ID) REFERENCES RSOs(RSO_ID) ON DELETE CASCADE,
    FOREIGN KEY (user_ID) REFERENCES Users(UID) ON DELETE CASCADE
);

-- Trigger to activate RSO if it has more than 4 members
DELIMITER $$

CREATE TRIGGER RSOStatusUpdate
AFTER INSERT ON RSO_Members
FOR EACH ROW
BEGIN
    DECLARE member_count INT;

    SELECT COUNT(*) INTO member_count
    FROM RSO_Members
    WHERE RSO_ID = NEW.RSO_ID;

    IF member_count > 4 THEN
        UPDATE RSOs
        SET status = 'active'
        WHERE RSO_ID = NEW.RSO_ID;
    END IF;
END$$

DELIMITER ;

CREATE TABLE RSO_Events (
    event_ID INT PRIMARY KEY,
    RSO_ID INT,
    FOREIGN KEY (event_ID) REFERENCES Events(event_ID) ON DELETE CASCADE,
    FOREIGN KEY (RSO_ID) REFERENCES RSOs(RSO_ID)
);

CREATE TABLE Private_Events (
    event_ID INT PRIMARY KEY,
    FOREIGN KEY (event_ID) REFERENCES Events(event_ID) ON DELETE CASCADE
);

CREATE TABLE Public_Events (
    event_ID INT PRIMARY KEY,
    superadmin_ID INT,
    FOREIGN KEY (event_ID) REFERENCES Events(event_ID) ON DELETE CASCADE,
    FOREIGN KEY (superadmin_ID) REFERENCES SuperAdmins(UID)
);
