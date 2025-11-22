 
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// export function AccessMethodChart() {
//   const data = [
//     { name: 'Mobile', value: 1200 },
//     { name: 'Web', value: 800 },
//     { name: 'Chatbot', value: 400 },
//   ];

//   return (
//     <div className="bg-slate-800 rounded-xl p-6">
//       <h3 className="text-lg font-bold text-white mb-4">Access Method Distribution</h3>

//       <ResponsiveContainer width="100%" height={250}>
//         <PieChart>
//           {/* original gradients */}
//           <defs>
//             <linearGradient id="cyanGradient" x1="0" y1="0" x2="1" y2="1">
//               <stop offset="0%" stopColor="#06b6d4" />
//               <stop offset="100%" stopColor="#22d3ee" />
//             </linearGradient>
//             <linearGradient id="tealGradient" x1="0" y1="0" x2="1" y2="1">
//               <stop offset="0%" stopColor="#0891b2" />
//               <stop offset="100%" stopColor="#14b8a6" />
//             </linearGradient>
//             <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="1">
//               <stop offset="0%" stopColor="#a855f7" />
//               <stop offset="100%" stopColor="#c084fc" />
//             </linearGradient>
//           </defs>

//           <Pie
//             data={data}
//             cx="50%"
//             cy="55%"
//             outerRadius={85}
//             dataKey="value"
//             nameKey="name"
//             label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//             labelLine={false}
//           >
//             <Cell fill="url(#cyanGradient)" />
//             <Cell fill="url(#tealGradient)" />
//             <Cell fill="url(#purpleGradient)" />
//           </Pie>

//           <Tooltip
//             contentStyle={{
//               backgroundColor: '#1e293b',
//               border: 'none',
//               borderRadius: '8px'
//             }}
//             /* labelStyle and itemStyle reliably apply to tooltip text nodes */
//             labelStyle={{ color: '#94a3b8', fontSize: 12 }}
//             itemStyle={{ color: '#fff', fontSize: 13 }}
//             // return [formattedValue, originalName] so the second column shows 'Mobile'/'Web'/'Chatbot'
//             formatter={(value: number, name: string) => [value.toLocaleString(), name]}
//           />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }


 
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { dashboardApi } from '../services/api';
import { Plus, Trash2, X } from 'lucide-react';

interface AccessMethod {
  name: string;
  value: number;
}

const STORAGE_KEY = 'myslt-access-methods';
const DEFAULT_COLORS = ['#06b6d4', '#0891b2', '#a855f7', '#14b8a6', '#f59e0b', '#10b981'];

// Helper function to remove duplicates (case-insensitive)
const deduplicateData = (arr: AccessMethod[]): AccessMethod[] => {
  const seen = new Map<string, AccessMethod>();
  arr.forEach(item => {
    const key = item.name.toLowerCase();
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  });
  return Array.from(seen.values());
};

export function AccessMethodChart() {

  const [data, setData] = useState<AccessMethod[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [
        { name: 'Mobile', value: 0 },
        { name: 'Web', value: 0 },
        { name: 'Chatbot', value: 0 },
      ];
      // Remove duplicates on load
      return deduplicateData(parsed);
    } catch (err) {
      return [
        { name: 'Mobile', value: 0 },
        { name: 'Web', value: 0 },
        { name: 'Chatbot', value: 0 },
      ];
    }
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newMethodName, setNewMethodName] = useState('');
  const [deleteMethodName, setDeleteMethodName] = useState('');

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save access methods:', err);
    }
  }, [data]);

  useEffect(() => {
    const fetchData = async (filters?: any) => {
      try {
        const response = await dashboardApi.getStats(filters);
        if (response.success && response.data.accessMethodDistribution) {
          const dist = response.data.accessMethodDistribution;
          // Update values from API but keep existing methods
          setData(prevData => {
            const updated = prevData.map(item => ({
              ...item,
              value: dist[item.name.toUpperCase()] ?? item.value
            }));
            // Ensure no duplicates after update
            return deduplicateData(updated);
          });
        }
      } catch (error) {
        console.error('Error fetching access method data:', error);
      }
    };

    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    
    const handleFilterChange = (event: any) => {
      const filters = event.detail || {};
      console.log('AccessMethodChart applying filters:', filters);
      fetchData(filters);
    };
    window.addEventListener('filtersChanged', handleFilterChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('filtersChanged', handleFilterChange);
    };
  }, []);

  const handleAddMethod = () => {
    const trimmed = newMethodName.trim();
    if (!trimmed) {
      alert('Please enter a method name');
      return;
    }
    
    // Check for duplicates (case-insensitive)
    const exists = data.some(m => m.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      alert(`Access method "${trimmed}" already exists`);
      return;
    }

    setData(prevData => [...prevData, { name: trimmed, value: 0 }]);
    setNewMethodName('');
    setShowAddModal(false);
  };

  const handleDeleteMethod = () => {
    setData(data.filter(m => m.name !== deleteMethodName));
    setDeleteMethodName('');
    setShowDeleteModal(false);
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Access Method Distribution</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Add access method"
          >
            <Plus size={18} />
          </button>
          <button
            onClick={() => {
              if (data.length > 0) {
                setShowDeleteModal(true);
              }
            }}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={data.length === 0}
            title="Remove access method"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          {/* original gradients */}
          <defs>
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="tealGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>

          <Pie
            data={data}
            cx="50%"
            cy="55%"
            outerRadius={85}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px'
            }}
            /* labelStyle and itemStyle reliably apply to tooltip text nodes */
            labelStyle={{ color: '#94a3b8', fontSize: 12 }}
            itemStyle={{ color: '#fff', fontSize: 13 }}
            // return [formattedValue, originalName] so the second column shows 'Mobile'/'Web'/'Chatbot'
            formatter={(value: number, name: string) => [value.toLocaleString(), name]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Add Method Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Add Access Method</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
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
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMethod()}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddMethod}
                  disabled={!newMethodName.trim()}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  Add Method
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false);
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

      {/* Delete Method Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Remove Access Method</h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteMethodName('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Method to Remove
                </label>
                <select
                  value={deleteMethodName}
                  onChange={(e) => setDeleteMethodName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border border-slate-600"
                >
                  <option value="">Choose a method...</option>
                  {data.map((method) => (
                    <option key={method.name} value={method.name}>
                      {method.name} ({method.value} requests)
                    </option>
                  ))}
                </select>
              </div>

              {deleteMethodName && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
                  <p className="text-red-400 text-sm">
                    Warning: This will permanently remove "{deleteMethodName}" from the chart.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDeleteMethod}
                  disabled={!deleteMethodName}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                  Remove Method
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteMethodName('');
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
