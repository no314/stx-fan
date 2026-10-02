At the end of this build, write a skill-update handoff file. It is input for a
future merge session that will update our shared skills (stacks-dapp-architecture,
static-first-architecture, stacks-labs-dapp-design) from several such handoffs at
once. Do not update, edit, or propose changes to any skill yourself; the handoff
file is the only deliverable.

File: name it YEARMONTHDAY_skill-update-handoff-<app-name>.md (date of writing,
e.g. 20260915_skill-update-handoff-zero-to-lending.md) and place it in the app's
project root. Follow the structure of an existing example:
zero_to_claimed_rewards/20260903_skill-update-handoff-zero-to-claiming.md.

Content rules:
1. Only learnings you actually lived in THIS build: things that surprised you,
   broke, got corrected by me, or contradicted the skills as written. No generic
   best practices, nothing restated from the skills unless this build confirmed,
   refuted, or narrowed it. If the build contradicts a skill, record the
   contradiction and the evidence; do not resolve it.
2. Tag every learning three ways:
   [skill: which of the three it feeds]
   [kind: rule | default | example]
   [generalizes: one line saying where it stops applying]
   When unsure between rule and example, choose example. The merge session, not
   you, decides what becomes a rule.
3. Include a scaffold section for this app: which files and structures a future
   app should copy by path verbatim, versus what is only worth reading for
   inspiration. Be specific with paths.
4. Include a verified-constants section: any numbers, principals, limits, or API
   behaviors you verified against a primary source during the build, with enough
   context that nobody re-derives them.
5. Include mistakes and dead ends as learnings too (what looked right but was
   wrong, and what exposed it). These are often the most valuable entries.
6. Include a short process section: anything about how we worked (testing order,
   review cadence, deploy quirks) that a future build session should know.
7. Plain markdown, no em dashes anywhere.

Write it while the build is fresh, before any summary or compaction, and tell me
where you put it.