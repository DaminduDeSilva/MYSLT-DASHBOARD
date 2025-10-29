import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3Icon, ServerIcon, SettingsIcon, HelpCircleIcon } from 'lucide-react';
export function Sidebar() {
  const location = useLocation();
  const navItems = [{
    path: '/',
    icon: ServerIcon,
    label: 'Servers'
  }, {
    path: '/dashboard',
    icon: BarChart3Icon,
    label: 'Dashboard'
  }];
  return <div className="w-20 hover:w-64 bg-slate-950 flex flex-col items-start py-6 gap-6 transition-all duration-300 group">
      <div className="flex items-center gap-3 px-4">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
          M
        </div>
        <span className="text-white font-bold text-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          MySLT Monitor
        </span>
      </div>
      <nav className="flex-1 flex flex-col gap-4 w-full">
        {navItems.map(item => <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <item.icon size={24} className="shrink-0" />
            <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {item.label}
            </span>
          </Link>)}
      </nav>
      <div className="flex flex-col gap-4 w-full">
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
          <SettingsIcon size={24} className="shrink-0" />
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Settings
          </span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors">
          <HelpCircleIcon size={24} className="shrink-0" />
          <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Help
          </span>
        </button>
      </div>
    </div>;
}