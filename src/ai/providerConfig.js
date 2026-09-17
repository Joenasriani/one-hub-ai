const DEFAULT_PROVIDER = 'openrouter';
const DEFAULT_MODEL = 'openrouter/free';
const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1';

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveValue(overrides, key, envValue, fallback = '') {
  if (Object.prototype.hasOwnProperty.call(overrides, key)) {
    return overrides[key];
  }

  return envValue || fallback;
}

function getProviderConfig(overrides = {}) {
  const provider = normalizeString(
    resolveValue(overrides, 'provider', process.env.AI_PROVIDER, DEFAULT_PROVIDER)
  );
  const model = normalizeString(
    resolveValue(overrides, 'model', process.env.AI_MODEL, DEFAULT_MODEL)
  );
  const apiKey = normalizeString(
    resolveValue(overrides, 'apiKey', process.env.OPENROUTER_API_KEY)
  );
  const baseUrl = normalizeString(
    resolveValue(overrides, 'baseUrl', process.env.OPENROUTER_BASE_URL, DEFAULT_BASE_URL)
  ).replace(/\/+$/, '');

  if (!apiKey) {
    throw new Error('Missing OPENROUTER_API_KEY. Set OPENROUTER_API_KEY to call OpenRouter.');
  }

  if (provider !== DEFAULT_PROVIDER) {
    throw new Error('Only the OpenRouter provider is allowed in this repository.');
  }

  if (model !== DEFAULT_MODEL) {
    throw new Error('Only the free-only OpenRouter router (openrouter/free) is allowed.');
  }

  if (baseUrl !== DEFAULT_BASE_URL) {
    throw new Error('Only the official OpenRouter API base URL is allowed.');
  }

  return {
    provider: DEFAULT_PROVIDER,
    model: DEFAULT_MODEL,
    apiKey,
    baseUrl: DEFAULT_BASE_URL,
  };
}

module.exports = {
  DEFAULT_PROVIDER,
  DEFAULT_MODEL,
  DEFAULT_BASE_URL,
  getProviderConfig,
};
