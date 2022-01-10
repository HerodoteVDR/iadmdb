var express = require('express');
var router = express.Router();
// on récupère la fonction getRandomMovies de movies.js
const axios = require("axios");
const Airtable = require('airtable');
const apiKey = "keycQG2ES1ZMbCjm0";

Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: apiKey,
});

const tmdb_apiKey = "d142929db40137ccd06e817b947269c0";


function getSpecificMovie(id) {
    let getMovieUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdb_apiKey}&language=fr`;
    let mdbData = axios.get(getMovieUrl);
    return mdbData.then((response) => {
        return response.data;
    })
}



async function getMovieCast (id){
    let movieCastUrl = `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${tmdb_apiKey}&language=fr`;
    let mdbcData = axios.get(movieCastUrl);
    return mdbcData.then((response) => {
        return response.data;
    })
}

/* airtable */

const base = Airtable.base('appme6v3zds3AK7B1');


function getRandomTeacher() {
    return Math.floor(Math.random() * 4)
}


let teachers = [];

async function getTeacher() {

    return base('Teachers')
        .select({
            view: "Grid view"
        })
        .all()
        .then((data) => {
            teachers = data.map((d) => d.fields);
            teachers = teachers[getRandomTeacher()];
            return teachers
        })

}



let name = [];

async function getTeacherName() {

    return base('Teachers')
        .select({
            view: "Grid view"
        })
        .all()
        .then((data) => {
            name = data.map((d) => d.get("Names"));
            name = name[randomTeacher];
            return name
        })
}

let comments = [];

async function getTeacherComment() {
    if (comments.length) return comments;
    return base("TeacherComments")
        .select({
            view: "Grid view"
        })
        .all()
        .then((data) => {
            comments = data.map((d) => d.fields)
            return comments;
        })
}
// localhost:3000/movie/id
router.get('/id/*', async function (req, res, next) {
    // Get movie id from url
    let requested_movie = req.originalUrl.split('/')[3];
    // Get movie data from tmdb
    const movies = await getSpecificMovie(requested_movie);

    const cast = await getMovieCast(requested_movie);
    let director = cast.crew.filter((ca) => ca.job ==="Director");

    /*  =teacher comment */

    const comments = await getTeacherComment();

    /* GENERATE COMMENT */

    const randomCommentElement = (table) =>
        table[Math.floor(Math.random() * table.length)];

    const subjects = comments.filter((c) => c.Type === "Subject");
    const adjectives = comments.filter((c) => c.Type === "Adjective");
    const successes = comments.filter((c) => c.Type === "Success");
    const verbs1 = comments.filter((c) => c.Type === "Verb1");
    const verbs2 = comments.filter((c) => c.Type === "Verb2");
    const verbs3 = comments.filter((c) => c.Type === "Verb3");
    const conclusions = comments.filter((c) => c.Type === "Conclusion");
    /* what about the movie */

    let subject;
    let adjective;
    let success;
    let verb1;
    let verb2;
    let verb3;
    let conclusion;


    /* BASED ON PUBLIC SCORE */

    if (movies.vote_average <= 6.5) {
        subject = randomCommentElement(subjects.filter((o) => o.Value === "Negative"));
        adjective = randomCommentElement(adjectives.filter((o) => o.Value === "Negative"));
        verb1 = randomCommentElement(verbs1.filter((o) => o.Value === "Negative"));
        conclusion = randomCommentElement(conclusions.filter((o) => o.Value === "Negative"));

    }

    else if (7.5 >= movies.vote_average && movies.vote_average > 6.5) {
        subject = randomCommentElement(subjects.filter((o) => o.Value === "Neutral"));
        adjective = randomCommentElement(adjectives.filter((o) => o.Value === "Neutral"));
        verb1 = randomCommentElement(verbs1.filter((o) => o.Value === "Neutral"));
        conclusion = randomCommentElement(conclusions.filter((o) => o.Value === "Neutral"));
    }

    else if (movies.vote_average > 7.5) {
        subject = randomCommentElement(subjects.filter((o) => o.Value === "Positive"));
        adjective = randomCommentElement(adjectives.filter((o) => o.Value === "Positive"));
        verb1 = randomCommentElement(verbs1.filter((o) => o.Value === "Positive"));
        conclusion = randomCommentElement(conclusions.filter((o) => o.Value === "Positive"));
    }



    /*  BASED ON CAST AND CREW */

    // crew

    if (director[0].popularity < 1) {
        verb2 = randomCommentElement(verbs2.filter((o) => o.Value === "Negative"));
    }

    else if (director[0].popularity >= 1 && director[0].popularity <= 5) {
        verb2 = randomCommentElement(verbs2.filter((o) => o.Value === "Neutral"));
    }

    else if (director[0].popularity > 5) {
        verb2 = randomCommentElement(verbs2.filter((o) => o.Value === "Positive"));
    }

    // cast
    if (cast.cast[0].popularity <= 5) {
        verb3 = randomCommentElement(verbs3.filter((o) => o.Value === "Negative"));
    }

    else if (cast.cast[0].popularity > 5 && cast.cast[0].popularity < 15) {
        verb3 = randomCommentElement(verbs3.filter((o) => o.Value === "Neutral"));
    }

    else if (cast.cast[0].popularity >= 15) {
        verb3 = randomCommentElement(verbs3.filter((o) => o.Value === "Positive"));
    }




    /* FORMAT AND SUCCESS */

    /* En dessous de mille, affichage sans rien */
    if (movies.revenue < 999) {
        movies.revenue.toString();
        movies.revenue = `${movies.revenue}`;
        success = randomCommentElement(successes.filter((o) => o.Value === "Negative"));

    }
    /* Au dessus des centaines, x milles $ */
    else if(999999 > movies.revenue && movies.revenue > 999) {
        movies.revenue = Math.ceil(movies.revenue / 1000);
        movies.revenue.toString();
        movies.revenue = `${movies.revenue} milles`;
        success = randomCommentElement(successes.filter((o) => o.Value === "Neutral"));
    }


    /* Au dessus des milliers, x millions $ */
    else if(999999999 > movies.revenue && movies.revenue > 999999) {
        movies.revenue = Math.ceil(movies.revenue / 1000000);
        movies.revenue.toString();

        movies.revenue = `${movies.revenue} millions`;
        success = randomCommentElement(successes.filter((o) => o.Value === "Positive"));
    }

    else if(movies.revenue > 999999999){
        movies.revenue = Math.ceil(movies.revenue / 1000000000);
        movies.revenue.toString();
        movies.revenue = `${movies.revenue} milliards`;
        success = randomCommentElement(successes.filter((o) => o.Value === "Positive"));
    }
    //
    const teacher = await getTeacher();
    const teacherImage = teacher.Images;
    const teacherName = teacher.Names;


    res.render('movie', {movie: movies, cast : cast, teacherImage: teacherImage, director: director, teacherName: teacherName,
        comment: `${subject.Contents} ${adjective.Contents} ${success.Contents} ${verb1.Contents}. ${director[0].name} ${verb2.Contents} 
        ${cast.cast[0].name} ${verb3.Contents}. ${conclusion.Contents} ${movies.genres[0].name.toLowerCase()}s !`});
});


module.exports = router;



/* =tentative de searchbar qui n'a pas abouti dans les temps */


//
// function getMovieByName(name) {
//     let getMovieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdb_apiKey}&language=fr&query=${name}`;
//     let mdbData = axios.get(getMovieUrl);
//     return mdbData.then((response) => {
//         return response.data;
//     })
// }
//
//
// // localhost:3000/movie/id
// router.get('/search/*', async function (req, res, next) {
//
//     let requestedMovieName = req.query.name;
//     // Get movie data from tmdb
//     const movieName = await getMovieByName(requestedMovieName);
//     console.log(movieName);
//     let requestedMovie = movieName.results[0].id;
//     console.log(requestedMovie)
//     // Get movie data from tmdb
//     const movies = await getSpecificMovie(requestedMovie);
//
//
//     const cast = await getMovieCast(requestedMovie);
//     let director = cast.crew.filter((ca) => ca.job ==="Director");
//
//     /*  =teacher comment */
//
//     const comments = await getTeacherComment();
//
//     /* GENERATE COMMENT */
//
//     const randomCommentElement = (table) =>
//         table[Math.floor(Math.random() * table.length)];
//
//     const subjects = comments.filter((c) => c.Type === "Subject");
//     const adjectives = comments.filter((c) => c.Type === "Adjective");
//     const successes = comments.filter((c) => c.Type === "Success");
//     const verbs1 = comments.filter((c) => c.Type === "Verb1");
//     const verbs2 = comments.filter((c) => c.Type === "Verb2");
//     const verbs3 = comments.filter((c) => c.Type === "Verb3");
//     const conclusions = comments.filter((c) => c.Type === "Conclusion");
//     /* what about the movie */
//
//     let subject;
//     let adjective;
//     let success;
//     let verb1;
//     let verb2;
//     let verb3;
//     let conclusion;
//
//
//     /* BASED ON PUBLIC SCORE */
//
//     if (movies.vote_average <= 5) {
//         subject = randomCommentElement(subjects.filter((o) => o.Value === "Negative"));
//         adjective = randomCommentElement(adjectives.filter((o) => o.Value === "Negative"));
//         verb1 = randomCommentElement(verbs1.filter((o) => o.Value === "Negative"));
//         conclusion = randomCommentElement(conclusions.filter((o) => o.Value === "Negative"));
//
//     }
//
//     else if (7.5 >= movies.vote_average && movies.vote_average > 5) {
//         subject = randomCommentElement(subjects.filter((o) => o.Value === "Neutral"));
//         adjective = randomCommentElement(adjectives.filter((o) => o.Value === "Neutral"));
//         verb1 = randomCommentElement(verbs1.filter((o) => o.Value === "Neutral"));
//         conclusion = randomCommentElement(conclusions.filter((o) => o.Value === "Neutral"));
//     }
//
//     else if (movies.vote_average > 7.5) {
//         subject = randomCommentElement(subjects.filter((o) => o.Value === "Positive"));
//         adjective = randomCommentElement(adjectives.filter((o) => o.Value === "Positive"));
//         verb1 = randomCommentElement(verbs1.filter((o) => o.Value === "Positive"));
//         conclusion = randomCommentElement(conclusions.filter((o) => o.Value === "Positive"));
//     }
//
//
//
//     /*  BASED ON CAST AND CREW */
//
//     // crew
//
//     if (director[0].popularity < 1) {
//         verb2 = randomCommentElement(verbs2.filter((o) => o.Value === "Negative"));
//     }
//
//     else if (director[0].popularity >= 1) {
//         verb2 = randomCommentElement(verbs2.filter((o) => o.Value === "Neutral"));
//     }
//
//     else if (director[0].popularity > 5) {
//         verb2 = randomCommentElement(verbs2.filter((o) => o.Value === "Positive"));
//     }
//
//     // cast
//     if (cast.cast[0].popularity <= 2) {
//         verb3 = randomCommentElement(verbs3.filter((o) => o.Value === "Negative"));
//     }
//
//     else if (cast.cast[0].popularity > 2 && cast.cast[0].popularity <= 6 ) {
//         verb3 = randomCommentElement(verbs3.filter((o) => o.Value === "Neutral"));
//     }
//
//     else if (cast.cast[0].popularity > 6) {
//         verb3 = randomCommentElement(verbs3.filter((o) => o.Value === "Positive"));
//     }
//
//
//
//
//
//     /* FORMAT AND SUCCESS */
//
//     /* En dessous de mille, affichage sans rien */
//     if (movies.revenue < 999) {
//         movies.revenue.toString();
//         movies.revenue = `${movies.revenue}`;
//         success = randomCommentElement(successes.filter((o) => o.Value === "Negative"));
//
//     }
//     /* Au dessus des centaines, x milles $ */
//     else if(999999 > movies.revenue && movies.revenue > 999) {
//         movies.revenue = Math.ceil(movies.revenue / 1000);
//         movies.revenue.toString();
//         movies.revenue = `${movies.revenue} milles`;
//         success = randomCommentElement(successes.filter((o) => o.Value === "Neutral"));
//     }
//
//
//     /* Au dessus des milliers, x millions $ */
//     else if(999999999 > movies.revenue && movies.revenue > 999999) {
//         movies.revenue = Math.ceil(movies.revenue / 1000000);
//         movies.revenue.toString();
//
//         movies.revenue = `${movies.revenue} millions`;
//         success = randomCommentElement(successes.filter((o) => o.Value === "Positive"));
//     }
//
//     else if(movies.revenue > 999999999){
//         movies.revenue = Math.ceil(movies.revenue / 1000000000);
//         movies.revenue.toString();
//         movies.revenue = `${movies.revenue} milliards`;
//         success = randomCommentElement(successes.filter((o) => o.Value === "Positive"));
//     }
//
//     const teacherName = await getTeacherName();
//     const teacherImage = await getTeacherImage();
//
//
//
//
//     res.render('movie', {movie: movies, cast : cast, teacherImage: teacherImage, director: director, teacherName: teacherName,
//         comment: `${subject.Contents} ${adjective.Contents} ${success.Contents} ${verb1.Contents}. ${director[0].name} ${verb2.Contents}
//         ${cast.cast[0].name} ${verb3.Contents}. ${conclusion.Contents} ${movies.genres[0].name.toLowerCase()}s !`});
// });
//


