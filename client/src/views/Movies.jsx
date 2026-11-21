import { useState } from "react";
import { api, formatMinutes } from "../api.js";

function PrereqPicker({ movies, selected, onChange, exclude }) {
  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const options = movies.filter((m) => m.id !== exclude);
  if (!options.length) return <p className="muted">No other movies yet.</p>;
  return (
    <div className="checks">
      {options.map((m) => (
        <label key={m.id} className="check">
          <input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggle(m.id)} />
          {m.title}
        </label>
      ))}
    </div>
  );
}

function AddMovie({ movies, reload }) {
  const [form, setForm] = useState({ title: "", year: "", runtime: "" });
  const [prereqs, setPrereqs] = useState([]);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.createMovie({
        title: form.title,
        year: Number(form.year),
        runtime: Number(form.runtime),
        prerequisites: prereqs,
      });
      setForm({ title: "", year: "", runtime: "" });
      setPrereqs([]);
      await reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h2>Add a movie</h2>
      <div className="row">
        <label className="field grow">Title
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} />
        </label>
        <label className="field">Release year
          <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required min={1888} max={2100} />
        </label>
        <label className="field">Runtime (min)
          <input type="number" value={form.runtime} onChange={(e) => setForm({ ...form, runtime: e.target.value })} required min={1} max={300} />
        </label>
      </div>
      <fieldset>
        <legend>Watch these first (optional)</legend>
        <PrereqPicker movies={movies} selected={prereqs} onChange={setPrereqs} />
      </fieldset>
      {error && <p className="notice error" role="alert">{error}</p>}
      <button className="primary" type="submit">Add movie</button>
    </form>
  );
}

function MovieRow({ movie, movies, reload }) {
  const [editing, setEditing] = useState(false);
  const [prereqs, setPrereqs] = useState(movie.prerequisites);
  const [error, setError] = useState("");
  const titleOf = (id) => movies.find((m) => m.id === id)?.title ?? "Unknown";

  const toggleWatched = async () => {
    setError("");
    try {
      await api.updateMovie(movie.id, { watched: !movie.watched });
      await reload();
    } catch (err) {
      setError(err.message);
    }
  };

  const savePrereqs = async () => {
    setError("");
    try {
      await api.updateMovie(movie.id, { prerequisites: prereqs });
      setEditing(false);
      await reload();
    } catch (err) {
      setError(err.code === "CIRCULAR_DEPENDENCY" ? `Circular dependency: ${err.message}` : err.message);
    }
  };

  const startEdit = () => {
    setPrereqs(movie.prerequisites);
    setError("");
    setEditing(true);
  };

  return (
    <li className={movie.watched ? "movie watched" : "movie"}>
      <label className="check big">
        <input type="checkbox" checked={movie.watched} onChange={toggleWatched} aria-label={`Mark ${movie.title} as watched`} />
        <span className="title">{movie.title}</span>
      </label>
      <span className="meta">{movie.year} · {formatMinutes(movie.runtime)}</span>
      <p className="prereq-line">
        {movie.prerequisites.length
          ? <>Watch first: {movie.prerequisites.map(titleOf).join(", ")}</>
          : <span className="muted">No prerequisites</span>}
      </p>
      {!editing && <button className="link" onClick={startEdit}>Edit prerequisites</button>}
      {editing && (
        <div className="editor">
          <PrereqPicker movies={movies} selected={prereqs} onChange={setPrereqs} exclude={movie.id} />
          <div className="row">
            <button className="primary" onClick={savePrereqs}>Save prerequisites</button>
            <button onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
      {error && <p className="notice error" role="alert">{error}</p>}
    </li>
  );
}

export default function Movies({ movies, reload }) {
  return (
    <div className="stack">
      <AddMovie movies={movies} reload={reload} />
      <section className="panel">
        <h2>Your movies</h2>
        {movies.length === 0 ? (
          <p className="muted">No movies yet. Add the first one above.</p>
        ) : (
          <ul className="movie-list">
            {movies.map((m) => <MovieRow key={m.id} movie={m} movies={movies} reload={reload} />)}
          </ul>
        )}
      </section>
    </div>
  );
}
