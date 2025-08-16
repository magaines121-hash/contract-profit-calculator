import React, { useMemo, useState, useEffect } from 'react';
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
        r.hoursPerNight*r.payPerHour*r.nightsPerWeek*WEEKS_PER_MONTH
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

  const card: React.CSSProperties = { background: '#fff', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,.06)', padding: 16 };
  const grid2: React.CSSProperties = { display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' };
  const label: React.CSSProperties = { fontSize: 12, color: '#555', display: 'block', marginBottom: 6 };
  const input: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: 8 };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Contract Profit Calculator</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCSV} style={{ padding: '8px 12px', borderRadius: 12, border: '1px solid #ddd', background: '#111', color: '#fff' }}>
            Export CSV
          </button>
          <button onClick={() => setState(DEFAULT_STATE)} style={{ padding: '8px 12px', borderRadius: 12, border: '1px solid #ddd', background: '#fff' }}>
            Reset
          </button>
        </div>
      </header>

      <div style={grid2}>
        <div style={card}>
          <div style={{ marginBottom: 10 }}>
            <label style={label}>Client Name</label>
            <input style={input} value={state.clientName} onChange={e=>set({clientName:e.target.value})} placeholder="Client name" />
          </div>
          <div>
            <label style={label}>Contract Monthly Billing ($)</label>
            <input type="number" min={0} style={input} value={state.contractBilling}
                   onChange={e=>set({contractBilling: toNum(e.target.value)})} placeholder="0.00" />
          </div>
        </div>

        <div style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={label}>Royalty %</label>
            <input type="number" min={0} style={input} value={state.royaltyPct}
                   onChange={e=>set({royaltyPct: toNum(e.target.value)})} placeholder="10" />
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>= {formatCurrency(royalty)}</div>
          </div>
          <div>
            <label style={label}>Management Fee %</label>
            <input type="number" min={0} style={input} value={state.managementPct}
                   onChange={e=>set({managementPct: toNum(e.target.value)})} placeholder="5" />
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>= {formatCurrency(management)}</div>
          </div>
          <div>
            <label style={label}>Insurance %</label>
            <input type="number" min={0} style={input} value={state.insurancePct}
                   onChange={e=>set({insurancePct: toNum(e.target.value)})} placeholder="7" />
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>= {formatCurrency(insurance)}</div>
          </div>
          <div>
            <label style={label}>Supplies %</label>
            <input type="number" min={0} style={input} value={state.suppliesPct}
                   onChange={e=>set({suppliesPct: toNum(e.target.value)})} placeholder="3" />
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>= {formatCurrency(supplies)}</div>
          </div>
          <div>
            <label style={label}>Labor Taxes %</label>
            <input type="number" min={0} style={input} value={state.laborTaxesPct}
                   onChange={e=>set({laborTaxesPct: toNum(e.target.value)})} placeholder="0" />
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>= {formatCurrency(laborTaxes)}</div>
          </div>
          <div>
            <label style={label}>Special Equipment ($)</label>
            <input type="number" min={0} style={input} value={state.specialEquipment}
                   onChange={e=>set({specialEquipment: toNum(e.target.value)})} placeholder="0.00" />
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      <PayrollTable rows={state.rows} setRows={(rows)=>set({rows})} />

      <div style={{ height: 16 }} />

      <div style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Royalty</span><span>{formatCurrency(royalty)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Management Fee</span><span>{formatCurrency(management)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Insurance</span><span>{formatCurrency(insurance)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Supplies</span><span>{formatCurrency(supplies)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Labor</span><span>{formatCurrency(labor)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Labor Taxes</span><span>{formatCurrency(laborTaxes)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Special Equipment</span><span>{formatCurrency(state.specialEquipment)}</span></div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 18 }}>
            <span>Total Expenses</span><span>{formatCurrency(totalExpenses)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: profit >= 0 ? 'seagreen' : 'crimson' }}>
            <span>Profit</span><span>{formatCurrency(profit)}</span>
          </div>
        </div>
      </div>

      <footer style={{ textAlign: 'center', color: '#666', fontSize: 12, marginTop: 16 }}>
        Weeks per month = {WEEKS_PER_MONTH.toFixed(3)} · Values save automatically
      </footer>
    </div>
  );
}
