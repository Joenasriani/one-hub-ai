const { openRouterChat } = require('./openrouterClient');

function requireTextInput(value, fieldName) {
  const normalized = typeof value === 'string' ? value.trim() : '';

  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalized;
}

async function generateText({ prompt, systemPrompt = 'You are a helpful AI assistant.' }) {
  const normalizedPrompt = requireTextInput(prompt, 'prompt');
  const normalizedSystemPrompt = requireTextInput(systemPrompt, 'systemPrompt');

  return openRouterChat({
    task: 'text_generation',
    messages: [
      { role: 'system', content: normalizedSystemPrompt },
      { role: 'user', content: normalizedPrompt },
    ],
  });
}

async function generateSummary({ sourceText }) {
  const normalizedSourceText = requireTextInput(sourceText, 'sourceText');

  return openRouterChat({
    task: 'research_summary',
    messages: [
      {
        role: 'system',
        content: 'Summarize the provided content with concise bullets and key takeaways.',
      },
      { role: 'user', content: normalizedSourceText },
    ],
  });
}

module.exports = {
  generateText,
  generateSummary,
};
