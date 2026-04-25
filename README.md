# One Hub AI

One Hub AI uses real server API routes for OpenRouter calls. Frontend code calls `/api/generate`.

## Required environment variable

```bash
OPENROUTER_API_KEY=your_key_here
```

Optional:

```bash
AI_MODEL=openrouter/auto
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TIMEOUT_MS=30000
```

## API routes

- `POST /api/generate`
  - Body: `{ "mode": "text" | "summary" | "storyboard" | "adCreative", "text": "..." }`
  - Calls OpenRouter and returns live content.
  - For `storyboard` and `adCreative`, returns a validated `structured` object to prevent blank UI regions.
- `GET /api/test-openrouter`
  - Runs a connectivity prompt and returns a live response.

Both routes log whether `OPENROUTER_API_KEY` is detected.

## Troubleshooting broken storyboard/ad creative outputs

If you see blank frame text or broken image-like UI:

1. Check `/api/generate` response JSON for `structured` fields.
2. If `structured` is missing, backend now returns a visible error instead of partial/fake content.
3. Run `/api/test-openrouter` to verify model connectivity.
4. Redeploy after any Vercel env var change.

## Local quick check

```bash
node --test test/ai.spec.js
```
