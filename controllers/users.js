const User = require('../models/User')
const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

exports.getUsers = asyncHandler(async (req,res,next)=>{
    res.json(res.advancedResults)
})

exports.getUser = asyncHandler(async (req,res,next)=>{
    const user = await User.findById(req.params.id)
    res.json({success: true, data: user})
})

exports.createUser = asyncHandler(async (req,res,next)=>{
    const user = User.create(req.body)
    res.status(201).json({success: true, data: user})
})

exports.updateUser = asyncHandler(async (req,res,next)=>{
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

    res.json({success: true, data: user})
})

exports.removeUser = asyncHandler(async (req,res,next)=>{
    const user = await User.findByIdAndDelete(req.params.id)
    res.json({success: true, data: user})
})