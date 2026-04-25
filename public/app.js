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

    outputElement.textContent = data.output;
  } catch (error) {
    outputElement.textContent = '';
    errorElement.textContent = `Generation failed: ${error.message}`;
  }
}

document.getElementById('generateBtn').addEventListener('click', () => requestGeneration('text'));
document.getElementById('summaryBtn').addEventListener('click', () => requestGeneration('summary'));
