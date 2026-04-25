const { getProviderConfig } = require('./providerConfig');

function normalizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages must be a non-empty array.');
  }

  return messages.map((message, index) => {
    if (!message || typeof message !== 'object') {
      throw new Error(`messages[${index}] must be an object.`);
    }

    const role = typeof message.role === 'string' ? message.role.trim() : '';
    const content = typeof message.content === 'string' ? message.content.trim() : '';

    if (!role || !content) {
      throw new Error(`messages[${index}] must include non-empty role and content.`);
    }

    return { role, content };
  });
}

async function openRouterChat({
  messages,
  task,
  metadata = {},
  overrides = {},
  timeoutMs = Number(process.env.OPENROUTER_TIMEOUT_MS || 30000),
}) {
  const normalizedTask = typeof task === 'string' ? task.trim() : '';

  if (!normalizedTask) {
    throw new Error('task is required.');
  }

  const normalizedMessages = normalizeMessages(messages);
  const config = getProviderConfig(overrides);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;

  try {
    response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: normalizedMessages,
        metadata: {
          ...metadata,
          task: normalizedTask,
        },
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (error && error.name === 'AbortError') {
      throw new Error(`OpenRouter request timed out after ${timeoutMs}ms.`);
    }

    throw new Error(`OpenRouter request failed before response: ${error.message}`);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenRouter request failed (${response.status}): ${body}`);
  }

  const data = await response.json();
  const content = normalizeAssistantContent(data?.choices?.[0]?.message?.content);

  if (!content) {
    throw new Error('OpenRouter response did not include a usable assistant message.');
  }

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('OpenRouter response did not include a usable assistant message.');
  }

  return {
    provider: config.provider,
    model: data?.model || config.model,
    task: normalizedTask,
    output: content,
    raw: data,
  };
}

module.exports = {
  normalizeAssistantContent,
  openRouterChat,
};
