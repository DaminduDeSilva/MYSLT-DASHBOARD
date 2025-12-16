
import { UsersIcon, TrendingUpIcon, ActivityIcon, ServerIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import emailjs from 'emailjs-com';
import { dashboardApi } from '../services/api';

interface DashboardStats {
  totalActiveCustomers: number;
  totalTrafficCount: number;
  liveTraffic: number;
  serverRequests: Record<string, number>;
}

interface MetricCard {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
  textColor: string;
  badge?: string;
}

export function MetricCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const sendTrafficAlert = () => {
    emailjs.send(
      "service_22depjr",
      "template_wikzlfa",
      {
        subject: "ALERT: Live Traffic Dropped to 0",
        message: "Live Traffic value is currently 0. Immediate attention required!"
      },
      "BGYMrLhoFJo2n84_3"
    )
    .then(() => {
      console.log("Traffic alert email sent!");
    })
    .catch((err) => {
      console.log("Failed to send traffic alert", err);
    });
  };

  useEffect(() => {
    const fetchStats = async (filters?: any) => {
      try {
        const response = await dashboardApi.getStats(filters);
        if (response.success && response.data) {
          setStats(response.data);
          if (response.data.liveTraffic <= 0) {
            sendTrafficAlert();
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Clear data when backend connection fails
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Listen for filter changes
    const handleFilterChange = (event: any) => {
      const filters = event.detail || {};
      console.log('MetricCards applying filters:', filters);
      fetchStats(filters);
    };
    window.addEventListener('filtersChanged', handleFilterChange);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchStats(), 30000);

    return () => {
      window.removeEventListener('filtersChanged', handleFilterChange);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  // Define colors for server cards (cycle through these)
  const serverColors = [
    { color: 'bg-cyan-500', textColor: 'text-cyan-100' },
    { color: 'bg-purple-500', textColor: 'text-purple-100' },
    { color: 'bg-indigo-500', textColor: 'text-indigo-100' },
    { color: 'bg-pink-500', textColor: 'text-pink-100' },
    { color: 'bg-rose-500', textColor: 'text-rose-100' },
    { color: 'bg-orange-500', textColor: 'text-orange-100' },
  ];

  // Base metrics (always shown)
  const baseMetrics: MetricCard[] = [{
    title: 'Total Active Customers',
    value: stats?.totalActiveCustomers.toString() || '0',
    change: '+12% from last hour',
    icon: UsersIcon,
    color: 'bg-blue-500',
    textColor: 'text-blue-100'
  }, {
    title: 'Total Traffic Count',
    value: stats?.totalTrafficCount.toLocaleString() || '0',
    change: '+8% from yesterday',
    icon: TrendingUpIcon,
    color: 'bg-green-500',
    textColor: 'text-green-100'
  }, {
    title: 'Live Traffic',
    value: stats?.liveTraffic?.toString() || '0',
    change: 'Real-time monitoring',
    icon: ActivityIcon,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-100',
    badge: 'LIVE'
  }];

  // Dynamic server metrics (only show servers that have been added)
  const serverMetrics: MetricCard[] = stats?.serverRequests 
    ? Object.entries(stats.serverRequests).map(([ip, count], index) => ({
        title: 'Number of Requests',
        value: count.toLocaleString(),
        change: ip,
        icon: ServerIcon,
        ...serverColors[index % serverColors.length]
      }))
    : [];

  const metrics = [...baseMetrics, ...serverMetrics];
  
  // Use CSS Grid auto-fit to create flexible columns that adapt to content
  return <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4" style={{
    gridTemplateColumns: `repeat(${Math.min(metrics.length, 6)}, minmax(0, 1fr))`
  }}>
      {metrics.map((metric, index) => <div key={`${metric.change}-${index}`} className={`${metric.color} rounded-lg p-4 text-white relative overflow-hidden`}>
          {'badge' in metric && metric.badge && <div className="absolute top-2 right-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
              {metric.badge}
            </div>}
          <div className="space-y-2">
            <div className="bg-white/20 p-2 rounded-lg w-fit">
              <metric.icon size={15} />
            </div>
            <div>
              <p className={`text-xs ${metric.textColor} mb-1`}>
                {metric.title}
              </p>
              <p className="text-2xl font-bold mb-0.5">{metric.value}</p>
              <p className={`text-xs ${metric.textColor}`}>{metric.change}</p>
            </div>
          </div>
        </div>)}
    </div>;
}


// import React, { useState, useEffect } from 'react';
// import { Users, TrendingUp, Activity, Server } from 'lucide-react';
// import emailjs from "emailjs-com";


// export function MetricCards() {
//   const [refreshInterval, setRefreshInterval] = useState(5000); // 30 seconds default
//   const [metrics, setMetrics] = useState([
//     {
//       title: 'Total Active Customers',
//       value: 637,
//       change: '+12% from last hour',
//       icon: Users,
//       color: 'bg-blue-500',
//       textColor: 'text-blue-100',
//       threshold: 1000
//     },
//     {
//       title: 'Total Traffic Count',
//       value: 15200,
//       change: '+8% from yesterday',
//       icon: TrendingUp,
//       color: 'bg-green-500',
//       textColor: 'text-green-100',
//       threshold: 20000
//     },
//     {
//       title: 'Live Traffic',
//       value: 500,
//       change: 'Real-time monitoring',
//       icon: Activity,
//       color: 'bg-emerald-500',
//       textColor: 'text-emerald-100',
//       badge: 'LIVE',
//       threshold: 502
//     },
//     {
//       title: 'Number of Requests',
//       value: 2481,
//       change: '172.25.37.16',
//       icon: Server,
//       color: 'bg-cyan-500',
//       textColor: 'text-cyan-100',
//       threshold: 3000
//     },
//     {
//       title: 'Number of Requests',
//       value: 2472,
//       change: '172.25.37.21',
//       icon: Server,
//       color: 'bg-purple-500',
//       textColor: 'text-purple-100',
//       threshold: 3000
//     },
//     {
//       title: 'Number of Requests',
//       value: 1847,
//       change: '172.25.37.138',
//       icon: Server,
//       color: 'bg-indigo-500',
//       textColor: 'text-indigo-100',
//       threshold: 3000
//     }
//   ]);

//   // Function to simulate fetching new data
//   const refreshMetrics = () => {
//   setMetrics(prevMetrics => {
//     const updated = prevMetrics.map(metric => ({
//       ...metric,
//       value: metric.value + Math.floor(Math.random() * 100) - 50
//     }));

//     // Find the LIVE TRAFFIC card
//     const liveTrafficCard = updated.find(m => m.title === "Live Traffic");

//     // Alert condition
//     if (liveTrafficCard && liveTrafficCard.value <= 0) {
//       sendTrafficAlert();
//     }

//     return updated;
//   });
// };


//   // Auto refresh effect
//   useEffect(() => {
//     const interval = setInterval(() => {
//       refreshMetrics();
//     }, refreshInterval);

//     return () => clearInterval(interval);
//   }, [refreshInterval]);

//   // Format number with K notation
//   const formatValue = (value) => {
//     if (value >= 1000) {
//       return (value / 1000).toFixed(1) + 'K';
//     }
//     return value.toLocaleString();
//   };

//   // Check if value exceeds threshold
//   const isHighTraffic = (value, threshold) => {
//     return value > threshold;
//   };

//   const sendTrafficAlert = () => {
//   emailjs.send(
//     "service_22depjr",
//     "template_wikzlfa",
//     {
//       subject: "ALERT: Live Traffic Dropped to 0",
//       message: "Live Traffic value is currently 0. Immediate attention required!"
//     },
//     "BGYMrLhoFJo2n84_3"
//   )
//   .then(() => {
//     console.log("Traffic alert email sent!");
//   })
//   .catch((err) => {
//     console.log("Failed to send traffic alert", err);
//   });
// };


//   return (
//     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
//       {metrics.map((metric, index) => (
//         <div
//           key={index}
//           className={`${metric.color} rounded-lg p-3 text-white relative overflow-hidden`}
//         >
//           {metric.badge && (
//             <div className="absolute top-2 right-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
//               {metric.badge}
//             </div>
//           )}
//           <div className="space-y-2">
//             <div className="bg-white/20 p-2 rounded-lg w-fit">
//               <metric.icon size={16} />
//             </div>
//             <div>
//               <p className={`text-[10px] ${metric.textColor} mb-1`}>
//                 {metric.title}
//               </p>
//               <p 
//                 className={`text-3xl font-bold mb-0.5 transition-colors duration-300 ${
//                   isHighTraffic(metric.value, metric.threshold) 
//                     ? 'text-red-400 animate-pulse' 
//                     : ''
//                 }`}
//               >
//                 {formatValue(metric.value)}
//               </p>
//               <p className={`text-[10px] ${metric.textColor}`}>
//                 {metric.change}
//               </p>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }


 