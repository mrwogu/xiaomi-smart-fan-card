# feature

<!-- PromptScript 2026-08-14T08:44:22.828Z | source: .promptscript/project.prs | target: claude - do not edit -->

> Implement a user-facing card or adapter feature safely

1. Read AGENTS.md, CLAUDE.md, README.md, relevant source, tests, and the
   current PromptScript source. Use the code graph when available.

2. Identify the correct boundary: state helper, adapter, service
   dispatcher, card rendering, editor, or documentation.

3. Add the smallest implementation that preserves capability gating and
   existing aliases.

4. Add focused Vitest coverage and redacted fixtures for every new branch.
5. Update README configuration, compatibility notes, and media slots when
   the visible behavior changes.

6. Run the narrowest tests, then npm run validate for the complete change.
7. Run npm run build, review dist/xiaomi-fan-card.js, and include the
   generated HACS bundle in the same change.

8. Stop before commit or push unless the user explicitly authorizes it.
