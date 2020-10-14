USE "1074271"

 -- CREATING USER TABLE ("botUser") --
    CREATE TABLE botUser
    (
        userID INT IDENTITY NOT NULL,
        email NVARCHAR (255) NOT NULL,
        firstName NVARCHAR (255) NOT NULL,
        lastName NVARCHAR (255) NOT NULL,
        dateOfBirth DATE NOT NULL,
        PRIMARY KEY(userID)
    )

    CREATE TABLE botClass
    (
        classID INT IDENTITY NOT NULL,
        className NVARCHAR (255) NOT NULL,
        PRIMARY KEY(classID)
    )

    CREATE TABLE botRole
    (
        roleID INT IDENTITY NOT NULL,
        roleName NVARCHAR (255) NOT NULL,
        roleDescription NVARCHAR (255) NOT NULL
        PRIMARY KEY(roleID)
    )

    CREATE TABLE botTrustedPassword
    (
        FK_userID INT NOT NULL,
        hashedPassword NVARCHAR(255) NOT NULL,

        CONSTRAINT FK_PasswordUser FOREIGN KEY (FK_userID) REFERENCES botUser(userID)
    )

    CREATE TABLE botUserRole
    (
        FK_userID INT NOT NULL,
        FK_roleID INT NOT NULL

        CONSTRAINT FK_UserRole_User FOREIGN KEY(FK_userID) REFERENCES botUser(userId),
        CONSTRAINT FK_UserRole_Role FOREIGN KEY(FK_roleID) REFERENCES botRole(roleID)
    )


    CREATE TABLE botUserClass
    (
        FK_userID INT NOT NULL,
        FK_classID INT NOT NULL

        CONSTRAINT FK_UserClass_User FOREIGN KEY(FK_userID) REFERENCES botUser(userId),
        CONSTRAINT FK_UserClass_Class FOREIGN KEY(FK_classID) REFERENCES botClass(classID)
    )

    CREATE TABLE attendance
    (
        FK_userID INT NOT NULL,
        FK_classID INT NOT NULL,
        datum date NOT NULL,
        present BIT NOT NULL

        CONSTRAINT FK_attendance_User FOREIGN KEY(FK_userID) REFERENCES botUser(userId),
        CONSTRAINT FK_attendance_Class FOREIGN KEY(FK_classID) REFERENCES botClass(classID)
    )


    -- INSERT INTO botUser(email, firstName, lastName, dateOfBirth) 
    -- VALUES
    -- ('TonyHarrison@ucn.dk', 'Tony', 'Harrison', '1968-10-9'),
    -- ('VinceNoir@ucn.dk', 'Vince', 'Noir', '1980-5-12'),
    -- ('HowardMoon@ucn.dk', 'Howard', 'Moon', '1985-8-28'),

    -- ('admin@ucn.dk', 'Bob', 'Fossil', '1998-10-12'),
    -- ('admin@ucn.dk', 'Shaman', 'Naboo', '1998-11-13'),
    -- ('admin@ucn.dk', 'Tommy', 'Nookah', '1998-3-8'),
    -- ('admin@ucn.dk', 'Milky', 'Joe', '1998-2-9'),
    -- ('admin@ucn.dk', 'Percius', 'Lilywhite', '1998-10-14'),
    -- ('admin@ucn.dk', 'Jhonny', 'Two-Hats', '1998-8-24'),
    -- ('admin@ucn.dk', 'David', 'Pieface', '1998-5-20')

    INSERT INTO botRole(roleName, roleDescription)
    VALUES
    ('Teacher', 'Teacher has access to its students attendance and is able change it.'),
    ('Student', 'Student can see his/her attendance.')

    INSERT INTO botClass(className)
    VALUES
    ('Music'),
    ('Sports'),
    ('Dance')


    SELECT * FROM botUser

