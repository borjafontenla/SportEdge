import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import process from 'process';
import 'fontisto/dist/fontisto.min.css';

window.process = process;


const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
