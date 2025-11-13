import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Activity, Server } from 'lucide-react';
import emailjs from "emailjs-com";


export function MetricCards() {
  const [refreshInterval, setRefreshInterval] = useState(5000); // 30 seconds default
  const [metrics, setMetrics] = useState([
    {
      title: 'Total Active Customers',
      value: 637,
      change: '+12% from last hour',
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-100',
      threshold: 1000
    },
    {
      title: 'Total Traffic Count',
      value: 15200,
      change: '+8% from yesterday',
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-100',
      threshold: 20000
    },
    {
      title: 'Live Traffic',
      value: 500,
      change: 'Real-time monitoring',
      icon: Activity,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-100',
      badge: 'LIVE',
      threshold: 502
    },
    {
      title: 'Number of Requests',
      value: 2481,
      change: '172.25.37.16',
      icon: Server,
      color: 'bg-cyan-500',
      textColor: 'text-cyan-100',
      threshold: 3000
    },
    {
      title: 'Number of Requests',
      value: 2472,
      change: '172.25.37.21',
      icon: Server,
      color: 'bg-purple-500',
      textColor: 'text-purple-100',
      threshold: 3000
    },
    {
      title: 'Number of Requests',
      value: 1847,
      change: '172.25.37.138',
      icon: Server,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-100',
      threshold: 3000
    }
  ]);

  // Function to simulate fetching new data
  const refreshMetrics = () => {
  setMetrics(prevMetrics => {
    const updated = prevMetrics.map(metric => ({
      ...metric,
      value: metric.value + Math.floor(Math.random() * 100) - 50
    }));

    // Find the LIVE TRAFFIC card
    const liveTrafficCard = updated.find(m => m.title === "Live Traffic");

    // Alert condition
    if (liveTrafficCard && liveTrafficCard.value <= 0) {
      sendTrafficAlert();
    }

    return updated;
  });
};


  // Auto refresh effect
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMetrics();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Format number with K notation
  const formatValue = (value) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toLocaleString();
  };

  // Check if value exceeds threshold
  const isHighTraffic = (value, threshold) => {
    return value > threshold;
  };

  const sendTrafficAlert = () => {
  emailjs.send(
    "service_22depjr",
    "template_wikzlfa",
    {
      subject: "ALERT: Live Traffic Dropped to 0",
      message: "Live Traffic value is currently 0. Immediate attention required!"
    },
    "BGYMrLhoFJo2n84_3"
  )
  .then(() => {
    console.log("Traffic alert email sent!");
  })
  .catch((err) => {
    console.log("Failed to send traffic alert", err);
  });
};


  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`${metric.color} rounded-lg p-3 text-white relative overflow-hidden`}
        >
          {metric.badge && (
            <div className="absolute top-2 right-2 bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
              {metric.badge}
            </div>
          )}
          <div className="space-y-2">
            <div className="bg-white/20 p-2 rounded-lg w-fit">
              <metric.icon size={16} />
            </div>
            <div>
              <p className={`text-[10px] ${metric.textColor} mb-1`}>
                {metric.title}
              </p>
              <p 
                className={`text-3xl font-bold mb-0.5 transition-colors duration-300 ${
                  isHighTraffic(metric.value, metric.threshold) 
                    ? 'text-red-400 animate-pulse' 
                    : ''
                }`}
              >
                {formatValue(metric.value)}
              </p>
              <p className={`text-[10px] ${metric.textColor}`}>
                {metric.change}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}