const jwt = require('jsonwebtoken');
const crypt = require('../config/encrypt');

module.exports = async (req, res, next) => {
    // check if the token exists in the req.header
    //  --> throw an error: 401 access denied: no token provided
    //      send a response with this error (request pipeline done)
    //
    // decode the token (with the secret key)
    //  --> if it was NOT successful: invalid token or token has been tampered with!
    //      throw and error: 400 bad request
    //      send response with error (request pipeline done)
    //
    // add the decoded content to the request object
    // move onto the next in the request pipeline
    try {
        const token = req.header('x-authentication-token');
        if (!token) throw {statusCode: 401, message: 'Access denied: no token provided.'};

        console.log(token);
        
        const decodedToken = await jwt.verify(token, crypt.jwtPrivateKey);
        
        console.log(decodedToken);

        req.user = decodedToken;
        next(); 
    }
    catch (err) {
        let errorMessage;
        if (!err.statusCode) {
            errorMessage = {
                statusCode: 400,
                message: err
            }
        } else {
            errorMessage = err;
        }
        res.status(errorMessage.statusCode).send(JSON.stringify(errorMessage));
    }
};