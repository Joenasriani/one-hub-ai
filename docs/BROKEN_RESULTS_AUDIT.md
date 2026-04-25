# Broken Results Audit (Storyboard + Ad Creative)

Date: 2026-04-25

## What the screenshots indicate

- Storyboard modal shows an image but empty/black narrative panel.
- Ad creative view shows a broken image asset area and sparse copy.

## Root causes found in code before this patch

1. `POST /api/generate` only handled generic text/summary modes.
2. No strict structured contract for storyboard/ad creative fields.
3. Model output parsing assumed plain string only and did not normalize content arrays.
4. UI had no dedicated rendering path for structured storyboard/ad fields.

## Fixes implemented

- Added `storyboard` and `adCreative` modes to `/api/generate`.
- Added strict JSON generation/parsing and required-field checks for:
  - storyboard: `frameTitle`, `frameDescription`, `cameraDirection`, `twist`
  - ad creative: `headline`, `subheadline`, `cta`, `visualPrompt`, `imageAlt`
- Added assistant content normalization for array-style OpenRouter responses.
- Updated frontend with explicit Storyboard and Ad Creative actions and structured rendering.
- Errors now surface clearly when required structured fields are missing.

## Deployment checks

1. Redeploy Vercel after env changes.
2. Verify `GET /api/test-openrouter` returns status `ok`.
3. Verify `POST /api/generate` with `mode: "storyboard"` returns non-empty `structured` fields.
4. Verify `POST /api/generate` with `mode: "adCreative"` returns non-empty `structured` fields.
