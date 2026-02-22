# WO1: Strudel Music v1.0 — Slash Command & Quality

## Summary
Deliver `/strudel` as a production-ready OpenClaw skill with slash command interface,
sample pack management, CI verification, and code quality fixes from Elliott's review.

## Scope
All 8 issues filed by Elliott on karmaterminal/strudel-music (#2–#9).

## Priority Order
1. **#2** — move sampleNames Set outside hap loop (one-liner, warm up)
2. **#3** — scale degree freq resolution TODO comment (one-liner)
3. **#7** — CI smoke test for offline renders (infrastructure, protects future changes)
4. **#4** — AST-aware viz stripping (code quality, prevents future breakage)
5. **#8** — sample pack management (partially done: `samples-manage.sh` exists, needs polish)
6. **#9** — slash command interface (partially done: SKILL.md has routing, needs dispatch wiring)
7. **#6** — document singleton fix for upstream Strudel (documentation, can happen anytime)
8. **#5** — adopt 2026.2.21 features (depends on fleet update — DONE, needs integration)

## Acceptance Criteria
- [ ] All 8 issues closed with commits referencing issue numbers
- [ ] `npm test` passes (12+ checks)
- [ ] `npm run test:render` passes
- [ ] CI green on push
- [ ] PR opened and merged to main
- [ ] ClaHub skill version bumped and published

## Branch
`feat/local-runtime-and-streaming` (existing, will continue here then PR to main)

## Notes
- Issues #8 and #9 are partially implemented — `samples-manage.sh` and SKILL.md routing exist
- #5 requires subagent spawning (now fixed!) and OpenClaw 2026.2.21-2 (deployed)
- #6 is a documentation task that could become an upstream Strudel PR
- Repo follows SpecKit rules per figs directive
