const express = require('express')

const {
    getUser,
    getUsers,
    createUser,
    updateUser,
    removeUser
} = require('../controllers/users')
const User = require('../models/User')
const advancedResults = require('../middleware/advancedResults')
const {protect, authorize} = require('../middleware/auth')

const router = express.Router()

router.use(protect)
router.use(authorize('admin'))

router.route('/')
.get(advancedResults(User),getUsers)
.post(createUser)

router.route('/:id')
.get(getUser)
.put(updateUser)
.delete(removeUser)



module.exports = router;