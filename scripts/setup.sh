#!/usr/bin/env bash
set -euo pipefail

npm install
npx playwright install webkit --with-deps
