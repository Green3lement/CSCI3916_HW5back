var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors= require('cors');
var User = require('./Users');
var Movie = require('./Movies');
var Review = require('./Review');

var app = express();
module.exports = app;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();


router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.route('/users/:userId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = req.params.userId;
        User.findById(id, function(err, user) {
            if (err) res.send(err);

            var userJson = JSON.stringify(user);
            // return that user
            res.json(user);
        });
    });

router.route('/users')
    .get(authJwtController.isAuthenticated, function (req, res) {
        User.find(function (err, users) {
            if (err) res.send(err);
            // return the users
            res.json(users);
        });
    });

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, message: 'Please pass username and password.'});
    }
    else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;
        // save the user
        user.save(function(err) {
            if (err) {
                // duplicate entry
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists. '});
                else
                    return res.send(err);
            }

            res.json({ success: true, message: 'User created!' });
        });
    }
});

router.post('/signin', function(req, res) {
    var userNew = new User();
    //userNew.name = req.body.name;
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) res.send(err);

        user.comparePassword(userNew.password, function(isMatch){
            if (isMatch) {
                var userToken = {id: user._id, username: user.username};
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, message: 'Authentication failed.'});
            }
        });


    });
});

router.route('/review')
    .post(authJwtController.isAuthenticated, function (req, res) {
        console.log(req.body);
        var review = new Review();
        review.title = req.body.title;
        review.username = req.body.username;
        review.rating = req.body.rating;
        if (Review.findOne({title: review.title} && {username: review.username}) != null) {
            review.save(function (err) {
                if (err) {
                    // duplicate entry
                    if (err.code == 11000)
                        res.json({success: false, message: 'Already reviewed'});
                    else
                        return res.send(err);
                }else res.json({success: true, message: 'Created'});
            });
        }
    })

    .get(authJwtController.isAuthenticated, function (req, res) {
        Review.find(function (err, review) {
            if(err) res.send(err);
            res.json(review);
        })
    });

router.route('/Movies')
    .get(authJwtController.isAuthenticated, function (req, res) {
        Movie.find(function (err, movies) {
            if (err) res.send(err);

            if(req.query.review === true) {
                var review = Review.find({title: req.body.title}, function (err, review) {
                    if (err) throw err;

                    res.json({success: true, movie: Movie, review: review,
                        msg: 'Movie and review retrieved from database'});
                });

                if (!review) {
                    res.status(401).send({success: false, msg: 'Review not available'});
                }
            }
            else{
                res.json({success: true, movie: Movie, msg:'Success'})
            }
        });
        if(!Movie) {
            res.status(401).send({success:false, msg:'Movie is not there' });
        }
    })

    .post(authJwtController.isAuthenticated, function (req, res) {
        var movie = new Movie({
            title: req.body.title,
            year: req.body.year,
            genre: req.body.genre,
            cast: req.body.cast
        });
        if(!movie){res.status(401).send({success:false, msg:'No movie given'})}

        else {
            var review = Review({
                title: req.body.title,
                username: req.body.username,
                rating: req.body.rating
            });
            review.save(function(err){
                if (err) throw err;
            });
            movie.save(function (err) {
                if (err) throw err;
            });

            res.json({success:true, msg:'Added the movie!'});
        }
    })

    .put(authJwtController.isAuthenticated, function (req, res) {

        var reqMovie = {title: req.body.title,
            year: req.body.year,
            genre: req.body.genre,
            cast: req.body.cast};
        var updatedMovie = {title: req.body.newTitle,
            year: req.body.newYear,
            genre: req.body.newGenre,
            cast: req.body.newCast};

        var movie = Movie.findOneAndUpdate(reqMovie, updatedMovie, function(err){
            if (err) throw err;
        });

        if (!movie) {
            res.status(401).send({success: false, msg: 'Movie is not there'});
        }
        else {
            res.json({success: true, msg: 'Movie successfully changed'});
        }
    })

    .delete(authJwtController.isAuthenticated, function (req, res) {
        var movie = Movie.deleteOne({title: req.body.title}, function(err){
            if (err) throw err;
        });

        if (!movie) {
            res.status(401).send({success: false, msg: 'Movie not there'});
        }
        else {
            res.json({success: true, msg: 'Movie deleted'});
        }
    });

app.use('/', router);
app.listen(process.env.PORT || 8080);
