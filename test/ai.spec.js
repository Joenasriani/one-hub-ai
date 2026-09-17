const test = require('node:test');
const assert = require('node:assert/strict');

const { getProviderConfig } = require('../src/ai/providerConfig');
const {
  normalizeAssistantContent,
  normalizeTimeoutMs,
  openRouterChat,
} = require('../src/ai/openrouterClient');
const { generateText, generateSummary } = require('../src/ai/generate');
const { buildMediaWorkflow } = require('../src/ai/mediaWorkflow');

test('getProviderConfig enforces OpenRouter free-only defaults', () => {
  const cfg = getProviderConfig({
    apiKey: '  abc123  ',
    provider: 'openrouter',
    model: 'openrouter/free',
    baseUrl: 'https://openrouter.ai/api/v1',
  });

  assert.equal(cfg.provider, 'openrouter');
  assert.equal(cfg.model, 'openrouter/free');
  assert.equal(cfg.apiKey, 'abc123');
  assert.equal(cfg.baseUrl, 'https://openrouter.ai/api/v1');
});

test('getProviderConfig throws when OpenRouter API key is missing', () => {
  assert.throws(
    () => getProviderConfig({ apiKey: '', provider: 'openrouter', model: 'openrouter/free' }),
    /Missing OPENROUTER_API_KEY/
  );
});

test('getProviderConfig rejects non-free model configuration', () => {
  assert.throws(
    () => getProviderConfig({ apiKey: 'x', model: 'openrouter\/auto' }),
    /Only the free-only OpenRouter router/
  );
});

test('normalizeAssistantContent handles strings and content arrays', () => {
  assert.equal(normalizeAssistantContent(' hello '), 'hello');
  assert.equal(
    normalizeAssistantContent([{ type: 'text', text: 'hello' }, { type: 'text', text: 'world' }]),
    'hello\nworld'
  );
});

test('normalizeTimeoutMs falls back for invalid values', () => {
  assert.equal(normalizeTimeoutMs('abc'), 30000);
  assert.equal(normalizeTimeoutMs(0), 30000);
  assert.equal(normalizeTimeoutMs(-1), 30000);
  assert.equal(normalizeTimeoutMs(1500), 1500);
});

test('openRouterChat throws on malformed messages', async () => {
  await assert.rejects(
    () => openRouterChat({ task: 'x', messages: [], overrides: { apiKey: 'test_key' } }),
    /messages must be a non-empty array/
  );
});

test('openRouterChat sends requests through openrouter/free', async () => {
  const originalFetch = global.fetch;
  let requestBody;

  try {
    global.fetch = async (_url, options) => {
      requestBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          model: 'resolved-free-model',
          choices: [{ message: { content: 'hello world' } }],
        }),
      };
    };

    const res = await openRouterChat({
      task: 'text_generation',
      messages: [{ role: 'user', content: 'hi' }],
      overrides: { apiKey: 'test_key' },
    });

    assert.equal(requestBody.model, 'openrouter/free');
    assert.equal(res.provider, 'openrouter');
    assert.equal(res.output, 'hello world');
  } finally {
    global.fetch = originalFetch;
  }
});

test('generate helpers validate input', async () => {
  await assert.rejects(() => generateText({ prompt: '' }), /prompt is required/);
  await assert.rejects(() => generateSummary({ sourceText: ' ' }), /sourceText is required/);
});

test('buildMediaWorkflow validates required fields', async () => {
  await assert.rejects(() => buildMediaWorkflow({ type: '', goal: 'x' }), /type is required/);
  await assert.rejects(() => buildMediaWorkflow({ type: 'video', goal: '' }), /goal is required/);
});
