---
name: "zero-to-capture"
description: "Keep a running skill-update handoff file in the app root during any zero_to or Stacks Labs app build, as input for a later merge of stacks-dapp-architecture, static-first-architecture and stacks-labs-dapp-design. Fire at build start to create the file, and whenever something surprises, breaks, is corrected by Werner, or contradicts a skill as written; also on 'capture', 'log this', 'remember this for the skills'. Writes a local markdown file only; never edits or proposes a skill."
---

# zero-to-capture

About this version: v2, 2026-11-22, written after the v4 merge. New since v1: one entry format with no undated entries, four optional lines (Origin, Observed live, Refutes, Owner decision), a header that names the app's shape, a Candidates used section, and the owner review pass.

A build teaches things the skills do not yet say. This skill records them while they are fresh, one entry at a time, in a file the next merge session reads. It never changes a skill: the merge session decides what becomes a rule.

## The file

One file per app, in the app's project root, named `YYYYMMDD_skill-update-handoff-<app-name>.md` where the date is the day the file was created and never changes. At the start of any build, look for a file matching `*_skill-update-handoff-*.md` in the app root. If none exists, create it from the template below before writing any code. If one exists, append to it, in this format even when older entries use another. Never create a second file for the same app.

The file stays local. It is not a Notion row, not a project doc, not a memory entry.

## When to write

Append an entry in the same turn the learning occurs, before answering the rest of the turn, so a compaction cannot lose it. Triggers:

- something in the build surprised you or broke;
- Werner corrected a decision, a number, a layout, or copy;
- the source, the chain, or a primary document contradicted one of the three skills as written (record the contradiction and the evidence; do not resolve it);
- a skill had no words for the situation;
- the PRD lacked a field the build needed, or a PRD line was wrong or stale (tag it `[skill: stacks-labs-dapp-design]` and name the PRD);
- Werner says capture, log this, or remember this for the skills.

Do not write generic best practice, anything restated from a skill the build merely followed, a learning about how to use Claude, or anything about the build environment (sandbox reach, proxy errors, tool limits). Those belong in Process at most.

## Entry format

Each learning is one bullet in the Learnings section. The date is mandatory and comes first; an entry whose date is unknown takes the date it was written and `source: recovered`. Four tags, two to six sentences, a path where one exists:

```
- [2026-11-22] [skill: static-first-architecture] [kind: example]
  [generalizes: fixture-mode apps; stops for apps with one read] [source: lived]
  What happened, what exposed it, and what the skill said or failed to say.
  Path: src/clients.js
  Observed live: no
```

`kind` is rule, default, or example; when unsure, example. `generalizes` is one line that also says where the learning stops applying. `source` is lived (this session saw it), recovered (reconstructed from artifacts after the fact), or inferred (believed, no artifact).

Optional lines, each on its own line after `Path:`, spelled exactly:

- `Observed live: yes | no`. Whether the fix or behavior was seen on a real network or wallet. Write `no` when a fix shipped and its result was not seen.
- `Origin: <repo at commit, or document and date>`. When the practice comes from somewhere other than this app, such as the Leather repo. The merge counts a named origin as a second observation unless Werner says otherwise.
- `Refutes: <date and first words of the earlier entry>`. When a later finding overturns an earlier entry. The earlier entry stays; the merge follows the later one.
- `Owner decision YYYY-MM-DD: <not for the skills | for the skills>. <reason in his words>`. Written only when Werner says so. An entry closed with "not for the skills" is not merged and not counted as an observation. The app keeps the behavior.

Entries are never deleted or rewritten. A wrong entry gets a `Refutes:` successor; an unwanted one gets an owner decision line.

The other sections are edited in place, not appended: Scaffold (copy by path verbatim, versus read for inspiration), Candidates used, Verified constants (only values checked against a primary source, with the source and date named), Mistakes and dead ends (what looked right, what exposed it), Process (testing order, deploy layout, review cadence), Gap list (what you know you do not know).

**Candidates used.** When the build follows an entry from a skill's "Candidates (one app, under review)" section, add one line: the candidate's first words, the skill, the path where this app uses it, the date. When a candidate was considered and did not fit, say that in one line too. The merge promotes and retires from these lines.

## Owner review pass

Before a merge, or when Werner asks to review the handoff, list the entries as one line each (date, skill, first sentence) and ask which are not for the skills. Append his decision line to each entry he names, with the day's date. Add a note under the Learnings heading that says the review happened and when. Do not close an entry on your own judgment.

## Template for a new file

```
# YYYYMMDD Skill-update handoff: learnings from <App Name>

Running log for the <app> build, started YYYY-MM-DD. Input for a future merge
of stacks-dapp-architecture, static-first-architecture and
stacks-labs-dapp-design. Entries are appended as they happen. Nothing here
changes a skill.

Shape: <wallet flow | no-wallet flow | no-rail page>. Scaffolded from: <app, or none>.
Skill versions at build start: <zero_to vN>.

## Scaffold

Copy by path:

Read for inspiration, do not generalize:

## Learnings

## Candidates used

## Mistakes and dead ends

## Process

## Verified constants (recheck only if stale)

## Gap list
```

## Rules

- Plain markdown, no em dashes anywhere.
- Never write a partial address, hash, txid, or principal; write the complete value or none.
- Never edit, propose, or draft changes to any skill from this file. If a learning seems urgent, say so to Werner in one sentence and still only append.
- A merge session reads this file; it does not write to it. The owner review pass is a capture step, not a merge step.
