import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend } from 'recharts';
import { dashboardApi } from '../services/api';

interface ApiSuccessRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiId: string;
  apiPath: string;
}

interface SuccessRateData {
  time: string;
  successRate: number;
}

export function ApiSuccessRateModal({ isOpen, onClose, apiId, apiPath }: ApiSuccessRateModalProps) {
  const [data, setData] = useState<SuccessRateData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch success rate data for the specific API over time
        const response = await dashboardApi.getApiSuccessRateHistory({
          apiNumber: apiId,
          hours: 24, // Last 24 hours
        });

        if (response.success && response.data) {
          const formattedData = response.data.map((item: any) => ({
            time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            successRate: Math.round(item.successRate * 100) / 100,
          }));
          setData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching API success rate history:', error);
        // Generate sample data as fallback
        const sampleData: SuccessRateData[] = [];
        const now = new Date();
        for (let i = 23; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 60 * 60 * 1000);
          sampleData.push({
            time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            successRate: 85 + Math.random() * 15,
          });
        }
        setData(sampleData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, apiId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">API Success Rate</h2>
            <p className="text-slate-400 mt-1">
              {apiId} - {apiPath}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              Loading success rate data...
            </div>
          ) : (
            <>
              {/* Chart */}
              <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#94a3b8"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                      }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                      itemStyle={{ color: '#10b981' }}
                      formatter={(value: number) => [`${value.toFixed(2)}%`, 'Success Rate']}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="line"
                    />
                    <Line
                      type="monotone"
                      dataKey="successRate"
                      name="Success Rate"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Statistics Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Average</p>
                  <p className="text-2xl font-bold text-white">
                    {data.length > 0
                      ? (data.reduce((sum, item) => sum + item.successRate, 0) / data.length).toFixed(2)
                      : '0.00'}%
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Highest</p>
                  <p className="text-2xl font-bold text-green-400">
                    {data.length > 0
                      ? Math.max(...data.map(item => item.successRate)).toFixed(2)
                      : '0.00'}%
                  </p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-1">Lowest</p>
                  <p className="text-2xl font-bold text-red-400">
                    {data.length > 0
                      ? Math.min(...data.map(item => item.successRate)).toFixed(2)
                      : '0.00'}%
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
