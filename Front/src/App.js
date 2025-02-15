// src/App.jsx
import React from 'react';
import Header from './components/Layout/Header';
import Dashboard from './components/Layout/Dashboard';
import './App.css';

function App() {
  // Ejemplo de credenciales
  const credentials = {
    username: "root",
    password: "V9cVi3URKNQxdFd"
  };

  return (
    <div>
      <Header />
      <Dashboard credentials={credentials} />
    </div>
  );
}

export default App;
