const { CustomError } =  require("./custom-err");

class DatabaseConnectionError extends CustomError {
    reason = "Error connecting to the database"
    statusCode = 503;
    constructor (){
        super("Error connecting to database");
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }
    
    formatedErrors() {
        return [
            {
                message: this.reason,
                code: "DATABASE_ERROR"
            }
        ]
    }
}

module.exports = {DatabaseConnectionError}