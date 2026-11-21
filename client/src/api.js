const BASE = "/api";

async function request(path, options) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || "Request failed.");
    err.code = data.error;
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  listMovies: () => request("/movies"),
  createMovie: (body) => request("/movies", { method: "POST", body: JSON.stringify(body) }),
  updateMovie: (id, body) => request(`/movies/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  rewatchOrder: (id) => request(`/movies/${id}/rewatch-order`),
  listCinemas: () => request("/cinemas"),
  createCinema: (body) => request("/cinemas", { method: "POST", body: JSON.stringify(body) }),
  booking: (id, groupSize) => request(`/cinemas/${id}/booking?groupSize=${encodeURIComponent(groupSize)}`),
};

export const formatMinutes = (m) => {
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (!h) return `${min} min`;
  return min ? `${h} h ${min} min` : `${h} h`;
};
