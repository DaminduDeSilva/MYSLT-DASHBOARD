 
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function AccessMethodChart() {
  const data = [
    { name: 'Mobile', value: 1200 },
    { name: 'Web', value: 800 },
    { name: 'Chatbot', value: 400 },
  ];

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Access Method Distribution</h3>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          {/* original gradients */}
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="tealGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>

          <Pie
            data={data}
            cx="50%"
            cy="55%"
            outerRadius={85}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            <Cell fill="url(#cyanGradient)" />
            <Cell fill="url(#tealGradient)" />
            <Cell fill="url(#purpleGradient)" />
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px'
            }}
            /* labelStyle and itemStyle reliably apply to tooltip text nodes */
            labelStyle={{ color: '#94a3b8', fontSize: 12 }}
            itemStyle={{ color: '#fff', fontSize: 13 }}
            // return [formattedValue, originalName] so the second column shows 'Mobile'/'Web'/'Chatbot'
            formatter={(value: number, name: string) => [value.toLocaleString(), name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
