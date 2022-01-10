const axios = require("axios");
const tmdb_apiKey ="d142929db40137ccd06e817b947269c0";
const shuffle = require("lodash/shuffle");

let movieId = 550;
movieId.toString();


exports.getRandomMovies = function () {
    let discoverMovieUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdb_apiKey}`;
    let mdbData = axios.get(discoverMovieUrl);
    return mdbData.then((response) => {
        return shuffle(response.data.results).slice(0,3);
    })
}







