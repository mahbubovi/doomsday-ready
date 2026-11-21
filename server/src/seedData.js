// Sample data from the challenge brief (not an official watch guide).
export const sampleMovies = [
  { title: "Iron Man", year: 2008, runtime: 126 },
  { title: "Captain America: The First Avenger", year: 2011, runtime: 124 },
  { title: "The Avengers", year: 2012, runtime: 143, prerequisites: ["Iron Man", "Captain America: The First Avenger"] },
  { title: "Captain America: Civil War", year: 2016, runtime: 147, prerequisites: ["The Avengers"] },
  { title: "Thor: Ragnarok", year: 2017, runtime: 130 },
  { title: "Avengers: Infinity War", year: 2018, runtime: 149, prerequisites: ["Captain America: Civil War", "Thor: Ragnarok"] },
  { title: "Avengers: Endgame", year: 2019, runtime: 181, prerequisites: ["Avengers: Infinity War"] },
  { title: "Avengers: Doomsday", year: 2026, runtime: 150, prerequisites: ["Avengers: Endgame"] },
];

export const sampleCinemas = [
  { name: "Starlight Multiplex", bundleSizes: [1, 3, 4] },
  { name: "Grand Orion", bundleSizes: [2, 5] },
  { name: "Metro Cineplex", bundleSizes: [6, 9, 20] },
  { name: "Paradise Screens", bundleSizes: [4, 6] },
];
