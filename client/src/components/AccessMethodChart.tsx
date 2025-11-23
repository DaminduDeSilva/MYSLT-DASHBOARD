 
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { dashboardApi } from '../services/api';

export function AccessMethodChart() {
  const [data, setData] = useState([
    { name: 'Mobile', value: 0 },
    { name: 'Web', value: 0 },
    { name: 'Chatbot', value: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getStats();
        if (response.success && response.data.accessMethodDistribution) {
          const dist = response.data.accessMethodDistribution;
          setData([
            { name: 'Mobile', value: dist.MOBILE || 0 },
            { name: 'Web', value: dist.WEB || 0 },
            { name: 'Chatbot', value: dist.CHATBOT || 0 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching access method data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    window.addEventListener('filtersChanged', fetchData);

    // Listen for new access methods added dynamically
    const handleAccessMethodAdded = (event: CustomEvent) => {
      const newMethod = event.detail as string;
      setData((prevData) => {
        // Check if newMethod already exists (case insensitive)
        if (prevData.find((item) => item.name.toLowerCase() === newMethod.toLowerCase())) {
          return prevData;
        }
        // Add new access method with zero value initially
        return [...prevData, { name: newMethod, value: 0 }];
      });
    };
    window.addEventListener('accessMethodAdded', handleAccessMethodAdded as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('filtersChanged', fetchData);
      window.removeEventListener('accessMethodAdded', handleAccessMethodAdded as EventListener);
    };
  }, []);

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Access Method Distribution</h3>

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
            {data.map((entry, index) => {
              // Using gradient fills cycling through gradients for new access methods
              const gradientIds = ['cyanGradient', 'tealGradient', 'purpleGradient'];
              const fillId = gradientIds[index % gradientIds.length];
              return <Cell key={`cell-${index}`} fill={`url(#${fillId})`} />;
            })}
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
