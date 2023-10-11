const express = require('express');
const { Role } = require('../role/role.model');
const { body } = require('express-validator')
const { BadRequestError } = require('../../../error-types/bad-req-err')
const { validateRequest } = require('../../../middlewares/req-validation')
const { currentUser } = require('../../../middlewares/curr-user')
const { requireUserAuth } = require('../../../middlewares/require-auth')
const { DatabaseConnectionError } = require('../../../error-types/db-connection-err');
const { Community } = require('./community.model');
const lodash = require('lodash');
const { Member } = require('../member/member.model');

communityRouter = express.Router()

communityRouter.post('/',
    currentUser,
    requireUserAuth,
    [
        body('name').isLength({ min: 2, max: 64 }).withMessage('Name must be atleast 2 chars'),
    ],
    validateRequest,
    async (req, res) => {
        try {
            const { name } = req.body;
            const communityExists = await Community.findOne({ slug: lodash.kebabCase(name) })

            if (communityExists) {
                throw new BadRequestError("name", "Community with given name already exists", "INVALID_INPUT")
            }

            const current_user = req.currentUser?.id
            const community = new Community({ name: name, owner: current_user });
            const savedCommunity = await community.save();

            const role = await Role.findOne({ name: "Community Admin" })

            if (!role) {
                throw new BadRequestError("role", "Role not found", "RESOURCE_NOT_FOUND")
            }

            const memnber = new Member({
                community: savedCommunity?._id,
                user: current_user,
                role: role._id
            })

            await memnber.save()

            return res.status(200).json({
                "status": true,
                "content": {
                    "data": {
                        "id": savedCommunity._id,
                        "name": savedCommunity.name,
                        "slug": savedCommunity.slug,
                        "owner": savedCommunity.owner,
                        "created_at": savedCommunity.created_at,
                        "updated_at": savedCommunity.updated_at
                    }
                }
            });
        } catch (error) {
            if (error instanceof BadRequestError) {
                throw error

            }
            console.log(error)
            throw new DatabaseConnectionError()
        }
    }
)


communityRouter.get('/',
    async (req, res, next) => {
        const page = parseInt(req.query.page) || 1
        const limit = 10

        const start_index = (page - 1) * limit
        const end_index = page * limit

        const total_docs = await Community.countDocuments();

        if (total_docs <= 0) {

            if (page < 1 || page > 1) {
                throw new BadRequestError("page", "Invalid page no", "INVALID_QUERY_PARAM_VALUE")
            }

            return res.status(200).json({
                "status": true,
                "content": {
                    "meta": {
                        "total": 0,
                        "pages": 1,
                        "page": 1
                    },
                    "data": []
                }
            })
        }

        const total_pages = Math.ceil(total_docs / limit)

        if (page < 1 || page > total_pages) {
            throw new BadRequestError("page", "Invalid page no", "INVALID_QUERY_PARAM_VALUE")
        }


        try {
            var data = await Community.find().skip(start_index).limit(limit).populate({
                path: 'owner',
                select: '-email -password -created_at -__v'
            }).select('-__v')
        } catch (error) {
            throw new DatabaseConnectionError()
        }

        const result = {
            "status": true,
            "content": {
                "meta": {
                    "total": total_docs,
                    "pages": total_pages,
                    "page": page
                },
                "data": data
            }
        }

        return res.status(200).json(result)
    }
)


communityRouter.get('/:id/members',
    async (req, res, next) => {
        const id = req?.params?.id
        const page = parseInt(req.query.page) || 1
        const limit = 10

        const start_index = (page - 1) * limit
        const end_index = page * limit

        if (!id) {
            throw new BadRequestError("id", "Invalid community id specified", "INVALID_INPUT")
        }

        const total_docs = await Member.find({community: id}).countDocuments();

        if (total_docs <= 0) {

            if (page < 1 || page > 1) {
                throw new BadRequestError("page", "Invalid page no", "INVALID_QUERY_PARAM_VALUE")
            }

            return res.status(200).json({
                "status": true,
                "content": {
                    "meta": {
                        "total": 0,
                        "pages": 1,
                        "page": 1
                    },
                    "data": []
                }
            })
        }
        const total_pages = Math.ceil(total_docs / limit)

        if (page < 1 || page > total_pages) {
            throw new BadRequestError("page", "Invalid page no", "INVALID_QUERY_PARAM_VALUE")
        }

        
        
        try {
            var data = await Member.find({community: id}).skip(start_index).limit(limit).populate([{
                path: 'user',
                select: '-email -password -created_at -__v'
            }, 
            {
                path: 'role',
                select: '-created_at -updated_at -__v'
            }
            ]).select('-__v')
        } catch (error) {
            throw new DatabaseConnectionError()
        }

        const result = {
            "status": true,
            "content": {
                "meta": {
                    "total": total_docs,
                    "pages": total_pages,
                    "page": page
                },
                "data": data
            }
        }

        return res.status(200).json(result)
    }
)

communityRouter.get('/me/owner',
    currentUser,
    requireUserAuth,
    async (req, res, next) => {
        const id = req?.currentUser?.id
        const page = parseInt(req.query.page) || 1
        const limit = 10

        const start_index = (page - 1) * limit
        const end_index = page * limit

        const total_docs = await Community.find({owner: id}).countDocuments();

        if (total_docs <= 0) {

            if (page < 1 || page > 1) {
                throw new BadRequestError("page", "Invalid page no", "INVALID_QUERY_PARAM_VALUE")
            }

            return res.status(200).json({
                "status": true,
                "content": {
                    "meta": {
                        "total": 0,
                        "pages": 1,
                        "page": 1
                    },
                    "data": []
                }
            })
        }

        const total_pages = Math.ceil(total_docs / limit)

        if (page < 1 || page > total_pages) {
            throw new BadRequestError("page", "Invalid page no", "INVALID_QUERY_PARAM_VALUE")
        }

        
        try {
            var data = await Community.find({owner: id}).skip(start_index).limit(limit).select('-__v')
        } catch (error) {
            throw new DatabaseConnectionError()
        }

        const result = {
            "status": true,
            "content": {
                "meta": {
                    "total": total_docs,
                    "pages": total_pages,
                    "page": page
                },
                "data": data
            }
        }

        return res.status(200).json(result)
    }
)

communityRouter.get('/me/member',
    currentUser,
    requireUserAuth,
    async (req, res, next) => {
        const id = req?.currentUser?.id
        const page = parseInt(req.query.page) || 1
        const limit = 10

        const start_index = (page - 1) * limit
        const end_index = page * limit
        
        const user_community_docs = await Member.find({user: id})
        
        if (user_community_docs.length <= 0) {

            if (page < 1 || page > 1) {
                throw new BadRequestError("page", "Invalid page no", "INVALID_QUERY_PARAM_VALUE")
            }

            return res.status(200).json({
                "status": true,
                "content": {
                    "meta": {
                        "total": 0,
                        "pages": 1,
                        "page": 1
                    },
                    "data": []
                }
            })
        }

        const total_pages = Math.ceil(user_community_docs.length / limit)

        if (page < 1 || page > total_pages) {
            throw new BadRequestError("page", "Invalid page no", "INVALID_QUERY_PARAM_VALUE")
        }
        
        const community_ids = user_community_docs.map(item => {
            return item.community
        }) 
        
        try {
            var data = await Community.find({_id: {$in: community_ids}}).skip(start_index).limit(limit).populate({
                path: "owner",
                select: "-email -password -created_at -__v"
            }).select('-__v')
        } catch (error) {
            throw new DatabaseConnectionError()
        }

        const result = {
            "status": true,
            "content": {
                "meta": {
                    "total": user_community_docs.length,
                    "pages": total_pages,
                    "page": page
                },
                "data": data
            }
        }

        return res.status(200).json(result)
    }
)


module.exports = { communityRouter }