import { isValidObjectId } from "mongoose";
import { apiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {ApiResponse} from '../utils/apiResponse.js'
import Video from '../models/video.model.js'
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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


const publishVideo = asyncHandler(async(req, res) => {
    const {description, title} = req.body

    if(!description || !title){
        throw new apiError(400, "title and description is required")
    }

    const videoFile = req.files?.videoFile?.[0]?.path;
    const thumbnailFile = req.files?.thumbnail?.[0].path;

    if(!videoFile || !thumbnailFile){
        throw new apiError(400, "thumbnail and video are required")
    }

    const videoUpload = await uploadOnCloudinary(videoFile)
    const thumbnailUpload = await uploadOnCloudinary(thumbnailFile)

    if(!videoUpload || thumbnailUpload){
        throw new apiError(500, "thumbnail or video upload failed")
    }

    const video = await Video.create({
        title,
        description,
        thumbnail: videoUpload.url,
        videoFile: videoUpload.url,
        duration: videoUpload.duration,
        owner: req.user_id,
        isPublished: true
    })

    return res.status(201)
    .json(
        new ApiResponse(201, video, "video upload successfully")
    )
})