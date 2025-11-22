 
// export function ApiDetailsTable() {
//   const apiData = [{
//     id: 'API-001',
//     method: 'GET',
//     path: '/customers',
//     successRate: '98%',
//     avgResponse: '120ms',
//     requestCount: 1240
//   }, {
//     id: 'API-002',
//     method: 'POST',
//     path: '/orders',
//     successRate: '97%',
//     avgResponse: '180ms',
//     requestCount: 840
//   }, {
//     id: 'API-003',
//     method: 'GET',
//     path: '/products',
//     successRate: '99%',
//     avgResponse: '90ms',
//     requestCount: 1520
//   }, {
//     id: 'API-004',
//     method: 'PUT',
//     path: '/users',
//     successRate: '96%',
//     avgResponse: '150ms',
//     requestCount: 680
//   }, {
//     id: 'API-005',
//     method: 'DELETE',
//     path: '/carts',
//     successRate: '98%',
//     avgResponse: '110ms',
//     requestCount: 320
//   }];
//   return <div className="bg-slate-800 rounded-xl p-6">
//       <h3 className="text-lg font-bold text-white mb-4">API Details</h3>
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead>
//             <tr className="border-b border-slate-700">
//               <th className="text-left py-3 px-4 text-slate-400 font-medium">
//                 API ID
//               </th>
//               <th className="text-left py-3 px-4 text-slate-400 font-medium">
//                 Method
//               </th>
//               <th className="text-left py-3 px-4 text-slate-400 font-medium">
//                 Path
//               </th>
//               <th className="text-left py-3 px-4 text-slate-400 font-medium">
//                 Success Rate
//               </th>
//               <th className="text-left py-3 px-4 text-slate-400 font-medium">
//                 Avg. Response
//               </th>
//               <th className="text-left py-3 px-4 text-slate-400 font-medium">
//                 Request Count
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {apiData.map(api => <tr key={api.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
//                 <td className="py-4 px-4 text-slate-300">{api.id}</td>
//                 <td className="py-4 px-4 text-slate-300">{api.method}</td>
//                 <td className="py-4 px-4 text-slate-300">{api.path}</td>
//                 <td className="py-4 px-4 text-slate-300">{api.successRate}</td>
//                 <td className="py-4 px-4 text-slate-300">{api.avgResponse}</td>
//                 <td className="py-4 px-4 text-slate-300">{api.requestCount}</td>
//               </tr>)}
//           </tbody>
//         </table>
//       </div>
//     </div>;
// }


 
import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';

interface ApiData {
  apiId: string;
  method: string;
  path: string;
  successRate: string;
  avgResponse: string;
  requestCount: number;
}

export function ApiDetailsTable() {
  const [apiData, setApiData] = useState<ApiData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (filters?: any) => {
      try {
        const combinedFilters = { limit: 20, ...filters };
        const response = await dashboardApi.getApiDetails(combinedFilters);
        if (response.success && response.data) {
          setApiData(response.data);
        }
      } catch (error) {
        console.error('Error fetching API details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    
    const handleFilterChange = (event: any) => {
      const filters = event.detail || {};
      console.log('ApiDetailsTable applying filters:', filters);
      fetchData(filters);
    };
    window.addEventListener('filtersChanged', handleFilterChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('filtersChanged', handleFilterChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">API Details</h3>
        <div className="text-slate-400 text-center py-8">Loading...</div>
      </div>
    );
  }
  return <div className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">API Details</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 font-medium">
                API ID
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">
                Method
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">
                Path
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">
                Success Rate
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">
                Avg. Response
              </th>
              <th className="text-left py-3 px-4 text-slate-400 font-medium">
                Request Count
              </th>
            </tr>
          </thead>
          <tbody>
            {apiData.map(api => <tr key={api.apiId} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                <td className="py-4 px-4 text-slate-300">{api.apiId}</td>
                <td className="py-4 px-4 text-slate-300">{api.method}</td>
                <td className="py-4 px-4 text-slate-300">{api.path}</td>
                <td className="py-4 px-4 text-slate-300">{api.successRate}</td>
                <td className="py-4 px-4 text-slate-300">{api.avgResponse}</td>
                <td className="py-4 px-4 text-slate-300">{api.requestCount}</td>
              </tr>)}
          </tbody>
        </table>
      </div>
    </div>;
}
