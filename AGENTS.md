# Agent Instructions

## Scope
These notes apply to the entire repository.

## Workflow Expectations
- When you edit any JavaScript file, run `npm run lint:js` before committing.
- When you edit any HTML file, run `npm run validate:html` before committing.
- Mention the exact test and lint commands you executed in your final summary.
- Prefer updating the modular pages (`index-modular.html`, `index-full-modular.html`) over the legacy `wake.html` unless specifically required.

## Style Guidance
- Follow the existing module boundaries described in `agent.md` when adding features.
- Use Prettier (`npm run format` / `npm run format:js`) to resolve formatting issues instead of hand formatting.
