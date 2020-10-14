module.exports = (req, res, next)=> {
    if (req.user.role.roleID){
        next()
    }else{
        errorMessage={
            statusCode: 401,
            message: 'Not Authorized'
        }
        res.status(401).send(JSON.stringify(errorMessage))
    }
}