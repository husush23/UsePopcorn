import {useEffect, useRef, useState} from 'react';
import StarRating from './StarRating';
import {useMovies} from './useMovies';

const average = arr =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Navbar({children}) {
  return <nav className='nav-bar'>{children}</nav>;
}
function NumResults({movies}) {
  return (
    <p className='num-results'>
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Logo() {
  return (
    <div className='logo'>
      <span role='img'>🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Search({query, setQuery}) {
  const inputEl = useRef(null);

  useEffect(() => {
    const callback = e => {
      if (document.activeElement === inputEl) return;
      if (e.code === 'Enter') {
        inputEl.current.focus();
        setQuery('');
      }
    };
    document.addEventListener('keydown', callback);
  }, [setQuery]);

  return (
    <input
      className='search'
      type='text'
      placeholder='Search movies...'
      value={query}
      onChange={e => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
const key = '4576ce21';
export default function App() {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const [watched, setWatched] = useState(() =>
    JSON.parse(localStorage.getItem('watched'))
  );

  function handleSelect(id) {
    setSelectedId(prev => (prev === id ? null : id));
  }
  function handleClosesMovie() {
    setSelectedId(null);
  }
  function handleAddWatched(movie) {
    setWatched(watched => [...watched, movie]);
  }

  useEffect(() => {
    localStorage.setItem('watched', JSON.stringify(watched));
  }, [watched]);

  // Custom Hook
  const {movies, isLoading, error} = useMovies(query);

  return (
    <>
      <Navbar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MoviesList movies={movies} onSelectMovie={handleSelect} />
          )}
          {error && <Error message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onClose={handleClosesMovie}
              onAddWatched={handleAddWatched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList watched={watched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className='loader'>Loading...</p>;
}
function Error({message}) {
  return (
    <p className='error'>
      <span>🚫</span> {message}
    </p>
  );
}

function Main({children}) {
  return <main className='main'>{children}</main>;
}

function Box({children}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className='box'>
      <button className='btn-toggle' onClick={() => setIsOpen(open => !open)}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && children}
    </div>
  );
}
function MoviesList({movies, onSelectMovie}) {
  return (
    <ul className='list list-movies'>
      {movies?.map(movie => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}
function Movie({movie, onSelectMovie}) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({selectedId, onClose, onAddWatched}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUsserRating] = useState('');

  const ratingCount = useRef(0);

  useEffect(() => {
    if (userRating) ratingCount.current = ratingCount.current + 1;
  }, [userRating]);

  const {
    Title: title,
    Plot: plot,
    Runtime: runtime,
    Year: year,
    Poster: poster,
    imdbRating,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  const [avgRating, setAvgRating] = useState(0);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: +imdbRating,
      runtime: +runtime.split(' ').at(0),
      userRating,
      ratingDecisions: ratingCount.current,
    };
    onAddWatched(newWatchedMovie);
    onClose();
  }

  useEffect(() => {
    async function fetchMovieDetails() {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${key}&i=${selectedId}`
      );
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    fetchMovieDetails();
  }, [selectedId]);
  return (
    <div className='details'>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className='btn-back' onClick={onClose}>
              &larr;
            </button>
            <img alt={`poster of ${movie} movie`} src={poster} />
            <div className='details-overview'>
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>⭐{imdbRating} imdb Rating</p>
            </div>
          </header>
          <section>
            <div className='rating'>
              <StarRating
                maxRating={10}
                size={24}
                onSetRating={setUsserRating}
              />
              <button className='btn-add' onClick={handleAdd}>
                + Add to list{' '}
              </button>
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedSummary({watched}) {
  const avgImdbRating = average(watched.map(movie => movie.imdbRating));
  const avgUserRating = average(watched.map(movie => movie.userRating));
  const avgRuntime = average(watched.map(movie => movie.runtime));
  return (
    <div className='summary'>
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedList({watched}) {
  return (
    <ul className='list'>
      {watched.map(movie => (
        <WatchedMovies movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}
function WatchedMovies({movie}) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
