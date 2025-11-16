// import { useState } from 'react';
// import { ClockIcon, Filter, ChevronDown, ChevronUp } from 'lucide-react';

// export function FilterSection() {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <div className="space-y-4">
//       {/* Filter Toggle Button */}
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//       >
//         <Filter size={20} />
//         <span>{isOpen ? 'Hide Filters' : 'Show Filters'}</span>
//         {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//       </button>

//       {/* Collapsible Filter Panel */}
//       {isOpen && (
//         <div className="bg-slate-800 rounded-xl p-6 shadow-lg animate-slideDown">
//           <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-white mb-2">API Number</label>
//               <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
//                 <option>All APIs</option>
//                 <option>API-001</option>
//                 <option>API-002</option>
//                 <option>API-003</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-white mb-2">API Name</label>
//               <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
//                 <option>API Names</option>
//                 <option>/customers</option>
//                 <option>/orders</option>
//                 <option>/products</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-white mb-2">Customer Number</label>
//               <input
//                 type="text"
//                 placeholder="Enter customer number"
//                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-white mb-2">Date</label>
//               <input
//                 type="date"
//                 placeholder="mm/dd/yyyy"
//                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-white mb-2">Time</label>
//               <div className="relative">
//                 <input
//                   type="time"
//                   className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-white mb-2">Auto Refresh</label>
//               <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
//                 <option>Every 30s</option>
//                 <option>Every 1m</option>
//                 <option>Every 5m</option>
//                 <option>Off</option>
//               </select>
//             </div>
//             <div className="flex items-end">
//               <button className="w-full px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2">
//                 <span>🔍</span>
//                 Apply Filters
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { ClockIcon, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { dashboardApi } from '../services/api';

interface ApiItem {
  number: string;
  name: string;
}

export function FilterSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiList, setApiList] = useState<ApiItem[]>([]);
  const [filters, setFilters] = useState({
    apiNumber: 'ALL',
    apiName: '',
    customerNumber: '',
    date: '',
    time: '',
    autoRefresh: '30s'
  });

  useEffect(() => {
    // Fetch API list from backend
    const fetchApiList = async () => {
      try {
        const response = await dashboardApi.getApiList();
        if (response.success) {
          setApiList(response.data);
        }
      } catch (error) {
        console.error('Error fetching API list:', error);
      }
    };
    fetchApiList();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    // Emit filter change event or call parent callback
    console.log('Applied filters:', filters);
    // You can emit custom event or use context/redux here
    window.dispatchEvent(new CustomEvent('filtersChanged', { detail: filters }));
  };

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <Filter size={20} />
        <span>{isOpen ? 'Hide Filters' : 'Show Filters'}</span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Collapsible Filter Panel */}
      {isOpen && (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg animate-slideDown">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">API Number</label>
              <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.apiNumber}
                onChange={(e) => handleFilterChange('apiNumber', e.target.value)}
              >
                <option value="ALL">All APIs</option>
                {apiList.map((api) => (
                  <option key={api.number} value={api.number}>
                    {api.number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">API Name</label>
              <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.apiName}
                onChange={(e) => handleFilterChange('apiName', e.target.value)}
              >
                <option value="">API Names</option>
                {apiList.map((api) => (
                  <option key={api.number} value={api.name}>
                    {api.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Customer Number</label>
              <input
                type="text"
                placeholder="Enter customer number"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.customerNumber}
                onChange={(e) => handleFilterChange('customerNumber', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Date</label>
              <input
                type="date"
                placeholder="mm/dd/yyyy"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.date}
                onChange={(e) => handleFilterChange('date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Time</label>
              <div className="relative">
                <input
                  type="time"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.time}
                  onChange={(e) => handleFilterChange('time', e.target.value)}
                />
                <ClockIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Auto Refresh</label>
              <select 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.autoRefresh}
                onChange={(e) => handleFilterChange('autoRefresh', e.target.value)}
              >
                <option value="30s">Every 30s</option>
                <option value="1m">Every 1m</option>
                <option value="5m">Every 5m</option>
                <option value="off">Off</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                className="w-full px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                onClick={handleApplyFilters}
              >
                <span>🔍</span>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}                                           