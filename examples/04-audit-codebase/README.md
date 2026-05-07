# Example 04: Skill-First Audit

Instead of pasting a long audit prompt, run the built-in `$audit` skill and let it enforce a consistent, high-signal review format.

## What is a skill?

A skill is a reusable instruction pack for Codex. It gives Codex:
- a focused workflow,
- explicit quality standards,
- and a strict output contract.

In practice, skills reduce prompt-writing overhead and make outputs more consistent across users and sessions.

## Why this changes the game

- Less prompt crafting: You invoke the capability directly (`$audit`) instead of maintaining a large one-off prompt.
- Better consistency: Output shape, severity language, and review depth stay predictable.
- Faster onboarding: New team members can run the same review standard immediately.
- Easier iteration: Update the skill once in `.codex/skills/audit/SKILL.md`; every future audit improves.

## How to run

From Codex in this repository:

1. Run:
```text
$audit
```
2. Optionally paste a narrow scope (for example, a specific module or file path) after invoking the skill.
3. Review findings in severity order and convert accepted items into `todo.md` actions.

## Suggested team pattern

- Use `$audit` for red-team style review passes.
- Use scoped implementation prompts for fixes.
- Re-run `$audit` after changes to check regressions.
