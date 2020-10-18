
const Bootcamp = require('../models/Bootcamp')
const User = require('../models/User')
const errorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const sendEmail = require('../utils/sendEmail')
const crypto = require('crypto')


exports.register = asyncHandler(async (req,res,next)=>{
    const {name, email, password, role} = req.body

    const user = await User.create({name, email, password, role})

    // create token
        sendTokenResponse(user,200,res)

})

exports.login = asyncHandler(async (req,res,next)=>{
     const { email, password } = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next(new errorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new errorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new errorResponse('Invalid credentials', 401));
  }



    sendTokenResponse(user,200,res)
})


exports.logout = asyncHandler(async (req,res,next)=>{

  res.cookie('token', 'none',
  {expires: new Date(Date.now()+10*1000),
  httpOnly: true,
})
  res.json({success: true, data: 'You are gone'})
})

// Get token from model, create cookie and send response 

const sendTokenResponse = (user, statusCode, res)=>{
     const token = user.getSignJwtToken()

     const options = {
         expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE *24*60*60*1000 ) ,
        httpOnly: true,
     }

     if (process.env.NODE_ENV === 'production') {
         options.secure = true
     }

     res.status(statusCode)
     .cookie('token', token, options)
     .json({success: true, token})

}


exports.getMe = asyncHandler(async (req,res,next)=>{
  const user = await User.findById(req.user.id)

  res.json({success: true, data:user})
})




exports.forgotPassword = asyncHandler(async (req,res,next)=>{

  const user = await User.findOne({email: req.body.email})

  if (!user) {
    return next(new errorResponse('Email is not valid', 404));
  }
  const resetToken = user.getResetToken()
  

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new errorResponse('Email could not be sent', 500));
  }

  res.status(200).json({
    success: true,
    data: user
  });
})



exports.resetPassword = asyncHandler(async (req,res,next)=>{
  const resetPasswordToken = crypto.createHash('sha256')
  .update(req.params.resettoken)
  .digest('hex')

  const user = await User.findOne({ 
    resetPasswordToken,
    resetPasswordExpire: {$gt: Date.now()}
  })

  if(!user){
  return next( new errorResponse('invalid token', 400))}

  user.password = req.body.password
  user.resetPasswordExpire = undefined
  user.resetPasswordToken = undefined
    await user.save()

    sendTokenResponse(user,200,res)
})


exports.updateUserDetails = asyncHandler(async (req,res,next)=>{
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  }
  const user = await User.findByIdAndUpdate(req.params.id, fieldsToUpdate,
    {new: true, runValidators: true})

    res.json({success: true, data: user})
})


exports.updateUserPassword = asyncHandler(async (req,res,next)=>{
 const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentpassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newpassword
  await user.save()
  sendTokenResponse(user,200,res)
})