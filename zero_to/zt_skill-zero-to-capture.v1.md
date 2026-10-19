---
name: "zero-to-capture"
description: "Keep a running skill-update handoff file in the app root during any zero_to or Stacks Labs app build, as input for a later merge of stacks-dapp-architecture, static-first-architecture and stacks-labs-dapp-design. Fire at build start to create the file, and whenever something surprises, breaks, is corrected by Werner, or contradicts a skill as written; also on 'capture', 'log this', 'remember this for the skills'. Writes a local markdown file only; never edits or proposes a skill."
---

# zero-to-capture

A build teaches things the skills do not yet say. This skill records them while they are fresh, one entry at a time, in a file the next merge session reads. It never changes a skill: the merge session decides what becomes a rule.

## The file

One file per app, in the app's project root, named `YYYYMMDD_skill-update-handoff-<app-name>.md` where the date is the day the file was created and never changes. At the start of any build, look for a file matching `*_skill-update-handoff-*.md` in the app root. If none exists, create it from the template below before writing any code. If one exists, append to it. Never create a second file for the same app.

The file stays local. It is not a Notion row, not a project doc, not a memory entry.

## When to write

Append an entry in the same turn the learning occurs, before answering the rest of the turn, so a compaction cannot lose it. Triggers:

- something in the build surprised you or broke;
- Werner corrected a decision, a number, a layout, or copy;
- the source, the chain, or a primary document contradicted one of the three skills as written (record the contradiction and the evidence; do not resolve it);
- a skill had no words for the situation;
- Werner says capture, log this, or remember this for the skills.

Do not write generic best practice, anything restated from a skill the build merely followed, or a learning about how to use Claude.

## Entry format

Each learning is one bullet in the Learnings section, dated, tagged four ways, two to six sentences, with a path into the app where one exists:

```
- [2026-10-18] [skill: static-first-architecture] [kind: example]
  [generalizes: fixture-mode apps] [source: lived]
  What happened, what exposed it, and what the skill said or failed to say.
  Path: src/clients.js
```

`kind` is rule, default, or example; when unsure, example. `generalizes` is one line saying where the learning stops applying. `source` is lived (this session saw it), recovered (reconstructed from artifacts after the fact), or inferred (believed, no artifact).

The other sections are edited in place, not appended: Scaffold (copy by path verbatim, versus read for inspiration), Verified constants (only values checked against a primary source, with the source named), Mistakes and dead ends (what looked right, what exposed it), Process (testing order, deploy layout, review cadence), Gap list (what you know you do not know).

## Template for a new file

```
# YYYYMMDD Skill-update handoff: learnings from <App Name>

Running log for the <app> build, started YYYY-MM-DD. Input for a future merge
of stacks-dapp-architecture, static-first-architecture and
stacks-labs-dapp-design. Entries are appended as they happen. Nothing here
changes a skill.

## Scaffold

Copy by path:

Read for inspiration, do not generalize:

## Learnings

## Mistakes and dead ends

## Process

## Verified constants (recheck only if stale)

## Gap list
```

## Rules

- Plain markdown, no em dashes anywhere.
- Never write a partial address, hash, txid, or principal; write the complete value or none.
- Never edit, propose, or draft changes to any skill from this file. If a learning seems urgent, say so to Werner in one sentence and still only append.
- A merge session reads this file; it does not write to it.