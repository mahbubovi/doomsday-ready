import { useCallback, useEffect, useState } from "react";
import { api, formatMinutes } from "../api.js";

export default function Rewatch({ movies, reload }) {
  const [targetId, setTargetId] = useState("");
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async (id) => {
    if (!id) return setPlan(null);
    try {
      setError("");
      setPlan(await api.rewatchOrder(id));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { load(targetId); }, [targetId, load]);

  const toggle = async (movie) => {
    try {
      await api.updateMovie(movie.id, { watched: !movie.watched });
      await Promise.all([load(targetId), reload()]);
    } catch (err) {
      setError(err.message);
    }
  };

  const percent = plan && plan.total ? Math.round((plan.watchedCount / plan.total) * 100) : 0;

  return (
    <section className="panel">
      <h2>Rewatch plan</h2>
      <label className="field">Movie you want to be ready for
        <select value={targetId} onChange={(e) => setTargetId(e.target.value)}>
          <option value="">Choose a movie</option>
          {movies.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
      </label>

      {error && <p className="notice error" role="alert">{error}</p>}
      {!plan && !error && <p className="muted">Pick a movie to see what to watch before it.</p>}

      {plan && plan.total === 0 && <p className="notice">Nothing to catch up on. You can watch {plan.target.title} right away.</p>}

      {plan && plan.total > 0 && (
        <>
          <div className="progress-head">
            <strong>{plan.watchedCount} of {plan.total} watched</strong>
            <span>
              {plan.remainingMinutes === 0 ? "All caught up" : `${formatMinutes(plan.remainingMinutes)} left to watch`}
            </span>
          </div>
          <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={plan.total} aria-valuenow={plan.watchedCount}>
            <div className="fill" style={{ width: `${percent}%` }} />
          </div>

          <ol className="order">
            {plan.order.map((m) => (
              <li key={m.id} className={m.watched ? "watched" : ""}>
                <label className="check big">
                  <input type="checkbox" checked={m.watched} onChange={() => toggle(m)} />
                  <span className="title">{m.title}</span>
                </label>
                <span className="meta">{m.year} · {formatMinutes(m.runtime)}</span>
              </li>
            ))}
          </ol>
          <p className="muted">Then watch {plan.target.title}.</p>
        </>
      )}
    </section>
  );
}
