const { CustomError } = require("../error-types/custom-err");

const errHandler = (
    err, 
    req, 
    res, 
    next
) => {
    if (err instanceof CustomError){
        return res.status(err.statusCode).send(
            {
                status: false,
                errors: err.formatedErrors()
            }
        );
    }
    console.log(err)
    return res.status(400).send({
        status: false,
        errors: [
            {
                message: "something went wrong!",
                field: "unknown"
            }
        ]
    })
}

module.exports = {errHandler}