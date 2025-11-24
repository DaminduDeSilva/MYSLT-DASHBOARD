import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Clock, GitBranch, Plus, Trash2, Save, X } from 'lucide-react';

interface ServerItem {
  ip: string;
  os: 'windows' | 'linux';
  cpu: number;
  ram: number;
  disk: number;
  uptime: string;
  networkData: { time: string; value: number }[];
}

interface AccessMethod {
  name: string;
  value: number;
}

export function AdminPanel() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Server Management
  const [servers, setServers] = useState<ServerItem[]>([]);
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [newServerIP, setNewServerIP] = useState('');
  const [newServerOS, setNewServerOS] = useState<'windows' | 'linux'>('windows');
  
  // Auto Refresh Settings
  const [refreshRates, setRefreshRates] = useState({
    dashboard: 30,
    liveTraffic: 5,
    charts: 30
  });
  
  // Access Methods
  const [accessMethods, setAccessMethods] = useState<AccessMethod[]>([]);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');
  const [selectedMethodToDelete, setSelectedMethodToDelete] = useState('');

  useEffect(() => {
    // Check authentication
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus !== 'true') {
      navigate('/');
      return;
    }
    setIsAuthenticated(true);

    // Load servers
    const savedServers = localStorage.getItem('myslt-servers');
    if (savedServers) {
      setServers(JSON.parse(savedServers));
    }

    // Load access methods
    const savedMethods = localStorage.getItem('myslt-access-methods');
    if (savedMethods) {
      setAccessMethods(JSON.parse(savedMethods));
    }

    // Load refresh rates
    const savedRates = localStorage.getItem('myslt-refresh-rates');
    if (savedRates) {
      setRefreshRates(JSON.parse(savedRates));
    }
  }, [navigate]);

  const handleAddServer = () => {
    if (!newServerIP.trim()) {
      alert('Please enter a valid IP address');
      return;
    }

    // Check for duplicates
    if (servers.some(s => s.ip === newServerIP)) {
      alert('Server with this IP already exists');
      return;
    }

    // Mock server data
    const newServer: ServerItem = {
      ip: newServerIP,
      os: newServerOS,
      cpu: Math.floor(Math.random() * 30) + 40,
      ram: Math.floor(Math.random() * 30) + 50,
      disk: Math.floor(Math.random() * 20) + 60,
      uptime: '15d 7h 23m',
      networkData: Array.from({ length: 20 }, (_, i) => ({
        time: `${i * 2}h`,
        value: Math.floor(Math.random() * 100)
      }))
    };

    const updatedServers = [...servers, newServer];
    setServers(updatedServers);
    localStorage.setItem('myslt-servers', JSON.stringify(updatedServers));
    window.dispatchEvent(new Event('serversUpdated'));
    
    setNewServerIP('');
    setShowAddServerModal(false);
  };

  const handleDeleteServer = (ip: string) => {
    if (confirm(`Are you sure you want to remove server ${ip}?`)) {
      const updatedServers = servers.filter(s => s.ip !== ip);
      setServers(updatedServers);
      localStorage.setItem('myslt-servers', JSON.stringify(updatedServers));
      window.dispatchEvent(new Event('serversUpdated'));
    }
  };

  const handleSaveRefreshRates = () => {
    localStorage.setItem('myslt-refresh-rates', JSON.stringify(refreshRates));
    alert('Refresh rates saved successfully!');
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('refreshRatesChanged', { detail: refreshRates }));
  };

  const handleAddAccessMethod = () => {
    const trimmed = newMethodName.trim();
    if (!trimmed) {
      alert('Please enter a method name');
      return;
    }

    if (accessMethods.some(m => m.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('Access method already exists');
      return;
    }

    const updatedMethods = [...accessMethods, { name: newMethodName.trim(), value: 0 }];
    setAccessMethods(updatedMethods);
    localStorage.setItem('myslt-access-methods', JSON.stringify(updatedMethods));
    window.dispatchEvent(new Event('accessMethodsUpdated'));
    
    setNewMethodName('');
    setShowAddMethodModal(false);
  };

  const handleDeleteAccessMethod = () => {
    if (!selectedMethodToDelete) return;

    if (confirm(`Are you sure you want to remove "${selectedMethodToDelete}"?`)) {
      const updatedMethods = accessMethods.filter(m => m.name !== selectedMethodToDelete);
      setAccessMethods(updatedMethods);
      localStorage.setItem('myslt-access-methods', JSON.stringify(updatedMethods));
      window.dispatchEvent(new Event('accessMethodsUpdated'));
      setSelectedMethodToDelete('');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-slate-400">Manage system settings and configurations</p>
        </div>

        {/* Server Management Section */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Server className="text-blue-500" size={24} />
              <h2 className="text-xl font-bold text-white">Server Management</h2>
            </div>
            <button
              onClick={() => setShowAddServerModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Add Server
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((server) => (
              <div key={server.ip} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Server size={18} className="text-cyan-400" />
                    <span className="text-white font-semibold">{server.ip}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteServer(server.ip)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>OS:</span>
                    <span className="font-medium text-white">{server.os === 'windows' ? 'Windows' : 'Linux'}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>CPU:</span>
                    <span className="font-medium text-white">{server.cpu}%</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>RAM:</span>
                    <span className="font-medium text-white">{server.ram}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Refresh Settings */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="text-green-500" size={24} />
            <h2 className="text-xl font-bold text-white">Auto Refresh Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Dashboard Refresh (seconds)
              </label>
              <input
                type="number"
                value={refreshRates.dashboard}
                onChange={(e) => setRefreshRates({ ...refreshRates, dashboard: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                min="5"
                max="300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Live Traffic Refresh (seconds)
              </label>
              <input
                type="number"
                value={refreshRates.liveTraffic}
                onChange={(e) => setRefreshRates({ ...refreshRates, liveTraffic: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                min="1"
                max="60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Charts Refresh (seconds)
              </label>
              <input
                type="number"
                value={refreshRates.charts}
                onChange={(e) => setRefreshRates({ ...refreshRates, charts: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                min="10"
                max="300"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSaveRefreshRates}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Save size={18} />
              Save Refresh Settings
            </button>
          </div>
        </div>

        {/* Access Methods Management */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <GitBranch className="text-purple-500" size={24} />
              <h2 className="text-xl font-bold text-white">Access Methods</h2>
            </div>
            <button
              onClick={() => setShowAddMethodModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={18} />
              Add Method
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {accessMethods.map((method) => (
              <div key={method.name} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{method.name}</span>
                  <button
                    onClick={() => {
                      setSelectedMethodToDelete(method.name);
                      handleDeleteAccessMethod();
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-slate-400 text-sm mt-2">{method.value} requests</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Server Modal */}
      {showAddServerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Add Server</h3>
              <button
                onClick={() => {
                  setShowAddServerModal(false);
                  setNewServerIP('');
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
                  placeholder="e.g., 172.25.37.16"
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Operating System
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewServerOS('windows')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      newServerOS === 'windows'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Windows
                  </button>
                  <button
                    onClick={() => setNewServerOS('linux')}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
                      newServerOS === 'linux'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Linux
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddServer}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Add Server
                </button>
                <button
                  onClick={() => {
                    setShowAddServerModal(false);
                    setNewServerIP('');
                  }}
                  className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Access Method Modal */}
      {showAddMethodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Add Access Method</h3>
              <button
                onClick={() => {
                  setShowAddMethodModal(false);
                  setNewMethodName('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Method Name
                </label>
                <input
                  type="text"
                  value={newMethodName}
                  onChange={(e) => setNewMethodName(e.target.value)}
                  placeholder="e.g., Desktop, Tablet, API"
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 border border-slate-600"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAccessMethod()}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddAccessMethod}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  Add Method
                </button>
                <button
                  onClick={() => {
                    setShowAddMethodModal(false);
                    setNewMethodName('');
                  }}
                  className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
