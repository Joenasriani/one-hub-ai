# OpenRouter Route Audit

Original audit date: 2026-04-25  
Contract corrected: 2026-09-17

## Verification checklist

1. **Backend route calling OpenRouter**
   - `api/generate.js` calls `generateText` / `generateSummary`.
   - `api/test-openrouter.js` calls `openRouterChat` directly.

2. **Uses `process.env.OPENROUTER_API_KEY`**
   - `src/ai/providerConfig.js` resolves the API key from `process.env.OPENROUTER_API_KEY`.

3. **Free-only model enforcement**
   - Provider is restricted to `openrouter`.
   - Requested model is restricted to `openrouter/free`.
   - Alternate model configuration is rejected before a request is sent.
   - API base URL is restricted to `https://openrouter.ai/api/v1`.

4. **Frontend calls backend route**
   - `public/app.js` sends requests to `/api/generate`.

5. **Supported generation modes**
   - `text`
   - `summary`
   - Unsupported modes return HTTP 400.

6. **Error handling**
   - Malformed JSON request bodies return HTTP 400.
   - Provider failures are returned as explicit JSON errors.
   - Frontend displays visible error text in the `#error` element.

7. **Timeout handling**
   - Invalid/non-positive timeout configuration falls back to 30000 ms.
   - Timeout protection remains active through response-body parsing.

8. **Assistant content normalization**
   - String assistant content is accepted.
   - Array-style text content is normalized to a string.

9. **Test endpoint**
   - `GET /api/test-openrouter` is implemented.

## Evidence boundary

This document describes the repository code contract. It does not by itself prove upstream availability, production uptime, public-scale reliability, or external security certification.
