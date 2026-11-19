# [Brownyx](https://brownyx.com) CEL Technical Specification

## 1. Name

**[Brownyx](https://brownyx.com) Cognitive Expansion Layer**  
Short name: **[Brownyx](https://brownyx.com) CEL**

## 2. Scope

CEL is a bounded optional internal stage in the [Brownyx](https://brownyx.com) cognitive cycle.

In Brownyx, CEL runs after memory and inner-world recall and before candidate action generation. On selected reading cycles, a separate stage can supply authorized local passages before CEL. Action execution and identity changes have their own gates.

This document preserves the original public concept while describing current implementation guarantees. The interfaces, schemas, and thresholds below are conceptual examples, not an authoritative API contract or production configuration. See [Implementation Status](implementation-status.md) for the review date and the distinction between implementation and evaluation.

## 3. Core Rule

```text
Direct reasoning first.
Expansion only when justified.
Bisociation only as a late-stage strategy.
Synthesis always last.
```

## 4. Trigger Rules

The runtime admits expansion through several paths.

- Sufficient salience, authenticated operator input or a supported explicit request.
- Severe rumination with relevant current evidence, a strong unresolved tension relevant to the current topic, or both.
- Accepted local reading tied to an approved objective can qualify a later cycle to consider that evidence.
- The agenda can select an existing domain hypothesis for source review or verification planning against its current revision.

Repeated override attempts on the same evidence can pause further attempts when they produce no durable progress. Numeric invocation quotas and frequency limits apply only when request limits are enabled, which is optional and off by default. Eligibility, source authorization, finite recovery, operation deadlines and Stop still apply.

The original concept identifies these useful expansion signals:

- event salience is high;
- the input asks for diagnosis, design, architecture, strategy, meaning, or project direction;
- the cycle detects ambiguity;
- retrieved contexts conflict;
- there are active unresolved questions;
- there is possible self-model relevance;
- Agenda v2 selected a hypothesis, contradiction, or self-model tension;
- latest viability state indicates stagnation risk or unresolved tension pressure.

CEL should be skipped when:

- the event is a low-signal internal tick;
- the task is a simple factual or operational answer;
- there is already a sufficient direct answer;
- an enforced request budget is exhausted;
- LLM route is unavailable;
- recent CEL runs produced no material result;
- an override has entered a no-progress backoff or reached an enforced attempt limit.

These conceptual signals are not independent promises of invocation. The runtime applies current eligibility, context provenance, lifecycle, and budget checks. The former ResearchRequest runtime/API is retired and is not selectable. CEL does not initiate autonomous web or doc2rag search. Local Knowledge remains a separate intake layer, and external doc2rag context is available only through a private manual preview.

## 5. Strategy Ladder

| Order | Strategy | Output |
|---:|---|---|
| 1 | Context Sufficiency Check | context gaps |
| 2 | Intent Clarification | intent summary |
| 3 | Frame Switching | frame candidates |
| 4 | Contradiction Detection | contradiction candidates |
| 5 | Hypothesis Generation | hypothesis candidates |
| 6 | Self-Model Tension Detection | tension candidates |
| 7 | Question Generation | question candidates |
| 8 | Analogy | analogy candidates |
| 9 | Bisociation | bisociation candidates |
| 10 | Synthesis | plain conclusion |

The ladder expresses strategy order and restraint. It is not a claim that ten separate modules or model calls execute in a fixed sequence. One bounded structured expansion operation may return a subset of these signals.

## 6. Suggested Service

```text
backend/app/services/cognitive_expansion.py
```

Conceptual interface sketch, retained from the original publication. These names do not define a public SDK or the private runtime's exact callable API:

```python
class CognitiveExpansionService:
    def should_run(self, context) -> CognitiveExpansionTrigger:
        ...

    def build_input(self, context) -> CognitiveExpansionInput:
        ...

    def run(self, context) -> CognitiveExpansionResult:
        ...

    def validate_result(self, result) -> CognitiveExpansionResult:
        ...

    def apply_persistence(self, result) -> CognitiveExpansionPersistenceReport:
        ...

    def append_trace_step(self, result, report) -> None:
        ...
```

## 7. Suggested Schemas

This simplified example illustrates the original output vocabulary. It omits runtime validation, provenance, candidate lifecycle, and telemetry fields. It must not be used as a production JSON contract.

```python
class CognitiveExpansionTrigger(BaseModel):
    should_run: bool
    reasons: list[str]
    skipped_reason: str | None = None
    max_strategy_level: str | None = None

class CognitiveExpansionResult(BaseModel):
    should_run: bool
    trigger_reasons: list[str] = []
    strategies_used: list[str] = []
    context_gaps: list[str] = []
    intent_summary: str | None = None
    frames: list[FrameCandidate] = []
    contradictions: list[ContradictionCandidate] = []
    hypotheses: list[HypothesisCandidate] = []
    self_model_tensions: list[SelfModelTensionCandidate] = []
    questions: list[QuestionCandidate] = []
    analogies: list[AnalogyCandidate] = []
    bisociations: list[BisociationCandidate] = []
    synthesis: str
    recommended_output_mode: str
    confidence: float
```

The implemented contract also distinguishes artifact recommendations, filtered context for candidate action generation and internal-only notes. Ordinary expansion can return `should_run=false`. A running result requires a nonblank synthesis. When the agenda admits an exact hypothesis for verification planning, CEL must give a reasoned decision to author, revise or retain a plan, or to wait for evidence or authority. Retaining a plan and waiting both leave the plan intact.

Provider output is validated before downstream use. Bounded shape normalization does not grant authority to malformed candidates. Provider, protocol, and structured-output recovery remain bounded on the same configured route and model. A semantically empty synthesis with `should_run=true` may receive one CEL corrective retry when the operation's recovery budget permits. Protocol recovery is not a switch to another model. Exhausted provider or validation failures are recorded as non-blocking CEL failures and do not supply candidate context or durable effects.

## 8. Persistence Mapping

The following thresholds are illustrative values from the original concept, not an exhaustive acceptance policy or operator configuration. Passing a score threshold does not bypass validation, provenance, deduplication, review, or the successful-cycle terminal fence.

During analysis, CEL results are staged as proposals. Accepted domain effects are applied inside the successful cycle's fenced terminal transaction with the rest of the cycle state. A failed, cancelled, or stale cycle does not turn staged CEL output into durable cognitive state. CEL persistence uses a rollback boundary: a recorded persistence failure does not invalidate an otherwise completed cycle.

### Contradictions

Persist only if:

```text
severity >= 0.55
confidence >= 0.55
```

Target:

```text
Contradiction
CognitiveAgendaItem(type="contradiction")
```

The runtime links the agenda item to an authoritative contradiction entity and uses canonical identity and evidence deduplication. Repetition alone is not a newly accepted durable result.

### Hypotheses

Persist only if:

```text
confidence >= 0.35
novelty >= 0.35
```

Target:

```text
Hypothesis
CognitiveAgendaItem(type="hypothesis_seed")
```

With authorized source passages and an approved objective, CEL can propose a scoped domain hypothesis, a verification plan or a next investigation step. It can revise an existing hypothesis or plan only against the exact selected version. If the available sources support a question but no registered check fits, CEL can leave the hypothesis untested, identify missing evidence or record a reasoned decision to take no action. Source review alone cannot establish an empirical result.

### Self-Model Tensions

Persist as agenda only:

```text
CognitiveAgendaItem(type="self_model_tension")
```

Do not directly write SelfModelVersion.

### Questions

Persist only if durable and non-duplicative:

```text
MindQuestion
CognitiveAgendaItem(type="open_question")
```

The shared question service resolves canonical identity and checks that contextual references belong unambiguously to the same Mind. An explicit question binding or a verified current operator answer reserves the question scope for that cycle. CEL can otherwise contribute at most one new question family in a cycle.

### Analogies

Persist only if clear and useful:

```text
clarity_score >= 0.70
usefulness_score >= 0.60
risk_score <= 0.50
```

Target:

```text
CycleTrace
CognitiveAgendaItem(type="mind_cell_candidate", review_required=true)
```

An analogy does not directly become an active MindCell. A durable candidate requires operator review under the existing agenda policy. MindCell remains a non-personal cognitive pattern, separate from ordinary Memory.

### Bisociations

Persist only if strict quality thresholds pass:

```text
clarity_score >= 0.75
usefulness_score >= 0.70
risk_score <= 0.45
```

Default:

```text
internal only
```

Durable bisociations follow the same review-required MindCell candidate boundary. Internal-only does not imply hidden execution: the operator can inspect traces and candidates.

### Artifact Recommendations

CEL may stage an artifact recommendation for review. Durable persistence creates a review-required artifact candidate under the existing artifact policy; it does not itself create, publish, or deliver an artifact. Artifact generation and external delivery have their own action, safety, and consent boundaries.

## 9. Trace Step

The runtime records the generation step as:

```text
cognitive_expansion
```

Simplified conceptual generation example:

```json
{
  "step": "cognitive_expansion",
  "enabled": true,
  "should_run": true,
  "trigger_reasons": [],
  "strategies_used": [],
  "result_summary": "A bounded synthesis for candidate action generation.",
  "skipped_reason": null,
  "llm_used": true,
  "model": "...",
  "validation_errors": []
}
```

A separate `cognitive_expansion_persistence` step reports terminal acceptance. Provider invocation, staged proposals, and accepted durable results are distinct. Diagnostics distinguish provider failure, invalid or empty output, non-durable-only output, rejected output, duplicate-only output, accepted durable results, and persistence failure. A provider call or zero persistence alone does not establish cognitive progress or healthy behavior.

## 10. Acceptance Criteria

CEL is accepted when:

1. It does not run on every simple cycle.
2. It considers high-signal cycles and applies the eligibility rules before invoking expansion.
3. It produces structured validated JSON.
4. Results are stored in CycleTrace.
5. Strong contradictions create existing Contradiction records.
6. Strong hypotheses create or update existing Hypothesis records.
7. Self-model tensions create agenda items, not direct self-model versions.
8. Durable questions are synchronized into MindQuestion.
9. Analogies and bisociations are internal-only by default.
10. User-facing output remains clear.
11. The system does not claim consciousness.
12. No new memory types are introduced.

These are behavioral acceptance criteria for the architecture. They do not establish a measured improvement in reasoning, creativity, continuity, or subjective experience.
