import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import LoginCard from './LoginCard';

function Mask({ value }: { value?: string }) {
  if (!value) return <code>missing</code>;
  return <code>{value.slice(0, 8)}…{value.slice(-6)}</code>;
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState('boot');

  useEffect(() => {
    setStatus('getSession…');
    supabase.auth.getSession()
      .then(({ data }) => {
        setSession(data.session ?? null);
        setStatus('listening');
      })
      .catch(e => {
        setStatus('getSession error: ' + (e?.message || String(e)));
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => {
      setSession(sess);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto' }}>
      <h1 style={{ marginTop: 0 }}>Contract Profit Calculator — Diagnostics</h1>

      <div style={{ padding: 12, background: '#F0F7FF', border: '1px solid #CCE0FF', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
        <div><strong>Status:</strong> {status}</div>
        <div><strong>env.URL:</strong> <code>{envUrl || 'missing'}</code></div>
        <div><strong>env.KEY:</strong> <Mask value={envKey} /></div>
        <div><strong>session:</strong> <code>{session?.user?.email || 'none'}</code></div>
      </div>

      {!session ? (
        <>
          <p>You are <strong>not signed in</strong>. Use the form below.</p>
          <LoginCard />
          <p style={{ fontSize: 12, color: '#666', marginTop: 12 }}>
            If signup requires confirmation, create a user in Supabase → Authentication → Users (toggle “Email confirmed” ON), then sign in here.
          </p>
        </>
      ) : (
        <>
          <p>You are <strong>signed in</strong> as <code>{session.user.email}</code>.</p>
          <button
            onClick={() => supabase.auth.signOut()}
            style={{ padding: '8px 12px', borderRadius: 12, border: '1px solid #ddd', background: '#fff' }}
          >
            Sign out
          </button>
          <div style={{ marginTop: 16, padding: 12, background: '#FAFAFA', border: '1px solid #EEE', borderRadius: 8 }}>
            <p style={{ marginTop: 0 }}><strong>Next step:</strong> Once this screen is stable after sign-in, we’ll drop the calculator UI back in.</p>
          </div>
        </>
      )}
    </div>
  );
}
