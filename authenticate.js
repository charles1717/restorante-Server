//p. numbers are used to track the code from User Authentication with Passport
//t. numbers are used to track the code from User Authentication with Passport and JSON Web Token

var passport = require('passport'); //p.1
var LocalStrategy = require('passport-local').Strategy; //p.2
var User = require('./models/user'); //p.3

var JwtStrategy = require('passport-jwt').Strategy; //t.1
var ExtractJwt = require('passport-jwt').ExtractJwt; //t.2
var jwt = require('jsonwebtoken'); //t.3......used to create, sign and verify tokens

var config = require('./config'); //t.4

exports.local = passport.use(new LocalStrategy(User.authenticate())); //p.4
passport.serializeUser(User.serializeUser()); //p.5 - only needed for Express Sessions
passport.deserializeUser(User.deserializeUser()); //p.6 - only needed for Express Sessions

exports.getToken = function(user) //t.5
{
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

var opts = {}; //t.6
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //t.7
opts.secretOrKey = config.secretKey; //t.8

exports.jwtPassport = passport.use(new JwtStrategy(opts, //t.9
    (jwt_payload, done) => 
    {
        console.log("JWT payload: ", jwt_payload)
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if(err)
            {
                return done(err, false);
            }
            else if (user)
            {
                return done(null, user);
            }
            else 
            {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false}); //t.10

exports.verifyAdmin = (req, res, next) => 
{
    console.log(req.user.admin);
    if(req.user.admin)
    {
        return next();
    }
    else
    {
        err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}

exports.verifyCommentOwner = (req, res, next) =>
{
    
}
