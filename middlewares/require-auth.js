const { NotAuthoriozedError } = require('../error-types/not-authorized-err');

const requireUserAuth = (
    req, 
    res,
    next
) => {
   if(!req?.currentUser || req?.currentUser?.role !== "user"){
        throw new NotAuthoriozedError("You need to sign in to proceed.", "NOT_SIGNEDIN");
   } 
   next();
}

const requireAdminAuth = (
    req, 
    res,
    next
) => {
   if(!req?.currentUser || req?.currentUser?.role !== "admin"){
        throw new NotAuthoriozedError();
   } 
   next();
}

module.exports = {requireUserAuth, requireAdminAuth};