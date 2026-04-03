import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Ensure environment variables are loaded so the Anthropic client can auto-load the key
dotenv.config();

/**
 * Model Name to be used.
 * @constant {string}
 */
const MODEL_NAME = 'claude-sonnet-4-20250514';

/**
 * Max output tokens for generation.
 * @constant {number}
 */
const MAX_TOKENS = 4096;

/**
 * Temperature indicating deterministic output.
 * @constant {number}
 */
const TEMPERATURE = 0;

/**
 * Allowed Ticket Categories
 * @constant {string[]}
 */
const ALLOWED_CATEGORIES = ['Billing', 'Technical', 'Account', 'Feature Request', 'Other'];

/**
 * Allowed Ticket Priorities
 * @constant {string[]}
 */
const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

/**
 * Allowed Team Assignments
 * @constant {string[]}
 */
const ALLOWED_TEAMS = ['Billing Team', 'Engineering', 'Customer Success', 'Product'];

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
- category: (Allowed values: ${ALLOWED_CATEGORIES.join(', ')})
- priority: (Allowed values: ${ALLOWED_PRIORITIES.join(', ')})
- assigned_team: (Allowed values: ${ALLOWED_TEAMS.join(', ')})
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
  const anthropic = new Anthropic();
  
  const formattedTickets = tickets
    .map(t => `ID: ${t.id}\nDescription: ${t.description}`)
    .join('\n\n---\n\n');
  
  const userPrompt = `Please classify the following tickets:\n\n${formattedTickets}`;
  
  let attempts = 0;
  const maxAttempts = 2;
  
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let cumulativeProcessingTime = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    const startTime = Date.now();
    
    const response = await anthropic.messages.create({
      model: MODEL_NAME,
      max_tokens: MAX_TOKENS,
      temperature: TEMPERATURE,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: userPrompt }
      ]
    });
    
    cumulativeProcessingTime += (Date.now() - startTime);
    totalInputTokens += response.usage.input_tokens || 0;
    totalOutputTokens += response.usage.output_tokens || 0;
    
    let responseText = response.content[0].text;
    
    if (responseText.startsWith('```')) {
      const lines = responseText.split('\n');
      lines.shift();
      if (lines.length > 0 && lines[lines.length - 1].startsWith('```')) {
        lines.pop();
      }
      responseText = lines.join('\n').trim();
    }
    
    try {
      const classifications = JSON.parse(responseText);
      return {
        classifications,
        processingTime: cumulativeProcessingTime,
        tokenCounts: {
          input: totalInputTokens,
          output: totalOutputTokens
        }
      };
    } catch (error) {
      console.warn(`[Warning] Failed to parse LLM response on attempt ${attempts}. Raw response: ${responseText}`);
      if (attempts >= maxAttempts) {
        console.error(responseText);
        throw new Error('LLM response could not be parsed after retry. Raw response logged above.');
      }
    }
  }
}
