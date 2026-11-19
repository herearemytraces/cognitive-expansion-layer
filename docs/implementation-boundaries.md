# Implementation Boundaries

## 1. Public vs Private

This repository publishes documentation and a static explanatory site. It does not distribute an executable CEL runtime, model service, public CEL API, or SDK. See [Implementation Status](implementation-status.md) for the current review scope.

Public:

- high-level concept;
- terminology;
- architecture overview;
- boundary rules;
- defensive publication;
- citation metadata.

Interfaces, simplified schemas, and original score examples are conceptual material. They do not define the private runtime's authoritative contract or production settings.

Private:

- production [Brownyx](https://brownyx.com) code;
- production prompts;
- exact model routing;
- exact scoring heuristics;
- private runtime data;
- infrastructure secrets;
- private integrations;
- commercial implementation details.

## 2. No Production Secrets

Do not publish:

- API keys;
- database schemas beyond conceptual examples;
- internal production prompt chains;
- private traces;
- private memory examples;
- customer data;
- deployment credentials;
- model provider secrets;
- exact anti-abuse heuristics.

Implementation updates should publish behavior and state-boundary guarantees, not private scoring values, provider retry internals, complete database schemas, or production examples.

## 3. No Direct Consciousness Claims

Do not write:

```text
Brownyx is conscious.
CEL proves machine consciousness.
CEL creates real subjective experience.
```

Use:

```text
Brownyx is a research runtime for persistent synthetic mind instances.
CEL is an architecture pattern for bounded cognitive expansion.
The project remains agnostic about consciousness claims.
```

## 4. No Self-Model Shortcut

CEL must not directly update identity. It proposes bounded signals and remains subject to the existing self-model gates, inhibition, lifecycle controls, operator authority, and external-action consent.

Allowed:

```text
self-model tension agenda item
trace evidence
candidate signal for existing gates
```

Forbidden:

```text
direct identity rewrite
direct stable trait insertion
direct capability claim
direct consciousness claim
```

## 5. No Memory Pollution

CEL output should not become ordinary memory by default.

Use:

- CycleTrace for ephemeral expansion;
- MindQuestion for durable questions;
- Hypothesis for testable claims;
- Contradiction for tensions;
- review-required MindCell candidate agenda items for durable cognitive patterns;
- Artifact candidate for deliberate externalization.

CEL candidates do not directly become active MindCells or artifacts. Operator review and the existing artifact policy govern their next stage. A reviewed MindCell remains non-personal and must not be written into ordinary Memory as a shortcut.

Analysis output is staged. Accepted durable effects are applied only within a successful, fenced terminal cycle transaction. Cancelled, failed, or stale cycles discard staged cognitive changes. A persistence failure is contained and reported without manufacturing accepted progress. A provider invocation, duplicate-only output, or useful non-durable synthesis is not itself durable progress.

Durable questions pass through the shared question service with deduplication and canonical identity. Context-dependent questions require a valid typed referent with unambiguous same-Mind provenance. An explicitly bound question or a verified current operator answer takes precedence over new CEL questions. Otherwise, a cycle may admit one new question family.

## 6. Knowledge And External Action

An approved program can supply attributed local passages to CEL through the runtime's reading stage. Those passages may motivate an untested explanation or identify evidence still needed. The program sets the permitted sources and objectives. CEL has no autonomous web or doc2rag search capability. External doc2rag context remains a private manual preview. The former ResearchRequest runtime and API are retired.

When the agenda selects a hypothesis for source review, CEL may propose a qualitative revision or a next step for that exact hypothesis version. When it selects verification planning, CEL may propose a new or revised plan, retain the current plan, or record missing evidence or authority. A separate executor checks authorization before running a proposed check. An empirical conclusion requires admissible results from a check.

An artifact recommendation is not authorization to generate, publish, or deliver an artifact. External actions retain the existing policy, executor, and consent boundaries.

## 7. Bisociation Boundary

Bisociation is allowed only when:

- earlier strategies are insufficient;
- it produces a clear useful conclusion;
- it passes clarity and risk thresholds;
- it remains internal by default.

Bad:

```text
Every answer becomes symbolic and poetic.
```

Good:

```text
A structural analogy or bisociation is used internally to generate a useful hypothesis, then the final output is clear.
```
