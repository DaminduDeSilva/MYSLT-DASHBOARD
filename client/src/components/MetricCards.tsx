 
import { UsersIcon, TrendingUpIcon, ActivityIcon, ServerIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';

interface DashboardStats {
  totalActiveCustomers: number;
  totalTrafficCount: number;
  liveTraffic: number;
  serverRequests: {
    '172.25.37.16': number;
    '172.25.37.21': number;
    '172.25.37.138': number;
  };
}

export function MetricCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApi.getStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Listen for filter changes
    const handleFilterChange = () => {
      fetchStats();
    };
    window.addEventListener('filtersChanged', handleFilterChange);

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => {
      window.removeEventListener('filtersChanged', handleFilterChange);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  const metrics = [{
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
    value: stats?.liveTraffic.toString() || '0',
    change: 'Real-time monitoring',
    icon: ActivityIcon,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-100',
    badge: 'LIVE'
  }, {
    title: 'Number of Requests',
    value: stats?.serverRequests['172.25.37.16'].toLocaleString() || '0',
    change: '172.25.37.16',
    icon: ServerIcon,
    color: 'bg-cyan-500',
    textColor: 'text-cyan-100'
  }, {
    title: 'Number of Requests',
    value: stats?.serverRequests['172.25.37.21'].toLocaleString() || '0',
    change: '172.25.37.21',
    icon: ServerIcon,
    color: 'bg-purple-500',
    textColor: 'text-purple-100'
  }, {
    title: 'Number of Requests',
    value: stats?.serverRequests['172.25.37.138'].toLocaleString() || '0',
    change: '172.25.37.138',
    icon: ServerIcon,
    color: 'bg-indigo-500',
    textColor: 'text-indigo-100'
  }];
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => <div key={index} className={`${metric.color} rounded-lg p-4 text-white relative overflow-hidden`}>
          {metric.badge && <div className="absolute top-2 right-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
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
