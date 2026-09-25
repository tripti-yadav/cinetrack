let movies = [];
const API_URL = "http://localhost:3000";

// queue from local storage
let queue = JSON.parse(
  localStorage.getItem("cinetrack_queue") || "[]"
);
// dom
const movieGrid = document.getElementById("movie-grid");
const searchInput = document.getElementById("search-input");
const queueList = document.getElementById("queue-list");

const movieForm = document.getElementById("movie-form");
const titleInput = document.getElementById("title-input");
const yearInput = document.getElementById("year-input");
const genreInput = document.getElementById("genre-input");
const ratingInput = document.getElementById("rating-input");

//get movies from apiiii
async function loadMovies() {
  try {
    const response = await fetch(`${API_URL}/api/movies`);

    if (!response.ok) {
      throw new Error("Could not load movies");
    }

    movies = await response.json();
    renderMovies();
    renderQueue();

  } catch (error) {
    console.error(error);
  }
}
//add movie brother
async function addMovie() {
  const movieData = {
    title: titleInput.value,
    year: Number(yearInput.value),

    genre: genreInput.value
      .split(",")
      .map(function (genre) {
        return genre.trim();
      }),

    rating: Number(ratingInput.value),

    watched: false,
  };
  const response = await fetch(`${API_URL}/api/movies`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(movieData),
  });

  if (!response.ok) {
    throw new Error("Could not add movie");
  }
  const newMovie = await response.json();

  movies.push(newMovie);

  renderMovies();
  renderQueue();

  movieForm.reset();
}
//render queue
function renderQueue() {

  const queuedMovies = queue
    .map(function (movieId) {

      return movies.find(function (movie) {
        return movie._id === movieId;
      });

    })
    .filter(function (movie) {
      return movie !== undefined;
    });

  // Remove movie IDs that no longer
  // exist in the database

  queue = queuedMovies.map(function (movie) {
    return movie._id;
  });

  // Save cleaned queue

  localStorage.setItem(
    "cinetrack_queue",
    JSON.stringify(queue)
  );
  // Render queue
  queueList.innerHTML = queuedMovies
    .map(function (movie) {
      return `
        <div class="queue-item">

          <strong>${movie.title}</strong>

          <span>${movie.year}</span>

          <button
            class="remove-queue-button"
            data-id="${movie._id}"
            type="button"
          >
            Remove
          </button>

        </div>
      `;

    })
    .join("");
}
// render movies

function renderMovies() {

  const searchTerm = searchInput.value
    .toLowerCase()
    .trim();
  const visibleMovies = movies.filter(function (movie) {

    return movie.title
      .toLowerCase()
      .includes(searchTerm);
  });
  movieGrid.innerHTML = visibleMovies
    .map(function (movie) {
      return `
        <article class="movie-card">

          <div class="poster">
            ${movie.title.toUpperCase()}
          </div>
          <h3>
            ${movie.title}
          </h3>
          <p>
            ${movie.year} · ${movie.genre.join(", ")}
          </p>
          <p>
            ★ ${movie.rating}
          </p>
          <!-- WATCH -->
          <button
            class="watch-button"
            data-id="${movie._id}"
            type="button"
          >
            ${
              movie.watched
                ? "Watched ✓"
                : "Mark watched"
            }
          </button>
          <!-- EDIT -->
          <button
            class="edit-button"
            data-id="${movie._id}"
            type="button"
          >
            Edit
          </button>
          <!-- DELETE -->
          <button
            class="delete-button"
            data-id="${movie._id}"
            type="button"
          >
            Delete
          </button>
          <!-- QUEUE -->
          <button
            class="queue-button"
            data-id="${movie._id}"
            type="button"
          >
            ${
              queue.includes(movie._id)
                ? "Remove from Queue"
                : "Add to Tonight's Queue"
            }
          </button>

        </article>
      `;
    })
    .join("");
}
// queue buitton
movieGrid.addEventListener(
  "click",
  function (event) {

    if (!event.target.matches(".queue-button")) {
      return;
    }
    const movieId =
      event.target.dataset.id;
    // already in queue?
    // remove
    if (queue.includes(movieId)) {
      queue = queue.filter(function (id) {
        return id !== movieId;
      });

    }
    //not in queue?
    //add it.
    else {
      queue.push(movieId);
    }
    //save queue
    localStorage.setItem(
      "cinetrack_queue",
      JSON.stringify(queue)
    );
    //update UI
    renderMovies();
    renderQueue();

  }
);
//remove from queue
queueList.addEventListener(
  "click",
  function (event) {
    if (
      !event.target.matches(
        ".remove-queue-button"
      )
    ) {
      return;
    }
    const movieId =
      event.target.dataset.id;
    queue = queue.filter(function (id) {
      return id !== movieId;
    });
    localStorage.setItem(
      "cinetrack_queue",
      JSON.stringify(queue)
    );
    renderMovies();
    renderQueue();
  }
);
//watch button
movieGrid.addEventListener(
  "click",
  async function (event) {

    if (!event.target.matches(".watch-button")) {
      return;
    }
    const movieId =
      event.target.dataset.id;
    const clickedMovie = movies.find(
      function (movie) {
        return movie._id === movieId;
      }
    );
    if (!clickedMovie) {
      return;
    }
    const updatedWatched =
      !clickedMovie.watched;
    const response = await fetch(
      `${API_URL}/api/movies/${movieId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: clickedMovie.title,
          year: clickedMovie.year,
          genre: clickedMovie.genre,
          rating: clickedMovie.rating,
          watched: updatedWatched,
        }),
      }
    );
    if (!response.ok) {
      throw new Error(
        "Could not update movie"
      );
    }
    const updatedMovie =
      await response.json();
    const movieIndex =
      movies.findIndex(
        function (movie) {
          return movie._id === movieId;
        }
      );
    movies[movieIndex] =
      updatedMovie;
    renderMovies();
    renderQueue();
  }
);
//edit button
movieGrid.addEventListener(
  "click",
  async function (event) {

    if (!event.target.matches(".edit-button")) {
      return;
    }
    const movieId =
      event.target.dataset.id;


    const movie = movies.find(
      function (movie) {
        return movie._id === movieId;
      }
    );
    if (!movie) {
      return;
    }
    const newRating = prompt(
      "Enter new rating:",
      movie.rating
    );

    if (newRating === null) {
      return;
    }
    const updatedMovieData = {
      title: movie.title,
      year: movie.year,
      genre: movie.genre,
      rating: Number(newRating),
      watched: movie.watched,
    };
    const response = await fetch(
      `${API_URL}/api/movies/${movieId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          updatedMovieData
        ),
      }
    );
    if (!response.ok) {
      throw new Error(
        "Could not update movie"
      );
    }
    const updatedMovie =
      await response.json();
    const movieIndex =
      movies.findIndex(
        function (movie) {
          return movie._id === movieId;
        }
      );
    movies[movieIndex] =
      updatedMovie;
    renderMovies();
    renderQueue();
  }
);
//delete button
movieGrid.addEventListener(
  "click",
  async function (event) {
    if (!event.target.matches(".delete-button")) {
      return;
    }
    const movieId =
      event.target.dataset.id;
    const response = await fetch(
      `${API_URL}/api/movies/${movieId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error(
        "Could not delete movie"
      );
    }
    // Remove from movies array

    movies = movies.filter(
      function (movie) {
        return movie._id !== movieId;
      }
    );
    // Remove from local queue too
    queue = queue.filter(
      function (id) {
        return id !== movieId;
      }
    );
    // Save cleaned queue

    localStorage.setItem(
      "cinetrack_queue",
      JSON.stringify(queue)
    );
    renderMovies();
    renderQueue();

  }
);
//search movies

searchInput.addEventListener(
  "input",
  renderMovies
);
//add movie form
movieForm.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();
    try {
      await addMovie();
    } catch (error) {
      console.error(error);
      alert("Could not add movie");
    }
  }
);
//start app
loadMovies();