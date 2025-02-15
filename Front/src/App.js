// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Dashboard from './components/Layout/Dashboard';
import VideoStreamWebRTC from './components/Camera/VideoStreamWebRTC';
import './App.css';

function App() {
  const credentials = {
    username: "root",
    password: "V9cVi3URKNQxdFd"
  };

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/stream" element={<Dashboard credentials={credentials} />} />
        <Route path="/stream-procesado" element={<VideoStreamWebRTC />} />
        <Route path="*" element={<Dashboard credentials={credentials} />} />
      </Routes>
    </Router>
  );
}

export default App;
