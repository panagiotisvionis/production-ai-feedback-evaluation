# Production AI Feedback Evaluation

A production-minded TypeScript reference implementation for collecting **human feedback on AI decisions** without allowing feedback to silently rewrite the original decision.

This project demonstrates patterns I use when designing operational AI systems: immutable decision history, strict validation, privacy-aware evaluation exports, bounded free text, audit-friendly metadata, and tests around safety invariants.

> This is a sanitized portfolio sample adapted from real-world operational engineering patterns. It contains no production data, customer data, credentials, or proprietary business logic.

## Why this exists

Shipping an AI workflow is only the beginning. A production system also needs to answer: Was the decision useful? Where do humans disagree? Can feedback be collected without corrupting history? Can evaluation data be exported without leaking PII? Can quality be measured instead of relying on anecdotes?

## Core invariants

1. **Model decisions are immutable.** Feedback is attached after the decision and never changes it.
2. **Feedback is evaluation data, not an instruction.**
3. **Evaluation exports are data-minimized.** Customer identity, message bodies, URLs and other operational fields are absent.
4. **Free-text feedback is bounded and scrubbed.** Common emails, phone numbers and URLs are redacted.
5. **Quality is measurable.** Agreement/disagreement rates and per-label counts are computed.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run check
```

## Production extension points

In a larger system I would place authorization before any data read, persist feedback through a server-side boundary, use request-scoped known-entity redaction in addition to regex scrubbing, bound database reads to the evaluated candidate set, record append-only audit events, and monitor metrics by model/version and decision type.
