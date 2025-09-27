# Developer setup and secrets

This document explains recommended secure places to store API keys and extension secrets.

## 1) Local .env (recommended for small teams/local dev)
- Copy `.env.example` to `.env` and fill in your keys.
- `.env` is in `.gitignore` by default — do NOT commit it.

## 2) VS Code User settings (recommended for extension API keys)
- Open VS Code Settings (Cmd+,) → search for the extension (e.g., "Genie") → paste API key into the API key field.
- User settings are stored per-user and not committed to the repo.

## 3) macOS Keychain (secure)
- Use Keychain Access to store keys and access them from scripts or macOS-native extensions.
- Example: use `security` CLI to read values in scripts.

## 4) CI / GitHub Secrets (for workflows)
- Add repository or organization secrets at https://github.com/<org>/<repo>/settings/secrets/actions
- Reference them in workflows using `${{ secrets.MY_SECRET }}`.

## 5) Thunder Client / Postman
- Store environment variables locally and exclude them from git; use shared environment files only when encrypted.

## 6) Best practices
- Rotate keys periodically.
- Use minimal scopes for API tokens.
- Never store production credentials in the repo.

*** End of doc
