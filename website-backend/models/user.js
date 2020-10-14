const con = require('../config/connection');
const sql = require('mssql');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const crypt = require('../config/encrypt.js');
const {asyncForEach} = require('../apiHelp/asyncHelper.js');

class User {
    // constructor
    constructor(userObj) {
        this.userID = userObj.userID;
        this.email = userObj.email;
        
        if (userObj.role) {
            this.role = {}
            this.role.roleID = userObj.role.roleID;
            this.role.roleName = userObj.role.roleName;
            this.role.roleDescription = userObj.role.roleDescription;
        }
        this.firstName = userObj.firstName;
        this.lastName = userObj.lastName;
        this.phoneNumber = userObj.phoneNumber;
        //this.dateOfBirth = userObj.dateOfBirth;
    }

    // static validate (for User object)
    static validate(userObj) {
        const schema = Joi.object({
            userID: Joi.number().integer().min(1),
            email: Joi.string().email().max(255),     
            role: Joi.object({
                roleID: Joi.number().integer().min(1),
                roleName: Joi.string().max(255),
                roleDescription: Joi.string().max(255)
            }),
            firstName: Joi.string().max(50),
            lastName: Joi.string().max(50),
            phoneNumber: Joi.string().max(14),
            classId: Joi.number().integer().min(1)
        });
        return schema.validate(userObj);
    }

    // static validateLoginInfo
    static validateLoginInfo(loginInfoObj) {
        const schema = Joi.object({
            email: Joi.string().email().max(255),
            password: Joi.string().min(3).max(255)
        });

        return schema.validate(loginInfoObj);
    }

    // static validateLoginInfo
    static validateAttendance(attendanceObj) {
        const schema = Joi.object({
            FK_userID: Joi.string().email().max(255),
            FK_classID: Joi.string().min(3).max(255),
            datum: Joi.date().format('YYYY-MM-DD').less('now'),
            present: Joi.number().integer().min(0).max(1)
        });
        return schema.validate(attendanceObj);
    }


    // static matchUserEmailAndPassword
    static matchUserEmailAndPassword(loginInfoObj) {
        return new Promise((resolve, reject) => {
            (async () => {
           
                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('email', sql.NVarChar(255), loginInfoObj.email)
                        .query(`SELECT * FROM botUser
                                    INNER JOIN botUserPassword
                                        ON botUser.userID = botUserPassword.FK_userID
                                    INNER JOIN botUserRole
                                        ON botUser.userID = botUserRole.FK_userID
                                    INNER JOIN botRole
                                        ON botUserRole.FK_roleID = botRole.roleID
                                    WHERE botUser.email = @email`);

                    console.log(result);
                    if (!result.recordset[0]) throw { statusCode: 404, message: 'User not found' };
                    if (result.recordset.length > 1) throw { statusCode: 500, message: 'DB is corrupt' };

                    const match = await bcrypt.compare(loginInfoObj.password, result.recordset[0].hashedPassword);
                    if (!match) throw { statusCode: 404, message: 'User not found' };

                    const record = {
                        userID: result.recordset[0].userID,
                        email: result.recordset[0].email,
                        role: {
                            roleID: result.recordset[0].roleID
                        }
                    }

                    const { error } = User.validate(record);
                    if (error) throw { statusCode: 409, message: error };

                    resolve(new User(record));
                }
                catch (err) {
                    console.log(err);
                    let errorMessage;
                    if (!err.statusCode) {
                        errorMessage = {
                            statusCode: 500,
                            message: err
                        }
                    } else {
                        errorMessage = err;
                    }
                    reject(errorMessage);
                }
                sql.close()
            })();
        });
    }

    // static readByEmail(email)
    static readByEmail(email) {
        return new Promise((resolve, reject) => {
            (async () => {
                
                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('email', sql.NVarChar(255), email)
                        .query('SELECT * FROM botUser WHERE email = @email');
                    console.log(result);
                    if (result.recordset.length == 0) throw { statusCode: 404, message: 'User not found.' };
                    if (result.recordset.length > 1) throw { statusCode: 500, message: 'Database is corrupt.' };

                    const userWannabe = {
                        userID: result.recordset[0].userID,
                        email: result.recordset[0].email
                    }

                    const { error } = User.validate(userWannabe);
                    if (error) throw { statusCode: 409, message: error };

                    resolve(new User(userWannabe));
                }
                catch (err) {
                    console.log(err);
                    let errorMessage;
                    if (!err.statusCode) {
                        errorMessage = {
                            statusCode: 500,
                            message: err
                        }
                    } else {
                        errorMessage = err;
                    }
                    reject(errorMessage);
                }
                sql.close();
            })();
        });
    }

    
    create(optionsObj) {
        return new Promise((resolve, reject) => {
            (async () => {
                
                try {
                    console.log(`optionsObj.password ${optionsObj.password}`)
                    const hashedPassword = await bcrypt.hash(optionsObj.password, crypt.saltRounds); //global var not working WTF*--*--*-*-*-***

                    const pool = await sql.connect(con);
                    const result1 = await pool.request()
                        .input('email', sql.NVarChar(255), this.email)
                        .input('firstName', sql.NVarChar(255), this.firstName)
                        .input('lastName', sql.NVarChar(255), this.lastName)
                        .input('phoneNumber', sql.NVarChar(14), this.phoneNumber)
                        .input('hashedPassword', sql.NVarChar(255), hashedPassword)
                        .query(`INSERT INTO botUser (email, firstName, lastName, phoneNumber) VALUES (@email, @firstName, @lastName, @phoneNumber);
                                SELECT userID, email, firstName, lastName FROM botUser WHERE userID = SCOPE_IDENTITY();
                                INSERT INTO botUserPassword (FK_userID, hashedPassword) VALUES (SCOPE_IDENTITY(), @hashedPassword)`);
                    console.log(result1);
                    if (result1.recordset.length != 1) throw { statusCode: 500, message: 'Database is corrupt.' };

                    const result2 = await pool.request()
                        .input('userID', sql.Int, result1.recordset[0].userID)
                        .input('roleID', sql.Int, this.role.roleID)
                        .query(`INSERT INTO botUserRole (FK_userID, FK_roleID)
                                VALUES (@userID, @roleID);
                                SELECT * FROM botUserRole INNER JOIN botRole
                                ON botUserRole.FK_roleID = botRole.roleID
                                WHERE botUserRole.FK_userID = @userID`);
                    console.log(result2);
                    if (result2.recordset.length != 1) throw { statusCode: 500, message: 'Database is corrupt.' };

                    const record = {
                        userID: result1.recordset[0].userID,
                        email: result1.recordset[0].email,
                        firstName: result1.recordset[0].firstName,
                        lastName: result1.recordset[0].lastName,
                        phoneNumber: result1.recordset[0].phoneNumber,
                        //dateOfBirth: result1.recordset[0].dateOfBirth,
                        role: {
                            roleID: result2.recordset[0].roleID,
                            roleName: result2.recordset[0].roleName,
                            roleDescription: result2.recordset[0].roleDescription
                        }
                    }

                    const { error } = User.validate(record);
                    if (error) throw { statusCode: 409, message: error };

                    resolve(new User(record));
                }
                catch (err) {
                    console.log(err);
                    let errorMessage;
                    if (!err.statusCode) {
                        errorMessage = {
                            statusCode: 500,
                            message: err
                        }
                    } else {
                        errorMessage = err;
                    }
                    reject(errorMessage);
                }
                sql.close();
            })();
        });
    }


    createAttendance(studentsarr){
        return new Promise((resolve, reject) => {
            (async () => {
                
                try {
                    const pool = await sql.connect(con);
                    const result = await pool.request()
                        .input('userID', sql.Int, studentsarr.studentId)
                        .input('classID', sql.Int, studentsarr.classId)
                        //.input('datum', sql.date, studentsarrs.datum)
                        .input('present', sql.Bit, studentsarr.studentPresent)
                        .query(`INSERT INTO botAttendance(FK_userID, FK_classID, datum, present) VALUES (@studentId, @classId, @datum, @studentPresent);`);
                    console.log(result);
                    if (result.recordset.length != 1) throw { statusCode: 500, message: 'Database is corrupt.' };

                    
                    const record = [];
                    result.recordset.forEach(record => {
                        let attendanceWannabe = {
                            userID: record.FK_userID,
                            classID: record.FK_classID,
                            datum: record.datum,
                            present: record.present
                        }
                        record.push(attendanceWannabe)
                    });

                    const { error } = User.validate(attendanceWannabe);
                    if (error) throw { statusCode: 409, message: error };

                    resolve(new User(record));
                }
                catch (err) {
                    console.log(err);
                    let errorMessage;
                    if (!err.statusCode) {
                        errorMessage = {
                            statusCode: 500,
                            message: err
                        }
                    } else {
                        errorMessage = err;
                    }
                    reject(errorMessage);
                }
                sql.close();
            })();
        });
    }


    static readById(id) {
        return new Promise((resolve, reject) => {
            (async () => {

                try {
                    const pool = await sql.connect(con)
                    const result = await pool.request()
                        .input('userID', sql.Int, id)
                        .query(`SELECT * FROM botUser
                                INNER JOIN botUserRole
                                ON botUser.userID = botUserRole.FK_userID
                                INNER JOIN botRole
                                ON botUserRole.FK_roleID = botRole.roleID
                                WHERE botUser.userID = @userID; `)
                                
                    console.log(result)

                    if (result.recordset.length == 0) throw { statusCode: 404, message: 'user not found' }
                    if (result.recordset.length > 1) throw { statusCode: 500, message: 'DB is corrupt' }

                    const userWannabe = {
                        userID: result.recordset[0].userID,
                        email: result.recordset[0].email,
                        role: {
                            roleID: result.recordset[0].roleID,
                            roleName: result.recordset[0].roleName,
                            roleDescription: result.recordset[0].roleDescription
                        },
                        firstName: result.recordset[0].firstName,
                        lastName: result.recordset[0].lastName,
                        phoneNumber: result.recordset[0].phoneNumber
                    }

                    const { error } = User.validate(userWannabe)
                    if (error) throw { statusCode: 409, message: error }

                    resolve(new User(userWannabe))
                } catch (err) {
                    let errorMessage;
                    console.log(err)
                    if (!err.statusCode) {
                        errorMessage = {
                            statusCode: 500,
                            message: err
                        }
                    } else {
                        errorMessage = err
                    }
                    reject(errorMessage)
                }
                sql.close()

            })()
        })
    }

    static readAttendance(id) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const pool = await sql.connect(con)
                    const result = await pool.request()
                        .input('userID', sql.Int, id)
                        .query(`SELECT * FROM botAttendance
                                WHERE botAttendance.FK_userID = @userID`)

                    console.log(result)

                    if (result.recordset.length == 0) throw { statusCode: 404, message: 'user not found' }

                    const attendance = [];
                    result.recordset.forEach(record => {
                        let attendanceWannabe = {
                            userID: record.FK_userID,
                            classID: record.FK_classID,
                            datum: record.datum,
                            present: record.present
                        }
                        attendance.push(attendanceWannabe)
                    });

                    resolve(attendance)

                } catch (err) {
                    let errorMessage;
                    console.log(err)
                    if (!err.statusCode) {
                        errorMessage = {
                            statusCode: 500,
                            message: err
                        }
                    } else {
                        errorMessage = err
                    }
                    reject(errorMessage)
                }
                sql.close()

            })()
        })
    }

    static updatePhoneNumber(id, phoneNumber) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const pool = await sql.connect(con)
                    const result = await pool.request()
                        .input('userID', sql.Int, id)
                        .input('phoneNumber', sql.Int, phoneNumber)
                        .query(`UPDATE botUser
                                SET botUser.phoneNumber = @phoneNumber
                                WHERE userID = @userID
                                SELECT phoneNumber FROM botUser
                                WHERE userID = @userID`)

                    console.log(result)

                    if (result.recordset.length == 0) throw { statusCode: 404, message: 'user not found' }

                    let phoneNumberWannabe = {
                        phoneNumber: result.recordset[0].phoneNumber
                    }

                    resolve(new User(phoneNumberWannabe))

                } catch (err) {
                    let errorMessage;
                    console.log(err)
                    if (!err.statusCode) {
                        errorMessage = {
                            statusCode: 500,
                            message: err
                        }
                    } else {
                        errorMessage = err
                    }
                    reject(errorMessage)
                }
                sql.close()

            })()
        })
    }

    static readClasses(id) {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const pool = await sql.connect(con)
                    const result = await pool.request()
                        .input('userID', sql.Int, id)
                        .query(`SELECT * FROM botUser
                                INNER JOIN botUserClass
                                ON botUser.userID = botUserClass.FK_userID
                                INNER JOIN botClass
                                ON botUserClass.FK_classID = botClass.classID
                                WHERE botUser.userID = @userID`);

                    console.log(result);

                    if (result.recordset.length == 0) throw { statusCode: 404, message: 'user not found' }
                    const classes = []
                    result.recordset.forEach(record => {

                        let classWannabe = {
                            userID: record.userID,
                            classID: record.classID,
                            className: record.className
                        }
                        classes.push(classWannabe);
                    })
                    resolve(classes);

                } catch (err) {
                    let errorMessage;
                    console.log(err)
                    if (!err.statusCode) {
                        errorMessage = {
                            statusCode: 500,
                            message: err
                        }
                    } else {
                        errorMessage = err
                    }
                    reject(errorMessage);
                }
                sql.close();

            })();
        });
    }

    static getStudents() {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    const pool = await sql.connect(con)
                    const result = await pool.request()
                        .query(`SELECT userID, firstName, lastName FROM botUser
                                INNER JOIN botUserRole
                                ON botUser.userID = botUserRole.FK_userID
                                WHERE botUserRole.FK_roleID = 2`);

                  

                    if (result.recordset.length == 0) throw { statusCode: 404, message: 'user not found' }
                    const students = []
                    result.recordset.forEach(record => {

                        let studentWannabe = {
                            userID: record.userID,
                            firstName: record.firstName,
                            lastName: record.lastName
                        }
                        students.push(studentWannabe);
                    })
                    resolve(students);

                } catch (err) {
                    let errorMessage;
                    console.log(err)
                    if (!err.statusCode) {
                        errorMessage = {
                            statusCode: 500,
                            message: err
                        }
                    } else {
                        errorMessage = err
                    }
                    reject(errorMessage);
                }
                sql.close();

            })();
        });
    }

    static createAttendance(classId, students){
        return new Promise((resolve, reject) => {
            (async () => {
                
                try {
                    const pool = await sql.connect(con);

                    await asyncForEach(students, async (student)=>{
                        const result = await pool.request()
                            .input('FK_userID', sql.Int, parseInt(student.studentId))
                            .input('FK_classID', sql.Int, parseInt(student.classId))
                            .input('present', sql.Bit, !!student.studentPresent)
                            .query(`INSERT INTO botAttendance(FK_userID, FK_classID, datum, present) VALUES (@FK_userID, @FK_classID, GETDATE(), @present);`);
                        
                            console.log('create attendance');
                            console.log(result);
                            console.log(student);
                        // if (result.recordset.length != 1) throw { statusCode: 500, message: 'Database is corrupt.' };
                    })
 
                    // const { error } = User.validate(attendanceWannabe);
                    // if (error) throw { statusCode: 409, message: error };
 
                    resolve();
                    // resolve(new User(record));
                }
                
                catch (err) {
                    console.log(err);
                    let errorMessage;
                    if (!err.statusCode) {
                        errorMessage = {
                            statusCode: 500,
                            message: err
                        }
                    } else {
                        errorMessage = err;
                    }
                    reject(errorMessage);
                }

                sql.close();
            })();
        });
    }
}

module.exports = User;