import React from 'react';
import { SearchIcon, BellIcon, UserIcon } from 'lucide-react';
export function Header() {
  return <header className="h-16 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-xl font-bold text-white">
          <span className="text-blue-500">MySLT</span> Monitoring
        </h1>
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input type="text" placeholder="Filter your monitoring data..." className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Export
        </button>
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-700 transition-colors">
          <BellIcon size={20} />
        </button>
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-700 transition-colors">
          <UserIcon size={20} />
        </button>
      </div>
    </header>;
}