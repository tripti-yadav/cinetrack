const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
const { MongoClient, ObjectId } = require("mongodb");

const PORT = 3000;

const client = new MongoClient(process.env.MONGODB_URI);

const db = client.db("cinetrack");
const moviesCollection = db.collection("movies");

// Health check
app.get("/api/health", function (req, res) {
  res.json({
    status: "ok",
  });
});

// GET all movies
app.get("/api/movies", async function (req, res) {
  try {
    const movies = await moviesCollection.find({}).toArray();

    res.json(movies);
  } catch (error) {
    console.error("GET /api/movies error:", error);

    res.status(500).json({
      message: "Failed to fetch movies",
      error: error.message,
    });
  }
});

// GET one movie
app.get("/api/movies/:id", async function (req, res) {
  try {
    const movieId = new ObjectId(req.params.id);

    const movie = await moviesCollection.findOne({
      _id: movieId,
    });

    if (!movie) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    res.json(movie);
  } catch (error) {
    console.error("GET /api/movies/:id error:", error);

    res.status(400).json({
      message: "Invalid movie ID",
    });
  }
});

// POST create movie
app.post("/api/movies", async function (req, res) {
  try {
    if (!req.body.title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const newMovie = {
      title: req.body.title,
      year: req.body.year,
      genre: req.body.genre,
      rating: req.body.rating,
      watched: req.body.watched,
      createdAt: new Date(),
    };

    const result = await moviesCollection.insertOne(newMovie);

    const createdMovie = await moviesCollection.findOne({
      _id: result.insertedId,
    });

    res.status(201).json(createdMovie);
  } catch (error) {
    console.error("POST /api/movies error:", error);

    res.status(500).json({
      message: "Failed to create movie",
      error: error.message,
    });
  }
});

// PUT update movie
app.put("/api/movies/:id", async function (req, res) {
  try {
    const movieId = new ObjectId(req.params.id);

    const result = await moviesCollection.updateOne(
      { _id: movieId },
      {
        $set: {
          title: req.body.title,
          year: req.body.year,
          genre: req.body.genre,
          rating: req.body.rating,
          watched: req.body.watched,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    const updatedMovie = await moviesCollection.findOne({
      _id: movieId,
    });

    res.json(updatedMovie);
  } catch (error) {
    console.error("PUT /api/movies/:id error:", error);

    res.status(400).json({
      message: "Invalid movie ID",
    });
  }
});
// DELETE movie
app.delete("/api/movies/:id", async function (req, res) {
  try {
    const movieId = new ObjectId(req.params.id);

    const result = await moviesCollection.deleteOne({
      _id: movieId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Movie not found",
      });
    }

    res.json({
      message: "Movie deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/movies/:id error:", error);

    res.status(400).json({
      message: "Invalid movie ID",
    });
  }
});

// Start server
async function startServer() {
  try {
    await client.connect();

    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, "0.0.0.0" function () {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

startServer();