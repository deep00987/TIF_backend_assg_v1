
const { CustomError } = require('./custom-err');

class RequestValidationError extends CustomError{

    statusCode = 400;
    f_Error
    statusId
    constructor(errors, statusId="VALIDATION_ERROR"){
        super("invalid request parameters");
        this.f_Error = errors || []
        this.statusId = statusId
        Object.setPrototypeOf(this, RequestValidationError.prototype);
    }

    formatedErrors() {
        
        return this.f_Error.map(err => {
            return {
                param: err?.path || "unkonwn",
                message: err?.msg || "something went wrong",
                code: this.statusId || "unkonwn",

            }
        })
    }
}

module.exports = {RequestValidationError}
