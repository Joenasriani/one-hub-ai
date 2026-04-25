const { openRouterChat } = require('./openrouterClient');

function requireTextInput(value, fieldName) {
  const normalized = typeof value === 'string' ? value.trim() : '';

  if (!normalized) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalized;
}

/**
 * Build traceable media instructions in two stages:
 * 1) LLM generation step (prompt/scripts/metadata)
 * 2) Renderer step (external service execution)
 */
async function buildMediaWorkflow({ type, goal, constraints = [] }) {
  const normalizedType = requireTextInput(type, 'type');
  const normalizedGoal = requireTextInput(goal, 'goal');
  const normalizedConstraints = Array.isArray(constraints)
    ? constraints.map((item) => (typeof item === 'string' ? item.trim() : '')).filter(Boolean)
    : [];

  const llmStep = await openRouterChat({
    task: `${normalizedType}_prompt_generation`,
    messages: [
      {
        role: 'system',
        content:
          'Return JSON with keys: prompt, metadata, script, captions, render_instructions. Keep output practical.',
      },
      {
        role: 'user',
        content: `Media type: ${normalizedType}\nGoal: ${normalizedGoal}\nConstraints: ${normalizedConstraints.join(', ') || 'none'}`,
      },
    ],
  });

  return {
    llm_generation: {
      provider: llmStep.provider,
      model: llmStep.model,
      task: llmStep.task,
      payload: llmStep.output,
    },
    media_rendering: {
      status: 'pending_external_tool',
      notes:
        'Use your selected media renderer to execute render_instructions. This repository only handles the LLM generation step.',
    },
  };
}

module.exports = {
  buildMediaWorkflow,
};
