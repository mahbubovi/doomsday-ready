import mongoose from "mongoose";

const cinemaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    bundleSizes: [{ type: Number, min: 1, max: 500 }],
  },
  { timestamps: true }
);

export const serializeCinema = (c) => ({
  id: String(c._id),
  name: c.name,
  bundleSizes: c.bundleSizes,
});

export default mongoose.model("Cinema", cinemaSchema);
