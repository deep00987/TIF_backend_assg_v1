const { CustomError } = require("./custom-err");

class NotFoundErr extends CustomError {
    statusCode = 404;

    constructor () {
        super ("requested resource not found");
        Object.setPrototypeOf(this, NotFoundErr.prototype);

    }

    formatedErrors(){
        return [
            {
                message: "resource not found"
            }
        ]
    }
    
}

module.exports = {NotFoundErr}