import express from "express";
import cors from "cors";
import movies from "./routes/movies.js";
import cinemas from "./routes/cinemas.js";
import { HttpError } from "./errors.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/movies", movies);
app.use("/api/cinemas", cinemas);

app.use((_req, _res, next) => next(new HttpError(404, "NOT_FOUND", "Route not found.")));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.code, message: err.message });
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "VALIDATION_ERROR", message: "Invalid JSON body." });
  console.error(err);
  res.status(500).json({ error: "INTERNAL_ERROR", message: "Something went wrong." });
});

export default app;
