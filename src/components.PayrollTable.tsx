
import React from 'react';
import { formatCurrency } from './utils.currency';

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

const number = (v: any) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));

export default function PayrollTable({ rows, setRows }: Props) {
  const update = (id: string, key: keyof Row, value: number) => {
    setRows(rows.map(r => (r.id === id ? { ...r, [key]: value } : r)));
  };

  const addRow = () => {
    setRows([...rows, { id: crypto.randomUUID(), hoursPerNight: 0, payPerHour: 0, nightsPerWeek: 0 }]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const rowMonthly = (r: Row) => r.hoursPerNight * r.payPerHour * r.nightsPerWeek * WEEKS_PER_MONTH;

  const labor = rows.reduce((sum, r) => sum + rowMonthly(r), 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Payroll</h2>
        <button className="btn btn-primary" onClick={addRow}>Add Row</button>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th className="th text-left">#</th>
              <th className="th text-right">Hours / Night</th>
              <th className="th text-right">Pay / Hour ($)</th>
              <th className="th text-right">Nights / Week</th>
              <th className="th text-right">Weeks / Month</th>
              <th className="th text-right">Monthly Pay ($)</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className="td">{i + 1}</td>
                <td className="td text-right">
                  <input className="number-input" type="number" min={0} step="0.1"
                    value={r.hoursPerNight}
                    onChange={e => update(r.id, 'hoursPerNight', number(e.target.value))}/>
                </td>
                <td className="td text-right">
                  <input className="number-input" type="number" min={0} step="0.01"
                    value={r.payPerHour}
                    onChange={e => update(r.id, 'payPerHour', number(e.target.value))}/>
                </td>
                <td className="td text-right">
                  <input className="number-input" type="number" min={0} step="0.1"
                    value={r.nightsPerWeek}
                    onChange={e => update(r.id, 'nightsPerWeek', number(e.target.value))}/>
                </td>
                <td className="td text-right">{WEEKS_PER_MONTH.toFixed(3)}</td>
                <td className="td text-right">{formatCurrency(rowMonthly(r))}</td>
                <td className="td text-right">
                  <button className="btn btn-ghost" onClick={() => removeRow(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right">
        <div className="text-sm text-gray-600">Labor (sum of monthly pay)</div>
        <div className="text-xl font-semibold">{formatCurrency(labor)}</div>
      </div>
    </div>
  );
}

export const sumLabor = (rows: Row[]) =>
  rows.reduce((sum, r) => sum + r.hoursPerNight * r.payPerHour * r.nightsPerWeek * WEEKS_PER_MONTH, 0);
