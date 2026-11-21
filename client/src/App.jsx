import { useCallback, useEffect, useState } from "react";
import { api } from "./api.js";
import Movies from "./views/Movies.jsx";
import Rewatch from "./views/Rewatch.jsx";
import Booking from "./views/Booking.jsx";

const TABS = [
  { id: "movies", label: "Movies" },
  { id: "rewatch", label: "Rewatch plan" },
  { id: "booking", label: "Booking" },
];

export default function App() {
  const [tab, setTab] = useState("movies");
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loadError, setLoadError] = useState("");

  const reloadMovies = useCallback(async () => setMovies(await api.listMovies()), []);
  const reloadCinemas = useCallback(async () => setCinemas(await api.listCinemas()), []);

  useEffect(() => {
    Promise.all([reloadMovies(), reloadCinemas()]).catch((e) => setLoadError(e.message));
  }, [reloadMovies, reloadCinemas]);

  return (
    <div className="shell">
      <header className="masthead">
        <h1>Doomsday Ready</h1>
        <p>Catch up on the films you need, then book opening night together.</p>
      </header>

      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? "tab active" : "tab"} onClick={() => setTab(t.id)} aria-current={tab === t.id}>
            {t.label}
          </button>
        ))}
      </nav>

      {loadError && <p className="notice error" role="alert">Could not reach the API: {loadError}</p>}

      <main>
        {tab === "movies" && <Movies movies={movies} reload={reloadMovies} />}
        {tab === "rewatch" && <Rewatch movies={movies} reload={reloadMovies} />}
        {tab === "booking" && <Booking cinemas={cinemas} reload={reloadCinemas} />}
      </main>
    </div>
  );
}
