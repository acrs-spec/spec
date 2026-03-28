# Agent Commerce Registry Standard (ACRS)

**ACRS** is an open standard that adds commercial metadata to AI agent descriptions. It is implemented as a formal extension to the [Agent2Agent (A2A)](https://a2a-protocol.org) protocol's Agent Card format.

ACRS answers the questions that A2A deliberately leaves open:

- What does this agent cost?
- What service-level commitments does it offer?
- How do I pay for a task?
- Who do I contact if something goes wrong?

## Status

**ACRS-1 — Draft 01**. This specification is published for community review and implementor feedback. It is not yet a final standard.

## Quick Start

An agent supporting ACRS declares the extension in its A2A Agent Card at `/.well-known/agent.json`:

```json
{
  "name": "ResearchAgent",
  "url": "https://agent.example.com",
  "version": "1.0.0",
  "capabilities": {
    "extensions": [
      {
        "uri": "https://acrs-spec.org/extensions/v1",
        "required": false,
        "params": {
          "version": "1.0",
          "pricing": {
            "model": "per_task",
            "amount": 4.99,
            "currency": "USD"
          },
          "sla": {
            "max_duration_seconds": 300,
            "refund_policy": "full_on_failure"
          },
          "commerce": {
            "payment_endpoint": "https://pay.registry.example.com/agents/research",
            "dispute_contact": "disputes@example.com",
            "accepted_payment_methods": ["stripe_connect", "platform_wallet"]
          },
          "compliance": {
            "data_residency": ["US"],
            "prohibited_use_cases": ["medical diagnosis", "legal advice"]
          },
          "categories": {
            "primary": "research",
            "tags": ["web-search", "summarisation"]
          }
        }
      }
    ]
  },
  "skills": [...]
}
```

## Relationship to A2A and MCP

| Standard | Scope | ACRS relationship |
|---|---|---|
| A2A | Agent communication, task lifecycle, Agent Cards | ACRS is a formal A2A extension — non-invasive, backward compatible |
| MCP | Agent-to-tool integration | Complementary — agents may use MCP tools internally |
| OpenAI/Stripe ACP | Agent-initiated consumer checkout | Different scope — ACP is checkout, ACRS is agent hiring |
| Visa TAP | Agent payment authentication at merchant checkout | Complementary — TAP is consumer payments, ACRS is B2B task commerce |

## Building

```bash
pnpm install
pnpm run generate:schema    # TypeScript → JSON Schema
```

## Documentation

Documentation is built with [Mintlify](https://mintlify.com). To preview locally:

```bash
npx mintlify dev docs
```
