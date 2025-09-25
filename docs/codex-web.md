# Codex Web Quick Start

Open this project in the ChatGPT Codex web workspace, then run:

```bash
./scripts/setup.sh
```

That installs dependencies and the Safari (WebKit) browser binary Playwright needs. Common commands:

```bash
npm test             # Safari Playwright suite (default: index-full-modular)
npm run test:modular
npm run test:full-modular
npm run test:unit
npm run test:performance
npm run validate:all
```

Entry points: `index-full-modular.html` (default), `index-modular.html` (core calculator).
