 
import './index.css';
import { createRoot } from 'react-dom/client';
import { MSALApp } from './MSALApp';
const container = document.getElementById('root');
if (container) {
	createRoot(container).render(<MSALApp />);
}
