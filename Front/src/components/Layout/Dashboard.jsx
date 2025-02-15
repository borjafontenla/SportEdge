// src/components/Layout/Dashboard.jsx
import React, { useState } from 'react';
import VideoStreamZoomCustom from '../Camera/VideoStreamZoomCustom';
import CameraControls from '../Camera/CameraControls';
import CaptureOptions from '../Camera/CaptureOptions';
import ZoomControls from '../Camera/ZoomControls';
import styles from './styles/Dashboard.module.css';

const Dashboard = ({ credentials }) => {
  const [zoom, setZoom] = useState(1);
  const streamUrl = "http://localhost:5000/hls/stream.m3u8";
  
  // Calcula dimensiones para ocupar el 80% del viewport
  const containerWidth = Math.floor(window.innerWidth * 0.8);
  const containerHeight = Math.floor(window.innerHeight * 0.8);

  return (
    <div className={styles.dashboard}>
      <div className={styles.videoArea}>
        <VideoStreamZoomCustom 
          streamUrl={streamUrl} 
          zoom={zoom} 
          width={containerWidth} 
          height={containerHeight} 
        />
      </div>
      <div className={styles.sidePanel}>
        <CameraControls />
        <CaptureOptions />
        <ZoomControls zoom={zoom} setZoom={setZoom} />
      </div>
    </div>
  );
};

export default Dashboard;
