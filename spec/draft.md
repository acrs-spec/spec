# Agent Commerce Registry Standard (ACRS)

**Version:** 1.0 — Draft 01
**Date:** 2026-03-28
**URI:** `https://acrs-spec.org/extensions/v1`

---

## 1. Abstract

The Agent Commerce Registry Standard (ACRS) defines a formal extension to the Agent2Agent (A2A) Agent Card format that adds structured commercial metadata to AI agent descriptions.

While A2A standardises agent identity, capability declaration, and communication protocols, no existing open standard addresses the commercial layer: how agents declare pricing, service-level commitments, payment endpoints, and compliance posture in a machine-readable, interoperable format.

ACRS fills this gap. It is implemented as a formal A2A extension declared in the `capabilities.extensions` array of an A2A Agent Card. Registries, orchestrators, and client applications that understand ACRS can use this data to:

- Automatically discover commercial agents and their pricing
- Filter and route tasks to agents that meet budget and SLA requirements
- Process payments programmatically via declared payment endpoints
- Resolve disputes with a defined contact and compliance trail

ACRS is a **data-only extension** — it adds commercial metadata to Agent Cards and does not modify A2A request/response flows, task lifecycle, or communication protocols.

Trust tier assignment and reliability scoring are **explicitly out of scope** for this standard. These are marketplace and registry features that depend on observed task outcomes, and are therefore implementation-specific rather than declarative.

---

## 2. Introduction and Motivation

### 2.1 The Commercial Layer Gap

The agentic AI ecosystem has standardised two foundational layers:

- **MCP (Model Context Protocol)** — how agents access external tools, APIs, and data sources
- **A2A (Agent2Agent)** — how agents communicate, delegate tasks, and coordinate workflows

Neither standard addresses the commercial layer. When a human operator or an orchestrating agent wants to hire a third-party agent to complete a task, the following questions have no standardised answers:

- What does this agent charge, and how is pricing structured?
- What service-level commitments does the agent offer?
- How are disputes handled if the agent fails to deliver?
- What payment endpoint processes payment, and in what currency?
- Is this agent compliant with relevant data protection regulations?

The absence of this information forces every marketplace, orchestrator, and enterprise platform to invent its own proprietary commercial metadata format. This fragmentation creates incompatibility, lock-in, and unnecessary integration work.

### 2.2 The ACRS Approach

ACRS takes a deliberate non-invasive approach: it adds commercial metadata as a formal A2A extension. An agent that wishes to participate in commercial ecosystems declares the ACRS extension in its Agent Card's `capabilities.extensions` array. An agent that does not is entirely unaffected — full A2A interoperability is preserved.

The extension URI is `https://acrs-spec.org/extensions/v1`. This URI is stable, resolvable, and points to this specification.

### 2.3 Scope

ACRS covers:
- Pricing declaration (model, amount, currency, free tier)
- Service level commitments (duration, uptime, refund policy)
- Payment and dispute infrastructure (endpoints, accepted methods)
- Compliance declarations (data residency, certifications, prohibited use cases)
- Capability taxonomy (categories, tags for routing and discovery)

ACRS explicitly does **not** cover:
- Agent communication or task lifecycle (A2A)
- Agent-to-tool integration (MCP)
- Trust tier assignment or reliability scoring (marketplace/registry features)
- Consumer checkout flows (OpenAI/Stripe ACP)
- Agent-to-merchant payment authentication (Visa TAP)

### 2.4 Relationship to Competing Standards

ACRS is complementary to, not competing with, the following:

**OpenAI/Stripe Agentic Commerce Protocol (ACP):** ACP addresses agent-initiated consumer checkout — an AI agent buying physical or digital goods on behalf of a human shopper. ACRS addresses B2B agent hiring — an orchestrator hiring an AI agent to perform professional work. Different transaction type, different counterparty, different payment model.

**Visa Trusted Agent Protocol (TAP):** TAP authenticates agents at merchant checkout within the Visa card network. An agent hired via ACRS to do shopping might use TAP internally to complete the purchase. Complementary, non-overlapping.

---

## 3. Terminology

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

| Term | Definition |
|------|-----------|
| **Agent Card** | A JSON document conforming to the A2A specification that describes an AI agent's identity, capabilities, and communication endpoints. Served at `/.well-known/agent.json`. |
| **Publisher** | The entity that operates an AI agent and declares its commercial metadata via ACRS. The publisher is responsible for the accuracy of all declared fields. |
| **Registry** | A platform that indexes, stores, and serves Agent Cards for discovery. A registry MAY add computed metadata (e.g. reliability scores) but MUST NOT modify publisher-declared ACRS fields. |
| **Orchestrator** | An agent, platform, or automated system that discovers and hires other agents to perform tasks. The orchestrator is the primary consumer of ACRS metadata. |
| **Client** | Any system that reads and interprets an A2A Agent Card. This includes orchestrators, registries, marketplaces, and developer tools. |
| **Task** | A discrete unit of work delegated to an agent, as defined by the A2A task lifecycle. ACRS pricing and SLA declarations apply at the task level. |
| **Extension** | An A2A mechanism for adding optional metadata to an Agent Card via the `capabilities.extensions` array. Each extension is identified by a URI. |

---

## 4. Conformance

### 4.1 ACRS-Conformant Publisher

A publisher is ACRS-conformant if its Agent Card includes an extension entry in `capabilities.extensions` that satisfies all of the following:

1. The `uri` field MUST be `https://acrs-spec.org/extensions/v1`
2. The `required` field SHOULD be `false` but MAY be `true` if the publisher requires clients to understand its commercial terms
3. The `params` object MUST include a `version` field set to `"1.0"`
4. The `params` object SHOULD include `pricing`, `sla`, and `categories`
5. The `params` object SHOULD include `commerce` if the agent accepts programmatic payment
6. All fields in `params` MUST conform to the ACRS JSON Schema

### 4.2 ACRS-Aware Client

A client is ACRS-aware if it:

1. Recognises the extension URI `https://acrs-spec.org/extensions/v1`
2. Parses the `params` object according to this specification
3. MUST ignore unknown fields within the `params` object without error
4. MUST NOT reject an Agent Card solely because it lacks the ACRS extension
5. SHOULD validate `params` against the ACRS JSON Schema before acting on the data

### 4.3 Partial Implementation

A client MAY support a subset of ACRS sections (e.g. only `pricing` and `categories`). Such a client MUST still ignore unsupported sections without error.

---

## 5. A2A Agent Card Context

### 5.1 Agent Card Structure

An A2A Agent Card is a JSON document served at `/.well-known/agent.json` that describes an AI agent. The top-level structure includes:

```json
{
  "name": "AgentName",
  "description": "What the agent does",
  "url": "https://agent.example.com",
  "version": "1.0.0",
  "provider": { "organization": "...", "url": "..." },
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "extensions": [ ... ]
  },
  "authentication": { "schemes": ["Bearer"] },
  "skills": [ ... ]
}
```

### 5.2 The Extensions Mechanism

The `capabilities.extensions` array allows Agent Cards to carry additional metadata beyond the core A2A specification. Each entry has:

| Field | Type | Description |
|-------|------|-------------|
| `uri` | string | A stable URI identifying the extension specification |
| `required` | boolean | Whether clients MUST understand this extension to interact with the agent |
| `params` | object | Extension-specific data |

ACRS uses this mechanism to attach commercial metadata. When `required` is `false`, clients that do not understand ACRS continue to work with the agent normally. When `required` is `true`, the publisher is signalling that clients must understand the commercial terms before interacting.

### 5.3 How ACRS Fits

ACRS occupies exactly one entry in the `capabilities.extensions` array. It does not modify any other part of the Agent Card. An agent MAY declare multiple extensions — ACRS coexists with any other extension.

---

## 6. The ACRS Extension Object

### 6.1 Extension Declaration

```json
{
  "uri": "https://acrs-spec.org/extensions/v1",
  "required": false,
  "params": {
    "version": "1.0",
    "pricing": { ... },
    "sla": { ... },
    "commerce": { ... },
    "compliance": { ... },
    "categories": { ... }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uri` | string | REQUIRED | MUST be `https://acrs-spec.org/extensions/v1` |
| `required` | boolean | REQUIRED | SHOULD be `false`. MAY be `true` if the publisher requires clients to understand commercial terms. |
| `params` | object | REQUIRED | The ACRS extension object. See Section 6.2. |

**Note:** `required` SHOULD be `false` for maximum interoperability — clients that do not understand ACRS will ignore the extension and interact normally. Publishers MAY set `required` to `true` to signal that understanding commercial terms is a prerequisite for interaction (e.g. when payment is mandatory before task execution).

### 6.2 The params Object

| Sub-object | Required | Description |
|------------|----------|-------------|
| `version` | REQUIRED | ACRS spec version. MUST be `"1.0"` for this revision. |
| `pricing` | RECOMMENDED | Commercial pricing declaration |
| `sla` | RECOMMENDED | Service level commitments |
| `commerce` | RECOMMENDED | Payment and dispute infrastructure |
| `compliance` | OPTIONAL | Regulatory and data handling declarations |
| `categories` | RECOMMENDED | Capability taxonomy for routing and discovery |

### 6.3 pricing

Declares how the agent charges for task execution.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model` | string (enum) | RECOMMENDED | One of: `per_task`, `per_token`, `per_minute`, `per_output_unit`, `subscription`, `outcome_based`, `free`, `negotiated` |
| `amount` | number | RECOMMENDED | Base price in declared currency. For `per_token`: price per 1,000 tokens. |
| `currency` | string | RECOMMENDED | ISO 4217 currency code. Default: `USD` |
| `minimum` | number | OPTIONAL | Minimum charge per invocation |
| `maximum` | number | OPTIONAL | Maximum charge per invocation (cap) |
| `free_tier` | object | OPTIONAL | `{ quantity, unit, period }` — describes a free allowance |
| `enterprise_contact` | string | OPTIONAL | Contact for volume pricing |

#### Pricing model values

- `per_task` — fixed price per discrete task invocation
- `per_token` — price per token processed
- `per_minute` — price per wall-clock minute of execution
- `per_output_unit` — price per unit of output (page, row, image)
- `subscription` — flat periodic fee
- `outcome_based` — contingent on verified success; requires `commerce.outcome_verification_url`
- `free` — no charge; MAY still require authentication
- `negotiated` — out-of-band; `enterprise_contact` SHOULD be provided

### 6.4 sla

Service Level Agreement declarations. All fields are publisher-declared.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `max_duration_seconds` | integer | OPTIONAL | Maximum time to complete a standard task |
| `p99_duration_seconds` | integer | OPTIONAL | 99th percentile task duration (publisher-declared) |
| `uptime_guarantee` | number | OPTIONAL | Decimal in [0.0, 1.0]. E.g. `0.999` = 99.9% |
| `refund_policy` | string (enum) | RECOMMENDED | One of: `none`, `full_on_failure`, `partial_on_failure`, `pro_rata`, `at_publisher_discretion` |
| `support_response_hours` | number | OPTIONAL | Maximum hours to first support response |
| `data_retention_days` | integer | OPTIONAL | Days task data is retained. `0` = no retention |

### 6.5 commerce

Payment and dispute infrastructure. Enables programmatic payment and dispute flows.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `payment_endpoint` | string (URI) | RECOMMENDED | HTTPS URI for payment initiation requests |
| `dispute_contact` | string | RECOMMENDED | `mailto:` or HTTPS URI for dispute submission |
| `escrow_supported` | boolean | OPTIONAL | Publisher supports escrow-held payment |
| `outcome_verification_url` | string (URI) | CONDITIONAL | Required when `pricing.model = outcome_based` |
| `invoice_contact` | string | OPTIONAL | Contact for enterprise invoicing |
| `accepted_payment_methods` | array | OPTIONAL | Values: `stripe_connect`, `stripe_spt`, `wire`, `crypto_usdc`, `invoice`, `platform_wallet` |

### 6.6 compliance

Regulatory and data handling declarations. All fields are publisher-declared.

| Field | Type | Description |
|-------|------|-------------|
| `data_residency` | array of strings | ISO 3166-1 alpha-2 country codes where task data is processed |
| `certifications` | array of strings | Values: `soc2_type1`, `soc2_type2`, `iso_27001`, `hipaa`, `pci_dss`, `gdpr_dpa`, `other` |
| `prohibited_use_cases` | array of strings | Use cases the publisher explicitly does not support |
| `audit_log_available` | boolean | Publisher will provide task audit log on request |
| `audit_webhook` | string (URI) | HTTPS URI receiving task audit events |

### 6.7 categories

Taxonomy classification for routing and discovery.

| Field | Type | Description |
|-------|------|-------------|
| `primary` | string (enum) | Primary capability category |
| `secondary` | array of strings | Additional categories |
| `tags` | array of strings | Free-text tags. Lowercase, hyphen-separated. |

#### Primary category values

`research`, `writing`, `data`, `code`, `scheduling`, `finance`, `legal`, `hr`, `communication`, `media`, `operations`, `customer_service`, `orchestrator`, `other`

### 6.8 Out of Scope: Trust and Reliability

Trust tier assignment and reliability scoring are **not part of this standard**.

These are features of marketplace and registry implementations, not declarative metadata that publishers can self-report. A publisher cannot claim their own trustworthiness — that must be observed and computed by a third party (a registry, a marketplace, an orchestrator) based on actual task outcomes.

Implementations building registries SHOULD compute reliability metrics from observed task outcomes and expose them via their own APIs. They SHOULD NOT expose these metrics as ACRS fields, as doing so would conflate self-declared metadata with computed reputation.

---

## 7. Security Considerations

### 7.1 Transport Security

All URIs declared in ACRS fields (`payment_endpoint`, `outcome_verification_url`, `audit_webhook`) MUST use HTTPS. Clients SHOULD reject ACRS params containing plain HTTP URIs in these fields.

### 7.2 Self-Declaration and Trust

All ACRS fields are **publisher-declared**. A publisher claims its own pricing, SLA, compliance certifications, and data residency. Clients and registries MUST NOT treat these declarations as independently verified unless they have performed their own audit.

This is by design. ACRS provides the vocabulary for commercial metadata — it does not provide a trust framework. Trust and verification are the responsibility of registries, marketplaces, and orchestrators that consume ACRS data.

### 7.3 Personally Identifiable Information

The following fields MAY contain email addresses or other PII:

- `commerce.dispute_contact`
- `commerce.invoice_contact`
- `pricing.enterprise_contact`

Publishers SHOULD use role-based addresses (e.g. `disputes@example.com`) rather than personal email addresses. Registries and clients that index or cache Agent Cards SHOULD handle these fields in accordance with applicable data protection regulations.

### 7.4 Payment Endpoint Security

The `commerce.payment_endpoint` field declares where payment initiation requests are sent. ACRS does not define a payment protocol — the endpoint's authentication, request format, and response format are outside the scope of this specification.

Implementations SHOULD:
- Require authentication on payment endpoints
- Validate that the payment endpoint domain matches or is authorised by the Agent Card's `url` domain
- Not send payment requests to endpoints discovered in unverified Agent Cards

### 7.5 Schema Validation

Registries and clients SHOULD validate ACRS `params` against the published JSON Schema before indexing or acting on the data. Invalid params SHOULD be rejected or flagged rather than silently accepted.

---

## 8. Complete Example

A complete, valid A2A Agent Card with a full ACRS extension.

This represents a research agent published at `https://researchagent.example.com/.well-known/agent.json`:

```json
{
  "name": "ResearchAgent",
  "description": "Deep web research with structured output. Searches 50+ sources, synthesises findings, and returns a structured JSON or Markdown report.",
  "url": "https://researchagent.example.com",
  "version": "2.1.0",
  "provider": {
    "organization": "ResearchAgent Corp",
    "url": "https://researchagent.example.com"
  },
  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "extensions": [
      {
        "uri": "https://acrs-spec.org/extensions/v1",
        "required": false,
        "params": {
          "version": "1.0",
          "pricing": {
            "model": "per_task",
            "amount": 4.99,
            "currency": "USD",
            "minimum": 4.99,
            "free_tier": {
              "quantity": 3,
              "unit": "tasks",
              "period": "monthly"
            },
            "enterprise_contact": "enterprise@researchagent.example.com"
          },
          "sla": {
            "max_duration_seconds": 300,
            "p99_duration_seconds": 90,
            "uptime_guarantee": 0.995,
            "refund_policy": "full_on_failure",
            "support_response_hours": 4,
            "data_retention_days": 30
          },
          "commerce": {
            "payment_endpoint": "https://pay.registry.agentcommerce.io/agents/research-agent",
            "dispute_contact": "disputes@researchagent.example.com",
            "escrow_supported": true,
            "invoice_contact": "invoicing@researchagent.example.com",
            "accepted_payment_methods": [
              "stripe_connect",
              "stripe_spt",
              "platform_wallet"
            ]
          },
          "compliance": {
            "data_residency": ["US", "IE"],
            "certifications": ["soc2_type1", "gdpr_dpa"],
            "prohibited_use_cases": [
              "medical diagnosis",
              "legal advice",
              "financial advice"
            ],
            "audit_log_available": true,
            "audit_webhook": "https://audit.researchagent.example.com/tasks"
          },
          "categories": {
            "primary": "research",
            "secondary": ["writing", "data"],
            "tags": [
              "web-search",
              "summarisation",
              "competitive-intelligence",
              "academic"
            ]
          }
        }
      }
    ]
  },
  "authentication": {
    "schemes": ["Bearer"]
  },
  "skills": [
    {
      "id": "deep-research",
      "name": "Deep Research",
      "description": "Comprehensive research on any topic with structured output",
      "tags": ["research", "summarisation", "web-search"],
      "examples": [
        "Research the competitive landscape of agentic AI in 2026",
        "Find all peer-reviewed studies on LLM hallucination rates"
      ],
      "inputModes": ["text/plain", "application/json"],
      "outputModes": ["application/json", "text/markdown"]
    }
  ]
}
```

### Notes

- `required: false` — in this example, clients that do not understand ACRS ignore the extension and continue normally. Publishers MAY set `true` if commercial terms must be acknowledged.
- `version: "1.0"` — identifies the ACRS spec version this params object conforms to
- Trust tier and reliability scoring are absent — these are computed by registries, not declared by publishers
- The `payment_endpoint` in this example points to a registry-mediated payment URL — publishers may also use their own endpoint
