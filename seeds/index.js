const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedhelpers');
const Campground = require('../models/campground')


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

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

// for(let i = 0; i < 50; i++)
// {
//     console.log(cities[i].city, cities[i].state);
// }

const seedDB = async () => {
    await Campground.deleteMany({});
    // const c = new Campground({title : 'purple field'});
    // await c.save();
    for(let i = 0; i < 50; i++)
    {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

         //console.log(cities[random1000].city + " - " + cities[random1000].state);

        const camp = new Campground({
            location : `${cities[random1000].city}, ${cities[random1000].state}`, 
            title : `${sample(descriptors)} ${sample(places)}`,
            image : 'https://cdn2.howtostartanllc.com/images/business-ideas/business-idea-images/Campground.jpg',
            description :'Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum consectetur placeat velit reprehenderit nisi non illum impedit, deleniti soluta nemo ducimus fuga, eligendi repudiandae minima quisquam consequuntur optio, officia nostrum!',
            price
        })

        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});

