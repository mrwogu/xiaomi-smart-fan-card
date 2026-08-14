# promptscript

<!-- PromptScript 2026-08-14T08:53:07.211Z | source: .promptscript/project.prs | target: claude - do not edit -->

> Change agent instructions and regenerate all targets

1. Edit .promptscript/project.prs or its imported fragments, never generated
   AGENTS.md, CLAUDE.md, Factory droids, or Claude agents.

2. Keep the source modular: context, standards, restrictions, knowledge,
   workflows, and agents each have one responsibility.

3. Run prs validate --strict.
4. Run prs compile and inspect every generated target.
5. Run Prettier on generated Markdown and npm run validate.
6. Review generated instruction diffs for accidental loss of rules,
   duplicated sections, secrets, or unsupported target syntax.
