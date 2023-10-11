/**
 * Abstract class CustomError
 * 
 * @class CustomError
 */
class CustomError extends Error{
    
    statusCode;
    
    constructor(msg, statusId=""){
        super(msg);
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    formatedErrors(){}
    // return type {
    //     "status": false,
    //     "errors": [
                // {

                // }
    //     ]
    // }

}

module.exports = {CustomError}