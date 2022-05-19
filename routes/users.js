const express = require('express');
const router = express.Router();
const catchAsync = require('../utilis/catchAsync');

const users = require('../controllers/users');

const User = require('../models/user');

const passport = require('passport');

router.route('/register')
.get(users.renderRegister)
.post(catchAsync(users.register))

router.route('/login')
.get(users.renderLogin)
.post(passport.authenticate('local', {failureFlash : true, failureRedirect: '/login'}), users.login)


// router.get('/register', users.renderRegister);

// router.post('/register', catchAsync(users.register));

// router.get('/login', users.renderLogin);

// router.post('/login', passport.authenticate('local', {failureFlash : true, failureRedirect: '/login'}), users.login)

router.get('/logout', users.logout);


module.exports = router;