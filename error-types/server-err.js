const { CustomError } = require("./custom-err");

class InternalServerError extends CustomError{
    statusCode = 512;
    msg;
    constructor(message){
        super(message || "Internal server error");
        this.msg = message || "Internal server error";
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
    formatedErrors() {
        return [
            {
                message: this.msg,
            }
        ]
    }
}

module.exports = {InternalServerError}