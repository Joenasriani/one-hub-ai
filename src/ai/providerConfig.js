const DEFAULT_PROVIDER = 'openrouter';
const DEFAULT_MODEL = 'openrouter/auto';
const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function getProviderConfig(overrides = {}) {
  const provider = normalizeString(overrides.provider || process.env.AI_PROVIDER || DEFAULT_PROVIDER);
  const model = normalizeString(overrides.model || process.env.AI_MODEL || DEFAULT_MODEL);
  const apiKey = normalizeString(overrides.apiKey || process.env.ROBOMARKET_API);
  const baseUrl = normalizeString(overrides.baseUrl || process.env.OPENROUTER_BASE_URL || DEFAULT_BASE_URL);

  if (!apiKey) {
    throw new Error(
      'Missing ROBOMARKET_API. Set ROBOMARKET_API to call OpenRouter Auto Free model.'
    );
  }

  if (!provider) {
    throw new Error('AI provider is required.');
  }

  if (!model) {
    throw new Error('AI model is required.');
  }

  if (!baseUrl) {
    throw new Error('AI base URL is required.');
  }

  if (provider !== DEFAULT_PROVIDER) {
    return {
      provider,
      model,
      apiKey,
      baseUrl,
    };
  }

  return {
    provider: DEFAULT_PROVIDER,
    model,
    apiKey,
    baseUrl,
  };
}

module.exports = {
  DEFAULT_PROVIDER,
  DEFAULT_MODEL,
  DEFAULT_BASE_URL,
  getProviderConfig,
};
