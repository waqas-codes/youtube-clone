import asyncHandler from "../utils/asyncHandler.js";

const userRegisteration = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "ok"
    })
})

export default userRegisteration