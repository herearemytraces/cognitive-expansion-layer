# CEL Implementation Status

Reviewed on **2026-11-19** against Brownyx Mind revision `55c2382`. The review covers committed source and local tests. Production behavior and the effect of CEL on reasoning quality require separate evidence.

The original version 0.1.0 publication remains the historical concept. Its strategy ladder, interface sketches, simplified schemas, and score examples describe architectural intent. They are not an authoritative public API, a production configuration, or a claim that every suggested strategy is a separate implemented module. Current behavioral guarantees are summarized below without exposing private prompts, model routes, or scoring details.

## Implemented Guarantees

- **When expansion runs.** CEL is optional. It follows recall and any eligible source reading, and precedes candidate action generation. Salient events, authenticated operator input and supported requests can qualify. Rumination needs current, relevant supporting context. A relevant unresolved tension can also qualify. Approved investigation work has its own eligibility paths. Numerical request quotas and ordinary cooldowns are optional and off by default. The runtime still limits retries and can defer repeated attempts on the same material when they produce no progress.
- **Validated proposals.** Ordinary expansion may abstain. A running result requires a nonblank synthesis. The runtime validates structured proposals, filters malformed or forbidden content and records failures. Recovery uses the same configured model with finite retries. The rest of the cycle can continue if recovery fails.
- **Staged effects and terminal authority.** Analysis produces proposals, not durable cognitive mutations. Accepted CEL effects are applied inside the successful cycle's fenced terminal transaction with the rest of the cycle state. Failed, cancelled, or stale cycles discard staged domain effects. Incremental traces and activity telemetry can record attempted computation without proving completion.
- **Questions and contradictions.** Accepted contradictions link to their agenda items. The shared question service checks provenance, resolves duplicates and can admit one family of related CEL questions per ordinary cycle. When a cycle belongs to a specific existing question or operator answer, it preserves that focus and can skip expansion entirely.
- **Review before promotion.** Useful analogies and bisociations create review-required MindCell candidate agenda items. Artifact recommendations also become review-required candidates under the existing artifact policy. CEL does not directly create active MindCells, rewrite durable identity, publish artifacts, or authorize external delivery. MindCell remains separate from personal Memory; bisociation is internal-only by default and inspectable by the operator.
- **Observable outcomes and contained failure.** Generation and terminal persistence are reported separately. Provider invocation, empty or invalid output, non-durable-only output, rejection, duplicate-only output, accepted durable state, and persistence failure are distinct outcomes. Only newly created or materially reinforced durable state counts as accepted CEL progress. A contained persistence failure does not leave partially applied CEL effects or invalidate an otherwise completed cycle.
- **Source access.** The reading stage supplies passages that the Mind can access for the approved program. CEL has no autonomous web or doc2rag search. Private manual previews, ordinary memory and borrowed MindCell patterns retain their separate roles.

## Hypotheses and evidence

After an eligible reading, CEL can propose an explanation for an approved objective, identify a missing observation, or give a reason to take no action. Brownyx records the program and scope of a domain hypothesis. Two claims with the same title can therefore describe different populations or periods. A change to the formulation creates a revision and preserves the earlier statement.

When the cycle selects an existing hypothesis, CEL can revise only the selected version. A source review can retain an untested claim and identify the next passage or observation needed. A request to decide on a verification plan requires an explicit decision, such as proposing a plan, keeping the existing plan, or explaining which evidence or permission is missing. If an authorized computation is already available, the cycle can skip expansion and let action selection consider or decline it.

For example, a report might say delays fell after a scheduling change. CEL can attribute that claim to the report and propose comparing observations from the relevant periods. Saving the proposal records the intended check. With only the report, the assessment can remain untested or inconclusive. A finding of empirical support or contradiction requires observations from a separately authorized check for the relevant hypothesis and plan version. The model can lower its confidence without adding any measurement.

## Strategy Ladder And Implementation

The ten strategies in the [Technical Specification](cel-specification.md) express a progression from context sufficiency and intent clarification toward frames, contradictions, hypotheses, questions, analogy, rare bisociation, and plain synthesis. They are a reasoning policy, not ten mandatory sequential calls.

The implemented structured operation can return a subset of those signals. Deterministic eligibility, validation, filtering, persistence, and review enforce its boundaries. A strategy name in a trace does not establish that an independent algorithm executed or that expansion improved the result.

## Evaluation Limits And Future Work

Tests with synthetic providers exercise an ordinary Mind cycle from permitted reading through a versioned hypothesis and proposed plan. They also cover a stale or mismatched target and withdrawal of source access. In a follow-up cycle, the built-in mock can return possible actions without indicating which one it selects. The runtime rejects that response. Tests that reach this failure confirm the earlier hypothesis commit and leave the subsequent action unverified.

Detailed traces identify cycles that consider evidence for an approved objective or revisit a selected investigation. The recent-results summary can omit the eligibility label for either path.

In one documented November pilot with a live model, two CEL reviews had access to admitted data and a compatible, authorized check. One abstained and the other recorded a missing measurement. Neither proposed the plan in those cycles. This illustrates a limit of the current implementation even when source access and execution authority are available.

Brownyx also supports comparisons of complete Mind cycles on fixed evidence. Those comparisons include recall, CEL and other stages together. Measuring the contribution of CEL itself would require comparing equivalent cycles with expansion enabled and disabled, using the same evidence, resources and outcome criteria. This review reports no such comparison or evidence of subjective experience.

The optional dedicated CEL run table described in [Architecture](architecture.md) remains a conceptual extension.

## Public Repository And Site Boundary

This repository contains documentation and a static explanatory site. It does not supply an executable CEL runtime, inference service, public CEL API, SDK, private prompts, or production deployment package. The site does not connect to a live Mind or call a model.

The private Brownyx runtime implements the guarantees above. The public repository explains those guarantees and the original concept while preserving the [Implementation Boundaries](implementation-boundaries.md).
