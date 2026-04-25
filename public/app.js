function renderStructured(mode, structured) {
  if (!structured) return '';

  if (mode === 'storyboard') {
    return [
      `Frame Title: ${structured.frameTitle}`,
      `Frame Description: ${structured.frameDescription}`,
      `Camera Direction: ${structured.cameraDirection}`,
      `Twist: ${structured.twist}`,
    ].join('\n');
  }

  if (mode === 'adCreative') {
    return [
      `Headline: ${structured.headline}`,
      `Subheadline: ${structured.subheadline}`,
      `CTA: ${structured.cta}`,
      `Visual Prompt: ${structured.visualPrompt}`,
      `Image Alt: ${structured.imageAlt}`,
    ].join('\n');
  }

  return '';
}

async function requestGeneration(mode) {
  const promptElement = document.getElementById('prompt');
  const errorElement = document.getElementById('error');
  const outputElement = document.getElementById('output');

  errorElement.textContent = '';
  outputElement.textContent = 'Working...';

  const text = promptElement.value.trim();

  if (!text) {
    errorElement.textContent = 'Please enter text before submitting.';
    outputElement.textContent = '';
    return;
  }

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, text }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Generation failed.');
    }

    const structuredText = renderStructured(mode, data.structured);
    outputElement.textContent = structuredText || data.output;
  } catch (error) {
    outputElement.textContent = '';
    errorElement.textContent = `Generation failed: ${error.message}`;
  }
}

document.getElementById('generateBtn').addEventListener('click', () => requestGeneration('text'));
document.getElementById('summaryBtn').addEventListener('click', () => requestGeneration('summary'));
document.getElementById('storyboardBtn').addEventListener('click', () => requestGeneration('storyboard'));
document.getElementById('adCreativeBtn').addEventListener('click', () => requestGeneration('adCreative'));
