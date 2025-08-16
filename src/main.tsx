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

function showFatal(message: string) {
  const el = ensureRoot();
  el.innerHTML = '<pre style="white-space:pre-wrap;color:red;padding:16px;"></pre>';
  el.querySelector('pre')!.textContent = message;
  console.error(message);
}

// Error Boundary to catch render-time errors
class ErrorBoundary extends React.Component<any, { error: any }> {
  constructor(p:any){ super(p); this.state = { error: null }; }
  static getDerivedStateFromError(error:any){ return { error }; }
  componentDidCatch(e:any){ console.error('React error:', e); }
  render(){
    if (this.state.error) {
      return (
        <pre style={{whiteSpace:'pre-wrap', color:'red', padding:16}}>
{String(this.state.error?.message || this.state.error)}
{'\n'}{String(this.state.error?.stack || '')}
        </pre>
      );
    }
    return this.props.children;
  }
}

// Dynamically import App so module-load errors are caught,
// and also wrap App in ErrorBoundary for render errors.
(async () => {
  try {
    const { default: App } = await import('./App');
    ReactDOM.createRoot(ensureRoot()).render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
  } catch (e: any) {
    showFatal(`Failed to load App:\n${e?.message || String(e)}\n\n${e?.stack || ''}`);
  }
})();

// Catch non-React errors too
window.addEventListener('error', (e) => {
  showFatal(`JS Error: ${e.message}\n${e.error?.stack || ''}`);
});
window.addEventListener('unhandledrejection', (e:any) => {
  showFatal(`Unhandled Promise Rejection: ${e?.reason?.message || String(e?.reason)}`);
});
