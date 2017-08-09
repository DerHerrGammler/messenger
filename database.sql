CREATE TABLE userdata (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE KEY,
    user_password VARCHAR(255),
    user_email VARCHAR(255) UNIQUE KEY
);
CREATE TABLE message (
    message_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    time TIMESTAMP,
    message VARCHAR(255),
    status VARCHAR(10)
);
CREATE TABLE pw_back (
    pw_back_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    time TIMESTAMP,
    link VARCHAR(255) UNIQUE KEY
);


INSERT INTO userdata ( username, user_password, user_email ) VALUES ( "DieFrauGammler", "lulz1!H", "bli@bla.blub" );
UPDATE userdata SET user_email = "herold_felix@web.de" WHERE username = "DerHerrGammler";
INSERT INTO userdata (username, user_password, user_email) VALUES ( "DasEtwasGammler", "Haha123!", "trololol@dein.mudda");
DELETE FROM userdata WHERE username = "DerHerrGammler";

INSERT INTO message ( sender_id, receiver_id, message) VALUES ( 4, 5, "Du bist ein Idiot.");
INSERT INTO message ( sender_id, receiver_id, message) VALUES ( 5, 4, "Pff das sagt der richtige Lappen!!");

SELECT * FROM message
LEFT JOIN userdata ON message.receiver_id = userdata.id
WHERE receiver_id = 4;

-- Gleich neu erstellen

CREATE TABLE userdata(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE KEY,
    user_password TEXT,
    user_email VARCHAR(255) UNIQUE KEY
);
CREATE TABLE message(
    message_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    unixtime INT,
    message TEXT,
    stat VARCHAR(10)
);
CREATE TABLE pw_back(
    pw_back_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    unixtime INT,
    link VARCHAR(255) UNIQUE KEY
);
