const {
  generateText,
  generateSummary,
  generateStoryboard,
  generateAdCreative,
} = require('../src/ai/generate');

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
      } catch {
        reject(new Error('Invalid JSON body.'));
      }
    });
    req.on('error', (error) => reject(error));
  });
}

function mapErrorStatus(errorMessage) {
  if (!errorMessage) return 500;
  if (errorMessage.includes('required') || errorMessage.includes('Invalid JSON')) return 400;
  if (errorMessage.includes('Missing OPENROUTER_API_KEY')) return 500;
  if (errorMessage.includes('timed out')) return 504;
  return 500;
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
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const mode = typeof body.mode === 'string' ? body.mode.trim() : 'text';

    if (!text) {
      sendJson(res, 400, { error: 'text is required.' });
      return;
    }

    let result;
    switch (mode) {
      case 'summary':
        result = await generateSummary({ sourceText: text });
        break;
      case 'storyboard':
        result = await generateStoryboard({ context: text });
        break;
      case 'adCreative':
        result = await generateAdCreative({ context: text });
        break;
      case 'text':
      default:
        result = await generateText({ prompt: text });
        break;
    }

    sendJson(res, 200, {
      mode,
      provider: result.provider,
      model: result.model,
      output: result.output,
      structured: result.structured || null,
      task: result.task,
    });
  } catch (error) {
    const message = error?.message || 'Failed to generate output.';
    const statusCode = mapErrorStatus(message);
    console.error('[api/generate] Request failed:', message);
    sendJson(res, statusCode, { error: message });
  }
};
