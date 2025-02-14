// src/components/Layout/Dashboard.jsx
import React, { useState } from 'react';
import VideoStreamZoomCustom from '../Camera/VideoStreamZoomCustom';
import CameraControls from '../Camera/CameraControls';
import PTZControls from '../Camera/PTZControls';
import CaptureOptions from '../Camera/CaptureOptions';
import styles from './Dashboard.module.css';

const Dashboard = ({ credentials }) => {
  const [zoom, setZoom] = useState(1);
  const streamUrl = "http://localhost:5000/hls/stream.m3u8";

  return (
    <div className={styles.dashboard}>
      <div className={styles.videoArea}>
        <VideoStreamZoomCustom streamUrl={streamUrl} zoom={zoom} width={Math.floor(window.innerWidth * 0.8)} height={Math.floor(window.innerHeight * 0.8)} />
      </div>
      <div className={styles.sidePanel}>
        <CameraControls />
        {/* Aquí puedes dejar los controles PTZ originales para otras funciones */}
        
        <CaptureOptions />
      </div>
    </div>
  );
};

export default Dashboard;
