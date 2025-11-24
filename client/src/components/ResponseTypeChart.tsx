 
// import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Cell } from 'recharts';

// export function ResponseTypeChart() {
//   const data = [
//     {
//       name: 'Information',
//       value: 2100
//     },
//     {
//       name: 'Warning',
//       value: 80
//     },
//     {
//       name: 'Error',
//       value: 60
//     }
//   ];

//   return (
//     <div className="bg-slate-800 rounded-xl p-6">
//       <h3 className="text-lg font-bold text-white mb-4">
//         Response Type Distribution
//       </h3>
//       <ResponsiveContainer width="100%" height={250}>
//         <BarChart data={data}>
//           <defs>
//             <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
//               <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
//             </linearGradient>
//             <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
//               <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.8} />
//             </linearGradient>
//             <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
//               <stop offset="100%" stopColor="#f87171" stopOpacity={0.8} />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
//           <XAxis dataKey="name" stroke="#94a3b8" />
//           <YAxis stroke="#94a3b8" />
//           <Tooltip 
//             contentStyle={{
//               backgroundColor: '#1e293b',
//               border: 'none',
//               borderRadius: '8px',
//               color: '#fff'
//             }} 
//           />
//           <Bar dataKey="value" radius={[8, 8, 0, 0]}>
//             <Cell fill="url(#blueGradient)" />
//             <Cell fill="url(#orangeGradient)" />
//             <Cell fill="url(#redGradient)" />
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }


 
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Cell } from 'recharts';
import { dashboardApi } from '../services/api';

export function ResponseTypeChart() {
  const [data, setData] = useState([
    { name: 'Information', value: 0 },
    { name: 'Warning', value: 0 },
    { name: 'Error', value: 0 }
  ]);

  useEffect(() => {
    const fetchData = async (filters?: any) => {
      try {
        const response = await dashboardApi.getStats(filters);
        if (response.success && response.data.responseTypeDistribution) {
          const dist = response.data.responseTypeDistribution;
          setData([
            { name: 'Information', value: dist.Information || 0 },
            { name: 'Warning', value: dist.Warning || 0 },
            { name: 'Error', value: dist.Error || 0 }
          ]);
        }
      } catch (error) {
        console.error('Error fetching response type data:', error);
      }
    };

    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    
    const handleFilterChange = (event: any) => {
      const filters = event.detail || {};
      console.log('ResponseTypeChart applying filters:', filters);
      fetchData(filters);
    };
    window.addEventListener('filtersChanged', handleFilterChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('filtersChanged', handleFilterChange);
    };
  }, []);

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        Response Type Distribution
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
              <stop offset="100%" stopColor="#f87171" stopOpacity={0.8} />
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
            <Cell fill="url(#blueGradient)" />
            <Cell fill="url(#orangeGradient)" />
            <Cell fill="url(#redGradient)" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
