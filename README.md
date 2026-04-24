<div align="center">

<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

<h1>One Hub AI</h1>

<p>AI provider defaults are standardized on OpenRouter Auto Free.</p>
</div>

## Default AI Provider Policy

All AI-powered workflows in this repository should route through:

- **Provider:** `openrouter`
- **Model:** `openrouter/auto` (or current OpenRouter Auto Free equivalent)
- **API key env var:** `ROBOMARKET_API`

No hidden fallback providers are configured.

## Added provider abstraction

The following modules centralize AI behavior:

- `src/ai/providerConfig.js`
  - Centralized provider/model defaults and API key checks.
- `src/ai/openrouterClient.js`
  - OpenRouter chat completion client.
- `src/ai/generate.js`
  - Text generation and research summary helpers.
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
