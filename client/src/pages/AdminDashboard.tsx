import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { serverHealthApi } from '../services/api';
import { ServerCard } from '../components/ServerCard';

interface Server {
  serverIp: string;
  cpuUtilization: number;
  ramUsage: number;
  diskSpace: number;
  uptime: string;
  networkTraffic?: number;
}

export function AdminDashboard() {
  // State for refresh rate selection
  const [refreshRate, setRefreshRate] = useState<string>('30000'); // default 30 seconds

  // State for servers info
  const [servers, setServers] = useState<Server[]>([]);

  // State to hold new server IP input
  const [newServerIp, setNewServerIp] = useState<string>('');

  // State for new access method input
  const [newAccessMethod, setNewAccessMethod] = useState<string>('');

  // State to hold access methods updated locally
  const [accessMethods, setAccessMethods] = useState<{ name: string; value: number }[]>([
    { name: 'Mobile', value: 0 },
    { name: 'Web', value: 0 },
    { name: 'Chatbot', value: 0 }
  ]);

  useEffect(() => {
    // Fetch server health data from backend
    const fetchServers = async () => {
      try {
        const response = await serverHealthApi.getAllServers();
        if (response.success) {
          setServers(response.data);
        }
      } catch (error) {
        console.error('Error fetching server health in admin dashboard:', error);
      }
    };
    fetchServers();

    // Listen to accessMethodAdded event to update local access method list
    const handleAccessMethodAdded = (event: CustomEvent) => {
      const newMethod = event.detail as string;
      setAccessMethods((prev) => {
        // Avoid duplicates
        if (prev.find((item) => item.name.toLowerCase() === newMethod.toLowerCase())) {
          return prev;
        }
        return [...prev, { name: newMethod, value: 0 }];
      });
    };
    window.addEventListener('accessMethodAdded', handleAccessMethodAdded as EventListener);
    return () => {
      window.removeEventListener('accessMethodAdded', handleAccessMethodAdded as EventListener);
    };
  }, []);

  // Handle refresh rate change
  const handleRefreshRateChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRefreshRate(event.target.value);
    console.log('Admin changed refresh rate to (ms):', event.target.value);
  };

  // Handle input change for new server IP
  const handleNewServerIpChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewServerIp(event.target.value);
  };

  // Handle adding new server card
  const handleAddServer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newServerIp.trim()) {
      return;
    }
    // Add new server with placeholder metrics
    const newServer: Server = {
      serverIp: newServerIp.trim(),
      cpuUtilization: 0,
      ramUsage: 0,
      diskSpace: 0,
      uptime: 'N/A',
      networkTraffic: 0,
    };
    setServers(prev => [...prev, newServer]);
    setNewServerIp('');
  };

  // Handle input change for new access method
  const handleNewAccessMethodChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewAccessMethod(event.target.value);
  };

  // Handle adding new access method submit
  const handleAddAccessMethod = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newAccessMethod.trim()) {
      return;
    }
    window.dispatchEvent(
      new CustomEvent('accessMethodAdded', { detail: newAccessMethod.trim() })
    );
    setNewAccessMethod('');
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Auto-Refresh Rate Card */}
        <section className="bg-slate-800 p-6 rounded-xl shadow-md flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-4">Change Auto-Refresh Rate</h3>
          <select
            id="refreshRate"
            value={refreshRate}
            onChange={handleRefreshRateChange}
            className="px-4 py-2 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="10000">10 seconds</option>
            <option value="30000">30 seconds (default)</option>
            <option value="60000">1 minute</option>
            <option value="300000">5 minutes</option>
            <option value="0">Off</option>
          </select>
        </section>

        {/* New Server Addition Card */}
        <section className="bg-slate-800 p-6 rounded-xl shadow-md flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-4">Add New Server</h3>
          <form onSubmit={handleAddServer} className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Enter new server IP"
              value={newServerIp}
              onChange={handleNewServerIpChange}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              Add Server
            </button>
          </form>
        </section>

        {/* New Access Method Addition Card */}
        <section className="bg-slate-800 p-6 rounded-xl shadow-md flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-4">Add Access Method</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newAccessMethod.trim()) {
                return;
              }
              window.dispatchEvent(
                new CustomEvent('accessMethodAdded', { detail: newAccessMethod.trim() })
              );
              setNewAccessMethod('');
            }}
            className="flex items-center gap-4"
          >
            <input
              type="text"
              placeholder="Enter new access method"
              value={newAccessMethod}
              onChange={(e) => setNewAccessMethod(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Access Method
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
