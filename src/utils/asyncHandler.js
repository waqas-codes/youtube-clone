const asyncHandler = (func) => async (req, res, next) => {
    try {
        await func (req, res, next)
    } catch (error) {
        res.status(error.code || 500).json({
            message: error.message,
            success: false
        })
    }
}

export default asyncHandler


// stander approach /////////////////
// const asyncHandler = (requestHandler) => {
//     return(res, req, next) => {
//         Promise.resolve(requestHandler(res, req, next)).catch((err) => next(err))
//     }
// }