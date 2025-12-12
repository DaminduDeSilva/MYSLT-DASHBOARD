 
import { useState, useEffect } from 'react';
import { ServerCard } from '../components/ServerCard';
import { serverHealthApi } from '../services/api';

interface Server {
  ip: string;
  cpu: number;
  ram: number;
  disk: number;
  uptime: string;
  networkData: number[];
  networkTraffic: number;
  os: 'windows' | 'linux';
}

export function SystemHealth() {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch servers from backend
  const fetchServers = async () => {
    try {
      const response = await serverHealthApi.getAllServers();
      if (response.success && response.data) {
        // Transform backend data to frontend format
        const transformedServers = response.data.map((server: any) => ({
          ip: server.serverIp,
          cpu: server.cpuUtilization,
          ram: server.ramUsage,
          disk: server.diskSpace,
          uptime: server.uptime,
          networkTraffic: server.networkTraffic || 0,
          networkData: [20, 35, 28, 40, 32, 50, 45, 38, 42, 55, 48, 35], // Placeholder for chart
          os: server.serverIp.startsWith('192.168') ? 'linux' : 'windows' as 'windows' | 'linux'
        }));
        setServers(transformedServers);
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchServers();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchServers, 30000);
    return () => clearInterval(interval);
  }, []);

  // Reload servers when changed in admin panel
  useEffect(() => {
    const handleReload = () => {
      fetchServers();
    };
    window.addEventListener('serversUpdated', handleReload);
    return () => window.removeEventListener('serversUpdated', handleReload);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-white text-xl">Loading servers...</div>
      </div>
    );
  }

  return <div className="space-y-6">
      <div className="bg-blue-600 rounded-2xl p-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            System Health Monitoring
          </h2>
          <p className="text-blue-100">
            Real-time monitoring of all production servers (Auto-refresh every 30s)
          </p>
        </div>
      </div>

      {servers.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-400 text-lg mb-4">No servers added yet</p>
          <p className="text-slate-500">Add servers via Admin Panel to start monitoring</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {servers.map(server => (
            <ServerCard 
              key={server.ip} 
              {...server}
            />
          ))}
        </div>
      )}
    </div>;
}
