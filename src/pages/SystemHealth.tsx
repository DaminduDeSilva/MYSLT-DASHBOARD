import React from 'react';
import { ServerCard } from '../components/ServerCard';
export function SystemHealth() {
  const servers = [{
    ip: '172.25.37.16',
    cpu: 46.88,
    ram: 61.91,
    disk: 60.27,
    uptime: '11d 0h 2m',
    networkData: [20, 35, 28, 40, 32, 50, 45, 38, 42, 55, 48, 35]
  }, {
    ip: '172.25.37.21',
    cpu: 63.05,
    ram: 71.54,
    disk: 49.48,
    uptime: '15d 0h 2m',
    networkData: [25, 30, 35, 42, 38, 48, 52, 40, 45, 50, 42, 35]
  }, {
    ip: '172.25.37.138',
    cpu: 41.01,
    ram: 51.59,
    disk: 66.9,
    uptime: '30d 0h 2m',
    networkData: [18, 25, 30, 38, 42, 48, 55, 50, 58, 52, 45, 38]
  }];
  return <div className="space-y-6">
      <div className="bg-blue-600 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          System Health Monitoring
        </h2>
        <p className="text-blue-100">
          Real-time monitoring of all production servers
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {servers.map(server => <ServerCard key={server.ip} {...server} />)}
      </div>
    </div>;
}


// import React, { useState } from 'react';
// import { RefreshCw } from 'lucide-react';
// import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

// // FilterSection Component
// function FilterSection() {
//   const [selectedServer, setSelectedServer] = useState('172.25.37.16');
//   const [selectedDate, setSelectedDate] = useState('2024-01-15');
//   const [selectedTime, setSelectedTime] = useState('14:30');
//   const [timeRange, setTimeRange] = useState('5 minutes');

//   return (
//     <div className="flex gap-4 mb-6">
//       <select 
//         className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-800"
//         value={selectedServer}
//         onChange={(e) => setSelectedServer(e.target.value)}
//       >
//         <option>Server IP</option>
//         <option>172.25.37.16</option>
//         <option>172.25.37.21</option>
//         <option>172.25.37.138</option>
//       </select>
      
//       <input 
//         type="date"
//         className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-800"
//         value={selectedDate}
//         onChange={(e) => setSelectedDate(e.target.value)}
//       />
      
//       <input 
//         type="time"
//         className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-800"
//         value={selectedTime}
//         onChange={(e) => setSelectedTime(e.target.value)}
//       />
      
//       <select 
//         className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-800"
//         value={timeRange}
//         onChange={(e) => setTimeRange(e.target.value)}
//       >
//         <option>5 minutes</option>
//         <option>15 minutes</option>
//         <option>30 minutes</option>
//         <option>1 hour</option>
//       </select>

//       <button className="bg-gray-900 text-white p-2 rounded-lg border border-gray-800 hover:bg-gray-800">
//         <RefreshCw size={20} />
//       </button>
//     </div>
//   );
// }

// // MetricCards Component
// function MetricCards() {
//   return (
//     <div className="grid grid-cols-4 gap-4 mb-6">
//       <div className="bg-gradient-to-br from-orange-900/50 to-orange-950/50 border border-orange-800/40 rounded-xl p-5">
//         <div className="text-orange-400 text-xs mb-1">CPU Usage (Avg)</div>
//         <div className="text-4xl font-bold text-orange-400">68%</div>
//       </div>

//       <div className="bg-gradient-to-br from-blue-900/50 to-blue-950/50 border border-blue-800/40 rounded-xl p-5">
//         <div className="text-blue-400 text-xs mb-1">RAM Usage (Avg)</div>
//         <div className="text-4xl font-bold text-blue-400">73%</div>
//       </div>

//       <div className="bg-gradient-to-br from-purple-900/50 to-purple-950/50 border border-purple-800/40 rounded-xl p-5">
//         <div className="text-purple-400 text-xs mb-1">Disk Space Used</div>
//         <div className="text-4xl font-bold text-purple-400">81%</div>
//       </div>

//       <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-950/50 border border-emerald-800/40 rounded-xl p-5">
//         <div className="text-emerald-400 text-xs mb-1">Network Traffic</div>
//         <div className="text-4xl font-bold text-emerald-400">245 <span className="text-xl">MB/s</span></div>
//       </div>
//     </div>
//   );
// }

// // CpuUtilizationChart Component
// function CpuUtilizationChart() {
//   const cpuData = Array.from({ length: 50 }, (_, i) => ({
//     time: i,
//     value: 55 + Math.sin(i / 3) * 10 + Math.random() * 3
//   }));

//   return (
//     <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800/30">
//       <h3 className="text-white text-lg font-semibold mb-4">CPU Utilization Over Time</h3>
//       <ResponsiveContainer width="100%" height={200}>
//         <LineChart data={cpuData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
//           <defs>
//             <linearGradient id="cpuGradient" x1="0" y1="0" x2="1" y2="0">
//               <stop offset="0%" stopColor="#f97316" />
//               <stop offset="100%" stopColor="#fb923c" />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={true} />
//           <XAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} hide />
//           <YAxis 
//             stroke="#6b7280" 
//             tick={{ fill: '#6b7280', fontSize: 12 }} 
//             domain={[0, 80]} 
//             ticks={[0, 20, 40, 60, 80]} 
//             tickFormatter={(v) => `${v}%`} 
//           />
//           <Line 
//             type="monotone" 
//             dataKey="value" 
//             stroke="url(#cpuGradient)" 
//             strokeWidth={2} 
//             dot={false} 
//             isAnimationActive={false} 
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// // RamUtilizationChart Component
// function RamUtilizationChart() {
//   const ramData = Array.from({ length: 50 }, (_, i) => ({
//     time: i,
//     value: 60 + Math.sin(i / 4) * 8 + Math.random() * 3
//   }));

//   return (
//     <div className="bg-gray-900/30 rounded-xl p-6 border border-gray-800/30">
//       <h3 className="text-white text-lg font-semibold mb-4">RAM Utilization Over Time</h3>
//       <ResponsiveContainer width="100%" height={200}>
//         <LineChart data={ramData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
//           <defs>
//             <linearGradient id="ramGradient" x1="0" y1="0" x2="1" y2="0">
//               <stop offset="0%" stopColor="#3b82f6" />
//               <stop offset="100%" stopColor="#60a5fa" />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={true} />
//           <XAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} hide />
//           <YAxis 
//             stroke="#6b7280" 
//             tick={{ fill: '#6b7280', fontSize: 12 }} 
//             domain={[0, 80]} 
//             ticks={[0, 20, 40, 60, 80]} 
//             tickFormatter={(v) => `${v}%`} 
//           />
//           <Line 
//             type="monotone" 
//             dataKey="value" 
//             stroke="url(#ramGradient)" 
//             strokeWidth={2} 
//             dot={false} 
//             isAnimationActive={false} 
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// // DiskSpaceTrendChart Component
// function DiskSpaceTrendChart() {
//   const diskTrendData = [
//     { name: 'CPU', value: 58 },
//     { name: 'RAM', value: 75 },
//     { name: 'Disk', value: 65 }
//   ];

//   const diskColors = ['#a855f7', '#8b5cf6', '#ec4899'];

//   return (
//     <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800/50">
//       <h3 className="text-white text-lg font-semibold mb-4">Disk Space Trend</h3>
//       <ResponsiveContainer width="100%" height={200}>
//         <BarChart data={diskTrendData}>
//           <defs>
//             {diskColors.map((color, i) => (
//               <linearGradient key={i} id={`diskBar${i}`} x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor={color} stopOpacity={1} />
//                 <stop offset="100%" stopColor={color} stopOpacity={0.6} />
//               </linearGradient>
//             ))}
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//           <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
//           <YAxis 
//             stroke="#6b7280" 
//             tick={{ fill: '#6b7280' }} 
//             domain={[0, 100]} 
//             ticks={[0, 20, 40, 60, 80, 100]} 
//             tickFormatter={(v) => `${v}%`} 
//           />
//           <Bar dataKey="value" radius={[8, 8, 0, 0]}>
//             {diskTrendData.map((entry, index) => (
//               <Cell key={index} fill={`url(#diskBar${index})`} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// // ServerComparisonChart Component
// function ServerComparisonChart() {
//   const serverCompData = [
//     { name: 'CPU', value: 55 },
//     { name: 'RAM', value: 90 },
//     { name: 'Disk', value: 70 },
//     { name: 'Disk', value: 85 }
//   ];

//   const serverColors = ['#f97316', '#3b82f6', '#3b82f6', '#a855f7'];

//   return (
//     <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800/50">
//       <h3 className="text-white text-lg font-semibold mb-4">Server Comparison</h3>
//       <ResponsiveContainer width="100%" height={200}>
//         <BarChart data={serverCompData}>
//           <defs>
//             {serverColors.map((color, i) => (
//               <linearGradient key={i} id={`serverBar${i}`} x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="0%" stopColor={color} stopOpacity={1} />
//                 <stop offset="100%" stopColor={color} stopOpacity={0.6} />
//               </linearGradient>
//             ))}
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//           <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
//           <YAxis 
//             stroke="#6b7280" 
//             tick={{ fill: '#6b7280' }} 
//             domain={[0, 100]} 
//             tickFormatter={(v) => `${v}%`} 
//           />
//           <Bar dataKey="value" radius={[8, 8, 0, 0]}>
//             {serverCompData.map((entry, index) => (
//               <Cell key={index} fill={`url(#serverBar${index})`} />
//             ))}
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// // UptimeSummaryChart Component
// function UptimeSummaryChart() {
//   const uptimeTrendData = Array.from({ length: 20 }, (_, i) => ({
//     time: i,
//     server1: 55 + Math.sin(i / 3) * 8,
//     server2: 35 + Math.sin(i / 2.5) * 6
//   }));

//   return (
//     <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800/50">
//       <h3 className="text-white text-lg font-semibold mb-4">Uptime Summary</h3>
//       <ResponsiveContainer width="100%" height={200}>
//         <LineChart data={uptimeTrendData}>
//           <defs>
//             <linearGradient id="uptime1" x1="0" y1="0" x2="1" y2="0">
//               <stop offset="0%" stopColor="#10b981" />
//               <stop offset="100%" stopColor="#34d399" />
//             </linearGradient>
//             <linearGradient id="uptime2" x1="0" y1="0" x2="1" y2="0">
//               <stop offset="0%" stopColor="#6366f1" />
//               <stop offset="100%" stopColor="#818cf8" />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//           <XAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} tickFormatter={() => ''} />
//           <YAxis 
//             stroke="#6b7280" 
//             tick={{ fill: '#6b7280' }} 
//             domain={[0, 80]} 
//             ticks={[0, 20, 40, 60, 80]} 
//             tickFormatter={(v) => `${v}%`} 
//           />
//           <Line 
//             type="monotone" 
//             dataKey="server1" 
//             stroke="url(#uptime1)" 
//             strokeWidth={2} 
//             dot={false} 
//           />
//           <Line 
//             type="monotone" 
//             dataKey="server2" 
//             stroke="url(#uptime2)" 
//             strokeWidth={2} 
//             dot={false} 
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// // UptimeSummaryTable Component
// function UptimeSummaryTable() {
//   const servers = [
//     { ip: '172.25.37.16', uptime: '2h days' },
//     { ip: '172.25.37.21', uptime: '26 hours' },
//     { ip: '172.25.37.138', uptime: '16 hours' }
//   ];

//   return (
//     <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800/50">
//       <h3 className="text-white text-lg font-semibold mb-4">Uptime Summary</h3>
//       <div className="space-y-3">
//         <div className="flex justify-between text-sm border-b border-gray-800 pb-2">
//           <span className="text-gray-400">Server</span>
//           <span className="text-gray-400">Uptime</span>
//         </div>
//         {servers.map((server, i) => (
//           <div key={i} className="flex justify-between text-sm">
//             <span className="text-gray-300">{server.ip}</span>
//             <span className="text-gray-300">{server.uptime}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// // Main Dashboard Component
// export function SystemHealth() {
//   return (
//     <div className="min-h-screen bg-gray-950 p-6">
//       <FilterSection />
//       <MetricCards />

//       <div className="grid grid-cols-2 gap-6 mb-6">
//         <CpuUtilizationChart />
//         <RamUtilizationChart />
//       </div>

//       <div className="grid grid-cols-4 gap-6">
//         <DiskSpaceTrendChart />
//         <ServerComparisonChart />
//         <UptimeSummaryChart />
//         <UptimeSummaryTable />
//       </div>
//     </div>
//   );
// }