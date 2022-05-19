const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds');
const {campgroundSchema} =require('../schemas');
// const {isLoggedIn} = require('../middleware');
const catchAsync = require('../utilis/catchAsync');
const multer = require('multer');
const {storage} = require('../cloudinary');
// const upload = multer({dest : 'uploads/'});
const upload = multer({storage});
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');
const ExpressError = require('../utilis/ExpressError');


// const validateCampground = (req, res, next) => {
   
//     const {error} = campgroundSchema.validate(req.body);
//     if(error)
//     {
//         const message = error.details.map(el => el.message).join(',')
//         throw new ExpressError(message, 400);
//     }

//     else
//     {
//         next();
//     }
// }

// const isAuthor = async (req, res, next) => {
//     const {id} = req.params;
//     const campground = await Campground.findById(id);
//     if(!campground.author.equals(req.user._id)) {
//         req.flash('error', 'You are not allowed to do that');
//         return res.redirect(`/campgrounds/${id}`);
//     }
    
//     next();
// }

router.route('/')
.get(catchAsync(campgrounds.index))
 .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))
// .post(upload.array('image'), (req, res) => {
//     console.log(req.body);
//     //gdvusguods
//     console.log(req.files);
//     res.send('It worked');
// })

//router.get('/', catchAsync(campgrounds.index))

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
.get(catchAsync(campgrounds.showCampground))
.put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
.delete(isLoggedIn, catchAsync(campgrounds.deleteCampground));

// router.get('/makecampground', async (req, res) => {
//     const camp = new Campground({title : 'My Backyard', description : 'cheap camping'});
//     await camp.save();
//     res.send(camp);
// })



//router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

// router.get('/:id', catchAsync(campgrounds.showCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// router.delete('/:id', isLoggedIn, catchAsync(campgrounds.deleteCampground));

module.exports = router;