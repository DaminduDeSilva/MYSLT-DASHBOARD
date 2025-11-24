 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import { SystemHealth } from './pages/SystemHealth';
import { Dashboard } from './pages/Dashboard';
import { ApiDetailsTable } from './pages/ApiDetailsTable';
import { AdminPanel } from './pages/AdminPanel';
import { Login } from './pages/Login';

export function AppRouter() {
  return <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />}>
          <Route index element={<SystemHealth />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="api-details" element={<ApiDetailsTable />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
        
      </Routes>
    </BrowserRouter>;
}
