 
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
export function LiveTrafficChart() {
  const data = [{
    time: '14:30',
    value: 42
  }, {
    time: '14:35',
    value: 55
  }, {
    time: '14:40',
    value: 48
  }, {
    time: '14:45',
    value: 62
  }, {
    time: '14:50',
    value: 52
  }, {
    time: '14:55',
    value: 58
  }, {
    time: '15:00',
    value: 48
  }];
  return <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        Live Traffic Monitor
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{
          backgroundColor: '#1e293b',
          border: 'none',
          borderRadius: '8px',
          color: '#fff'
        }} />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} name="Requests" />
        </LineChart>
      </ResponsiveContainer>
    </div>;
}
