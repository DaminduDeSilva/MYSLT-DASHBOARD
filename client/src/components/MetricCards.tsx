 
import { UsersIcon, TrendingUpIcon, ActivityIcon, ServerIcon } from 'lucide-react';
export function MetricCards() {
  const metrics = [{
    title: 'Total Active Customers',
    value: '637',
    change: '+12% from last hour',
    icon: UsersIcon,
    color: 'bg-blue-500',
    textColor: 'text-blue-100'
  }, {
    title: 'Total Traffic Count',
    value: '15.2K',
    change: '+8% from yesterday',
    icon: TrendingUpIcon,
    color: 'bg-green-500',
    textColor: 'text-green-100'
  }, {
    title: 'Live Traffic',
    value: '542',
    change: 'Real-time monitoring',
    icon: ActivityIcon,
    color: 'bg-emerald-500',
    textColor: 'text-emerald-100',
    badge: 'LIVE'
  }, {
    title: 'Number of Requests',
    value: '2,481',
    change: '172.25.37.16',
    icon: ServerIcon,
    color: 'bg-cyan-500',
    textColor: 'text-cyan-100'
  }, {
    title: 'Number of Requests',
    value: '2,472',
    change: '172.25.37.21',
    icon: ServerIcon,
    color: 'bg-purple-500',
    textColor: 'text-purple-100'
  }, {
    title: 'Number of Requests',
    value: '1,847',
    change: '172.25.37.138',
    icon: ServerIcon,
    color: 'bg-indigo-500',
    textColor: 'text-indigo-100'
  }];
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => <div key={index} className={`${metric.color} rounded-lg p-4 text-white relative overflow-hidden`}>
          {metric.badge && <div className="absolute top-2 right-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
              {metric.badge}
            </div>}
          <div className="space-y-2">
            <div className="bg-white/20 p-2 rounded-lg w-fit">
              <metric.icon size={15} />
            </div>
            <div>
              <p className={`text-xs ${metric.textColor} mb-1`}>
                {metric.title}
              </p>
              <p className="text-2xl font-bold mb-0.5">{metric.value}</p>
              <p className={`text-xs ${metric.textColor}`}>{metric.change}</p>
            </div>
          </div>
        </div>)}
    </div>;
}
