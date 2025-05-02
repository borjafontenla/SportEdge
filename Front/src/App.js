import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Dashboard from './components/Layout/Dashboard';
import VideoStreamWebRTC from './components/Camera/VideoStreamWebRTC';
import { BACKEND_URL } from './config'; // Importar URL
import axios from 'axios'; // Para llamadas API
import './App.css';

function App() {
  const [cameras, setCameras] = useState([]); // Lista de cámaras disponibles {id: 'cam1', ...}
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar lista de cámaras desde el backend al montar
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${BACKEND_URL}/api/cameras`);
        if (response.data && response.data.length > 0) {
          setCameras(response.data);
          setSelectedCameraId(response.data[0].id); // Selecciona la primera por defecto
        } else {
          setError("No se encontraron cámaras configuradas en el backend.");
          setCameras([]);
          setSelectedCameraId(null);
        }
      } catch (err) {
        console.error("Error fetching cameras:", err);
        setError(`Error al cargar cámaras: ${err.message}`);
        setCameras([]);
        setSelectedCameraId(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCameras();
  }, []); // Se ejecuta solo una vez al montar

  if (loading) {
    return <div>Cargando configuración de cámaras...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;
  }

  if (cameras.length === 0) {
      return <div style={{ padding: '20px' }}>No hay cámaras disponibles para mostrar. Verifica la configuración del backend.</div>;
  }

  return (
    <Router>
      {/* Pasar cámaras y selector al Header */}
      <Header
          cameras={cameras}
          selectedCameraId={selectedCameraId}
          onSelectCamera={setSelectedCameraId}
      />
      <main className="app-main-content"> {/* Añadir clase para posible padding */}
        <Routes>
          <Route
            path="/stream"
            element={
              selectedCameraId ? (
                <Dashboard key={selectedCameraId} cameraId={selectedCameraId} /> // key ayuda a React a remontar si cambia la cámara
              ) : (
                <div>Selecciona una cámara</div>
              )
            }
          />
          <Route
            path="/stream-procesado"
            element={
              selectedCameraId ? (
                <VideoStreamWebRTC key={selectedCameraId} cameraId={selectedCameraId} />
              ) : (
                <div>Selecciona una cámara</div>
              )
            }
          />
          {/* Redirige la ruta raíz a /stream por defecto */}
          <Route path="*" element={<Navigate to="/stream" replace />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;