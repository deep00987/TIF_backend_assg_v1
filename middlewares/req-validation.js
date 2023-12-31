const { validationResult } = require('express-validator');
const { RequestValidationError } = require('../error-types/req-validation-err');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    

    if (!errors.isEmpty()){
        throw new RequestValidationError(errors.array(), "INVALID_INPUT");
    }

    next();
}
module.exports = {validateRequest}