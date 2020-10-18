const Bootcamp = require('../models/Bootcamp')
const geocoder = require('../utils/geocoder')
const path = require('path')
const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
// ++++++++++++++++++++++++++++++++
exports.getBootcamps =asyncHandler( async (req,res,next)=>{
      
         res.json(res.advancedResults)
    
})

////// ++++++++++++++++++++++++++++++
exports.getBootcamp = asyncHandler(async (req,res,next)=>{
    
        const bootcamp = await Bootcamp.findById(req.params.id)
        if (!bootcamp) {
            return  next(new errorResponse('Bootcamp not found', 404))

        }
        res.json({succes:true , data: bootcamp})
  
})

/// ++++++++++++++++++++++++++++++++++++
exports.createBootcamp = asyncHandler(async(req,res,next)=>{

 req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // If the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new errorResponse(
        `The user with ID ${req.user.id} has already published a bootcamp`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp
  });
})

// ++++++++++++++++++++++++++++++

exports.updateBootcamp = asyncHandler(async (req,res,next)=>{
        const bootcamp = await Bootcamp.findById(req.params.id)
        if (!bootcamp) {
             return  next(new errorResponse('Bootcamp not found', 404))
        }


        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
                 return  next(new errorResponse('you not have permission to do that', 401))
        }

        bootcamp  = await Bootcamp.findByIdAndUpdate(req.params.id, req.body,{new: true, runValidators: true})
        res.status(201).json({success: true, data: bootcamp})
})

///+++++++++++++


exports.deleteBootcamp = asyncHandler(async (req,res,next)=>{
        const bootcamp = await Bootcamp.findById(req.params.id)
        if (!bootcamp) {
             return  next(new errorResponse('Bootcamp not found', 404))
        }

         if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
                 return  next(new errorResponse('you not have permission to do that', 401))
        }
        bootcamp.remove()
        res.status(200).json({success: true, data: bootcamp})
})


exports.getBootcampsInRadius = asyncHandler(async (req,res,next)=>{
        const {zipcode, distance } = req.params;

        const loc = await geocoder.geocode(zipcode);
        const lat = loc[0].latitude;
        const lng = loc[0].longitude;

        // Calc  Radius
        const radius = distance / 6378

        const bootcamps = await Bootcamp.find({
                location: {$geoWithin: {$centerSphere: [[lng, lat] ,radius]}}
        })

        res.json({success: true,
                count: bootcamps.length, data: bootcamps})
})


exports.bootcampPhotoUpload = asyncHandler(async (req,res,next)=>{
        const bootcamp = await Bootcamp.findById(req.params.id)
        if (!bootcamp) {
            return  next(new errorResponse('Bootcamp not found',404))
        }

        
         if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
                 return  next(new errorResponse('you not have permission to do that', 401))
        }

        if (!req.files) {
           return next(new errorResponse('Upload photo', 400))     
        }

        const file = req.files.file
        if (!file.mimetype.startsWith('image')) {
 return next(new errorResponse('please upload an image', 400)) 
        }

        if (file.size > process.env.MAX_FILE_UPLOAD) {
                 return next(new errorResponse('img must not be larger then 1mb', 400)) 
        }
        file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

        file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async(err)=>{
                if (err) {
                       console.error(err)
                       return next(new errorResponse('Problem with photo upload', 500))  
                }
                await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name})
                res.json({status: true, data: file.name})
        })
})