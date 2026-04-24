const { openRouterChat } = require('./openrouterClient');

async function generateText({ prompt, systemPrompt = 'You are a helpful AI assistant.' }) {
  return openRouterChat({
    task: 'text_generation',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
  });
}

async function generateSummary({ sourceText }) {
  return openRouterChat({
    task: 'research_summary',
    messages: [
      {
        role: 'system',
        content: 'Summarize the provided content with concise bullets and key takeaways.',
      },
      { role: 'user', content: sourceText },
    ],
  });
}

module.exports = {
  generateText,
  generateSummary,
};
