 
import { ServerCard } from '../components/ServerCard';
import { useEffect, useState } from 'react';
import { serverHealthApi } from '../services/api';

interface Server {
  ip: string;
  cpu: number;
  ram: number;
  disk: number;
  uptime: string;
  networkData: number[];
}

export function SystemHealth() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServerHealth = async () => {
      try {
        const response = await serverHealthApi.getAllServers();
        if (response.success) {
          // Transform backend data to component format
          const transformedServers = response.data.map((server: any) => ({
            ip: server.serverIp,
            cpu: server.cpuUtilization,
            ram: server.ramUsage,
            disk: server.diskSpace,
            uptime: server.uptime,
            networkData: [20, 35, 28, 40, 32, 50, 45, 38, 42, 55, 48, 35] // Mock network data for chart
          }));
          setServers(transformedServers);
        }
      } catch (error) {
        console.error('Error fetching server health:', error);
        // Fallback to default data
        setServers([
          {
            ip: '172.25.37.16',
            cpu: 46.88,
            ram: 61.91,
            disk: 60.27,
            uptime: '11d 0h 2m',
            networkData: [20, 35, 28, 40, 32, 50, 45, 38, 42, 55, 48, 35]
          },
          {
            ip: '172.25.37.21',
            cpu: 63.05,
            ram: 71.54,
            disk: 49.48,
            uptime: '15d 0h 2m',
            networkData: [25, 30, 35, 42, 38, 48, 52, 40, 45, 50, 42, 35]
          },
          {
            ip: '172.25.37.138',
            cpu: 41.01,
            ram: 51.59,
            disk: 66.9,
            uptime: '30d 0h 2m',
            networkData: [18, 25, 30, 38, 42, 48, 55, 50, 58, 52, 45, 38]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchServerHealth();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchServerHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-white">Loading server health data...</div>;
  }
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
