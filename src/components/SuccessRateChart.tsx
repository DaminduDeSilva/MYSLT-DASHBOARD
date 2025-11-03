import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Cell } from 'recharts';

export function SuccessRateChart() {
  const data = [
    { api: '', rate: 0 },
    { api: 'A55', rate: 68 },
    { api: 'A35', rate: 80 },
    { api: 'A50', rate: 40 }
  ];

  const getColor = (rate: number) => {
    if (rate >= 80) return '#10b981'; // green
    if (rate >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">API-wise Success Rate</h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="api" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" domain={[0, 100]} ticks={[0, 40, 60, 80, 100]} tickFormatter={(v) => `${v}%`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value: number) => [`${value}%`, 'Success Rate']}
          />

          <Bar dataKey="rate" barSize={36} radius={[6, 6, 0, 0]} label={{ position: 'top', formatter: (val: number) => `${val}%`, fill: '#fff', fontSize: 12 }}>
            {data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={getColor(entry.rate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}