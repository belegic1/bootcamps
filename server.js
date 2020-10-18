
const express = require('express')
const dotenv = require('dotenv')
dotenv.config({path: './config/config.env'})
const morgan = require('morgan')
const colors = require('colors')
const fileUpload = require('express-fileupload')
const path = require('path')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const hpp = require('hpp')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')
const errorHandler = require('./middleware/error')

connectDB()

const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')
const reviews = require('./routes/reviews')
const logger = require('./middleware/logger')
const app = express()

app.use(express.json())
app.use(cookieParser())
//app.use(logger)
//dev login middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'))
}

app.use(fileUpload())
app.use(mongoSanitize())
app.use(helmet())
app.use(xss())
app.use(hpp())
const limiter = rateLimit({
    windowMs: 10*60*1000,
    max: 100
})

app.use(limiter)
app.use(cors())

app.use(express.static(path.join(__dirname,'public')))

// Mount Routes

app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)
app.use('/api/v1/reviews', reviews)

//Must be after mount Routes to work
app.use(errorHandler)



const port = process.env.PORT || 5000
const server = app.listen(port, () => {
    console.log(`App listening on port ${port}!`.yellow.bold);
});


process.on('unhandledRejection', (err,promise)=>{
    console.log(`Eror: ${err.message}`.red);
    server.close(()=> process.exit(1))
})