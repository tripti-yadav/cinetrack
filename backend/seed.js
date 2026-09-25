const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGODB_URI);

const movies = [
  {
    title: "Interstellar",
    year: 2014,
    genre: ["Sci-Fi", "Drama"],
    rating: 8.7,
    watched: false,
    note: "",
    createdAt: new Date(),
  },
  {
    title: "Spirited Away",
    year: 2001,
    genre: ["Animation", "Fantasy"],
    rating: 8.6,
    watched: false,
    note: "",
    createdAt: new Date(),
  },
  {
    title: "The Dark Knight",
    year: 2008,
    genre: ["Action", "Crime"],
    rating: 9.0,
    watched: true,
    note: "",
    createdAt: new Date(),
  },
  {
    title: "Moonlight",
    year: 2016,
    genre: ["Drama", "Coming-of-Age"],
    rating: 7.4,
    watched: true,
    note: "",
    createdAt: new Date(),
  },
  {
    title: "Dune: Part Two",
    year: 2024,
    genre: ["Sci-Fi", "Adventure"],
    rating: 8.5,
    watched: false,
    note: "",
    createdAt: new Date(),
  },
  {
    title: "Parasite",
    year: 2019,
    genre: ["Drama", "Thriller"],
    rating: 8.5,
    watched: false,
    note: "",
    createdAt: new Date(),
  },
  {
    title: "The Matrix",
    year: 1999,
    genre: ["Sci-Fi", "Action"],
    rating: 8.7,
    watched: true,
    note: "",
    createdAt: new Date(),
  },
  {
    title: "Whiplash",
    year: 2014,
    genre: ["Drama", "Music"],
    rating: 8.5,
    watched: false,
    note: "",
    createdAt: new Date(),
  },
  {
    title: "Arrival",
    year: 2016,
    genre: ["Sci-Fi", "Drama"],
    rating: 8.0,
    watched: false,
    note: "",
    createdAt: new Date(),
  },
  {
    title: "The Grand Budapest Hotel",
    year: 2014,
    genre: ["Comedy", "Drama"],
    rating: 8.1,
    watched: true,
    note: "",
    createdAt: new Date(),
  },
];

async function seedDatabase() {
  try {
    await client.connect();

    console.log("Connected to MongoDB");

    const db = client.db("cinetrack");
    const moviesCollection = db.collection("movies");

    await moviesCollection.deleteMany({});

    const result = await moviesCollection.insertMany(movies);

    console.log(`${result.insertedCount} movies inserted`);
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await client.close();
  }
}

seedDatabase();