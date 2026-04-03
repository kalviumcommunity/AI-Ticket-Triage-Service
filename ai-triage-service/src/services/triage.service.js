import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Ensure environment variables are loaded so the Anthropic client can auto-load the key
dotenv.config();

/**
 * System prompt definition outlining the boundaries and structure of classification.
 * We enforce JSON output without markdown wrapper and mandate explicit allowed field values.
 * @constant {string}
 */
const SYSTEM_PROMPT = `You are an AI ticket triage assistant. Your job is to classify batches of support tickets.
You must return the classification strictly as a JSON array of objects.
Do not wrap the output in markdown codeblocks like \`\`\`json. Return only raw JSON.

Each object in the array MUST contain exactly these fields:
- id: (matching the ticket ID)
- category: (Allowed values: Billing, Technical, Account, Feature Request, Other)
- priority: (Allowed values: Low, Medium, High, Critical)
- assigned_team: (Allowed values: Billing Team, Engineering, Customer Success, Product)
- summary: (A brief summary of the ticket, maximum 20 words)

Input format will be a list of tickets with their ID and description.
Deterministically classify the tickets based on the descriptions provided.`;

/**
 * Processes a batch of tickets using the Anthropic API to classify them.
 * 
 * @param {Array<Object>} tickets - The array of tickets to classify.
 * @param {string|number} tickets[].id - The unique identifier of the ticket.
 * @param {string} tickets[].description - The description/content of the ticket.
 * @returns {Promise<Object>} An object containing the processed classifications, processing time, and token counts.
 * @throws {Error} If the AI response cannot be parsed or the API call fails.
 */
export async function classifyBatch(tickets) {
  // Initialize the Anthropic client. It automatically picks up ANTHROPIC_API_KEY from the environment.
  const anthropic = new Anthropic();
  
  // Format the sequence of tickets to inject cleanly into the user prompt
  const formattedTickets = tickets
    .map(t => `ID: ${t.id}\nDescription: ${t.description}`)
    .join('\n\n---\n\n');
  
  const userPrompt = `Please classify the following tickets:\n\n${formattedTickets}`;
  
  const startTime = Date.now();
  
  // Create a structured API request with exactly specified constraints
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514', // Using the exact requested model version
    max_tokens: 1024,
    temperature: 0, // Deterministic output requirement
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  });
  
  const endTime = Date.now();
  const processingTime = endTime - startTime;
  
  // Isolate the text segment from the Anthropic response
  let responseText = response.content[0].text;
  
  // Robustly handle cases where the model disobeys instructions and uses markdown code fences
  if (responseText.startsWith('```')) {
    const lines = responseText.split('\n');
    // Strip the opening fence
    lines.shift();
    // Strip the closing fence if it's the last discrete line
    if (lines.length > 0 && lines[lines.length - 1].startsWith('```')) {
      lines.pop();
    }
    // Rejoin the remaining lines
    responseText = lines.join('\n').trim();
  }
  
  let classifications;
  try {
    // Attempt parsing. Will throw if response text is invalid JSON
    classifications = JSON.parse(responseText);
  } catch (error) {
    // Throw a descriptive semantic error, including the raw text context
    throw new Error(`Failed to parse AI response as JSON. Raw response: ${responseText}`);
  }
  
  return {
    classifications,
    processingTime,
    tokenCounts: {
      input: response.usage.input_tokens || 0,
      output: response.usage.output_tokens || 0
    }
  };
}
