
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var User = require('../models/users');
var Role = require('../models/roles');
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id)
        .populate('role')
        .exec(function (err, user) {
            if(err) throw err;
            console.log(user);
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose username is the same as the forms username
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'username' :  username }, function(err, user) {
            // if there are any errors, return the error

            if (err)
                return done(err);
    
            // check to see if theres already a user with that username

            if (user) {
                return done(null, false, req.flash('registerMessage', 'That username is already taken.'));
            } else {

                // if there is no user with that username
                // create the user
                var newUser  = new User({
                        username: username,
                        password: password,
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        email:req.body.email,
                        location: req.body.location,
                        createdAt: new Date()
                });

                Role.findOne({ name: req.body.role }, function(err, role) {
                    if (err) throw err;
                    newUser.role = role._id;
                    // save the user
                    newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                     });
                });
            }

        });    

        });

    }));

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata         
            // all is well, return successful user
            return done(null, user);
        });

    }));
};