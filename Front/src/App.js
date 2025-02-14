import React from 'react';
import Dashboard from './components/Layaout/Dashboard';

function App() {
  // Credenciales de ejemplo (no se usan para el stream en este ejemplo ya que el backend lo maneja)
  const credentials = {
    username: "root",
    password: "V9cVi3URKNQxdFd"
  };

  return <Dashboard credentials={credentials} />;
  
}

export default App;
