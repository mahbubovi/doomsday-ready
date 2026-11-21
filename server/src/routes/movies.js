import { Router } from "express";
import mongoose from "mongoose";
import Movie, { serializeMovie } from "../models/Movie.js";
import { HttpError, asyncHandler } from "../errors.js";
import { validateMovie } from "../validation.js";
import { wouldCreateCycle, rewatchOrder } from "../services/rewatch.js";

const router = Router();
const validId = (id) => mongoose.isValidObjectId(id);

async function loadGraph() {
  const all = await Movie.find({}, "prerequisites").lean();
  return new Map(all.map((m) => [String(m._id), m.prerequisites.map(String)]));
}

// Prerequisites may be given as ids or as exact titles (handy for seeding).
async function resolvePrerequisites(refs) {
  const ids = [];
  for (const ref of refs) {
    const movie = validId(ref)
      ? await Movie.findById(ref, "_id").lean()
      : await Movie.findOne({ title: ref }, "_id").lean();
    if (!movie) throw new HttpError(404, "PREREQUISITE_NOT_FOUND", `Prerequisite "${ref}" does not exist.`);
    ids.push(String(movie._id));
  }
  return [...new Set(ids)];
}

const circular = () =>
  new HttpError(409, "CIRCULAR_DEPENDENCY", "This change would make a movie depend on itself, directly or through other movies.");

async function createOne(body) {
  const data = validateMovie(body);
  const prerequisites = await resolvePrerequisites(data.prerequisites || []);
  // A brand-new movie cannot be anyone's prerequisite yet, so it cannot be part of a loop.
  try {
    const movie = await Movie.create({ ...data, prerequisites });
    return serializeMovie(movie);
  } catch (err) {
    if (err.code === 11000) throw new HttpError(409, "DUPLICATE", `A movie titled "${data.title}" already exists.`);
    throw err;
  }
}

// Accepts one movie or an array. Arrays are created in order, so later items
// may list earlier ones as prerequisites (by title or id). Stops at the first error.
router.post("/", asyncHandler(async (req, res) => {
  if (Array.isArray(req.body)) {
    const created = [];
    for (const [i, item] of req.body.entries()) {
      try {
        created.push(await createOne(item));
      } catch (err) {
        if (err instanceof HttpError) err.message = `Item ${i}: ${err.message}`;
        throw err;
      }
    }
    return res.status(201).json(created);
  }
  res.status(201).json(await createOne(req.body));
}));

router.get("/", asyncHandler(async (_req, res) => {
  const movies = await Movie.find().sort({ year: 1, title: 1 });
  res.json(movies.map(serializeMovie));
}));

router.patch("/:id", asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) throw new HttpError(404, "NOT_FOUND", "Movie not found.");
  const movie = await Movie.findById(req.params.id);
  if (!movie) throw new HttpError(404, "NOT_FOUND", "Movie not found.");

  const data = validateMovie(req.body, { partial: true });
  if (data.prerequisites) {
    const prerequisites = await resolvePrerequisites(data.prerequisites);
    // Check the NEW prerequisite set against the rest of the graph.
    if (wouldCreateCycle(String(movie._id), prerequisites, await loadGraph())) throw circular();
    data.prerequisites = prerequisites;
  }

  Object.assign(movie, data);
  try {
    await movie.save();
  } catch (err) {
    if (err.code === 11000) throw new HttpError(409, "DUPLICATE", `A movie titled "${data.title}" already exists.`);
    throw err;
  }
  res.json(serializeMovie(movie));
}));

router.get("/:id/rewatch-order", asyncHandler(async (req, res) => {
  if (!validId(req.params.id)) throw new HttpError(404, "NOT_FOUND", "Movie not found.");
  const target = await Movie.findById(req.params.id).lean();
  if (!target) throw new HttpError(404, "NOT_FOUND", "Movie not found.");

  const graph = await loadGraph();
  const orderIds = rewatchOrder(String(target._id), graph);
  const found = await Movie.find({ _id: { $in: orderIds } }).lean();
  const byId = new Map(found.map((m) => [String(m._id), m]));
  const order = orderIds.map((id) => {
    const m = byId.get(id);
    return { id, title: m.title, year: m.year, runtime: m.runtime, watched: m.watched };
  });

  res.json({
    target: { id: String(target._id), title: target.title },
    order,
    total: order.length,
    watchedCount: order.filter((m) => m.watched).length,
    remainingMinutes: order.filter((m) => !m.watched).reduce((sum, m) => sum + m.runtime, 0),
  });
}));

export default router;
