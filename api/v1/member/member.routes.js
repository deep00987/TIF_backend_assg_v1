const express = require('express');
const { Role } = require('../role/role.model');
const { body } = require('express-validator')
const { BadRequestError } = require('../../../error-types/bad-req-err')
const { validateRequest } = require('../../../middlewares/req-validation')
const { currentUser } = require('../../../middlewares/curr-user')
const { requireUserAuth } = require('../../../middlewares/require-auth')
const { DatabaseConnectionError } = require('../../../error-types/db-connection-err');
const { Community } = require('../community/community.model');
const { Member } = require('../member/member.model');
const { User } = require('../auth/user.model');
const { NotAuthoriozedError } = require('../../../error-types/not-authorized-err');


const memberRouter = express.Router()


memberRouter.post('/',
    currentUser,
    requireUserAuth,
    [
        body('community').exists().withMessage('Community id must be included in request'),
        body('user').exists().withMessage('User id must be included in request'),
        body('role').exists().withMessage('role id must be included in request'),
    ],
    validateRequest,
    async (req, res) => {
        const {community, user, role} = req.body
        const current_user = req.currentUser?.id

        const initial_validation = await Promise.all([
            Community.findById(community), User.findById(user), Role.findById(role), 
        ])

        if (!initial_validation[0]) {
            throw new BadRequestError("community", "Community not found", "RESOURCE_NOT_FOUND")
        }

        if (!initial_validation[1]) {
            throw new BadRequestError("user", "User not found", "RESOURCE_NOT_FOUND")
        }

        if (!initial_validation[2]) {
            throw new BadRequestError("role", "Role not found", "RESOURCE_NOT_FOUND")
        }

        const userAllowdToAdd = await Community.find({_id: community, owner: current_user})
        
        if (userAllowdToAdd.length <= 0) {
            throw new NotAuthoriozedError("You are not authorized to perform this action.", "NOT_ALLOWED_ACCESS")
        }
        

        const userAlreadyAdded = await Member.find({community: community, user: user})
        
        if (userAlreadyAdded.length >= 1) {
            throw new BadRequestError("user", "User is already added in the community.", "RESOURCE_EXISTS")
        }

        try {
            const member = new Member({community, user, role})
            var savedMember = await member.save()
            
        } catch (error) {
            console.log(error)
            throw new DatabaseConnectionError()
        }

        return res.status(200).json({
            "status": true,
            "content": {
                "data": {
                    "id": savedMember?.id,
                    "community": savedMember?.community,
                    "user": savedMember?.user,
                    "role": savedMember?.role,
                    "created_at": savedMember?.created_at
                }
            }
        })
    }
)

memberRouter.delete('/:id',
    currentUser,
    requireUserAuth,
    async (req, res) => {
        
        const member_id = req.params?.id
        const current_user = req.currentUser.id
        const initial_validation = await Member.findById(member_id)

        if (!initial_validation) {
            throw new BadRequestError("user", "Member not found", "RESOURCE_NOT_FOUND")
        }

        const [admin_role, mod_role] = await Promise.all([
            Role.find({name: "Community Admin"}), 
            Role.find({name: "Community Moderator"}), 
        ])

        const [user_is_admin, user_is_mod] = await Promise.all([ 
            Member.find({
                community: initial_validation.community,
                user: current_user,
                role: admin_role[0]._id
            }),
            Member.find({
                community: initial_validation.community,
                user: current_user,
                role: mod_role[0]._id
            })
        ])

        if (user_is_admin.length <= 0 && user_is_mod.length <= 0) {
            throw new NotAuthoriozedError("You are not authorized to perform this action.", "NOT_ALLOWED_ACCESS")
        }
        
        const deletedMember = await Member.findOneAndRemove({
            _id: member_id
        })
        
        if (!deletedMember) {
            throw new BadRequestError("user", "Member not found", "RESOURCE_NOT_FOUND")
        }

        return res.status(200).json({
            "status": true,
        })
    }
)

module.exports = {memberRouter}