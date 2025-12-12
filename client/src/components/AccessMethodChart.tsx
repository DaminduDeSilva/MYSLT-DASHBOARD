import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { dashboardApi } from '../services/api';

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
      return deduplicateData(parsed);
    } catch (err) {
      return [
        { name: 'Mobile', value: 0 },
        { name: 'Web', value: 0 },
        { name: 'Chatbot', value: 0 },
      ];
    }
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save access methods:', err);
    }
  }, [data]);

  // Reload when changed in admin panel
  useEffect(() => {
    const handleReload = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setData(deduplicateData(JSON.parse(saved)));
    };
    window.addEventListener('accessMethodsUpdated', handleReload);
    return () => window.removeEventListener('accessMethodsUpdated', handleReload);
  }, []);

  useEffect(() => {
    const fetchData = async (filters?: any) => {
      try {
        const response = await dashboardApi.getStats(filters);
        if (response.success && response.data.accessMethodDistribution) {
          const dist = response.data.accessMethodDistribution;
          setData(prevData => {
            const updated = prevData.map(item => ({
              ...item,
              value: dist[item.name.toUpperCase()] ?? item.value
            }));
            return deduplicateData(updated);
          });
        }
      } catch (error) {
        console.error('Error fetching access method data:', error);
        // Clear data when backend connection fails
        const emptyData = [
          { name: 'Mobile', value: 0 },
          { name: 'Web', value: 0 },
          { name: 'Chatbot', value: 0 },
        ];
        setData(emptyData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyData));
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

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Access Method Distribution</h3>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
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
            labelStyle={{ color: '#94a3b8', fontSize: 12 }}
            itemStyle={{ color: '#fff', fontSize: 13 }}
            formatter={(value: number, name: string) => [value.toLocaleString(), name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
