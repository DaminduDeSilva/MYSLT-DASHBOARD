import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Cell } from 'recharts';

export function AccessMethodChart() {
  const data = [
    {
      name: 'Mobile',
      value: 1200
    },
    {
      name: 'Web',
      value: 800
    },
    {
      name: 'Chatbot',
      value: 400
    }
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        Access Method Distribution
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0891b2" stopOpacity={1} />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
              <stop offset="100%" stopColor="#c084fc" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }} 
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            <Cell fill="url(#cyanGradient)" />
            <Cell fill="url(#tealGradient)" />
            <Cell fill="url(#purpleGradient)" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}