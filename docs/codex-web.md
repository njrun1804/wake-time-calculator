# Codex Web Quick Start

Open this project in the ChatGPT Codex web workspace, then run:

```bash
./scripts/setup.sh
```

That installs dependencies and the Safari (WebKit) browser binary Playwright needs. Common commands:

```bash
npm test             # Safari Playwright suite
npm run test:core
npm run test:awareness
npm run test:unit
npm run test:performance
npm run validate:all
```

Entry point: `index.html` (calculator + awareness).
