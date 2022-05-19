const User = require('../models/user');

module.exports.renderRegister =  (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    // res.send(req.body);

    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registereduser = await User.register(user, password);

        req.login(registereduser, err => {
            if(err)
            {
                return next(err);
            }

            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        })

        
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
    // console.log(registereduser);
    
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectedUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectedUrl);
    // res.redirect('/campgrounds');

}

module.exports.logout = (req, res) => {
    req.logout();
    //the message

    req.flash('success', 'GoodBye! see you soon');
    res.redirect('/campgrounds');
}