import { apiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const getAllVideos = asyncHandler( async(req, res) => {
    const {page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    
    const skip = (Number(page ) -1)* Number(limit)

    if(!query) {
        throw new apiError(400, "_____")
    }
    
})