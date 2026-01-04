 
// import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
// export function LiveTrafficChart() {
//   const data = [{
//     time: '14:30',
//     value: 42
//   }, {
//     time: '14:35',
//     value: 55
//   }, {
//     time: '14:40',
//     value: 48
//   }, {
//     time: '14:45',
//     value: 62
//   }, {
//     time: '14:50',
//     value: 52
//   }, {
//     time: '14:55',
//     value: 58
//   }, {
//     time: '15:00',
//     value: 48
//   }];
//   return <div className="bg-slate-800 rounded-xl p-6">
//       <h3 className="text-lg font-bold text-white mb-4">
//         Live Traffic Monitor
//       </h3>
//       <ResponsiveContainer width="100%" height={250}>
//         <LineChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
//           <XAxis dataKey="time" stroke="#94a3b8" />
//           <YAxis stroke="#94a3b8" />
//           <Tooltip contentStyle={{
//           backgroundColor: '#1e293b',
//           border: 'none',
//           borderRadius: '8px',
//           color: '#fff'
//         }} />
//           <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} name="Requests" />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>;
// }


 
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { dashboardApi } from '../services/api';

export function LiveTrafficChart() {
  const [data, setData] = useState<Array<{ time: string; value: number }>>([]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let currentRefresh = '30s';

    const fetchData = async (_filters?: any) => {
      try {
        const response = await dashboardApi.getLiveTraffic(30);
        if (response.success && response.data) {
          setData(response.data.map((item: any) => ({
            time: item.time,
            value: item.count
          })));
        }
      } catch (error) {
        console.error('Error fetching live traffic data:', error);
        // Clear data when backend connection fails
        setData([]);
      }
    };

    const setupInterval = (refresh: string) => {
      if (intervalId) clearInterval(intervalId);
      
      if (refresh === 'off' || refresh === 'Off') {
        intervalId = null;
      } else {
        const ms = refresh === '30s' ? 30000 : refresh === '1m' ? 60000 : refresh === '5m' ? 300000 : 30000;
        intervalId = setInterval(() => fetchData(), ms);
      }
    };

    fetchData();
    setupInterval(currentRefresh);
    
    const handleFilterChange = (event: any) => {
      const filters = event.detail || {};
      console.log('LiveTrafficChart applying filters:', filters);
      fetchData(filters);
    };
    
    const handleAutoRefreshChange = (event: any) => {
      const { autoRefresh } = event.detail || {};
      if (autoRefresh) {
        currentRefresh = autoRefresh;
        setupInterval(autoRefresh);
      }
    };
    
    window.addEventListener('filtersChanged', handleFilterChange);
    window.addEventListener('autoRefreshChanged', handleAutoRefreshChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('filtersChanged', handleFilterChange);
      window.removeEventListener('autoRefreshChanged', handleAutoRefreshChange);
    };
  }, []);
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
