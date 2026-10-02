// Every version of every skill, newest first. Files sit beside this one with the zt_skill- prefix and are shown verbatim.
export const SKILLS = [
  {
    id: "static-first-architecture", title: "Static-first architecture", filetag: "skill: static-first-architecture",
    versions: [
      { label: "zero_to v2", file: "zt_skill-static-first-architecture.zero_to-v2.md",
        note: "zero_to v2: the currently installed skill, merged 2026-09-05 from the Zero to Signing, Zero to Claiming and sBTC Deposit Recovery hand-offs. Adds the copy-by-path scaffold list, test-first for the pure domain layer, the offline harness as the centre of regression (fixtures with real proportions, golden pre-fix fixtures, fixture mode shipped behind a URL flag), and deploy only the contents of dist. Vendoring is now stated as load-bearing for correctness, not only hygiene." },
      { label: "zero_to v1", file: "zt_skill-static-first-architecture.zero_to-v1.md",
        note: "zero_to v1: the skill the first zero_to apps were built with. Its body carried forward unchanged from Revised (byte-identical; only the frontmatter quoting differs), so the static-first lessons stabilised a version earlier than the dApp ones." },
      { label: "Revised", file: "zt_skill-static-first-architecture.revised.md",
        note: "Revised after building Signer Sidekick: adds \"dependencies are part of the artifact\" (vendor plus pin, CDN-primary with local fallback), URL as state, and \"verify by executing the artifact, not by resolving the graph\"." },
      { label: "Original", file: "zt_skill-static-first-architecture.original.md",
        note: "The original skill, as first written, before those lessons." },
    ],
  },
  {
    id: "stacks-dapp-architecture", title: "Stacks dApp architecture", filetag: "skill: stacks-dapp-architecture",
    versions: [
      { label: "zero_to v2", file: "zt_skill-stacks-dapp-architecture.zero_to-v2.md",
        note: "zero_to v2: the currently installed skill, merged 2026-09-05. Adds read resilience against the public API (the per-minute rate limit, one gate for every read, never cache a transient failure, a failed read renders as unavailable), print events versus indexer state, the on-chain batch reader, contract families that share a name but not an interface, lookup-and-verify over search, the no-wallet tier 2 with anti-phishing by negative capability, the three-way post-condition fork (who moves the asset decides the mode), and a section of verified reference constants." },
      { label: "zero_to v1", file: "zt_skill-stacks-dapp-architecture.zero_to-v1.md",
        note: "zero_to v1: adds the three-tier wallet selector (verified, offered untested, blocked, with install links and provider-id pinning), \"inherited constants are not pinned constants\" (a ported connectValue signed every transaction with a retired network's chain-id 0x80000005), and a \"transaction validity windows\" section (the prepare-phase guard)." },
      { label: "Revised", file: "zt_skill-stacks-dapp-architecture.revised.md",
        note: "Revised after building Signer Sidekick: adds wallet SIP-030 capability, source verification, read resilience, and network and chain-id handling." },
      { label: "Original", file: "zt_skill-stacks-dapp-architecture.original.md",
        note: "The original skill, as first written, before those lessons." },
    ],
  },
  {
    id: "stacks-labs-dapp-design", title: "Design and tone of voice", filetag: "skill: stacks-labs-dapp-design",
    versions: [
      { label: "zero_to v2", file: "zt_skill-stacks-labs-dapp-design.zero_to-v2.md",
        note: "zero_to v2: the currently installed skill, merged 2026-09-05. Adds copy-by-path, the blocked rail state, the chain-timing widget rules (floor never round, the marker at the true position, the blocked window has geometry, the last block is labelled end minus 1), key-material detection on any free-text input, and a dozen voice rules from the builds: stamp live figures with their read, unavailable never zero, say which source the view used, show the work before the conclusion, anti-phishing chrome." },
      { label: "zero_to v1", file: "zt_skill-stacks-labs-dapp-design.zero_to-v1.md",
        note: "zero_to v1: added after Signer Sidekick. The design system, layout pattern, and voice extracted from the production Zero to Signing app: the step-flow layout, the mandatory network accent swap, the closed surface system, per-network state and persistence conventions, and house voice (no em dashes). Its bundled assets (tokens.css, app.css, fonts) and component recipes ship with the skill." },
    ],
  },
  {
    id: "scaffold", title: "PRD and scaffolding", filetag: "skill: stacks-labs-dapp-design / references/scaffold.md",
    versions: [
      { label: "zero_to v2", file: "zt_skill-scaffold.zero_to-v2.md",
        note: "How additional apps get built. Product behaviour comes from a one page per-app PRD, not from any skill. Each new flow is scaffolded from the previous app rather than re-derived: the same project skeleton, network block, state model, and verification harness carried forward." },
    ],
  },
  {
    id: "merge-prompt", title: "How skills evolve", filetag: "process: the hand-off prompt given at the end of every build",
    versions: [
      { label: "current", file: "zt_skill-merge-prompt.md",
        note: "The prompt that ends each build. It produces the dated hand-off file; a separate merge session turns several hand-offs into the next skill version. The builder never edits a skill." },
    ],
  },
];

