import { isValidObjectId } from "mongoose";
import { apiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {ApiResponse} from '../utils/apiResponse.js'
import Video from '../models/video.model.js'

const getAllVideos = asyncHandler( async(req, res) => {
    const {page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    
    const filter = { isPublished: true}
    
    if(query) {
        filter.$or = [
            { title: {$regex: query, $options: "i"}},
            { description: {$regex: query, $options: "i"}}
        ]
    }

    if(userId){
        if(!isValidObjectId(userId)){
            throw new apiError(400, "invalid user Id")
        }

        filter.owner = userId
    }

    const videos = await Video.find(filter)
    .sort({ [sortBy]: sortType === "asc"? 1: -1})
    .skip((Number(page)-1)* Number(limit))
    .limit(Number(limit))

   return res.status(200)
   .json(
    new ApiResponse(200, videos, "vides fetched succesfully")
   )
})
