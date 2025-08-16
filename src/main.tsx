import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

function safeGetRoot() {
  const el = document.getElementById('root');
  if (!el) {
    const msg = document.createElement('pre');
    msg.textContent = 'Missing <div id="root"></div> in index.html';
    document.body.appendChild(msg);
    throw new Error('No #root element');
  }
  return el;
}

// lightweight error boundary to show errors on screen
class ErrorBoundary extends React.Component<any, {error: any}> {
  constructor(props:any){ super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error:any){ return { error }; }
  componentDidCatch(err:any){ console.error(err); }
  render(){
    if (this.state.error) {
      return (
        <pre style={{whiteSpace:'pre-wrap', color:'red', padding:'16px'}}>
{String(this.state.error?.message || this.state.error)}
{'\n'}{String(this.state.error?.stack || '')}
        </pre>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(safeGetRoot()).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// also catch global errors
window.addEventListener('error', (e) => {
  const el = safeGetRoot();
  el.innerHTML = '<pre style="white-space:pre-wrap;color:red;padding:16px;"></pre>';
  el.querySelector('pre')!.textContent = `JS Error: ${e.message}\n${e.error?.stack || ''}`;
});
