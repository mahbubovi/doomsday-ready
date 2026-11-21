import { useState } from "react";
import { api } from "../api.js";

function AddCinema({ reload }) {
  const [name, setName] = useState("");
  const [sizes, setSizes] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const bundleSizes = sizes.split(/[,\s]+/).filter(Boolean).map(Number);
    try {
      await api.createCinema({ name, bundleSizes });
      setName("");
      setSizes("");
      await reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="panel" onSubmit={submit}>
      <h2>Add a cinema</h2>
      <div className="row">
        <label className="field grow">Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="field grow">Bundle sizes (1–10 sizes, separated by commas)
          <input value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="6, 9, 20" required />
        </label>
      </div>
      {error && <p className="notice error" role="alert">{error}</p>}
      <button className="primary" type="submit">Add cinema</button>
    </form>
  );
}

export default function Booking({ cinemas, reload }) {
  const [cinemaId, setCinemaId] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    try {
      setResult(await api.booking(cinemaId, groupSize));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="stack">
      <form className="panel" onSubmit={submit}>
        <h2>Book opening night</h2>
        <div className="row">
          <label className="field grow">Cinema
            <select value={cinemaId} onChange={(e) => setCinemaId(e.target.value)} required>
              <option value="">Choose a cinema</option>
              {cinemas.map((c) => <option key={c.id} value={c.id}>{c.name} (bundles of {c.bundleSizes.join(", ")})</option>)}
            </select>
          </label>
          <label className="field">Group size
            <input type="number" min={1} max={10000} value={groupSize} onChange={(e) => setGroupSize(e.target.value)} required />
          </label>
        </div>
        <button className="primary" type="submit">Get quote</button>

        {error && <p className="notice error" role="alert">{error}</p>}

        {result && result.possible && (
          <div className="result" aria-live="polite">
            <p><strong>{result.totalBundles} {result.totalBundles === 1 ? "bundle" : "bundles"}</strong> for {result.groupSize} seats at {result.cinema.name}:</p>
            <ul>
              {result.bundles.map((b) => (
                <li key={b.size}>{b.count} × bundle of {b.size} <span className="muted">({b.count * b.size} seats)</span></li>
              ))}
            </ul>
          </div>
        )}
        {result && !result.possible && (
          <p className="notice error" aria-live="polite">Not possible. {result.message}</p>
        )}
      </form>

      <AddCinema reload={reload} />
    </div>
  );
}
