# Cost Comparison

## Overview
This document breaks down the cost and speed efficiencies gained by classifying 50 support tickets via a single batched Anthropic Claude API prompt versus 50 individual API calls.

## Batch Approach
*Based on our `triage_results.json` generation run.*
- **Total Input Tokens**: 2,145
- **Total Output Tokens**: 2,750
- **Total Processing Time**: 5,400 ms

**Cost Calculation:**
- Input Cost: 2,145 * $0.000003 = $0.006435
- Output Cost: 2,750 * $0.000015 = $0.041250
- **Total Cost**: **$0.047685**

## Individual Call Approach
*Estimated alternative approach requiring 1 system prompt per ticket.*
- **Total Input Tokens**: 10,000 (200 system tokens * 50 calls) + 1,945 (descriptions) = 11,945
- **Total Output Tokens**: 60 tokens per ticket * 50 tickets = 3,000
- **Total Processing Time**: ~1,500 ms/call * 50 calls = 75,000 ms (if sequential)

**Cost Calculation:**
- Input Cost: 11,945 * $0.000003 = $0.035835
- Output Cost: 3,000 * $0.000015 = $0.045000
- **Total Cost**: **$0.080835**

## Comparison Table

| Approach             | Total Input Tokens | Total Output Tokens | Estimated Cost (USD) | Estimated Total Latency |
| -------------------- | ------------------ | ------------------- | -------------------- | ----------------------- |
| **Batch**            | 2,145              | 2,750               | $0.047685            | 5,400 ms                |
| **Individual Calls** | 11,945             | 3,000               | $0.080835            | 75,000 ms               |

## Conclusion
The Batch Approach is vastly superior for both latency and financial cost. Grouping tickets reduces the repetitive token overhead incurred by sending system prompts multiple times, nearly halving the cost, and drastically slashes end-to-end processing times by reducing 50 network calls into merely one.
