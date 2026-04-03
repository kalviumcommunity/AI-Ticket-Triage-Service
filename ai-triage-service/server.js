import express from 'express';
import dotenv from 'dotenv';
import triageRoutes from './src/routes/triage.routes.js';

// Load environment variables from .env file
dotenv.config();

/**
 * Default port to run the server on.
 * @constant {number}
 */
const DEFAULT_PORT = 3000;

// Initialize the Express application
const app = express();
const PORT = process.env.PORT || DEFAULT_PORT;

// Middleware to parse incoming JSON payloads into JS objects
app.use(express.json());

/**
 * Middleware to force Content-Type to application/json for all responses.
 */
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Mount the triage router for requests targeting /triage
app.use('/triage', triageRoutes);

/**
 * Catch-all 404 handler for any route not matched by the triage router.
 */
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

/**
 * Global error-handling middleware.
 * Must be the last registered middleware.
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start the server and bind to the specified port
app.listen(PORT, () => {
  console.log(`AI Triage microservice is listening on port ${PORT}`);
});
