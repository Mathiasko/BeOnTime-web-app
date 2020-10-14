
-- CREATING USER TABLE ("botUser") --
CREATE TABLE botUser
(
    userID INT IDENTITY NOT NULL,
    email NVARCHAR (255) NOT NULL,
    firstName NVARCHAR (50) NOT NULL,
    lastName NVARCHAR (50) NOT NULL,
    phoneNumber NVARCHAR (14) NOT NULL,
    PRIMARY KEY(userID)
)

CREATE TABLE botClass
(
    classID INT IDENTITY NOT NULL,
    className NVARCHAR (50) NOT NULL,
    PRIMARY KEY(classID)
)

CREATE TABLE botRole
(
    roleID INT IDENTITY NOT NULL,
    roleName NVARCHAR (50) NOT NULL,
    roleDescription NVARCHAR (255) NOT NULL
        PRIMARY KEY(roleID)
)

CREATE TABLE botUserPassword
(
    FK_userID INT NOT NULL,
    hashedPassword NVARCHAR(255) NOT NULL,

    CONSTRAINT FK_PasswordUser FOREIGN KEY (FK_userID) REFERENCES botUser(userID)
)

CREATE TABLE botUserRole
(
    FK_userID INT NOT NULL,
    FK_roleID INT NOT NULL

        CONSTRAINT FK_UserRole_User FOREIGN KEY(FK_userID) REFERENCES botUser(userID),
    CONSTRAINT FK_UserRole_Role FOREIGN KEY(FK_roleID) REFERENCES botRole(roleID)
)


CREATE TABLE botUserClass
(
    FK_userID INT NOT NULL,
    FK_classID INT NOT NULL

        CONSTRAINT FK_UserClass_User FOREIGN KEY(FK_userID) REFERENCES botUser(userID),
    CONSTRAINT FK_UserClass_Class FOREIGN KEY(FK_classID) REFERENCES botClass(classID)
)

CREATE TABLE botAttendance
(
    FK_userID INT NOT NULL,
    FK_classID INT NOT NULL,
    datum DATE NOT NULL,
    present BIT NOT NULL

        CONSTRAINT FK_attendance_User FOREIGN KEY(FK_userID) REFERENCES botUser(userID),
    CONSTRAINT FK_attendance_Class FOREIGN KEY(FK_classID) REFERENCES botClass(classID)
)

INSERT INTO botClass
    (className)
VALUES
    ('Bathematics'),
    ('Biology'),
    ('History')

INSERT INTO botAttendance
    (FK_userID, FK_classID, datum, present)
VALUES
    (4, 2, '20120618', 1),
    (4, 2, '20120619', 1),
    (4, 2, '20120620', 0)

--teacher VinceNoir@ucn.dk password: Noir123
--teacher HowardMoon@ucn.dk password: Moon123
--student BobFossil@ucn.dk password: Fossil1234
--student Milky@ucn.dk password: Joe123
--student DavidPieface@ucn.dk password: Pieface123














-- INSERT INTO botUser(email, firstName, lastName, dateOfBirth) 
-- VALUES
-- ('TonyHarrison@ucn.dk', 'Tony', 'Harrison', '1968-10-9'),
-- ('VinceNoir@ucn.dk', 'Vince', 'Noir', '1980-5-12'),
-- ('HowardMoon@ucn.dk', 'Howard', 'Moon', '1985-8-28'),

-- ('admin@ucn.dk', 'Bob', 'Fossil', '1998-10-12'),
-- ('admin@ucn.dk', 'Shaman', 'Naboo', '1998-11-13'),
-- ('admin@ucn.dk', 'Tommy', 'Nookah', '1998-3-8'),
-- ('admin@ucn.dk', 'Milky', 'Joe', '1998-2-9'),
-- ('admin@ucn.dk', 'Precious', 'Lilywhite', '1998-10-14'),
-- ('admin@ucn.dk', 'Johnny', 'Two-Hats', '1998-8-24'),
-- ('admin@ucn.dk', 'David', 'Pieface', '1998-5-20')

-- INSERT INTO botRole(roleName, roleDescription)
-- VALUES
-- ('Teacher', 'Teacher has access to its students attendance and is able change it.'),
-- ('Student', 'Student can see his/her attendance.')

-- INSERT INTO botClass(className)
-- VALUES
-- ('Music'),
-- ('Sports'),
-- ('Dance')

-- DELETE FROM botClass WHERE classID > 3

/*INSERT INTO botUserClass(FK_userID, FK_classID)
    VALUES
    (1, 1),
    (2, 2),
    (4, 3),
    (5, 1),
    (5, 2),
    (5, 3),
    (6, 1),
    (6, 2),
    (6, 3),
    (7, 1),
    (7, 2),
    (7, 3),
    (8, 1),
    (8, 2),
    (8, 3),
    (9, 1),
    (9, 2),
    (9, 3),
    (10, 1),
    (10, 2),
    (10, 3)


    INSERT INTO botUserClass(FK_userID, FK_classID)
    VALUES
    (3,3),
    (4,1),
    (4,2)
    */

    INSERT INTO botAttendance(FK_userID, FK_classID, datum, present)
    VALUES
    (8, 1, '20200923', 0),
    (8, 2, '20200923', 1),
    (8, 3, '20200923', 1),
    (8, 1, '20200922', 1),
    (8, 2, '20200922', 1),
    (8, 3, '20200922', 1),
    (8, 1, '20200921', 1),
    (8, 2, '20200921', 1),
    (8, 3, '20200921', 1)

SELECT *
FROM botUser
SELECT *
FROM botUserClass

SELECT *
FROM botUser
SELECT *
FROM botUserRole
SELECT *
FROM botClass
SELECT *
FROM botRole
SELECT *
FROM botUserPassword
SELECT *
FROM botAttendance

UPDATE botUser
    SET phoneNumber = 55555
    WHERE userID = 4


SELECT *
FROM botUser
    INNER JOIN botUserRole
    ON botUser.userID = botUserRole.FK_userID
    INNER JOIN botRole
    ON botUserRole.FK_roleID = botRole.roleID

SELECT *
FROM botUser
    INNER JOIN botUserClass
    ON botUser.userID = botUserClass.FK_userID
    INNER JOIN botClass
    ON botUserClass.FK_classID = botClass.classID
ORDER BY userID ASC

SELECT *
FROM botUser
    INNER JOIN botAttendance
    ON botUser.userID = botAttendance.FK_userID
   