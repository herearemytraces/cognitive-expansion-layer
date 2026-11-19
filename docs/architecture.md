# [Brownyx](https://brownyx.com) CEL Architecture

## 1. Position In The Runtime

CEL is an optional bounded stage within the implemented Brownyx cognitive cycle. This public overview describes state boundaries without exposing private prompts, model routing, or scoring rules. See [Implementation Status](implementation-status.md) for the review scope.

Current position, simplified:

```text
event
  -> event intake
  -> salience and focus formation
  -> memory and inner-world recall
  -> optional reading of admitted local sources or reuse of approved evidence
  -> optional Cognitive Expansion Layer
  -> candidate action generation
  -> inhibition and policy checks
  -> staged response / reflection / artifact / self-model / question effects
  -> fresh terminal fence
  -> atomic durable state + viability + completed trace commit
  -> governed follow-on work or external delivery, when eligible
```

The reading stage can supply passages authorized for the current research program and recipient. CEL can propose another local reading through the agenda. Web and doc2rag search remain outside CEL, and external doc2rag previews require a manual request. Borrowed MindCell patterns and operator answers retain their own provenance.

## 2. Main Components

### 2.1. Trigger Evaluator

Ordinary expansion can follow event salience, manual operator input or a supported explicit request. An override for rumination or tension requires current relevant evidence and can narrow the available strategies. On an internal cycle, the scheduler can also select evidence for an approved objective or assign work on one existing hypothesis revision.

When an operator answer or an explicit reference to an existing question gives one canonical question control of the cycle, the runtime skips CEL. It also skips expansion when the selected investigation already has an authorized computation ready for action selection.

Per-cycle invocation caps, ordinary cooldowns and automatic attempt quotas apply when application request limits are enabled. These limits are off by default. Repeated attempts on the same material without accepted progress can still cause the runtime to defer that work. Scope, source access and operator Stop remain in force.

Inputs:

- event type;
- salience;
- workspace focus;
- retrieved memory summaries;
- active questions;
- active agenda items;
- latest viability state;
- recent CEL history.

Output:

```text
CognitiveExpansionTrigger
```

### 2.2. Input Builder

Creates a compact bounded input for the structured CEL call.

Domain work can also receive the approved objectives, attributed passages and, for an existing investigation, the selected hypothesis revision. A passage can motivate an untested hypothesis. A citation identifies the source of a claim.

Input should include:

- current event summary;
- recalled memory summaries;
- self-model summary;
- active questions;
- active agenda items;
- latest viability summary;
- workspace focus;
- inner-world summary if already available.

Do not include raw private trace internals unless needed for an operator-only diagnostic run.

### 2.3. Structured Expansion Runner

Runs one structured operation. Recovery can make a bounded number of attempts on the same model. A running JSON result requires a nonblank synthesis. A missing synthesis may receive one corrective retry while the operation has budget. If recovery fails, the trace records the failure and the cycle can continue.

Ordinary expansion can decline to propose anything. Review of evidence for approved objectives can yield one scoped hypothesis, a specific need for evidence or authority, or no action. For an assigned verification-plan decision, the model must explain its choice to author, revise or retain a plan, or wait for evidence or permission. A qualitative review of an existing hypothesis can instead retain or amend its untested claim using the admitted passages.

### 2.4. Validator

Rejects or clamps:

- invalid JSON and semantically empty running results;
- forbidden consciousness claims;
- direct self-model patches;
- new memory type requests;
- decorative metaphors with low usefulness;
- too many questions;
- high-risk bisociations;
- output that tries to bypass safety or policy.

Detection of a forbidden consciousness claim or direct state write suppresses the result before action selection and persistence. A contextual question needs a valid typed reference attributable to the same Mind. Before appending a revision to a selected hypothesis or plan, the runtime verifies the target and its current version.

### 2.5. Persistence Mapper

Maps strong candidates into existing [Brownyx](https://brownyx.com) structures:

- Contradiction;
- Hypothesis;
- CognitiveAgendaItem;
- MindQuestion;
- review-required MindCell candidate agenda items;
- review-required artifact candidate agenda items;
- CycleTrace.

CEL does not directly create active MindCells or artifacts. Candidate approval follows existing operator-review and artifact policies. Hypotheses and questions use their shared services for deduplication and canonical identity. Contradiction agenda items link to authoritative contradiction entities.

For approved research objectives, accepted proposals can also record a versioned domain hypothesis, a verification plan or an investigation's next step. These records preserve the source and scope of the proposal. Executing a check requires separate authorization and action selection.

### 2.6. Synthesis Handler

Produces a plain synthesis that can inform candidate action generation. The expansion model is not the final response author and does not execute its proposals.

Trace and terminal persistence reporting separately explain:

- what was detected;
- what was persisted;
- what was rejected;
- what should be reviewed;
- what should be shown to the user, if anything.

## 3. Persistence Philosophy

CEL is trace-first.

Most expansion candidates should remain in CycleTrace only.

Operator review is required before a MindCell or artifact recommendation becomes eligible for its next stage.

Analysis stages proposals without committing domain effects. A fresh successful-cycle terminal transaction validates current lifecycle and state before atomically applying accepted effects and completed-trace state. Cancellation, failure, or stale output discards staged cognitive changes. Incremental trace snapshots and activity telemetry may remain as evidence of attempted computation.

CEL persistence has a rollback boundary. If it fails, the runtime rolls back the CEL writes, records the failure and can complete the rest of the cycle. Diagnostics distinguish provider invocation, rejection, duplicates and trace-only synthesis from newly created or materially reinforced records. A recorded decision to wait can advance the investigation history. Empirical support requires separate evidence from an actual check.

## 4. Safety Philosophy

CEL expands cognition but does not override safety.

CEL must not bypass:

- inhibition;
- action policy;
- contact regulation;
- external executor permissions;
- self-model gates;
- lifecycle controls;
- operator stop/delete authority;
- cycle budgets.

## 5. Why No New Table In MVP

The original MVP chose CycleTrace and runtime_state summaries instead of a dedicated `cognitive_expansion_runs` table. The implemented runtime continues to use trace and terminal-state evidence for CEL observability.

Reason:

- fewer migrations;
- fewer state boundaries;
- less dashboard complexity;
- easier rollback;
- less risk of treating expansion as durable memory too early.

## 6. Future Optional Table

If current observability becomes insufficient, a dedicated table could be considered. This remains an optional design idea, not an implemented public API or committed roadmap item:

```text
cognitive_expansion_runs
```

Fields:

```text
id
mind_id
cycle_id
trace_id
event_id
trigger_reasons
strategies_used
summary
persisted_counts
risk_flags
created_at
```

Do not store raw prompts or private memory content in this table.
