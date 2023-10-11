const jwt =require('jsonwebtoken');
const { InternalServerError } = require('../error-types/server-err');
const { NotAuthoriozedError } = require('../error-types/not-authorized-err');

/**
 * 
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns returns the current user if JWT present in session cookie
 * @description this function can be used  for user authentication
 * 
 */

const currentUser = (
    req, 
    res, 
    next
) => {
    
    if (!req.session || !req.session.jwt){
        return next();
    }
    /** for Bearer token authentication; currently cookie based auth is set up */
    // const beararToken = req.headers['authorization']
    // if (typeof beararToken === 'undefined'){
    //     return next()
    // }

    try {

        //const token = req.headers.authorization.split(" ")[1]

        const payload = jwt.verify(
            req.session?.jwt, 
            process.env.JWT_KEY
        );

        if (payload.role === "admin"){
            return next();
        }
        req.currentUser = payload;
    } catch (error) {
        // throw new NotAuthoriozedError();
        console.log(error)
    }

    next();
}

/**
 * 
 * @param {req} req 
 * @param {res} res 
 * @param {next} next 
 * @returns returns the current admin user
 * @description this function can be used for multiple user roles for authentication
 * 
 */

const currentAdmin = (
    req, 
    res, 
    next
) => {
    if (!req.session || !req.session.jwt){
        return next();
    }
    try {
        const payload = jwt.verify(
            req.session?.jwt, 
            process.env.JWT_KEY
        );
        if (payload.role === "user"){
            return next();
        }
        console.log(payload)
        req.currentUser = payload;
    } catch (error) {
        // throw new NotAuthoriozedError();
    }
    
    next();
}

module.exports = {currentUser, currentAdmin}