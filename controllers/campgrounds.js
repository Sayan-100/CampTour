const Campground = require('../models/campground');
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const {cloudinary} = require('../cloudinary');

const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken : mapBoxToken});

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}

module.exports.renderNewForm =  (req, res) => {
    // if(!req.isAuthenticated())
    // {
    //     req.flash('error', 'you must be signed in');
    //     return res.redirect('/login');
    // }
    res.render('campgrounds/new');
}

module.exports.createCampground = async(req, res, next) => {

    // try {
    // if(!req.body.campground) throw new ExpressError('Invalid campground Data', 401);
    // if(!req.body.campground.price) {

    // }

    const geoData = await geocoder.forwardGeocode({
        query : req.body.campground.location,
        limit : 1
    }).send()

    // res.send(geoData.body.features[0].geometry.coordinates);

    // res.send('ok');

    req.flash('success', 'Succesfully new campground created');
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({url : f.path, filename: f.filename}))
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    res.redirect(`/campgrounds/${campground._id}`);
    // } catch(err) {
    //     next(err);
    // }
}

module.exports.showCampground = async(req, res) => {
    // console.log('This ', req.params);
    // console.log('This', req.body);
    const campground = await Campground.findById(req.params.id).populate({
        path : 'reviews', 
        populate : {
            path : 'author'
        }
    }).populate('author');
    console.log(campground);
    if(!campground)
    {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds')
    }
    // console.log(campground);
    res.render('campgrounds/show', {campground});
}

module.exports.renderEditForm = async(req, res) => {
    
    const {id} = req.params;
    const campground = await Campground.findById(id);
  
    if(!campground)
    {
        req.flash('error', 'Cannot find that campground');
        return res.redirect('/campgrounds');
    }

    // if(!campground.author.equals(req.user._id)) {
    //     req.flash('error', 'You are not allowed to do that');
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    // console.log(campground.location);
    res.render('campgrounds/edit', {campground});
}

module.exports.updateCampground = async(req, res) => {
    // res.send("It worked");
    const {id} = req.params;
    console.log(req.body);
    // const campground = await Campground.findById(id);
    
    // Campground.findByIdAndUpdate(id, {title : '', location : ''})
    // const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    // if(!campground.author.equals(req.user._id)) {
    //     req.flash('error', 'You are not allowed to do that');
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({url : f.path, filename: f.filename}));
    campground.images.push(...imgs);

    
    await campground.save();

    if(req.body.deleteImages)
    {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull : {images : {filename : {$in : req.body.deleteImages}}}})
        console.log(campground);
    }

    req.flash('success', 'succesfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`);

}

module.exports.deleteCampground = async (req, res) => {
    // const {id} = req.params;
    // const campground = await Campground.findById(id);
    
    // // Campground.findByIdAndUpdate(id, {title : '', location : ''})
    // // const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    // if(!campground.author.equals(req.user._id)) {
    //     req.flash('error', 'You are not allowed to do that');
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'succesfullly deleted camground')
    res.redirect('/campgrounds');
}