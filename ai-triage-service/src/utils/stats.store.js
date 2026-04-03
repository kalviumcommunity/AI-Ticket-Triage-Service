/**
 * In-memory data store using a plain JavaScript array to hold classification results.
 * @type {Array<Object>}
 */
const statsStore = [];

/**
 * Standard cost per input token in USD.
 * @constant {number}
 */
const INPUT_TOKEN_COST = 0.000003;

/**
 * Standard cost per output token in USD.
 * @constant {number}
 */
const OUTPUT_TOKEN_COST = 0.000015;

/**
 * Milliseconds in a 24-hour day.
 * @constant {number}
 */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Records a batch processing result into the in-memory store.
 * 
 * @param {Object} result - The result of the batch processing.
 * @param {number} result.timestamp - The timestamp of when the batch completed (Unix epoch ms).
 * @param {number} result.processingTime - Processing time in milliseconds.
 * @param {Object} result.tokenCounts - Token usage statistics.
 * @param {number} result.tokenCounts.input - Number of input tokens used.
 * @param {number} result.tokenCounts.output - Number of output tokens used.
 * @param {Object} result.categoryBreakdown - A map of category names to their respective counts from the batch.
 * @returns {void}
 */
export function recordBatch(result) {
  statsStore.push(result);
}

/**
 * Retrieves an aggregated summary of processing statistics over the last 24 hours.
 * 
 * @returns {Object} A statistics summary containing totals, averages, cost estimates, and category distribution.
 */
export function getStats() {
  const now = Date.now();
  const timeThreshold = now - ONE_DAY_MS;
  
  // Filter stats strictly to entries that occurred within the last 24 hours
  const recentStats = statsStore.filter(stat => stat.timestamp >= timeThreshold);
  
  let totalTickets = 0;
  let totalProcessingTime = 0;
  let estimatedCost = 0;
  const categoryCounts = {};
  
  // Iterate through all applicable records to accumulate totals
  for (const stat of recentStats) {
    totalProcessingTime += stat.processingTime;
    
    // Accumulate the cost using predefined token rates
    estimatedCost += (stat.tokenCounts.input * INPUT_TOKEN_COST) + 
                     (stat.tokenCounts.output * OUTPUT_TOKEN_COST);
    
    // Sum up tickets in each category
    for (const [category, count] of Object.entries(stat.categoryBreakdown)) {
      totalTickets += count;
      if (!categoryCounts[category]) {
        categoryCounts[category] = 0;
      }
      categoryCounts[category] += count;
    }
  }
  
  const totalBatches = recentStats.length;
  // Guard against division by zero if no batches exist
  const averageProcessingTime = totalBatches > 0 ? (totalProcessingTime / totalBatches) : 0;
  
  const categoryPercentages = {};
  // Compute percentage strings safely
  if (totalTickets > 0) {
    for (const [category, count] of Object.entries(categoryCounts)) {
      categoryPercentages[category] = ((count / totalTickets) * 100).toFixed(2) + '%';
    }
  }
  
  return {
    totalTickets,
    totalBatches,
    averageProcessingTime,
    estimatedCost,
    categoryDistribution: {
      counts: categoryCounts,
      percentages: categoryPercentages
    }
  };
}
