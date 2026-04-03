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

// Mount the triage router for requests targeting /triage
app.use('/triage', triageRoutes);

/**
 * Handle requests to unimplemented routes.
 */
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

/**
 * Centralized error handling middleware.
 * Catches any unhandled errors from route handlers.
 */
app.use((err, req, res, next) => {
  // We log the error here for system visibility while suppressing stack traces in responses
  console.error('[Unhandled Error]', err.message);
  res.status(500).json({ error: 'An internal server error occurred.' });
});

// Start the server and bind to the specified port
app.listen(PORT, () => {
  console.log(`AI Triage microservice is listening on port ${PORT}`);
});
