import React from 'react';
import { FilterSection } from '../components/FilterSection';
import { MetricCards } from '../components/MetricCards';
import { AccessMethodChart } from '../components/AccessMethodChart';
import { ResponseTimeChart } from '../components/ResponseTimeChart';
import { SuccessRateChart } from '../components/SuccessRateChart';
import { LiveTrafficChart } from '../components/LiveTrafficChart';
import { ResponseTypeChart } from '../components/ResponseTypeChart';
// import { ApiDetailsTable } from '../components/ApiDetailsTable';
export function Dashboard() {
  return <div className="space-y-6">
      
      <FilterSection />
      <MetricCards />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ResponseTypeChart />
        <AccessMethodChart />
        <ResponseTimeChart />
        <SuccessRateChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveTrafficChart />
        {/* <ApiDetailsTable /> */}
      </div>
    </div>;
}