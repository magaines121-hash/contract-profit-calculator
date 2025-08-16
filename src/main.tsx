import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function ensureRoot() {
  let el = document.getElementById('root');
  if (!el) {
    el = document.createElement('div');
    el.id = 'root';
    document.body.appendChild(el);
  }
  return el;
}

function showError(e: any) {
  const el = ensureRoot();
  el.innerHTML = '<pre style="white-space:pre-wrap;color:red;padding:16px;"></pre>';
  el.querySelector('pre')!.textContent =
    `Failed to load App:\n${e?.message || e}\n\n${e?.stack || ''}`;
  console.error(e);
}

// Dynamically import App so module-load errors are caught and shown
(async () => {
  try {
    const { default: App } = await import('./App');
    ReactDOM.createRoot(ensureRoot()).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (e) {
    showError(e);
  }
})();
