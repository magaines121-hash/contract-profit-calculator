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
    setLoading(true); setMsg(null); setErr(null);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMsg('Signed in.');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Account created. If email confirmation is required, check your inbox.');
      }
    } catch (e: any) {
      setErr(e?.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const card: React.CSSProperties = { background:'#fff', borderRadius:16, boxShadow:'0 2px 10px rgba(0,0,0,.06)', padding:16, maxWidth:420, margin:'0 auto' };
  const input: React.CSSProperties = { width:'100%', padding:'8px 10px', border:'1px solid #ccc', borderRadius:8 };
  const label: React.CSSProperties = { fontSize:12, color:'#555', display:'block', marginBottom:6 };

  return (
    <div style={card}>
      <h2 style={{marginTop:0}}>{mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
      <form onSubmit={submit} style={{display:'grid', gap:12}}>
        <div>
          <label style={label}>Email</label>
          <input style={input} type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label style={label}>Password</label>
          <input style={input} type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        {err && <div style={{color:'crimson', fontSize:12}}>{err}</div>}
        {msg && <div style={{color:'seagreen', fontSize:12}}>{msg}</div>}
        <button disabled={loading} style={{padding:'10px 12px', borderRadius:12, border:'1px solid #ddd', background:'#111', color:'#fff'}}>
          {loading ? 'Please wait…' : (mode === 'signin' ? 'Sign in' : 'Sign up')}
        </button>
      </form>
      <div style={{textAlign:'center', marginTop:12, fontSize:12}}>
        {mode === 'signin' ? (
          <button onClick={()=>setMode('signup')} style={{textDecoration:'underline'}}>Need an account? Sign up</button>
        ) : (
          <button onClick={()=>setMode('signin')} style={{textDecoration:'underline'}}>Already have an account? Sign in</button>
        )}
      </div>
    </div>
  );
}
