#!/usr/bin/env bash
set -euo pipefail

# Install project dev dependencies (assumes Homebrew + Node already installed)
brew update || true
brew upgrade || true

# Ensure fnm and node present
if ! command -v fnm >/dev/null 2>&1; then
  echo "fnm missing; installing"
  brew install fnm
fi

# Use LTS node
fnm install 22 || true
fnm use 22 || true

# Install npm deps
npm install

# Install playwright browsers
npx playwright install --with-deps || true

echo "Dev environment setup complete"
