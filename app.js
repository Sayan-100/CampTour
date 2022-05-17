const express = require('express');
const app = express();
const path = require('path');
const catchAsync = require('./utilis/catchAsync');
const ExpressError = require('./utilis/ExpressError');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
// const Joi = require('joi');
const Review = require('./models/review');
const campgrounds = require('./routes/campground');
const reviews = require('./routes/reviews');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const {campgroundSchema, reviewSchema} =require('./schemas');



//Database
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser : true,
    // useCreateIndex: true,
    useUnifiedTopology : true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("database connected");
});



app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended : true }));
app.use(methodOverride('_method'));

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

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req, res) => {
    res.render('home');
})



app.all('*', (req, res, next) => {
    next(new ExpressError('Not Found', 404));
})

app.use((err, req, res, next) => {
    // const {statusCode = 500, message = 'Something went wrong'} = err;
    // res.status(statusCode).send(message);

    const {statusCode = 500} = err;

    if(!err.message)
    {
        err.message = "Oh No, Something went wrong!"
    }

    res.status(statusCode).render('error', {err});
    // res.send('Something went wrong');
})

app.listen(5000, () => {
    console.log("serving on port 5000");
})