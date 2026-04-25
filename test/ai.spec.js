const test = require('node:test');
const assert = require('node:assert/strict');

const { getProviderConfig } = require('../src/ai/providerConfig');
const { openRouterChat } = require('../src/ai/openrouterClient');
const { generateText, generateSummary } = require('../src/ai/generate');
const { buildMediaWorkflow } = require('../src/ai/mediaWorkflow');

test('getProviderConfig uses defaults and trims values', () => {
  const cfg = getProviderConfig({ apiKey: '  abc123  ' });
  assert.equal(cfg.provider, 'openrouter');
  assert.equal(cfg.model, 'openrouter/auto');
  assert.equal(cfg.apiKey, 'abc123');
  assert.equal(cfg.baseUrl, 'https://openrouter.ai/api/v1');
});

test('getProviderConfig throws when api key is missing', () => {
  assert.throws(() => getProviderConfig({ apiKey: '   ' }), /Missing ROBOMARKET_API/);
});

test('openRouterChat throws on malformed messages', async () => {
  await assert.rejects(
    () => openRouterChat({ task: 'x', messages: [] }),
    /messages must be a non-empty array/
  );
});

test('openRouterChat returns normalized response on success', async () => {
  const originalFetch = global.fetch;

  try {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        model: 'openrouter/auto',
        choices: [{ message: { content: 'hello world' } }],
      }),
    });

    const res = await openRouterChat({
      task: 'text_generation',
      messages: [{ role: 'user', content: 'hi' }],
      overrides: { apiKey: 'test_key' },
    });

    assert.equal(res.provider, 'openrouter');
    assert.equal(res.model, 'openrouter/auto');
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
