import { useEffect, useState } from "react";
import { isCancel } from "axios";
import { getPopularMovies, searchMovies } from "./api/tmdb";
import MovieCard from "./components/MovieCard";


export default function App() {
  const[movies, setMovies] = useState([]); 
  const[loading,setLoading] = useState(true);
  const[error,setError] = useState(null);
  const[query, setQuery] = useState("");
  const[search, setSearch] = useState("");
  const[selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const request = search
      ? searchMovies(search, controller.signal, page)
      : getPopularMovies(controller.signal, page);

    request
      .then((data) => { 
        setMovies((prev) =>
          page === 1 ? data.results : [...prev, ...data.results]
      ); 
        setTotalPages(data.total_pages);
        setLoading(false); 
      })
      .catch((err) => {
        if (isCancel(err)) return;
        setError("Couldn't load movies. Try again later.");
        setLoading(false);
      });
    return () => controller.abort();
  }, [search, page]);

  return(
    <>
      <h1>Movie Explorer</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(query.trim());
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies..."
        />
        <button type="submit">Search</button><br></br>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && movies.length === 0 && search &&(
        <p>No results for "{search}"</p>
      )}

      {!loading && !error && movies.length > 0 &&(
        <div className="grid">
          {movies.map((m) => (
            <MovieCard key={m.id} movie={m} 
              onClick={() => setSelectedMovie(m)} />
          ))}
        </div>
      )}

            {!loading && !error && page < totalPages && (
        <button onClick={() => {
          setPage((prev) => prev +1);
          setLoading(true);
        }}>Load More</button>
      )}

      {selectedMovie && (
        <div className="modal-back" onClick={() => setSelectedMovie(null)}>
          <div className="movie-modal" role="dialog" aria-modal="true" 
            aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelectedMovie(null)}
                aria-label="close details">&times;</button>
                <h2 id="modal-title">{selectedMovie.title}</h2>
                <p>{selectedMovie.overview || "no overview available."}</p>
            </div>
        </div>
      )}


    </>
  )
}