import React from 'react';
import { formatCurrency } from '../utils/currency';

export const WEEKS_PER_MONTH = 4.333;

export type Row = {
  id: string;
  hoursPerNight: number;
  payPerHour: number;
  nightsPerWeek: number;
};

type Props = {
  rows: Row[];
  setRows: (rows: Row[]) => void;
};

const toNum = (v: any) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));

export default function PayrollTable({ rows, setRows }: Props) {
  const update = (id: string, key: keyof Row, value: number) => {
    setRows(rows.map(r => (r.id === id ? { ...r, [key]: value } : r)));
  };

  const addRow = () => {
    setRows([...rows, { id: crypto.randomUUID(), hoursPerNight: 0, payPerHour: 0, nightsPerWeek: 0 }]);
  };

  const removeRow = (id: string) => setRows(rows.filter(r => r.id !== id));

  const rowMonthly = (r: Row) => r.hoursPerNight * r.payPerHour * r.nightsPerWeek * WEEKS_PER_MONTH;

  const tdRight: React.CSSProperties = { textAlign: 'right', padding: '6px 8px' };
  const th: React.CSSProperties = { textAlign: 'left', padding: '6px 8px', fontSize: 12, color: '#555' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '6px 8px', border: '1px solid #ccc', borderRadius: 6 };

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,.06)', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Payroll</h2>
        <button onClick={addRow} style={{ padding: '8px 12px', borderRadius: 12, border: '1px solid #ddd', background: '#111', color: '#fff' }}>
          Add Row
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
          <thead>
            <tr>
              <th style={th}>#</th>
              <th style={{ ...th, textAlign: 'right' }}>Hours / Night</th>
              <th style={{ ...th, textAlign: 'right' }}>Pay / Hour ($)</th>
              <th style={{ ...th, textAlign: 'right' }}>Nights / Week</th>
              <th style={{ ...th, textAlign: 'right' }}>Weeks / Month</th>
              <th style={{ ...th, textAlign: 'right' }}>Monthly Pay ($)</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id} style={{ background: '#fafafa' }}>
                <td style={{ padding: '6px 8px' }}>{i + 1}</td>
                <td style={tdRight}>
                  <input type="number" min={0} step="0.1" value={r.hoursPerNight}
                         onChange={e => update(r.id, 'hoursPerNight', toNum(e.target.value))}
                         style={{ ...inputStyle, textAlign: 'right' }} />
                </td>
                <td style={tdRight}>
                  <input type="number" min={0} step="0.01" value={r.payPerHour}
                         onChange={e => update(r.id, 'payPerHour', toNum(e.target.value))}
                         style={{ ...inputStyle, textAlign: 'right' }} />
                </td>
                <td style={tdRight}>
                  <input type="number" min={0} step="0.1" value={r.nightsPerWeek}
                         onChange={e => update(r.id, 'nightsPerWeek', toNum(e.target.value))}
                         style={{ ...inputStyle, textAlign: 'right' }} />
                </td>
                <td style={tdRight}>{WEEKS_PER_MONTH.toFixed(3)}</td>
                <td style={tdRight}>{formatCurrency(rowMonthly(r))}</td>
                <td style={tdRight}>
                  <button onClick={() => removeRow(r.id)} style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid #ddd', background: '#fff' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const sumLabor = (rows: Row[]) =>
  rows.reduce((sum, r) => sum + r.hoursPerNight * r.payPerHour * r.nightsPerWeek * WEEKS_PER_MONTH, 0);
