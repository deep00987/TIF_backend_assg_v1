const express = require('express');
const {Role} = require('../role/role.model'); 
const {body} = require('express-validator')
const { BadRequestError } = require('../../../error-types/bad-req-err')
const { validateRequest } = require('../../../middlewares/req-validation')
const { currentUser } = require('../../../middlewares/curr-user')
const { requireUserAuth } = require('../../../middlewares/require-auth')
const { DatabaseConnectionError} = require('../../../error-types/db-connection-err');
const { paginated_results } = require('../../../middlewares/paginated_results');


roleRouter = express.Router()

roleRouter.post('/',
    // this route is protected
    currentUser,
    requireUserAuth,
    [
        body('name').isLength({ min: 2, max: 64 }).withMessage('Name must be atleast 2 chars'),
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { name } = req.body;

            const roleExists = await Role.findOne({name: name})
            
            if (roleExists) {
                throw new BadRequestError("name", "Role with given name already exists", "INVALID_INPUT")
            }

            const role = new Role({ name: name });
            const savedRole = await role.save();

            return res.status(200).json({
                "status": true,
                "content": {
                    "data": {
                        "id": savedRole._id,
                        "name":  savedRole.name,
                        "created_at":  savedRole.created_at,
                        "updated_at": savedRole.updated_at
                    }
                }
            });
        } catch (error) {
            if (error instanceof BadRequestError) {
                throw new BadRequestError("name", "Role with given name already exists", "INVALID_INPUT")
            }
            throw new DatabaseConnectionError()
        }
    });


roleRouter.get('/', paginated_results(Role), async (req, res) => {
    return res.status(200).json(res.paginated_results)
});

module.exports = {roleRouter};
