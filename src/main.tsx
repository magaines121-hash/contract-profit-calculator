import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

function ensureRoot() {
  const el = document.getElementById('root');
  if (!el) {
    const pre = document.createElement('pre');
    pre.textContent = 'Missing <div id="root"></div> in index.html';
    document.body.appendChild(pre);
    throw new Error('No #root element');
  }
  return el;
}

class ErrorBoundary extends React.Component<any, { error: any }> {
  constructor(p:any){ super(p); this.state = { error: null }; }
  static getDerivedStateFromError(error:any){ return { error }; }
  componentDidCatch(e:any){ console.error(e); }
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

ReactDOM.createRoot(ensureRoot()).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
