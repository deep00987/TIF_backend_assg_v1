const { CustomError } = require("./custom-err");

class BadRequestError extends CustomError{
    statusCode = 400;
    msg;
    statusId
    param
    constructor(param="unknown param", msg='UNKNOWN', statusId="UNKNOWN"){
        super(msg);
        if (msg === undefined || msg === null || msg === ''){ msg = "Bad request" }
        this.param = param 
        this.msg = msg 
        this.statusId = statusId 
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }

    formatedErrors(){
        return [
            {
                param: this.param,
                message: this.msg,
                code: this.statusId
            }
        ]
    }

}

module.exports = {BadRequestError}