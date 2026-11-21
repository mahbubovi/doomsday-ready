import { pathToFileURL } from "node:url";
import mongoose from "mongoose";
import Movie from "./models/Movie.js";
import Cinema from "./models/Cinema.js";
import { sampleMovies, sampleCinemas } from "./seedData.js";

export async function seed() {
  const byTitle = new Map();
  for (const m of sampleMovies) {
    const prerequisites = (m.prerequisites || []).map((t) => byTitle.get(t));
    const doc = await Movie.create({ ...m, prerequisites });
    byTitle.set(m.title, doc._id);
  }
  await Cinema.insertMany(sampleCinemas);
}

// `npm run seed` wipes both collections and reloads the sample data.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/doomsday-ready");
  await Movie.deleteMany({});
  await Cinema.deleteMany({});
  await seed();
  console.log("Seeded sample movies and cinemas.");
  await mongoose.disconnect();
}
