const { getProviderConfig } = require('./providerConfig');

async function openRouterChat({
  messages,
  task,
  metadata = {},
  overrides = {},
}) {
  const config = getProviderConfig(overrides);

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      metadata: {
        ...metadata,
        task,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;

  return {
    provider: config.provider,
    model: data?.model || config.model,
    task,
    output: content,
    raw: data,
  };
}

module.exports = {
  openRouterChat,
};
