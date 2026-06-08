// In-memory map: userId (string) → Set of SSE response objects
const clients = new Map();

export function addClient(userId, res) {
  const id = userId.toString();
  if (!clients.has(id)) clients.set(id, new Set());
  clients.get(id).add(res);
}

export function removeClient(userId, res) {
  const id = userId.toString();
  const set = clients.get(id);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) clients.delete(id);
}

export function pushToUser(userId, event, data) {
  const id = userId.toString();
  const set = clients.get(id);
  if (!set || set.size === 0) return;
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  set.forEach((res) => {
    try { res.write(payload); } catch { /* client disconnected */ }
  });
}
