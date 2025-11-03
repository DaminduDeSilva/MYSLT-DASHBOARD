 
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
export function ResponseTimeChart() {
  const data = [{
    api: '',
    responseTime: 220
  }, {
    api: 'A1',
    responseTime: 180
  }, {
    api: 'A2',
    responseTime: 170
  }, {
    api: 'A4',
    responseTime: 150 
  }, {
    api: 'A5',
    responseTime: 140
  }, {
    api: 'A6',
    responseTime: 110
  }];
  return <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        API Average Response Time
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
              <stop offset="100%" stopColor="#fb923c" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="api" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{
          backgroundColor: '#1e293b',
          border: 'none',
          borderRadius: '8px',
          color: '#fff'
        }} />
          <Bar dataKey="responseTime" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>;
}
