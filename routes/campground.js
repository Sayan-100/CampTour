const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const {campgroundSchema} =require('../schemas');
const catchAsync = require('../utilis/catchAsync');
const ExpressError = require('../utilis/ExpressError');


const validateCampground = (req, res, next) => {
   
    const {error} = campgroundSchema.validate(req.body);
    if(error)
    {
        const message = error.details.map(el => el.message).join(',')
        throw new ExpressError(message, 400);
    }

    else
    {
        next();
    }
}



router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}))


// router.get('/makecampground', async (req, res) => {
//     const camp = new Campground({title : 'My Backyard', description : 'cheap camping'});
//     await camp.save();
//     res.send(camp);
// })


router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', validateCampground, catchAsync(async(req, res, next) => {

    // try {
    // if(!req.body.campground) throw new ExpressError('Invalid campground Data', 401);
    // if(!req.body.campground.price) {

    // }
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
    // } catch(err) {
    //     next(err);
    // }
}))

router.get('/:id', catchAsync(async(req, res) => {
    // console.log('This ', req.params);
    // console.log('This', req.body);
    const campground = await Campground.findById(req.params.id).populate('reviews');
    console.log(campground);
    res.render('campgrounds/show', {campground});
}))

router.get('/:id/edit', catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id)
    // console.log(campground.location);
    res.render('campgrounds/edit', {campground});
}))

router.put('/:id', validateCampground, catchAsync(async(req, res) => {
    // res.send("It worked");
    const {id} = req.params;
    // Campground.findByIdAndUpdate(id, {title : '', location : ''})
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);

}))

router.delete('/:id', catchAsync(async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router;