const express = require('express')
const Review = require('../models/Review')
const {createReview,
     getReviews,
    getReview,
updateReview,
removeReview} = require('../controllers/reviews')
const advancedResults = require('../middleware/advancedResults')
const {protect, authorize} = require('../middleware/auth')

const router = express.Router({mergeParams: true})

router.route('/').get(advancedResults(Review,
    {
        path: 'bootcamp',
        select: 'name description'
    }), getReviews)
    .post(protect, authorize('publisher','admin'),createReview)
    
    router.route('/:id')
    .get(getReview)
    .put(protect,authorize('user','admin'),updateReview)
    .delete(protect, authorize('publisher','admin'),removeReview)


module.exports = router