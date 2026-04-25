

<p>Generate text, summaries, and media-prompt workflows through a single OpenRouter-first AI layer.</p>
</div>

## What this app does (2-second clarity)

One Hub AI is a backend utility layer for teams that want a **single, predictable entry point** for AI generation.

- **Who it is for:** product engineers and automation builders.
- **Main action:** call one helper and receive traced AI output.
- **Primary CTA:** start with `generateText` to validate your API key and baseline model routing.

## Quick start

```bash
cp .env.example .env
# set ROBOMARKET_API
node -e "const { generateText } = require('./src/ai/generate'); generateText({ prompt: 'Hello world' }).then(console.log).catch(console.error)"
```

## Default AI Provider Policy

All AI-powered workflows in this repository route through:

```bash
AI_MODEL=openrouter/auto
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TIMEOUT_MS=30000
```

## API routes

## Provider abstraction modules

- `src/ai/providerConfig.js`
  - Centralized provider/model defaults and API key checks.
- `src/ai/openrouterClient.js`
  - OpenRouter chat completion client with request validation and timeout protection.
- `src/ai/generate.js`
  - Text generation and research summary helpers with strict input validation.
- `src/ai/mediaWorkflow.js`
  - Two-stage media workflow:
    1) LLM generation step (prompt/script/metadata)
    2) External media rendering step

`public/app.js` calls `/api/generate` directly via `fetch` and displays a visible error message if generation fails.

## Local quick check

```bash
node --test test/ai.spec.js
```

## Vercel redeploy after env changes

After changing environment variables in Vercel, trigger a fresh deployment so functions pick up new values:

Each generation helper returns provider and model metadata so outputs can be traced to the generating model.

## Audit status

A full quality audit against the 15-point production readiness framework is documented in `docs/MASTER_APP_AUDIT.md`.
