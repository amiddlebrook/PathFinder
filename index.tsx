import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './index.css';

(window as typeof window & { L: typeof Leaflet }).L = Leaflet;
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(console.warn);
  });
}


const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);