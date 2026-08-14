# release

<!-- PromptScript 2026-08-14T08:44:22.828Z | source: .promptscript/project.prs | target: claude - do not edit -->

> Prepare a validated HACS release without publishing it

1. Confirm changes use Conventional Commits and the working tree is understood.
2. Run prs validate --strict and npm run validate.
3. Confirm hacs.json, README resource URL, dist bundle, and release
   workflow all use the same artifact filename.

4. Review security workflow permissions, immutable action pins, and
   Dependabot coverage.

5. Let Release Please create the version PR and release. Do not manually
   edit generated CHANGELOG sections.

6. Before any remote action, ask for explicit user approval. This project
   does not push or publish by default.
