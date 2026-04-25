const { openRouterChat } = require('./openrouterClient');

function requireTextInput(value, fieldName) {
  const normalized = typeof value === 'string' ? value.trim() : '';

  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalized;
}

function extractJsonObject(rawOutput) {
  const text = requireTextInput(rawOutput, 'model output');

  const fencedMatch = text.match(/```json\s*([\s\S]*?)\s*```/i) || text.match(/```\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch ? fencedMatch[1] : text;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error('Model did not return valid JSON.');
  }
}

function requireField(object, fieldName) {
  const value = typeof object?.[fieldName] === 'string' ? object[fieldName].trim() : '';
  if (!value) {
    throw new Error(`Generated payload missing required field: ${fieldName}`);
  }
  return value;
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

async function generateStoryboard({ context }) {
  const normalizedContext = requireTextInput(context, 'context');

  const response = await openRouterChat({
    task: 'storyboard_generation',
    messages: [
      {
        role: 'system',
        content:
          'Return ONLY valid JSON with keys: frameTitle, frameDescription, cameraDirection, twist. Each value must be non-empty text. No markdown.',
      },
      {
        role: 'user',
        content: `Context: ${normalizedContext}`,
      },
    ],
  });

  const parsed = extractJsonObject(response.output);

  return {
    ...response,
    structured: {
      frameTitle: requireField(parsed, 'frameTitle'),
      frameDescription: requireField(parsed, 'frameDescription'),
      cameraDirection: requireField(parsed, 'cameraDirection'),
      twist: requireField(parsed, 'twist'),
    },
  };
}

async function generateAdCreative({ context }) {
  const normalizedContext = requireTextInput(context, 'context');

  const response = await openRouterChat({
    task: 'ad_creative_generation',
    messages: [
      {
        role: 'system',
        content:
          'Return ONLY valid JSON with keys: headline, subheadline, cta, visualPrompt, imageAlt. Keep all fields non-empty. No markdown.',
      },
      {
        role: 'user',
        content: `Product/Domain context: ${normalizedContext}`,
      },
    ],
  });

  const parsed = extractJsonObject(response.output);

  return {
    ...response,
    structured: {
      headline: requireField(parsed, 'headline'),
      subheadline: requireField(parsed, 'subheadline'),
      cta: requireField(parsed, 'cta'),
      visualPrompt: requireField(parsed, 'visualPrompt'),
      imageAlt: requireField(parsed, 'imageAlt'),
    },
  };
}

module.exports = {
  extractJsonObject,
  generateText,
  generateSummary,
  generateStoryboard,
  generateAdCreative,
};
