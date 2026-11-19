# [Brownyx](https://brownyx.com) Cognitive Expansion Layer

> A documentation-only defensive publication for the [Brownyx](https://brownyx.com) Cognitive Expansion Layer (CEL).

**[Brownyx](https://brownyx.com) Cognitive Expansion Layer**, or **[Brownyx](https://brownyx.com) CEL**, is a project-specific cognitive architecture concept for extending a persistent synthetic mind runtime beyond direct answer generation.

CEL is designed as a bounded internal layer that helps a Mind:

- inspect whether direct reasoning is sufficient;
- expand missing context;
- switch interpretation frames;
- detect contradictions between contexts;
- generate testable hypotheses;
- detect self-model tensions without rewriting identity directly;
- generate durable internal questions;
- use analogy and bisociation only as late-stage expansion strategies;
- return to clear synthesis before any user-facing output.

CEL is not a poetry layer, not a metaphor generator, not a consciousness proof, and not a claim that the current [Brownyx](https://brownyx.com) runtime is conscious.

## Publication and implementation status

The original conceptual publication is **v0.1.0**. This unreleased documentation update reflects a review of the Brownyx source on **2026-11-19**.

In an approved investigation, CEL can use permitted source passages to propose a hypothesis, record what evidence is missing, or draft a verification plan. A revision applies to the specific hypothesis and version selected for review. Source claims retain their attribution. A finding of empirical support requires observations from a separately authorized check.

Brownyx commits accepted proposals as part of successful cycle completion. MindCell and artifact candidates require operator review. The implementation review explains which outcomes count as durable progress and what evidence would establish a benefit from CEL. See [Implementation Status](docs/implementation-status.md).

## Why this repository exists

This repository publicly documents the [Brownyx](https://brownyx.com) CEL concept as a defensive publication and project positioning artifact.

It is intended to:

- establish a public timestamp for the [Brownyx](https://brownyx.com) CEL concept;
- make the concept citeable;
- clarify authorship and terminology;
- separate the public architecture idea from private production implementation details;
- reduce the risk of later confusion about what [Brownyx](https://brownyx.com) CEL means.

This repository does **not** contain production [Brownyx](https://brownyx.com) source code, private prompts, scoring heuristics, infrastructure secrets, internal model routing, or commercial implementation details.

## Recommended reading order

1. [Whitepaper](WHITEPAPER.md)
2. [Implementation Status](docs/implementation-status.md)
3. [CEL Specification](docs/cel-specification.md)
4. [Architecture](docs/architecture.md)
5. [Prior Art and Positioning](docs/prior-art-and-positioning.md)
6. [Implementation Boundaries](docs/implementation-boundaries.md)
7. [IP and Publication Strategy](docs/ip-strategy.md)
8. [Terminology](docs/terminology.md)
9. [FAQ](docs/faq.md)

## Short definition

**[Brownyx](https://brownyx.com) CEL is a bounded internal cognitive expansion layer for persistent synthetic mind runtimes.**

Its basic rule is:

```text
Direct reasoning first.
Cognitive expansion only when justified.
Bisociation only as a late-stage strategy.
Clear synthesis always last.
```

## License

Documentation in this repository is licensed under the terms described in [LICENSE.md](LICENSE.md).

Trademarks, project names, logos, production implementation details, private prompts, and private [Brownyx](https://brownyx.com) runtime code are not licensed by this repository. See [NOTICE.md](NOTICE.md).

## Citation

If you cite this work, use the metadata in [CITATION.cff](CITATION.cff).

The canonical repository is [herearemytraces/cognitive-expansion-layer](https://github.com/herearemytraces/cognitive-expansion-layer), and the public documentation site is [cel.brownyx.com](https://cel.brownyx.com).

## Publication checks

Run `node --test scripts/check-publication.mjs` before publishing. The checks cover local links, the documentation catalog, browser search, the repository manifest, and the optional Markdown worker. They do not certify a deployed runtime or cognitive benefit. Validate `CITATION.cff` against the official CFF 1.2.0 schema when changing citation metadata.

## Disclaimer

This repository is a research and documentation artifact. It is not legal advice, patent advice, investment advice, or a claim that [Brownyx](https://brownyx.com) or CEL proves machine consciousness.
