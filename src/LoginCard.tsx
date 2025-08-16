import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function LoginCard() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(null); setMsg(null);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg('Signed in. Redirecting…');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Account created. If email confirmation is required, check your inbox.');
      }
    } catch (e:any) {
      setErr(e.message || 'Auth error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        {err && <div className="text-red-600 text-sm">{err}</div>}
        {msg && <div className="text-emerald-700 text-sm">{msg}</div>}
        <button className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Please wait…' : (mode === 'signin' ? 'Sign in' : 'Sign up')}
        </button>
      </form>
      <div className="text-sm text-center mt-4">
        {mode === 'signin' ? (
          <button className="underline" onClick={()=>setMode('signup')}>Need an account? Sign up</button>
        ) : (
          <button className="underline" onClick={()=>setMode('signin')}>Already have an account? Sign in</button>
        )}
      </div>
    </div>
  );
}
