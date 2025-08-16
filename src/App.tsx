import React, { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import LoginCard from './LoginCard';

import PayrollTable, { Row, WEEKS_PER_MONTH, sumLabor } from './components/PayrollTable';
import { formatCurrency } from './utils/currency';

type State = {
  clientName: string;
  contractBilling: number;
  royaltyPct: number;
  managementPct: number;
  insurancePct: number;
  suppliesPct: number;
  laborTaxesPct: number;
  specialEquipment: number;
  rows: Row[];
};

const DEFAULT_STATE: State = {
  clientName: '',
  contractBilling: 0,
  royaltyPct: 10,
  managementPct: 5,
  insurancePct: 7,
  suppliesPct: 3,
  laborTaxesPct: 0,
  specialEquipment: 0,
  rows: Array.from({ length: 5 }, () => ({
    id: crypto.randomUUID(),
    hoursPerNight: 0,
    payPerHour: 0,
    nightsPerWeek: 0,
  })),
};

const LS_KEY = 'contract-profit-calculator:v1';
const toNum = (v: any) => (isNaN(parseFloat(v)) ? 0 : Math.max(0, parseFloat(v)));

export default function App() {
  // --- Auth session ---
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Not signed in? Show login
  if (!session) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ margin: 0 }}>Contract Profit Calculator</h1>
        </header>
        <LoginCard />
        <p style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 12 }}>
          Tip: If Supabase requires email confirmation, confirm your email or create a user in Supabase → Authentication → Users.
        </p>
      </div>
    );
  }

  // --- Calculator state (signed-in only) ---
  const [state, setState] = useState<State>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return
