Step 1: Identify the highest-risk backend behaviour that currently lacks strong automated test coverage in `typescript-backend`.

Step 2: Add focused tests for that behaviour, following existing project conventions and keeping scope tight.

Step 3: Explain what risks remain after your tests.

Prioritize parity-critical paths:
- disrupted-itinerary tool chaining (required),
- guardrail tripwire blocking (if feasible without external API calls),
- handoff/event recording (if feasible without major refactor).

Be specific and include file references.
