# One Hub AI

One Hub AI now uses **real server API routes** for OpenRouter calls. Frontend code calls `/api/generate`; no mock generation path is used.

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
  - Body: `{ "mode": "text" | "summary", "text": "..." }`
  - Calls OpenRouter and returns real generated content.
- `GET /api/test-openrouter`
  - Calls OpenRouter with a connectivity prompt and returns the live response.

Both routes log whether `OPENROUTER_API_KEY` is detected.

## Frontend behavior

`public/app.js` calls `/api/generate` directly via `fetch` and displays a visible error message if generation fails.

## Local quick check

```bash
node --test test/ai.spec.js
```

## Vercel redeploy after env changes

After changing environment variables in Vercel, trigger a fresh deployment so functions pick up new values:

1. Update project env vars in Vercel dashboard.
2. Redeploy the latest commit (or push a no-op commit).
3. Hit `/api/test-openrouter` and confirm `status: "ok"`.
