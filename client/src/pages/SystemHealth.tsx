 
import { useState, useEffect } from 'react';
import { ServerCard } from '../components/ServerCard';
import { Plus, X, Loader, Monitor } from 'lucide-react';

interface Server {
  ip: string;
  cpu: number;
  ram: number;
  disk: number;
  uptime: string;
  networkData: number[];
  os: 'windows' | 'linux';
}

const STORAGE_KEY = 'myslt-servers';

const defaultServers: Server[] = [{
  ip: '172.25.37.16',
  cpu: 46.88,
  ram: 61.91,
  disk: 60.27,
  uptime: '11d 0h 2m',
  networkData: [20, 35, 28, 40, 32, 50, 45, 38, 42, 55, 48, 35],
  os: 'windows'
}, {
  ip: '172.25.37.21',
  cpu: 63.05,
  ram: 71.54,
  disk: 49.48,
  uptime: '15d 0h 2m',
  networkData: [25, 30, 35, 42, 38, 48, 52, 40, 45, 50, 42, 35],
  os: 'linux'
}, {
  ip: '172.25.37.138',
  cpu: 41.01,
  ram: 51.59,
  disk: 66.9,
  uptime: '30d 0h 2m',
  networkData: [18, 25, 30, 38, 42, 48, 55, 50, 58, 52, 45, 38],
  os: 'windows'
}];

export function SystemHealth() {
  const [servers, setServers] = useState<Server[]>(() => {
    // Load from localStorage on initial render
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultServers;
    } catch (err) {
      console.error('Failed to load servers from localStorage:', err);
      return defaultServers;
    }
  });

  const [showModal, setShowModal] = useState(false);
  const [newServerIP, setNewServerIP] = useState('');
  const [serverOS, setServerOS] = useState<'windows' | 'linux'>('windows');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Save to localStorage whenever servers change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(servers));
    } catch (err) {
      console.error('Failed to save servers to localStorage:', err);
    }
  }, [servers]);

  const handleDeleteServer = (ip: string) => {
    setServers(servers.filter(s => s.ip !== ip));
    setDeleteConfirm(null);
  };

  const handleAddServer = async () => {
    setError('');
    
    // Basic IP validation
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(newServerIP)) {
      setError('Please enter a valid IP address (e.g., 192.168.1.1)');
      return;
    }

    // Check for duplicate
    if (servers.some(s => s.ip === newServerIP)) {
      setError('This server is already being monitored');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Replace this with actual SNMP fetch from your backend
      // Example: const response = await fetch(`http://localhost:5000/api/servers/snmp/${newServerIP}?os=${serverOS}`);
      // const snmpData = await response.json();
      
      // Simulate SNMP fetch with mock data for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock: simulate random success/failure
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      if (!success) {
        throw new Error('SNMP connection failed');
      }
      
      const newServer: Server = {
        ip: newServerIP,
        cpu: Math.random() * 100,
        ram: Math.random() * 100,
        disk: Math.random() * 100,
        uptime: '0d 0h 0m',
        networkData: Array.from({ length: 12 }, () => Math.random() * 60),
        os: serverOS
      };

      setServers([...servers, newServer]);
      setShowModal(false);
      setNewServerIP('');
      setServerOS('windows');
    } catch (err) {
      setError('Failed to fetch server data via SNMP. Please check the IP address, OS type, and network connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  return <div className="space-y-6">
      <div className="bg-blue-600 rounded-2xl p-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            System Health Monitoring
          </h2>
          <p className="text-blue-100">
            Real-time monitoring of all production servers
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold shadow-lg"
        >
          <Plus size={20} />
          Add Server
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {servers.map(server => (
          <ServerCard 
            key={server.ip} 
            {...server} 
            onDelete={() => setDeleteConfirm(server.ip)}
          />
        ))}
      </div>

      {/* Add Server Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Add New Server</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                  setNewServerIP('');
                  setServerOS('windows');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Server IP Address
                </label>
                <input
                  type="text"
                  value={newServerIP}
                  onChange={(e) => setNewServerIP(e.target.value)}
                  placeholder="e.g., 192.168.1.100"
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Operating System
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setServerOS('windows')}
                    disabled={isLoading}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      serverOS === 'windows'
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Monitor size={18} />
                      Windows
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setServerOS('linux')}
                    disabled={isLoading}
                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                      serverOS === 'linux'
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Monitor size={18} />
                      Linux
                    </div>
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-slate-300 text-sm">
                  <strong className="text-white">Note:</strong> Server metrics (CPU, RAM, Disk, Network) will be automatically fetched via SNMP from the provided IP address. The server card will only appear after successfully fetching the data.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddServer}
                  disabled={isLoading || !newServerIP}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Fetching via SNMP...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Add Server
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                    setNewServerIP('');
                    setServerOS('windows');
                  }}
                  disabled={isLoading}
                  className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Delete Server</h3>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                <p className="text-white mb-2">
                  Are you sure you want to delete this server?
                </p>
                <p className="text-slate-300 text-sm font-mono">
                  {deleteConfirm}
                </p>
              </div>

              <p className="text-slate-400 text-sm">
                This action cannot be undone. All monitoring data for this server will be removed.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleDeleteServer(deleteConfirm)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Delete Server
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>;
}
