import { Router } from 'express';
import { classifyBatch } from '../services/triage.service.js';
import { recordBatch, getStats } from '../utils/stats.store.js';

// Create an isolated Express router specifically for triage operations
const router = Router();

/**
 * POST /
 * Processes an incoming payload of tickets and assigns categories and priorities using AI.
 * Captures metric statistics and logs them internally.
 */
router.post('/', async (req, res) => {
  const tickets = req.body;
  
  // Preliminary structural validation to ensure the input is exactly what we expect
  if (!Array.isArray(tickets)) {
    return res.status(400).json({ error: 'Invalid input: request body must be a JSON array.' });
  }
  
  // Guard against redundant/empty operations
  if (tickets.length === 0) {
    return res.status(400).json({ error: 'Invalid input: ticket array cannot be empty.' });
  }
  
  try {
    // Process the classification operation via the isolated service module
    const result = await classifyBatch(tickets);
    
    // Accumulate distribution metrics immediately after a successful response
    const categoryBreakdown = {};
    for (const item of result.classifications) {
      // Use fallback if the model hallucinates an invalid or missing property
      const category = item.category || 'Unknown';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = 0;
      }
      categoryBreakdown[category] += 1;
    }
    
    // Package stats specifically for the data store
    const batchStats = {
      timestamp: Date.now(),
      processingTime: result.processingTime,
      tokenCounts: result.tokenCounts,
      categoryBreakdown
    };
    
    // Asynchronously log the operation (no await needed since store is currently synchronous, but pattern holds)
    recordBatch(batchStats);
    
    // Safely emit the resulting JSON array
    return res.json(result.classifications);
  } catch (error) {
    // Blanket catch-all to prevent server crashing while giving feedback
    return res.status(500).json({ error: 'Failed during AI classification: ' + error.message });
  }
});

/**
 * GET /stats
 * Retrieves an aggregated summary of processing statistics over the last 24 hours.
 */
router.get('/stats', (req, res) => {
  try {
    const stats = getStats();
    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
});

export default router;
