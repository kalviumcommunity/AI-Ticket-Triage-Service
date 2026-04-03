# AI Ticket Triage Service

A production-grade AI-powered ticket triage microservice that utilizes the Anthropic Claude API to bulk classify support tickets deterministically. This service reduces latency and cost at scale by performing simultaneous processing and tracking exact token metrics and timing.

## Setup

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

3. **Configure Environment:**
   Copy the example environment variables file and fill in your details:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Open `.env` and add your **Anthropic API key**:
   \`\`\`
   ANTHROPIC_API_KEY=your_key_here
   \`\`\`

---

## Running the server

To launch the Express microservice, run:

\`\`\`bash
node server.js
\`\`\`

This will start the service running on port 3000 (or the port defined in your `.env` file).

---

## Generating results

We have provided a standalone script to automatically classify a batch of 50 sample tickets natively. You do not need to have the server running to run this script. Run:

\`\`\`bash
node scripts/generate_results.js
\`\`\`

This will:
- Read `data/tickets.json`
- Classify all 50 tickets using the Anthropic API
- Save the resulting JSON structure into `triage_results.json`
- Log processing statistics directly into your console

---

## API Reference

| Endpoint | HTTP Method | Description |
| -------- | ----------- | ----------- |
| `/triage` | `POST` | Processes an array of ticket objects (id, description) and returns their classifications. |
| `/triage/stats` | `GET` | Retrieves aggregate metrics regarding classification workloads performed over the last 24 hours. |

### 1. POST `/triage`

**Sample cURL Command:**
\`\`\`bash
curl -X POST http://localhost:3000/triage \
  -H "Content-Type: application/json" \
  -d '[{ "id": "T051", "description": "My account continues to get locked out after two failed attempts." }]'
\`\`\`

**Sample JSON Response (`200 OK`):**
\`\`\`json
[
  {
    "id": "T051",
    "category": "Account",
    "priority": "High",
    "assigned_team": "Customer Success",
    "summary": "User account repeatedly locking out after few failed login attempts."
  }
]
\`\`\`

### 2. GET `/triage/stats`

**Sample cURL Command:**
\`\`\`bash
curl -X GET http://localhost:3000/triage/stats
\`\`\`

**Sample JSON Response (`200 OK`):**
\`\`\`json
{
  "totalTickets": 100,
  "totalBatches": 2,
  "averageProcessingTime": 5040.5,
  "estimatedCost": 0.052,
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
