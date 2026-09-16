import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/base.css';
import './styles/sections.css';
import './styles/sections-bottom.css';

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
