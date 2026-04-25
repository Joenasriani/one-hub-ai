

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

- **Provider:** `openrouter`
- **Model:** `openrouter/auto` (or current OpenRouter Auto Free equivalent)
- **API key env var:** `ROBOMARKET_API`

No hidden fallback providers are configured.

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

## Environment setup

Copy `.env.example` and set your key:

```bash
cp .env.example .env
# then set ROBOMARKET_API
```

If `ROBOMARKET_API` is missing, code throws a clear runtime error instead of generating fake output.

## Logging / traceability

Each generation helper returns provider and model metadata so outputs can be traced to the generating model.

## Audit status

A full quality audit against the 15-point production readiness framework is documented in `docs/MASTER_APP_AUDIT.md`.
