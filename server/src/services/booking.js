/**
 * Fewest bundles that add up to exactly `groupSize`, or null if impossible.
 * Classic minimum-coin-change DP (greedy gives wrong answers, e.g. 6/9/20 for 44).
 * Returns { totalBundles, bundles: [{ size, count }] } sorted by size descending.
 */
export function bookingQuote(bundleSizes, groupSize) {
  const sizes = [...new Set(bundleSizes)];
  const best = new Array(groupSize + 1).fill(Infinity); // best[g] = fewest bundles for g seats
  const last = new Array(groupSize + 1).fill(0); // last[g] = bundle size used to reach g
  best[0] = 0;
  for (let g = 1; g <= groupSize; g++) {
    for (const s of sizes) {
      if (s <= g && best[g - s] + 1 < best[g]) {
        best[g] = best[g - s] + 1;
        last[g] = s;
      }
    }
  }
  if (best[groupSize] === Infinity) return null;

  const counts = new Map();
  for (let g = groupSize; g > 0; g -= last[g]) {
    counts.set(last[g], (counts.get(last[g]) || 0) + 1);
  }
  return {
    totalBundles: best[groupSize],
    bundles: [...counts.entries()]
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => b.size - a.size),
  };
}
