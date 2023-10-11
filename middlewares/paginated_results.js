const { BadRequestError } = require("../error-types/bad-req-err")
const { DatabaseConnectionError } = require("../error-types/db-connection-err")

const paginated_results = (model) => {

    return async(req, res, next) => {
        const page = parseInt(req.query.page) || 1
        const limit = 10

        const start_index = (page - 1) * limit
        const end_index = page * limit

        const total_docs = await model.countDocuments();

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
            var data = await model.find().skip(start_index).limit(limit).select("-__v")
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

        res.paginated_results = result
        next()
    }
}

const paginated_community_results = (model) => {

    return async(req, res, next) => {
        const page = parseInt(req.query.page) || 1
        const limit = 10

        const start_index = (page - 1) * limit
        const end_index = page * limit

        const total_docs = await model.countDocuments();
        const total_pages = Math.ceil(total_docs / limit)
        
        if (page < 1 || page > total_pages) {
            throw new BadRequestError("page", "Invalid page no", "INVALID_QUERY_PARAM_VALUE")
          }


        try {
            var data = await model.find().skip(start_index).limit(limit).populate({
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

        res.paginated_results = result
        next()
    }
}




module.exports = { paginated_results, paginated_community_results }