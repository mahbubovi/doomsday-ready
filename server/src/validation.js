import { HttpError } from "./errors.js";

const bad = (message) => new HttpError(400, "VALIDATION_ERROR", message);
const isInt = (v) => Number.isInteger(v);

export function validateMovie(body, { partial = false } = {}) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw bad("Body must be a JSON object.");
  }
  const out = {};
  const has = (k) => body[k] !== undefined;

  if (!partial || has("title")) {
    if (typeof body.title !== "string" || !body.title.trim() || body.title.trim().length > 200) {
      throw bad("title is required (1-200 characters).");
    }
    out.title = body.title.trim();
  }
  if (!partial || has("year")) {
    if (!isInt(body.year) || body.year < 1888 || body.year > 2100) {
      throw bad("year must be an integer between 1888 and 2100.");
    }
    out.year = body.year;
  }
  if (!partial || has("runtime")) {
    if (!isInt(body.runtime) || body.runtime < 1 || body.runtime > 300) {
      throw bad("runtime must be an integer between 1 and 300 minutes.");
    }
    out.runtime = body.runtime;
  }
  if (has("watched")) {
    if (typeof body.watched !== "boolean") throw bad("watched must be true or false.");
    out.watched = body.watched;
  }
  if (has("prerequisites")) {
    if (!Array.isArray(body.prerequisites) || body.prerequisites.some((p) => typeof p !== "string")) {
      throw bad("prerequisites must be an array of movie ids (or titles).");
    }
    out.prerequisites = body.prerequisites;
  }
  return out;
}

export function validateCinema(body) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw bad("Body must be a JSON object.");
  }
  if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 200) {
    throw bad("name is required (1-200 characters).");
  }
  if (!Array.isArray(body.bundleSizes) || body.bundleSizes.length === 0) {
    throw bad("bundleSizes must be a non-empty array of integers.");
  }
  if (body.bundleSizes.some((s) => !isInt(s) || s < 1 || s > 500)) {
    throw bad("Each bundle size must be an integer between 1 and 500.");
  }
  // Duplicate sizes are meaningless, so they are removed silently.
  const sizes = [...new Set(body.bundleSizes)].sort((a, b) => a - b);
  if (sizes.length > 10) throw bad("A cinema can have at most 10 different bundle sizes.");
  return { name: body.name.trim(), bundleSizes: sizes };
}

export function parseGroupSize(raw) {
  const n = Number(raw);
  if (raw === undefined || raw === "" || !isInt(n) || n < 1 || n > 10000) {
    throw bad("groupSize must be an integer between 1 and 10,000.");
  }
  return n;
}
