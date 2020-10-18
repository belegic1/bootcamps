const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
    title :{
        type: String,
        trim: true,
        require:[ true, 'Add a course title']
    },
    description: {
        type: String,
        required: [ true, 'Please, add a description']
    },
    weeks: {
        type: String,
        required: [true, 'Please Add a number of weeks duration']
    },
    tuition:{
        type: Number,
        required: [ true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [ true, 'Please add a minimum skill required for this course'],
        enum: ['beginner', 'intermediate', 'advance']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        require: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }

})

CourseSchema.statics.getAverageCosts = async function(bootcampId){
    const obj = await this.aggregate([
      { 
           $match:{bootcamp: bootcampId}
         },
         {
             $group: {
                 _id: '$bootcamp',
                 averageCost: {$avg: '$tuition'}
             }
         }
    ])
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost : Math.ceil( obj[0].averageCost / 10) * 10
        })
    } catch (error) {
        console.error(error)
    }
}

CourseSchema.post('save',  function(){
    this.constructor.getAverageCosts(this.bootcamp)
})
CourseSchema.pre('remove', function(){
    this.constructor.getAverageCosts(this.bootcamp)
})


module.exports = mongoose.model('Course', CourseSchema)