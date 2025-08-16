import React, { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import PayrollTable, { Row, WEEKS_PER_MONTH, sumLabor } from './components/PayrollTable';
mport { formatCurrency } from './utils/currency';
import { supabase } from './supabaseClient';
import LoginCard from './LoginCard';

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
const num = (v: any) => (isNaN(parseFloat(v)) ? 0 : Math.max(0, parseFloat(v)));

export default function App() {
  // --- Auth session ---
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  // If not signed in, show login
  if (!session) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Contract Profit Calculator</h1>
        </header>
        <LoginCard />
        <p className="text-xs text-gray-500 text-center mt-6">
          Tip: If Supabase requires email confirmation, check your inbox after signing up.
        </p>
      </div>
    );
  }

  // --- Calculator state (signed-in only) ---
  const [state, setState] = useState<State>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT_STATE;
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const set = (patch: Partial<State>) => setState(s => ({ ...s, ...patch }));
  const labor = useMemo(() => sumLabor(state.rows), [state.rows]);
  const pctDollar = (pct: number) => (state.contractBilling * pct) / 100;

  const royalty = pctDollar(state.royaltyPct);
  const management = pctDollar(state.managementPct);
  const insurance = pctDollar(state.insurancePct);
  const supplies = pctDollar(state.suppliesPct);
  const laborTaxes = labor * (state.laborTaxesPct / 100);

  const totalExpenses = royalty + management + insurance + supplies + labor + laborTaxes + state.specialEquipment;
  const profit = state.contractBilling - totalExpenses;

  const reset = () => setState(DEFAULT_STATE);

  const exportCSV = () => {
    const rows = [
      ['Client Name', state.clientName],
      ['Contract Billing', state.contractBilling],
      [],
      ['Payroll'],
      ['#','Hours/Night','Pay/Hour','Nights/Week','Weeks/Month','Monthly Pay'],
      ...state.rows.map((r,i)=>[
        i+1,
        r.hoursPerNight,
        r.payPerHour,
        r.nightsPerWeek,
        WEEKS_PER_MONTH,
        r.hoursPerNight * r.payPerHour * r.nightsPerWeek * WEEKS_PER_MONTH
      ]),
      [],
      ['Expenses %', 'Percent', 'Amount'],
      ['Royalty', state.royaltyPct, royalty],
      ['Management Fee', state.managementPct, management],
      ['Insurance', state.insurancePct, insurance],
      ['Supplies', state.suppliesPct, supplies],
      ['Labor', '', labor],
      ['Labor Taxes %', state.laborTaxesPct, laborTaxes],
      ['Special Equipment', '', state.specialEquipment],
      [],
      ['Total Expenses', '', totalExpenses],
      ['Profit', '', profit],
    ];

    const csv = rows.map(r => r.map(c => (c == null ? '' : String(c))).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contract-profit-calculator.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Contract Profit Calculator</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{session.user.email}</span>
          <button onClick={reset} className="btn btn-ghost">Reset</button>
          <button onClick={() => supabase.auth.signOut()} className="btn btn-primary">Sign out</button>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card space-y-3">
          <div>
            <label className="label">Client Name</label>
            <input className="input" value={state.clientName} onChange={e=>set({clientName:e.target.value})} placeholder="Client name"/>
          </div>
          <div>
            <label className="label">Contract Monthly Billing ($)</label>
            <input type="number" min={0} className="number-input" value={state.contractBilling}
              onChange={e=>set({contractBilling: num(e.target.value)})} placeholder="0.00"/>
          </div>
        </div>

        <div className="card grid grid-cols-2 gap-3">
          <div>
            <label className="label">Royalty %</label>
            <input type="number" min={0} className="number-input" value={state.royaltyPct}
              onChange={e=>set({royaltyPct: num(e.target.value)})} placeholder="10"/>
            <div className="text-sm text-gray-600 mt-1">= {formatCurrency(royalty)}</div>
          </div>
          <div>
            <label className="label">Management Fee %</label>
            <input type="number" min={0} className="number-input" value={state.managementPct}
              onChange={e=>set({managementPct: num(e.target.value)})} placeholder="5"/>
            <div className="text-sm text-gray-600 mt-1">= {formatCurrency(management)}</div>
          </div>
          <div>
            <label className="label">Insurance %</label>
            <input type="number" min={0} className="number-input" value={state.insurancePct}
              onChange={e=>set({insurancePct: num(e.target.value)})} placeholder="7"/>
            <div className="text-sm text-gray-600 mt-1">= {formatCurrency(insurance)}</div>
          </div>
          <div>
            <label className="label">Supplies %</label>
            <input type="number" min={0} className="number-input" value={state.suppliesPct}
              onChange={e=>set({suppliesPct: num(e.target.value)})} placeholder="3"/>
            <div className="text-sm text-gray-600 mt-1">= {formatCurrency(supplies)}</div>
          </div>
          <div>
            <label className="label">Labor Taxes %</label>
            <input type="number" min={0} className="number-input" value={state.laborTaxesPct}
              onChange={e=>set({laborTaxesPct: num(e.target.value)})} placeholder="0"/>
            <div className="text-sm text-gray-600 mt-1">= {formatCurrency(laborTaxes)}</div>
          </div>
          <div>
            <label className="label">Special Equipment ($)</label>
            <input type="number" min={0} className="number-input" value={state.specialEquipment}
              onChange={e=>set({specialEquipment: num(e.target.value)})} placeholder="0.00"/>
          </div>
        </div>
      </div>

      <PayrollTable rows={state.rows} setRows={(rows)=>set({rows})} />

      <div className="card grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between"><span>Royalty</span><span className="value">{formatCurrency(royalty)}</span></div>
          <div className="flex justify-between"><span>Management Fee</span><span className="value">{formatCurrency(management)}</span></div>
          <div className="flex justify-between"><span>Insurance</span><span className="value">{formatCurrency(insurance)}</span></div>
          <div className="flex justify-between"><span>Supplies</span><span className="value">{formatCurrency(supplies)}</span></div>
          <div className="flex justify-between"><span>Labor</span><span className="value">{formatCurrency(labor)}</span></div>
          <div className="flex justify-between"><span>Labor Taxes</span><span className="value">{formatCurrency(laborTaxes)}</span></div>
          <div className="flex justify-between"><span>Special Equipment</span><span className="value">{formatCurrency(state.specialEquipment)}</span></div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-lg"><span>Total Expenses</span><span className="value">{formatCurrency(totalExpenses)}</span></div>
          <div className={`flex justify-between text-xl ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            <span>Profit</span><span className="value">{formatCurrency(profit)}</span>
          </div>
        </div>
      </div>

      <footer className="text-xs text-gray-500 text-center">
        Weeks per month = {WEEKS_PER_MONTH.toFixed(3)} · Values save automatically
      </footer>
    </div>
  );
}
