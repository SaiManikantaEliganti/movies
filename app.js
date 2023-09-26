const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movie_id: dbObject.movie_id,
    director_id: dbObject.director_id,
    movie_name: dbObject.movie_name,
    lead_actor: dbObject.lead_actor,
    director_name: dbObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      *
    FROM
      movie;`;
  const MoviesArray = await database.all(getMoviesQuery);
  response.send(
    MoviesArray.map((eachmovie) => convertDbObjectToResponseObject(eachmovie))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMoviesQuery = `
  INSERT INTO
    movie (director_id, movie_name, lead_actor)
  VALUES
    ('${directorId}', ${movieName}, '${leadActor}');`;
  const movie = await database.run(postMoviesQuery);
  response.send("movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movies WHERE movie_id=${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movieId));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `UPDATE movies SET 
    director_id=${directorId},
    movie_name=${movieName},
    lead_actor=${lead_Actor}
    WHERE
    movie_id=${movieId}`;
  const movie = await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movies WHERE movie_id=${movieId}`;
  const movie = await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const DirectorArray = await database.all(getDirectorsQuery);
  response.send(
    DirectorArray.map((eachdirector) =>
      convertDbObjectToResponseObject(eachdirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `SELECT * FROM director WHERE director_id=${directorId}`;
  const director = await database.get(getDirectorQuery);
  response.send(convertDbObjectToResponseObject(director));
});

module.exports = app;
