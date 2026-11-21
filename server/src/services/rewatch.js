// Pure functions: no Express or Mongoose in here, so they are easy to unit test.
// graph: Map<id, string[]>  (each movie id -> ids of its prerequisites)

/**
 * Would giving `movieId` the prerequisites `newPrereqs` create a loop?
 * It does if `movieId` can be reached by walking prerequisite links
 * starting from any of the proposed prerequisites (this also covers a
 * movie depending on itself directly).
 */
export function wouldCreateCycle(movieId, newPrereqs, graph) {
  const seen = new Set();
  const stack = [...newPrereqs];
  while (stack.length) {
    const cur = stack.pop();
    if (cur === movieId) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const p of graph.get(cur) || []) stack.push(p);
  }
  return false;
}

/**
 * Every movie needed before `targetId`, each once, ordered so each movie
 * comes after its own prerequisites. The target is not included.
 * Iterative DFS post-order, so a very long chain cannot overflow the call stack.
 */
export function rewatchOrder(targetId, graph) {
  const visited = new Set([targetId]);
  const order = [];
  const stack = [{ id: targetId, next: 0 }];
  while (stack.length) {
    const top = stack[stack.length - 1];
    const prereqs = graph.get(top.id) || [];
    if (top.next < prereqs.length) {
      const p = prereqs[top.next++];
      if (!visited.has(p)) {
        visited.add(p);
        stack.push({ id: p, next: 0 });
      }
    } else {
      order.push(top.id); // all of its prerequisites are already in `order`
      stack.pop();
    }
  }
  order.pop(); // the last item pushed is the target itself
  return order;
}
