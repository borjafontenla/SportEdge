import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import process from 'process';
window.process = process;


const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
