# Broken Results Audit (Storyboard + Ad Creative)

Date: 2026-04-25

This file is retained as a historical engineering record. It describes a storyboard/ad-creative remediation direction considered at that time. It must not be read as a statement of the repository's current supported API contract.

## What the screenshots indicated

- Storyboard modal showed an image but an empty/black narrative panel.
- Ad creative view showed a broken image asset area and sparse copy.

## Root causes recorded at the time

1. `POST /api/generate` handled generic text/summary modes.
2. There was no complete structured contract for storyboard/ad creative fields.
3. Model output handling needed normalization for non-string content shapes.
4. The browser UI did not contain a complete supported rendering path for those structured modes.

## Current repository boundary

The supported `/api/generate` modes are:

- `text`
- `summary`

The repository does not currently expose `storyboard` or `adCreative` as supported `/api/generate` modes. Earlier notes that described those modes as implemented are superseded by the current code.

OpenRouter calls are restricted by the provider configuration to the free-only `openrouter/free` router.

## Current verification targets

1. `GET /api/test-openrouter` should return `status: "ok"` when a valid OpenRouter API key is configured and the upstream free router is available.
2. `POST /api/generate` with `mode: "text"` should return generated text.
3. `POST /api/generate` with `mode: "summary"` should return a summary.
4. Unsupported generation modes should return HTTP 400 rather than silently falling back to text generation.
