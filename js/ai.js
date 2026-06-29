// AI Assist frontend handler
(() => {
  let lastFocused = null;

  // track last focused input/textarea so we can insert
  document.addEventListener('focusin', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && t.type === 'text'))) {
      lastFocused = t;
    }
  });

  const openBtn = document.getElementById('openAiAssist');
  const modal = document.getElementById('aiAssistModal');
  const closeBtn = modal && modal.querySelector('.ai-close');
  const generateBtn = document.getElementById('generateBullets');
  const insertBtn = document.getElementById('insertBullets');
  const aiTitle = document.getElementById('aiTitle');
  const aiDescription = document.getElementById('aiDescription');
  const aiResults = document.getElementById('aiResults');
  const spinner = document.getElementById('aiSpinner');

  function openModal() {
    // if user has focused a textarea, prefill description
    if (lastFocused && lastFocused.value) {
      aiDescription.value = lastFocused.value;
    }
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  async function generate() {
    const title = aiTitle.value.trim();
    const description = aiDescription.value.trim();
    if (!description) return alert('Please enter a description or focus a field first.');

    generateBtn.disabled = true;
    spinner.style.display = 'block';
    aiResults.innerHTML = '';
    insertBtn.disabled = true;

    try {
      const resp = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bullets', title, description })
      });
      const data = await resp.json();
      if (!resp.ok) {
        const serverError = data && data.error ? data.error : (data && data.message ? data.message : 'AI request failed');
        throw new Error(serverError);
      }

      let bullets = data.bullets || [];

      // Normalization: some models return a single string with newlines or bullet markers.
      // If we get a single multiline string, split into lines and clean each line.
      function normalizeArray(arr) {
        if (!Array.isArray(arr)) return [];
        // If single element that contains newlines, split it
        if (arr.length === 1 && typeof arr[0] === 'string' && arr[0].includes('\n')) {
          const lines = arr[0].split('\n').map(l => l.trim()).filter(Boolean);
          return lines.map(l => l.replace(/^[-•\*\d\.\)\s]+/, '').trim()).filter(Boolean);
        }
        // Otherwise, coerce each item to string and clean
        return arr.map(item => String(item || '').trim().replace(/^[-•\*\d\.\)\s]+/, '')).filter(Boolean);
      }

      bullets = normalizeArray(bullets);

      if (bullets.length === 0) {
        // Show raw content when no structured bullets were derived (helpful for debugging)
        const raw = data.raw || '';
        aiResults.innerHTML = '<p>No suggestions returned.</p>' + (raw ? `<pre style="white-space:pre-wrap;margin-top:0.5rem;color:var(--text-light);">${raw}</pre>` : '');
      } else {
        const ul = document.createElement('ul');
        ul.style.paddingLeft = '1.2rem';
        bullets.forEach(b => {
          const li = document.createElement('li');
          li.textContent = b;
          ul.appendChild(li);
        });
        aiResults.appendChild(ul);
        insertBtn.disabled = !lastFocused;
      }
    } catch (err) {
      aiResults.innerHTML = `<p style="color:var(--gmu-gold);">Error: ${err.message}</p>`;
    } finally {
      generateBtn.disabled = false;
      spinner.style.display = 'none';
    }
  }

  async function insertBullets() {
    if (!lastFocused) return alert('No field selected to insert into. Click a textarea and try again.');
    const list = aiResults.querySelectorAll('li');
    if (!list.length) return alert('No generated bullets to insert.');

    // Insert bullets as newline-separated list
    const bullets = Array.from(list).map(li => '• ' + li.textContent).join('\n');
    // If lastFocused is textarea, replace value or append
    if (lastFocused.tagName === 'TEXTAREA' || lastFocused.tagName === 'INPUT') {
      const prev = lastFocused.value || '';
      lastFocused.value = prev ? prev + '\n' + bullets : bullets;
      lastFocused.focus();
    }
    insertBtn.disabled = true;
    closeModal();
  }

  if (generateBtn) generateBtn.addEventListener('click', generate);
  if (insertBtn) insertBtn.addEventListener('click', insertBullets);

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

})();
