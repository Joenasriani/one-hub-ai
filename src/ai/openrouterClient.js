const { getProviderConfig } = require('./providerConfig');

const DEFAULT_TIMEOUT_MS = 30000;

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

function normalizeAssistantContent(content) {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .map((part) => {
      if (typeof part === 'string') {
        return part.trim();
      }

      if (!part || typeof part !== 'object') {
        return '';
      }

      if (typeof part.text === 'string') {
        return part.text.trim();
      }

      if (typeof part.content === 'string') {
        return part.content.trim();
      }

      return '';
    })
    .filter(Boolean)
    .join('\n')
    .trim();
}

function normalizeTimeoutMs(value) {
  const timeout = Number(value);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT_MS;
}

async function openRouterChat({
  messages,
  task,
  metadata = {},
  overrides = {},
  timeoutMs = process.env.OPENROUTER_TIMEOUT_MS || DEFAULT_TIMEOUT_MS,
}) {
  const normalizedTask = typeof task === 'string' ? task.trim() : '';

  if (!normalizedTask) {
    throw new Error('task is required.');
  }

  const normalizedMessages = normalizeMessages(messages);
  const config = getProviderConfig(overrides);
  const effectiveTimeoutMs = normalizeTimeoutMs(timeoutMs);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), effectiveTimeoutMs);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
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

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenRouter request failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    const content = normalizeAssistantContent(data?.choices?.[0]?.message?.content);

    if (!content) {
      throw new Error('OpenRouter response did not include a usable assistant message.');
    }

    return {
      provider: config.provider,
      model: data?.model || config.model,
      task: normalizedTask,
      output: content,
      raw: data,
    };
  } catch (error) {
    if (error && error.name === 'AbortError') {
      throw new Error(`OpenRouter request timed out after ${effectiveTimeoutMs}ms.`);
    }

    if (error instanceof Error && error.message.startsWith('OpenRouter ')) {
      throw error;
    }

    throw new Error(`OpenRouter request failed: ${error?.message || 'Unknown error.'}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  DEFAULT_TIMEOUT_MS,
  normalizeAssistantContent,
  normalizeTimeoutMs,
  openRouterChat,
};
