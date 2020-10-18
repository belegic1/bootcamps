const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true,'Please add a title'],
        maxlength: 100,
        trim: true
    }, 
    text: {
        type: String,
        required: [true, 'Please ad some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating']
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

//Prevente user to submit more than one review per bootcamp
ReviewSchema.index({bootcamp: 1, user:1}, {unique: true})
////////////////////////////////////
ReviewSchema.statics.getAverageRating = async function(bootcampId){
    const obj = await this.aggregate([
      { 
           $match:{bootcamp: bootcampId}
         },
         {
             $group: {
                 _id: '$bootcamp',
                 averageRating: {$avg: '$rating'}
             }
         }
    ])
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating :obj[0].averageRating
        })
    } catch (error) {
        console.error(error)
    }
}


ReviewSchema.post('save',  function(){
    this.constructor.getAverageRating(this.bootcamp)
})
ReviewSchema.pre('remove', function(){
    this.constructor.getAverageRating(this.bootcamp)
})


module.exports = mongoose.model('Review', ReviewSchema)