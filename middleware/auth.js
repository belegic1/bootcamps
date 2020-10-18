const jwt = require('jsonwebtoken')

const asyncHandler = require('./async')
const errorResponse = ('../utils/errorResponse')
const User = require('../models/User')

exports.protect = asyncHandler(async (req,res,next)=>{
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
        console.log(token);
    }
    else if(req.cookies.token){
        token = req.cookies.token
    }

    //Make sure token exist

    if (!token) {
        return res.status(401).json({err: 'Not authorized'});
    }
    //verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id)
        next()
    } catch (error) {
                return res.status(401).json({err: 'Not authorized'});

        
    }
})

exports.authorize = (...roles) =>{
    return (req,res,next)=>{
        if (!roles.includes(req.user.role)) {
                return res.status(403).json({err: 'Not authorized for this action'});
            
        }

        next()
}
}