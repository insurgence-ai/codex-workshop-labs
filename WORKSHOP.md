# Codex Workshop Runbook (90 Minutes)

This runbook is for facilitators delivering the introductory Codex workshop against this repository.

## What this repo is optimised to teach

- Understanding an unfamiliar codebase quickly.
- Making scoped backend changes with explicit constraints.
- Adding targeted tests to reduce risk.
- Reviewing AI-generated changes with file-based evidence.

## Repo architecture (for facilitator framing)

- `ui/`: Next.js frontend for customer chat and orchestration visualisation.
- `typescript-backend/`: Express + OpenAI Agents orchestration runtime.
- `examples/`: hands-on lab examples (prompts + skill-first workflows).

## Pre-workshop setup checklist

Run this once on the facilitator machine before the session.

1. Install backend dependencies:
```bash
cd typescript-backend
npm install
```
2. Install UI dependencies:
```bash
cd ../ui
npm install
```
3. Set API key:
```bash
export OPENAI_API_KEY=your_api_key
```
4. Smoke test:
```bash
cd ../ui
npm run dev
```
5. Confirm:
- UI opens at `http://localhost:3000`
- backend is reachable via proxied `chatkit` routes
- starter prompts respond end-to-end

## Lab progression and timing

Use three labs with increasing difficulty.

1. Lab 1 (7-8 min): codebase understanding
   - Prompt: `examples/01-understand/prompt.md`
   - Outcome: attendees map request flow and system boundaries.
2. Lab 2 (10-12 min): test generation and risk reduction
   - Prompt: `examples/02-generate-tests/prompt.md`
   - Outcome: attendees add focused tests in `typescript-backend/tests`.
3. Lab 3 (10-12 min): scoped feature scaffold
   - Prompt: `examples/03-feature-scaffold/prompt.md`
   - Outcome: attendees add a new specialist agent with minimal blast radius.
4. Optional Lab 4 (8-10 min): skill-first audit workflow
   - Guide: `examples/04-audit-codebase/README.md`
   - Outcome: attendees run `$audit` and triage findings into concrete fix actions.

## Suggested facilitation pattern per lab

1. Ask Codex to inspect before editing.
2. Require a small implementation plan with file targets.
3. Execute one scoped change.
4. Run relevant checks/tests.
5. Review diff and discuss risk/edge cases.

## Notes on architecture question (Next.js vs Express)

- Keep Express backend for workshop labs: it is the clean place to demonstrate agent orchestration, guardrails, tool execution, and event logging.
- Keep Next.js frontend for workshop UX: it is stable for demoing system behaviour without introducing full-stack architectural change during the session.
- Do not migrate to a Next.js-only backend as part of this workshop; treat that as a separate architecture exercise.
