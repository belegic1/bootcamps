const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')
const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')

exports.getCourses = asyncHandler(async (req,res,next)=>{
    if (req.params.bootcampId) {
        const courses = await Course.find({bootcamp: req.params.bootcampId})

        return res.json({success: true,
            count: courses.length,
            data: course})
    }else{
        
    }
    res.json(res.advancedResults)
})


exports.getCourse = asyncHandler(async (req,res,next)=>{
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })
    if (!course) {
        return next(new errorResponse('Can not found this course', 404))
    }


    res.json({success: true,
         data: course})
})


exports.createCourse = asyncHandler(async (req,res,next)=>{
    req.body.bootcamp = req.params.bootcampId

    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    if (!bootcamp) {
        return next(new errorResponse('Bootcamp not found', 404))
    }

     if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
                 return  next(new errorResponse('you not have permission to do that', 401))
        }

    const course = await Course.create(req.body)

    res.status(201).json({success: true, data: course})
})

exports.updateCourse = asyncHandler(async (req,res,next)=>{
    let course = await Course.findById(req.params.id)

    if (!course) {
        next(new errorResponse('Course is not found', 404))
    }

     if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
                 return  next(new errorResponse('you not have permission to do that', 401))
        }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

    res.json({success: true, data: course})
})


exports.deleteCourse= asyncHandler(async (req,res,next)=>{
    const course = await Course.findById(req.params.id)

     if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
                 return  next(new errorResponse('you not have permission to do that', 401))
        }

    await course.remove()

    res.json({success :true, data: course})

})