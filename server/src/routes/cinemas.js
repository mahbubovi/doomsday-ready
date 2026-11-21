import { Router } from "express";
import mongoose from "mongoose";
import Cinema, { serializeCinema } from "../models/Cinema.js";
import { HttpError, asyncHandler } from "../errors.js";
import { validateCinema, parseGroupSize } from "../validation.js";
import { bookingQuote } from "../services/booking.js";

const router = Router();

async function createOne(body) {
  const data = validateCinema(body);
  try {
    return serializeCinema(await Cinema.create(data));
  } catch (err) {
    if (err.code === 11000) throw new HttpError(409, "DUPLICATE", `A cinema named "${data.name}" already exists.`);
    throw err;
  }
}

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
  res.json((await Cinema.find().sort({ name: 1 })).map(serializeCinema));
}));

router.get("/:id/booking", asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, "NOT_FOUND", "Cinema not found.");
  const cinema = await Cinema.findById(req.params.id).lean();
  if (!cinema) throw new HttpError(404, "NOT_FOUND", "Cinema not found.");
  const groupSize = parseGroupSize(req.query.groupSize);

  const quote = bookingQuote(cinema.bundleSizes, groupSize);
  const base = { cinema: { id: String(cinema._id), name: cinema.name, bundleSizes: cinema.bundleSizes }, groupSize };
  if (!quote) {
    return res.json({ ...base, possible: false, message: `No combination of bundles adds up to exactly ${groupSize} seats.` });
  }
  res.json({ ...base, possible: true, ...quote });
}));

export default router;
