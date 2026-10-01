// The online frontend talks to a helper on the visitor's own computer.
// The standalone file preview retains browser-only storage. When server.py
// serves the frontend itself it supplies its own same-origin config.js.
export const config = Object.freeze({
  apiBase: typeof location === 'undefined' || location.protocol === 'file:'
    ? '' : 'http://127.0.0.1:8000',
  refreshMs: 60_000,
});
