import mongoose from "mongoose";
import app from "./app.js";
import Movie from "./models/Movie.js";
import Cinema from "./models/Cinema.js";
import { seed } from "./seed.js";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/doomsday-ready";

await mongoose.connect(MONGO_URI);
await Movie.init(); // make sure the unique indexes exist before serving requests
await Cinema.init();

if (process.env.SEED_ON_EMPTY === "true" && (await Movie.countDocuments()) === 0) {
  await seed();
  console.log("Database was empty: loaded sample data.");
}

app.listen(PORT, () => console.log(`API listening on :${PORT}`));
