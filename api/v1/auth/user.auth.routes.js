const express = require('express')
const jwt = require('jsonwebtoken')
const {body} = require('express-validator')
const { User } = require('./user.model')
const { BadRequestError } = require('../../../error-types/bad-req-err')
const { Password } = require('../../../utils/password')
const { currentUser } = require('../../../middlewares/curr-user')
const { validateRequest } = require('../../../middlewares/req-validation')
const { requireUserAuth } = require('../../../middlewares/require-auth')
const { NotAuthoriozedError } = require('../../../error-types/not-authorized-err')

const authRouter = express.Router()

authRouter.get('/current_user',
    currentUser,
    async (req, res, next) => {
        return res.status(200).send({
            currentUser: req.currentUser || null
        })
    }   
);

authRouter.get('/me',
    currentUser,
    requireUserAuth,
    async (req, res, next) => {
        const userExists = await User.findById(req?.currentUser?.id)

        if (!userExists){
            throw new BadRequestError("id", "Invalid user id.", "INVALID_INPUT")
        }

        return res.status(200).send({
            "status": true,
            "content": {
                "data": {
                    "id": userExists?._id,
                    "name": userExists?.name,
                    "email": userExists?.email,
                    "created_at": userExists?.created_at
                }
            }
        })
    }   
);

authRouter.get('/user/:id',
    async (req, res) => {

        const id = req.params.id

        if (!id) {
            throw new BadRequestError("id", "Invalid user id.", "INVALID_INPUT")
        }

        try {
            const userExists = await User.findById(id);
            if (!userExists) {
                throw new BadRequestError("id", "user doesnt exist", "INVALID_INPUT")
            }
            
            return res.status(200).send({
                "status": true,
                "content": {
                    "data": {
                        "id": userExists?._id,
                        "name": userExists?.name,
                        "email": userExists?.email,
                        "created_at": userExists?.created_at
                    }
                }
            })

        } catch (error) {
            console.error(error);
            if (error instanceof BadRequestError) {
                throw new BadRequestError("id",error.msg, "INVALID_INPUT")
            }
            throw new DatabaseConnectionError()
        }
    }
);

authRouter.post('/signin',
    [
        body('email').isEmail().withMessage("Please provide a valid email address."),
        body('password').trim().isLength({min: 4, max: 20}).withMessage("Password must be bwtween 4-20 chars long")
    ], 
    validateRequest, 
    async (req, res, next) => {    
        const { email, password } = req.body;
        const userExists = await User.findOne({email})

        if (!userExists){
            throw new BadRequestError("email", "The credentials you provided are invalid.", "INVALID_CREDENTIALS")
        }

        const originalPassHash = userExists?.password || " ";
        const hashCheck = await Password.compare(originalPassHash, password);

        if (!hashCheck){
            throw new BadRequestError("password", "The credentials you provided are invalid.", "INVALID_CREDENTIALS")

        }

        const token = jwt.sign({
            id: userExists.id, 
            email: userExists.email,
            role: 'user'
        }, process.env.JWT_KEY ); 

        req.session = {
            jwt: token
        }

        res.status(200).json({
            "status": true,
            "content": {
                "data": {
                    "id": userExists?._id,
                    "name": userExists?.name,
                    "email": userExists?.email,
                    "created_at": userExists?.created_at
                },
                "meta": {
                    "access_token": token
                }
            }
        })
        
    }
);

authRouter.post('/signout', 
    async (req, res, next) => {
        req.session = null;
        res.status(200).send({})
    }
);

authRouter.post('/signup',
    [
        body('name').isLength({min: 2}).withMessage('Name should be at least 2 characters.'),
        body('email').isEmail().withMessage("email format is invalid"),
        body('password').trim().isLength({min: 4, max: 20}).withMessage("password must be bwtween 4-20 chars long")
    ], 
    validateRequest,
    async (req, res, next) => {

        const email = req.body.email
        const name = req.body.name
        
        const userExists = await User.findOne({email})
        
        if (userExists) {
            throw new BadRequestError("email", "User with this email address already exists.", "RESOURCE_EXISTS");
        }
        
        const passHash = await Password.toHashString(req.body.password);
        
        const user = new User({
            "name"           : req.body.name,
            "email"          : req.body.email,
            "password"       : passHash,
        })

        const userObj = await user.save();
        
        const token = jwt.sign({
            id: user.id, 
            email: user.email,
            role: 'user'
        }, process.env.JWT_KEY ); 

        req.session = {
            jwt: token
        }
       
        return res.status(200).json({
            "status": true,
            "content": {
                "data": {
                    "id": userObj._id,
                    "name":  userObj.name,
                    "email":  userObj.email,
                    "created_at":  userObj.created_at
                },
                "meta": {
                    "access_token": token
                }
            }
        })
});

authRouter.put('/user/update/me',
    currentUser,
    requireUserAuth,
    [
        body('name').isLength({min: 2}).withMessage('Name must be atleast 2 chars'),
        body('email').isEmail().withMessage("email format is invalid"), 
    ],
    validateRequest,
    async (req, res) => {

        const id = req.currentUser.id
        
        if (!id) {
            throw new BadRequestError("id", "Invalid user id.", "INVALID_INPUT")
        }

        const email = req.body?.email
        const userEmailExists = await User.findOne({
            $and:[
                {email: email},
                {_id: {$ne: id}}
            ]
        })
        
        if (userEmailExists) {
            throw new BadRequestError("email", "User with this email address already exists.", "RESOURCE_EXISTS");
        }

        try {
            const userExists = await User.findById(id);

            if (!userExists) {
                throw new BadRequestError("id", "user doesnt exist", "INVALID_INPUT")
            }
            
            const reqEmpty = Object.values(req?.body).every(x => x === null || x === '' || x === undefined);

            if (reqEmpty) {
                throw new BadRequestError("unknown", "No info received", "INVALID_INPUT")
            }

            for await (const key of Object.keys(req.body)) {
                if (key === 'password') {
                    const passHash = await Password.toHashString(req.body[key]);
                    userExists[key] = passHash;
                    continue;
                }
                userExists[key] = req.body[key];
            }

            userExists.save()

            return res.status(200).send({
                "status": true,
                "content": {
                    "data": {
                        "id": userExists?._id,
                        "name": userExists?.name,
                        "email": userExists?.email,
                        "created_at": userExists?.created_at
                    }
                }
            })

        } catch (error) {
            if (error instanceof BadRequestError) {
                throw new BadRequestError(error.msg)
            }
            if (error instanceof NotAuthoriozedError) {
                throw new NotAuthoriozedError("User unauthorized to perform this action", "INVALID_USER_ID")
            }
            console.error(error);
            throw new DatabaseConnectionError()
        }
    }
);

module.exports = { authRouter }