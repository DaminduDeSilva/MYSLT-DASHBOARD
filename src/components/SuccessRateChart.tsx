import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

export function SuccessRateChart() {
  const data = [
    { api: '', rate: 0 },
    { api: 'A55', rate: 68 },
    { api: 'A35', rate: 80},
    { api: 'A50', rate: 40},
    
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        API-wise Success Rate
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity={1} />
              <stop offset="50%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="api" 
            stroke="#94a3b8"
            interval="preserveStartEnd"
            ticks={['A55', 'A35', 'A50']}
          />
          <YAxis 
            stroke="#94a3b8"
            domain={[0, 100]}
            ticks={[0, 40, 60, 80, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value) => [`${value}%`, 'Success Rate']}
          />
          <Line 
            type="monotone" 
            dataKey="rate" 
            stroke="url(#lineGradient)" 
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}