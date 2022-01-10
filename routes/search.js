var express = require('express');
var router = express.Router();
const {getRandomMovies} = require("../helpers/movies");


router.get('/', async function (req, res, next) {
    const movies = await getRandomMovies();
    res.render('search', {movies: movies});
});


module.exports = router;
