 
import './index.css';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './AppRouter';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing in index.html');
const root = createRoot(container);
root.render(<AppRouter />);
