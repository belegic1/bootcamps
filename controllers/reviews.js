const Bootcamp = require('../models/Bootcamp')
const User = require('../models/User')
const Review = require('../models/Review')
const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')


exports.getReviews = asyncHandler(async (req,res,next)=>{
    if (req.params.bootcampId) {
        const reviews = await Review.find({bootcamp: req.params.bootcampId})

        return res.json({success: true,
            count: reviews.length, data: reviews})
    }else{
        res.status(404).json(res.advancedResults)
    }
})

exports.getReview = asyncHandler(async (req,res,next)=>{
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })

    if (!review) {
        return next(new errorResponse('No reviews found', 404))
    }

    res.json({success: true, data: review})
})

exports.createReview = asyncHandler(async (req,res,next)=>{
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    if (!bootcamp) {
        return next(new errorResponse('Bootcamp not found', 404))
    }

    const review = await Review.create(req.body)

    res.status(201).json({success: true, data: review})
})

exports.updateReview = asyncHandler(async (req,res,next)=>{
    const review = await Review.findById(req.params.id)

    if (!review) {
        return next(new errorResponse('No Review',404))
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new errorResponse('No Permission to Delete this review',401))
    }
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

    res.json({success: true, data: review})
})

exports.removeReview = asyncHandler(async (req,res,next)=>{
    const review = await Review.findById(req.params.id)

     if (!review) {
        return next(new errorResponse('No Review',404))
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new errorResponse('No Permission to Delete this review',401))
    }

    await review.remove()

    res.json({success: true, data: review})
})