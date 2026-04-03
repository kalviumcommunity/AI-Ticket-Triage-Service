import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { classifyBatch } from '../src/services/triage.service.js';

// Setting up directory paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  try {
    // 1. Resolve paths
    const ticketsPath = path.join(__dirname, '..', 'data', 'tickets.json');
    const outputPath = path.join(__dirname, '..', 'triage_results.json');
    
    // 2. Read and parse the 50 sample tickets
    const ticketsRaw = fs.readFileSync(ticketsPath, 'utf8');
    const tickets = JSON.parse(ticketsRaw);

    console.log(`Starting batch classification for ${tickets.length} tickets using Anthropic API...`);
    
    // 3. Process tickets through the service layer
    const result = await classifyBatch(tickets);
    
    // 4. Save the results back to the project root with 2-space indentation
    fs.writeFileSync(outputPath, JSON.stringify(result.classifications, null, 2), 'utf8');
    
    // 5. Output required telemetry to console
    console.log('✅ Successfully wrote output to triage_results.json');
    console.log(`Total processing time: ${result.processingTime}ms`);
    console.log(`Input tokens used: ${result.tokenCounts.input}`);
    console.log(`Output tokens used: ${result.tokenCounts.output}`);
    
  } catch (error) {
    console.error('Failed to generate results:', error.message);
    process.exit(1);
  }
}

// Execute the standalone script
run();
