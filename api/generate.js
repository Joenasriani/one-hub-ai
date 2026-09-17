const { generateText, generateSummary } = require('../src/ai/generate');

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (error) {
        const parseError = new Error('Invalid JSON body.');
        parseError.statusCode = 400;
        reject(parseError);
      }
    });

    req.on('error', (error) => reject(error));
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
    return;
  }

  const apiKeyDetected = Boolean(process.env.OPENROUTER_API_KEY);
  console.log(`[api/generate] OPENROUTER_API_KEY detected: ${apiKeyDetected}`);

  try {
    const body = await readRequestBody(req);
    const requestedMode = typeof body.mode === 'string' ? body.mode.trim() : 'text';

    if (!['text', 'summary'].includes(requestedMode)) {
      sendJson(res, 400, { error: 'Unsupported mode. Use "text" or "summary".' });
      return;
    }

    const text = typeof body.text === 'string' ? body.text.trim() : '';

    if (!text) {
      sendJson(res, 400, { error: 'text is required.' });
      return;
    }

    const result = requestedMode === 'summary'
      ? await generateSummary({ sourceText: text })
      : await generateText({ prompt: text });

    sendJson(res, 200, {
      mode: requestedMode,
      provider: result.provider,
      model: result.model,
      output: result.output,
      task: result.task,
    });
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    console.error('[api/generate] Request failed:', error.message);
    sendJson(res, statusCode, { error: error.message || 'Failed to generate output.' });
  }
};
