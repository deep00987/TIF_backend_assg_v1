const { CustomError } = require("./custom-err");

class NotAuthoriozedError extends CustomError {
    statusCode = 401;
    message;
    statusId
    constructor(msg, statusId =""){
        super(msg || "Not authorized");
        this.message = msg || "Not authorized";
        this.statusId = statusId
        Object.setPrototypeOf(this, NotAuthoriozedError.prototype);
    }
    formatedErrors(){
        return [
            {
                message: this.message,
                code: this.statusId
            }
        ]
    }
}

module.exports = {NotAuthoriozedError}