const { openRouterChat } = require('../src/ai/openrouterClient');

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed. Use GET.' });
    return;
  }

  const apiKeyDetected = Boolean(process.env.OPENROUTER_API_KEY);
  console.log(`[api/test-openrouter] OPENROUTER_API_KEY detected: ${apiKeyDetected}`);

  try {
    const result = await openRouterChat({
      task: 'connectivity_test',
      messages: [{ role: 'user', content: 'Reply with: OPENROUTER_OK' }],
    });

    sendJson(res, 200, {
      status: 'ok',
      provider: result.provider,
      model: result.model,
      output: result.output,
    });
  } catch (error) {
    console.error('[api/test-openrouter] Request failed:', error.message);
    sendJson(res, 500, {
      status: 'error',
      error: error.message || 'OpenRouter connectivity test failed.',
    });
  }
};
