const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../utils/geocoder')

const BootcampSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please Add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not have more than 50 characters']
    },
    slug: String,
    description: {
        type: String,
        required: [true, 'Please Add a description'],
        maxlength: [500, 'Name can not have more than 500 characters']
    }, 
    website: {
        type: String,
        match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
            ,'Please use a valid website']
    },
    phoneNumber: {
        type: String,
        maxlength: [20, 'Pleas add no more than 20 characters']
    },
    email: {
        type: String,
        match: [
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            ,'Please add a valid email'
        ]
    },
    address: {
        type: String,
        required: [true, 'Please add the address']
    },
      location: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  careers: {
      type: [String],
      required: true,
      enum: [
          'Web Development',
          'Mobile Development',
          'UI/UX',
          'Data Science',
          'Business',
          'Other'
      ]
  },
  averageRating:{
      type: Number,
      min: [1 ,'Must be greater then 1'],
      max: [10, 'Can not be greater tan 10']
  },
  averageCost: Number,
  photo: {
      type: String,
      default: 'no-photo.jpg'
  },
  housig:{
      type: Boolean,
      default: false
  },
  jobAssistance: {
      type: Boolean,
      default: false
  },
  jobGuarantee: {
      type: Boolean,
      default: false
  },
  acceptGi: {
      type: Boolean,
      default: false
  },
  createdAt: {
      type: Date,
      default: Date.now
  },
  user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
  }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

// Create Bootcamp Slug from camp name

BootcampSchema.pre('save', function(next){
    this.slug = slugify(this.name,{
        Lowell: true
    })
    next()
})

// Geocode  create location field

BootcampSchema.pre('save', async function(next){
    const loc = await geocoder.geocode(this.address)
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress : loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode ,
        country: loc[0].countryCode
    }

    // do no save address in db
    this.address = undefined
    next()
})

BootcampSchema.pre('remove', async function(next){
    console.log(`Courses being removed ${this._id}`);
    await this.model('Course').deleteMany({bootcamp: this._id})
    next()
})

BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
})

module.exports = mongoose.model('Bootcamp', BootcampSchema)