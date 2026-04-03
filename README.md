# 🚀 AI Ticket Triage Service

![Node.js](https://img.shields.io/badge/Node.js-18.x-green) ![Express.js](https://img.shields.io/badge/Express.js-4.x-blue) ![Anthropic API](https://img.shields.io/badge/Anthropic-Claude%203.5%20Sonnet-purple)

A production-grade AI-powered SaaS microservice solving a critical bottleneck: **support ticket triage**. This service dramatically reduces latency and human load by batch-classifying massive support queues deterministically utilizing anthropic AI. 

> *Capable of classifying 50 tickets at a fraction of the cost within 5,000ms.*

## 🌟 Features

- **Mass Bulk-Classification**: Routes huge arrays of tickets avoiding round-trip time penalties via unified batch requests.
- **Strict Data Contracts**: Generates predictable enums for priority (`High`, `Critical`), category (`Billing`, `Technical`), and deterministic routing.
- **Live Memory-Telemetry**: Features an integrated temporal performance-tracking subsystem for metrics caching.
- **Robust Fault Tolerance**: Hardened multi-pass LLM parsing engines combined with robust middleware guarding batch caps, structure, and fallback retries.

---

## 💻 Environment Setup

1. **Clone the repository:**
   \`\`\`bash
   git clone <repo-url>
   cd ai-triage-service
   \`\`\`

2. **Install dependencies:**
   Ensure you have Node installed, then run:
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure the Environment:**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Open `.env` and supply your **Anthropic API key**:
   \`\`\`env
   ANTHROPIC_API_KEY=your_key_here
   \`\`\`

---

## ⚡ Running the Microservice

> Launch the Express runtime with integrated error catching:

\`\`\`bash
npm start 
# or: node server.js
\`\`\`
*Server defaults sequentially to `PORT 3000`.*

---

## 🔬 Automated Generation

Want to trigger batch processing offline without initializing a listener? 

\`\`\`bash
node scripts/generate_results.js
\`\`\`

This locally fetches our curated `data/tickets.json`, fires it against the Anthropic servers, deposits output locally (`triage_results.json`), and feeds back latency and network telemetry tokens natively.

---

## 📚 API Reference Overview

| Endpoint | HTTP Method | Action |
| --- | --- | --- |
| `/triage` | `POST` | Batch classifies lists of raw ticket metadata. |
| `/triage/stats` | `GET` | Generates total performance telemetry from the 24 hour rolling window. |

### 1. `POST /triage`
**Body Constraints:** Maximum 100 ticket arrays. Requires strictly formed `id` strings and non-empty `description` fields.
**Sample cURL Call:**
\`\`\`bash
curl -X POST http://localhost:3000/triage \
  -H "Content-Type: application/json" \
  -d '[{ "id": "T051", "description": "My dashboard login locks out completely intermittently on load." }]'
\`\`\`

**Response:**
\`\`\`json
[
  {
    "id": "T051",
    "category": "Technical",
    "priority": "High",
    "assigned_team": "Engineering",
    "summary": "Intermittent remote lockouts disrupting load logic sequence."
  }
]
\`\`\`

---

### 2. `GET /triage/stats`
**Sample cURL Call:**
\`\`\`bash
curl -X GET http://localhost:3000/triage/stats
\`\`\`

**Response:**
\`\`\`json
{
  "totalTickets": 100,
  "totalBatches": 2,
  "averageProcessingTime": 5400.0,
  "estimatedCost": 0.047685,
  "categoryDistribution": {
    "counts": {
      "Technical": 45,
      "Account": 25,
      "Billing": 20,
      "Feature Request": 10
    },
    "percentages": {
      "Technical": "45.00%",
      "Account": "25.00%",
      "Billing": "20.00%",
      "Feature Request": "10.00%"
    }
  }
}
\`\`\`

---

> Crafted carefully as an industry-standard API model targeting production stability.
