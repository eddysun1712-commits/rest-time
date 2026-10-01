// Online use needs no server: the browser writes to a user-approved folder.
// server.py remains an optional integration path and supplies its own config.
export const config = Object.freeze({
  apiBase: '',
  refreshMs: 60_000,
});
