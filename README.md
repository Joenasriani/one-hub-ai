# One Hub AI

**Author:** Joe Nasr  
**Canonical identity:** https://joe-nasr-signals.vercel.app/v2/

One Hub AI is a small provider-integration layer for text generation, research-summary helpers, and media-planning workflows through OpenRouter.

## Current status

Working utility prototype for controlled evaluation and bounded integration.

It provides a single entry point for product engineers and automation workflows that need model routing plus returned provider and model metadata. The repository does not by itself establish public-scale reliability, security certification, compliance, or production performance.

## Quick start

```bash
cp .env.example .env
# set ROBOMARKET_API
node -e "const { generateText } = require('./src/ai/generate'); generateText({ prompt: 'Hello world' }).then(console.log).catch(console.error)"
```

## Provider policy

AI workflows in this repository route through OpenRouter using the configured model policy.

```bash
AI_MODEL=openrouter/auto
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TIMEOUT_MS=30000
```

## Core modules

- `src/ai/providerConfig.js`: provider defaults and API-key checks
- `src/ai/openrouterClient.js`: OpenRouter request handling and timeout protection
- `src/ai/generate.js`: text generation and research-summary helpers
- `src/ai/mediaWorkflow.js`: model-generated media planning data followed by an external rendering responsibility

Any browser interface calling this layer should surface provider failures rather than representing failed or missing provider output as generated content.

## Local checks

```bash
node --test test/ai.spec.js
```

Passing repository tests establish only the code paths covered by those tests.

## Audit record

`docs/MASTER_APP_AUDIT.md` contains an internal engineering self-audit. It is not an independent certification, external security assessment, or production-readiness guarantee.

Repository: https://github.com/Joenasriani/one-hub-ai
