const DEFAULT_PROVIDER = 'openrouter';
const DEFAULT_MODEL = 'openrouter/auto';

function getProviderConfig(overrides = {}) {
  const provider = overrides.provider || process.env.AI_PROVIDER || DEFAULT_PROVIDER;
  const model = overrides.model || process.env.AI_MODEL || DEFAULT_MODEL;
  const apiKey = overrides.apiKey || process.env.ROBOMARKET_API;

  if (!apiKey) {
    throw new Error(
      'Missing ROBOMARKET_API. Set ROBOMARKET_API to call OpenRouter Auto Free model.'
    );
  }

  if (provider !== DEFAULT_PROVIDER) {
    return {
      provider,
      model,
      apiKey,
      baseUrl: overrides.baseUrl || process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    };
  }

  return {
    provider: DEFAULT_PROVIDER,
    model,
    apiKey,
    baseUrl: overrides.baseUrl || process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  };
}

module.exports = {
  DEFAULT_PROVIDER,
  DEFAULT_MODEL,
  getProviderConfig,
};
