import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    year: { type: Number, required: true },
    runtime: { type: Number, required: true, min: 1, max: 300 },
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
    watched: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const serializeMovie = (m) => ({
  id: String(m._id),
  title: m.title,
  year: m.year,
  runtime: m.runtime,
  watched: m.watched,
  prerequisites: (m.prerequisites || []).map(String),
});

export default mongoose.model("Movie", movieSchema);
