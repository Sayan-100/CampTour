const express = require('express');
const catchAsync = require('../utilis/catchAsync');
// const {reviewSchema} =require('../schemas');

const Campground = require('../models/campground');

const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

const Review = require('../models/review');

const reviews = require('../controllers/reviews');

const ExpressError = require('../utilis/ExpressError');

const router = express.Router({mergeParams : true});

// const validateReview = (req, res, next) => {
//     const {error} = reviewSchema.validate(req.body);
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

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

module.exports = router;