const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('dishes dish')
    .populate('user')
    .then( (favorites) => {
        console.log(favorites);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    }, (err) => next(err))
    .catch( (err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => 
{
    Favorites.findOne({user: req.user._id})
    .then( ( favorite ) => {
        if (favorite == null)
        {
            Favorites.create({ user: req.user._id, dishes: req.body })
            .then( (favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch( (err) => next(err));
        }
        else
        {
            req.body.map((dish) => {
                if( favorite.dishes.includes(dish._id) )
                {
                    err = new Error('Favorites already contains this dish');
                    err.status = 404;
                    return next(err);
                }
                else
                {
                    favorite.dishes.push(dish._id);
                    favorite.save()
                    .then( (favorite) => {
                        Favorites.findById(favorite._id)
                        .populate('user')
                        .populate('dishes dish')
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                    }, (err) => next(err))
                    .catch((err) => next(err));
                }
            });            
        }
    });
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndDelete({user: req.user._id})
    .then( ( resp ) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch( (err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
})
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if(!favorites)
        {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.join({"exists": false, "favorites": favorites})
        }
        else
        {
            if(favorites.dishes.indexOf(req.params.dishId) < 0 )
            {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.join({"exists": false, "favorites": favorites})
            }
            else
            {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.join({"exists": true, "favorites": favorites})
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then( ( favorite ) => {
        if( favorite.dishes.includes(req.params.dishId) )
        {
            err = new Error('Favorites already contains this dish');
            err.status = 404;
            return next(err);
        }
        else
        {
            favorite.dishes.push(req.params.dishId);
            favorite.save()
            .then( (favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dishes dish')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                }, (err) => next(err))
                .catch((err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites/'+ req.params.dishId);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then( (favorite) => {
        if(favorite)
        {
            if( !favorite.dishes.includes(req.params.dishId) )
            {
                err = new Error('The dish you want to delete is not listed as a favorite');
                err.status = 404;
                return next(err);
            }
            else
            {
                for (var i = 0; i < favorite.dishes.length; i++)
                {
                    if(favorite.dishes[i] == req.params.dishId)
                    {
                        favorite.dishes.splice(i,1);
                        console.log(favorite.dishes);
                    }
                }
                console.log('For loop ended');
                favorite.save()
                .then( (favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dishes dish')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    }, (err) => next(err))
                    .catch((err) => next(err));
                }, (err) => next(err))
                .catch((err) => next(err));
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoriteRouter;
