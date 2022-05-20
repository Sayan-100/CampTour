if(process.env.NODE_ENV !== "production")
{ 
    require('dotenv').config();
}

console.log(process.env.SECRET);

const express = require('express');
const app = express();
const path = require('path');
// const catchAsync = require('./utilis/catchAsync');
const ExpressError = require('./utilis/ExpressError');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
// const Joi = require('joi');
// const Review = require('./models/review');
// const helmet = require('helmet');

const session = require('express-session');

const flash = require('connect-flash');

const methodOverride = require('method-override');
// const Campground = require('./models/campground');
// const {campgroundSchema, reviewSchema} =require('./schemas');

const mongoSanitize = require('express-mongo-sanitize');

const reviewRoutes = require('./routes/reviews');
const campgroundRoutes = require('./routes/campground');
const userRoutes = require('./routes/users');

const User = require('./models/user');
const passport = require('passport');

const LocalStrategy = require('passport-local');

const MongoDBStore = require('connect-mongo')(session);


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// const dbUrl = 'mongodb://localhost:27017/yelp-camp';
//Database
//
mongoose.connect(dbUrl, {
    useNewUrlParser : true,
    // useCreateIndex: true,
    useUnifiedTopology : true,
    // userFindAndModify : false
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error:"));
db.once('open', () => {
    console.log("database connected");
});



app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended : true }));
app.use(methodOverride('_method'));

app.use(flash());
// app.use(helmet({
//     frameguard : false,
// }))

// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/dfw3onnwx/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );

const secret = process.env.SECRET || 'thisshouldbeabettersecr';

app.use(mongoSanitize({
    replaceWith :'_'
}));

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter : 24 * 60 * 60,

});

store.on('error', function(e){
    console.log('store error', e);
})

const sessionConfig = {
    store,
    name : 'session',
    secret,
    resave : false,
    saveUninitialized : true,
    // store : assd
    cookie : {

        httpOnly : true,
        // secure : true,
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge : 1000 * 60 * 60 * 24 * 7

    }

}

app.get('/fakeUser', async (req, res) => {
    const user = new User({email : 'sayan@gmail.com', username : 'sayan'});
    const newUser = await User.register(user, 'fries');
    //the sending data
    res.send(newUser);
})


app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



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



app.use((req, res, next) => {

    // console.log(req.session);

    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

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