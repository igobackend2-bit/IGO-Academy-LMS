/**
 * Vercel serverless entry point — wraps the Express app from server/src/index.js.
 * On Vercel this file is invoked per-request instead of the app binding a port
 * (see the isServerless guard in server/src/index.js).
 * @module api/index
 */
module.exports = require('../server/src/index.js');
