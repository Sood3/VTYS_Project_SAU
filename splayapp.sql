CREATE  SCHEMA users;

CREATE TABLE "users"."User" (
    "userID" SERIAL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "is_standart" BOOLEAN DEFAULT TRUE,
    "is_developer" BOOLEAN DEFAULT FALSE,
    "is_mod" BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT "userPK" PRIMARY KEY ("userID")
);

CREATE TABLE "users"."Standart"(
    "userID" INT,
    
    CONSTRAINT "standart_userPK" PRIMARY KEY ("userID"),
    CONSTRAINT "standart_userFK" FOREIGN KEY ("userID") REFERENCES "users"."User"("userID") on DELETE CASCADE on UPDATE CASCADE
);

CREATE TABLE "users"."Developer"(
    "userID" INT,
    
    CONSTRAINT "developer_userPK" PRIMARY KEY ("userID"),
    CONSTRAINT "developer_userFK" FOREIGN KEY ("userID") REFERENCES "users"."User"("userID") on DELETE CASCADE on UPDATE CASCADE
);

CREATE TABLE "users"."Mod"(
    "userID" INT,
    
    CONSTRAINT "mod_userPK" PRIMARY KEY ("userID"),
    CONSTRAINT "mod_userFK" FOREIGN KEY ("userID") REFERENCES "users"."User"("userID") on DELETE CASCADE on UPDATE CASCADE
);

CREATE TABLE "public"."FriendRequest"(
    "requesterID" INT,
    "requestedID" INT,
    "friendshipID" SERIAL,
    "date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "state" BOOLEAN DEFAULT NULL,
    
    CONSTRAINT "friend_requestPK" PRIMARY KEY ("requesterID", "requestedID", "friendshipID"),
    
    CONSTRAINT "friend_request_requesterFK" FOREIGN KEY ("requesterID") 
    REFERENCES "users"."User"("userID"),

    CONSTRAINT "friend_request_requestedFK" FOREIGN KEY ("requestedID") 
    REFERENCES "users"."User"("userID")
);

CREATE TABLE "public"."FriendshipList"(
    "friendshipID" INT,
    "requesterID" INT,
    "requestedID" INT,
    "approval_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "friendshipPK" PRIMARY KEY ("friendshipID", "requesterID", "requestedID")
);

CREATE TABLE "public"."Purchase"(
    "purchaseID" SERIAL,
    "purch_date" tIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "purch_amount" FLOAT NOT NULL,
    "purch_content" VARCHAR(255) NOT NULL,
    
    CONSTRAINT "purchasePK" PRIMARY KEY ("purchaseID")
);

CREATE TABLE "public"."Game"(
    "gameID" SERIAL UNIQUE,
    "purchaseID" INT DEFAULT NULL,
    "game_name" VARCHAR(255) NOT NULL,
    "release_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "average_rating" DECIMAL(3, 2) DEFAULT 0.0,
    
    CONSTRAINT "gamePK" PRIMARY KEY ("gameID"),
    
    CONSTRAINT "gameFK" FOREIGN KEY ("purchaseID")
    REFERENCES "public"."Purchase"("purchaseID")
    ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE "public"."DLC"(
    "dlcID" SERIAL UNIQUE,
    "purchaseID" INT DEFAULT NULL,
    "dlc_name" VARCHAR(255) NOT NULL,
    "release_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "dlcPK" PRIMARY KEY ("dlcID"),
    
    CONSTRAINT "dlcFK" FOREIGN KEY ("purchaseID")
    REFERENCES "public"."Purchase"("purchaseID")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "public"."Development"(
    "gameID" INT,
    "devopID" INT,
    
    CONSTRAINT "developmentPK" PRIMARY KEY ("gameID", "devopID"),
    
    CONSTRAINT "dev_gameFK" FOREIGN KEY ("gameID")
    REFERENCES "public"."Game"("gameID"),
    
    CONSTRAINT "dev_devopFK" FOREIGN KEY ("devopID")
    REFERENCES "users"."Developer"("userID")
);

CREATE TABLE "public"."Type"(
    "typeID" SERIAL,
    "type_name" VARCHAR(255) NOT NULL,
    "singlePlayer" BOOLEAN DEFAULT FALSE,
    "multiPlayer" BOOLEAN DEFAULT FALSE,
    "offline" BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT "typePK" PRIMARY KEY ("typeID")
    
);

CREATE TABLE "public"."GameType"(
    "gameID" INT,
    "typeID" INT,
    
    CONSTRAINT "gametypePK" PRIMARY KEY ("gameID", "typeID"),
    
    CONSTRAINT "gametype_gameFK" FOREIGN KEY ("gameID")
    REFERENCES "public"."Game"("gameID"),
    
    CONSTRAINT "gametype_typeFK" FOREIGN KEY ("typeID")
    REFERENCES "public"."Type"("typeID")
);

CREATE TABLE "public"."SinglePlayer"(
    "typeID" INT,
    "session_info" VARCHAR(255),
    
    CONSTRAINT "singleplayerPK" PRIMARY KEY ("typeID"),
    
    CONSTRAINT "singleplayerFK" FOREIGN KEY ("typeID")
    REFERENCES "public"."Type"("typeID")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."MultiPlayer"(
    "typeID" INT,
    "server_info" VARCHAR(255),
    
    CONSTRAINT "multiplayerPK" PRIMARY KEY ("typeID"),
    
    CONSTRAINT "multiplayerFK" FOREIGN KEY ("typeID")
    REFERENCES "public"."Type"("typeID")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."Offline"(
    "typeID" INT,
    "internet_status" VARCHAR(255),
    
    CONSTRAINT "offlinePK" PRIMARY KEY ("typeID"),
    
    CONSTRAINT "offlineFK" FOREIGN KEY ("typeID")
    REFERENCES "public"."Type"("typeID")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "public"."Platform"(
    "platformID" SERIAL,
    "platform_name" VARCHAR(255) NOT NULL,
    
    CONSTRAINT "platformPK" PRIMARY KEY ("platformID")
);

CREATE TABLE "public"."PlatformPurchase" (
    "purchaseID" INT,
    "platformID" INT,
    
    CONSTRAINT "platpurchPK" PRIMARY KEY ("platformID", "purchaseID"),
    
    CONSTRAINT "platpurch_purchFK" FOREIGN KEY ("purchaseID")
    REFERENCES "public"."Purchase"("purchaseID"),
    
    CONSTRAINT "platpurch_platFK" FOREIGN KEY ("platformID")
    REFERENCES "public"."Platform"("platformID")
);


CREATE TABLE "public"."Library"(
    "userID" INT,
    "content" INT,
    "added_date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "libraryPK" PRIMARY KEY ("userID", "content"),
    
    CONSTRAINT "library_userFK" FOREIGN KEY ("userID")
    REFERENCES "users"."User"("userID"),
    
    CONSTRAINT "library_purchFK" FOREIGN KEY ("content")
    REFERENCES "public"."Purchase"("purchaseID")
);

CREATE TABLE "public"."Reviews"(
    "reviewID" SERIAL,
    "userID" INT,
    "content" INT,
    "info" VARCHAR(255) NOT NULL,
    "rating" DECIMAL(2,1) NOT NULL,
    
    CONSTRAINT "reviewsPK" PRIMARY KEY ("reviewID", "userID", "content"),
    
    CONSTRAINT "reviewsFK" FOREIGN KEY ("userID", "content")
    REFERENCES "public"."Library"("userID","content")
);

CREATE TABLE "public"."Marking"(
    "reviewID" INT,
    "reviewerID" INT,
    "content" INT,
    "markerID" INT,
    "mark_type" BOOLEAN NOT NULL,
    
    CONSTRAINT "markingPK" PRIMARY KEY ("reviewID", "reviewerID", "content", "markerID"),
    
    CONSTRAINT "marking_reviewFK" FOREIGN KEY ("reviewID", "reviewerID", "content")
    REFERENCES "public"."Reviews"("reviewID", "userID", "content"),
    
    CONSTRAINT "marking_userFK" FOREIGN KEY ("markerID")
    REFERENCES "users"."User"("userID")
);

INSERT INTO "users"."User" (username, email, password, is_standart, is_developer, is_mod)
VALUES
('JohnDoe', 'john@example.com', 'password123', TRUE, FALSE, FALSE),
('JaneDev', 'jane@example.com', 'securepass', FALSE, TRUE, FALSE),
('ModGuy', 'mod@example.com', 'modpassword', FALSE, FALSE, TRUE);


INSERT INTO "users"."Standart" ("userID")
VALUES
(1);

INSERT INTO "users"."Developer" ("userID")
VALUES
(2);

INSERT INTO "users"."Mod" ("userID")
VALUES
(3);

INSERT INTO "public"."Game" ("game_name")
VALUES
('Game A'),
('Game B'),
('Game C');

INSERT INTO "public"."DLC" ("dlc_name")
VALUES
('DLC 1'),
('DLC 2'),
('DLC 3');

INSERT INTO "public"."Purchase" ("purch_date", "purch_amount", "purch_content")
VALUES
(CURRENT_TIMESTAMP, 59.99, 'Game A'),
(CURRENT_TIMESTAMP, 19.99, 'Game B'),
(CURRENT_TIMESTAMP, 29.99, 'DLC C');


INSERT INTO "public"."Library" ("userID", "content", "added_date")
VALUES
(1, 1, CURRENT_TIMESTAMP),
(2, 1, CURRENT_TIMESTAMP),
(1, 2, CURRENT_TIMESTAMP),
(3, 2, CURRENT_TIMESTAMP);


INSERT INTO "public"."Reviews" ("userID", "content", "info", "rating")
VALUES
(1, 1, 'Great game!', 4.5),
(2, 1, 'Not bad.', 3.5),
(1, 2, 'Amazing gameplay!', 4.8),
(3, 2, 'Loved it!', 5.0);

INSERT INTO "public"."Type" ("type_name", "singlePlayer", "multiPlayer", "offline")
VALUES
('Action', TRUE, FALSE, TRUE),
('Strategy', TRUE, TRUE, FALSE),
('Adventure', TRUE, TRUE, TRUE);

INSERT INTO "public"."GameType" ("gameID", "typeID")
VALUES
(1, 1),
(2, 2),
(3, 3);

INSERT INTO "public"."Platform" (platform_name)
VALUES
('MacOS'),
('Windows'),
('VR');

INSERT INTO "public"."PlatformPurchase" ("platformID", "purchaseID")
VALUES
(1, 1),
(2, 2),
(3, 3);

INSERT INTO "public"."FriendRequest" ("requesterID", "requestedID", "state")
VALUES
(1, 2, TRUE),
(2, 3, TRUE),
(3, 1, TRUE);

INSERT INTO "public"."FriendshipList" ("friendshipID", "requesterID", "requestedID")
VALUES
(1, 1, 2),
(2, 2, 3),
(3, 3, 1);



CREATE OR REPLACE FUNCTION send_friend_request(
    p_requesterID INT,
    p_requestedID INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO "public"."FriendRequest" ("requesterID", "requestedID")
    VALUES (p_requesterID, p_requestedID);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_user(
    p_username VARCHAR,
    p_email VARCHAR,
    p_password VARCHAR,
    p_is_standart BOOLEAN,
    p_is_developer BOOLEAN,
    p_is_mod BOOLEAN
) RETURNS VOID AS $$
BEGIN
    INSERT INTO "users"."User" ("username", "email", "password", "is_standart", "is_developer", "is_mod")
    VALUES (p_username, p_email, p_password, p_is_standart, p_is_developer, p_is_mod);
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_friend_request_state() 
RETURNS TRIGGER AS $$ 
BEGIN
    -- Eğer state TRUE ise, FriendshipList tablosuna ekle 
    IF NEW.state = TRUE THEN 
        INSERT INTO public."FriendshipList" ("friendshipID", "requesterID", "requestedID", "approval_date") 
        VALUES (OLD."friendshipID", OLD."requesterID", OLD."requestedID", CURRENT_TIMESTAMP); 
    END IF;

    -- Kaydı FriendRequest tablosundan sil
    DELETE FROM public."FriendRequest" 
    WHERE "requesterID" = OLD."requesterID" 
      AND "requestedID" = OLD."requestedID"
      AND "friendshipID" = OLD."friendshipID";

    RETURN NULL; -- Trigger'da RETURN NULL kullanımı güncelleme işlemini iptal eder. 
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_friend_request_state 

AFTER UPDATE OF state 

ON public."FriendRequest" 

FOR EACH ROW 

EXECUTE FUNCTION handle_friend_request_state(); 


CREATE OR REPLACE FUNCTION get_friend_requests(requestedID INT)
RETURNS TABLE("friendshipID" INT, "requesterUsername" VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT fr."friendshipID", u."username" AS "requesterUsername"
    FROM public."FriendRequest" fr
    JOIN "users"."User" u ON u."userID" = fr."requesterID"
    WHERE fr."requestedID" = requestedID AND fr."state" IS NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_games_by_name( 

    search_game_name VARCHAR ) 

RETURNS TABLE ( 

    game_id INT, 

    game_name VARCHAR, 

    release_date TIMESTAMP 

) AS $$ 

BEGIN 

    RETURN QUERY 

    SELECT  

        "Game"."gameID", 

        "Game"."game_name", 

        "Game"."release_date" 

    FROM public."Game" 

    WHERE  

        "Game"."game_name" ILIKE '%' || search_game_name || '%'; 

END; 

$$ LANGUAGE plpgsql; 

CREATE TABLE public."PasswordChangeLog" ( 

    "logID" SERIAL PRIMARY KEY, 

    "userID" INT NOT NULL, 

    "old_password" TEXT, 

    "new_password" TEXT, 

    "changed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_log_userFK" FOREIGN KEY ("userID") REFERENCES users."User"("userID") ON DELETE CASCADE 

); 

CREATE OR REPLACE FUNCTION log_password_changes() 

RETURNS TRIGGER AS $$ 

BEGIN 

    -- Şifre değişmiş mi kontrol et 

    IF NEW.password IS DISTINCT FROM OLD.password THEN 

        INSERT INTO public."PasswordChangeLog" ( 

            "userID", "old_password", "new_password", "changed_at" 

        ) VALUES ( 

            NEW."userID", OLD.password, NEW.password, CURRENT_TIMESTAMP 

        ); 

    END IF; 

  

    RETURN NEW; -- Güncellemeyi devam ettir 

END; 

$$ LANGUAGE plpgsql; 

CREATE TRIGGER trigger_password_changes 

BEFORE UPDATE OF password 

ON users."User" 

FOR EACH ROW 

EXECUTE FUNCTION log_password_changes(); 



CREATE OR REPLACE FUNCTION get_user_friends(user_id INT) 

RETURNS TABLE ( 

    friend_name VARCHAR, 

    friendship_date TIMESTAMP 

) AS $$ 

BEGIN 

    RETURN QUERY 

    SELECT   

        CASE   

            WHEN "FriendshipList"."requesterID" = user_id THEN "User2"."username"  

            ELSE "User1"."username"  

        END AS "friend_name",  

        "FriendshipList"."approval_date" AS "friendship_date"  

    FROM   

        "public"."FriendshipList"  

    JOIN "users"."User" AS "User1"   

        ON "FriendshipList"."requesterID" = "User1"."userID"  

    JOIN "users"."User" AS "User2"   

        ON "FriendshipList"."requestedID" = "User2"."userID"  

    WHERE   

        "FriendshipList"."requesterID" = user_id   

        OR "FriendshipList"."requestedID" = user_id; 

END; 

$$ LANGUAGE plpgsql; 

CREATE OR REPLACE FUNCTION delete_user_related_data() 

RETURNS TRIGGER AS $$ 

BEGIN 

    -- FriendRequest tablosundaki ilgili kayıtları sil 

    DELETE FROM "public"."FriendRequest" 

    WHERE "requesterID" = OLD."userID" OR "requestedID" = OLD."userID"; 

  

    -- FriendshipList tablosundaki ilgili kayıtları sil 

    DELETE FROM "public"."FriendshipList" 

    WHERE "requesterID" = OLD."userID" OR "requestedID" = OLD."userID"; 

  

    -- Library tablosundaki ilgili kayıtları sil 

    DELETE FROM "public"."Library" 

    WHERE "userID" = OLD."userID"; 

  

    -- Reviews tablosundaki ilgili kayıtları sil 

    DELETE FROM "public"."Reviews" 

    WHERE "userID" = OLD."userID"; 

  

    -- Marking tablosundaki ilgili kayıtları sil 

    DELETE FROM "public"."Marking" 

    WHERE "markerID" = OLD."userID" OR "reviewerID" = OLD."userID"; 

  

    -- Developer tablosundaki ilgili kayıtları sil 

    DELETE FROM "users"."Developer" 

    WHERE "userID" = OLD."userID"; 

  

    -- Mod tablosundaki ilgili kayıtları sil 

    DELETE FROM "users"."Mod" 

    WHERE "userID" = OLD."userID"; 

  

    -- Standart tablosundaki ilgili kayıtları sil 

    DELETE FROM "users"."Standart" 

    WHERE "userID" = OLD."userID"; 

  

    -- İşlem tamam, silinecek kayıt geri döndürülüyor 

    RETURN OLD; 

END; 

$$ LANGUAGE plpgsql; 


CREATE TRIGGER user_delete_trigger 

BEFORE DELETE ON "users"."User" 

FOR EACH ROW 

EXECUTE FUNCTION delete_user_related_data(); 


CREATE OR REPLACE FUNCTION update_game_rating() 
RETURNS TRIGGER AS $$ 
BEGIN 
    UPDATE "public"."Game" 
    SET "average_rating" = ( 
        SELECT COALESCE(AVG("rating"), 0.0) 
        FROM "public"."Reviews" 
        WHERE "content" = COALESCE(NEW."content", OLD."content") 
    ) 
    WHERE "gameID" = COALESCE(NEW."content", OLD."content"); 

    RETURN NULL;
END;
$$ LANGUAGE plpgsql; 

CREATE TRIGGER update_game_rating_trigger 
AFTER INSERT OR UPDATE OR DELETE
ON "public"."Reviews" 
FOR EACH ROW 
EXECUTE FUNCTION update_game_rating();
