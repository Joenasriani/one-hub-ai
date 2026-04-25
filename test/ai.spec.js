const test = require('node:test');
const assert = require('node:assert/strict');
const { Readable, Writable } = require('node:stream');

const { getProviderConfig } = require('../src/ai/providerConfig');
const { openRouterChat } = require('../src/ai/openrouterClient');
const { generateText, generateSummary } = require('../src/ai/generate');
const { buildMediaWorkflow } = require('../src/ai/mediaWorkflow');
const generateHandler = require('../api/generate');
const testOpenRouterHandler = require('../api/test-openrouter');

function createMockReq({ method = 'GET', body } = {}) {
  const req = new Readable({ read() {} });
  req.method = method;

  if (body !== undefined) {
    req.push(typeof body === 'string' ? body : JSON.stringify(body));
  }

  req.push(null);
  return req;
}

function createMockRes() {
  let body = '';
  const headers = {};

  const res = new Writable({
    write(chunk, _encoding, callback) {
      body += chunk.toString();
      callback();
    },
  });

  res.statusCode = 200;
  res.setHeader = (name, value) => {
    headers[name.toLowerCase()] = value;
  };
  res.end = (chunk = '') => {
    if (chunk) {
      body += chunk.toString();
    }
    res.finished = true;
  };

  return {
    res,
    readBody: () => (body ? JSON.parse(body) : {}),
    headers,
  };
}

test('getProviderConfig uses defaults and trims values', () => {
  const cfg = getProviderConfig({ apiKey: '  abc123  ' });
  assert.equal(cfg.provider, 'openrouter');
  assert.equal(cfg.model, 'openrouter/auto');
  assert.equal(cfg.apiKey, 'abc123');
  assert.equal(cfg.baseUrl, 'https://openrouter.ai/api/v1');
});

test('getProviderConfig throws when api key is missing', () => {
  assert.throws(() => getProviderConfig({ apiKey: '   ' }), /Missing OPENROUTER_API_KEY/);
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

test('POST /api/generate returns live payload shape', async () => {
  const originalFetch = global.fetch;
  const previousKey = process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY = 'test_key';

  try {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        model: 'openrouter/auto',
        choices: [{ message: { content: 'generated from route' } }],
      }),
    });

    const req = createMockReq({ method: 'POST', body: { mode: 'text', text: 'hello' } });
    const { res, readBody } = createMockRes();

    await generateHandler(req, res);

    assert.equal(res.statusCode, 200);
    const payload = readBody();
    assert.equal(payload.output, 'generated from route');
    assert.equal(payload.provider, 'openrouter');
  } finally {
    global.fetch = originalFetch;
    process.env.OPENROUTER_API_KEY = previousKey;
  }
});

test('GET /api/test-openrouter returns connectivity response', async () => {
  const originalFetch = global.fetch;
  const previousKey = process.env.OPENROUTER_API_KEY;
  process.env.OPENROUTER_API_KEY = 'test_key';

  try {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({
        model: 'openrouter/auto',
        choices: [{ message: { content: 'OPENROUTER_OK' } }],
      }),
    });

    const req = createMockReq({ method: 'GET' });
    const { res, readBody } = createMockRes();

    await testOpenRouterHandler(req, res);

    assert.equal(res.statusCode, 200);
    const payload = readBody();
    assert.equal(payload.status, 'ok');
    assert.match(payload.output, /OPENROUTER_OK/);
  } finally {
    global.fetch = originalFetch;
    process.env.OPENROUTER_API_KEY = previousKey;
  }
});
