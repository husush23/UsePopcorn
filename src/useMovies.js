import {useState, useEffect} from 'react';

const key = '4576ce21';
export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&s=${query}`
        );
        if (!res.ok) {
          throw new Error('Failed to fetch ');
        }
        const data = await res.json();
        console.log(data);
        if (data.Response === 'False') {
          throw new Error('Movie not found');
        }
        setMovies(data.Search);
        setIsLoading(false);
      } catch (err) {
        console.log(err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (query.length < 3) {
      setMovies([]);
      setError('');
      return;
    }

    // handleCloseMovie()
    fetchData();
    const controller = new AbortController();
    return () => controller.abort();
  }, [query]);

  return {movies, isLoading, error};
}
