// src/components/Layout/Dashboard.jsx
import React, { useState } from 'react';
import VideoStreamWithZoom from '../Camera/VideoZoomEfficient';
import CameraControls from '../Camera/CameraControls';
import PTZControls from '../Camera/PTZControls';
import CaptureOptions from '../Camera/CaptureOptions';
import styles from './Dashboard.module.css';

const Dashboard = ({ credentials }) => {
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 1));

  const streamUrl = "http://localhost:5000/hls/stream.m3u8";

  return (
    <div className={styles.dashboard}>
      <div className={styles.videoArea}>
        <VideoStreamWithZoom streamUrl={streamUrl} zoom={zoom} width={640} height={480} />
      </div>
      <div className={styles.sidePanel}>
        <CameraControls />
        {/* En lugar de los controles PTZ originales (si ya no se usan) podemos usar estos controles de zoom digital */}
        <div className={styles.zoomControls}>
          <button className={styles.zoomButton} onClick={handleZoomOut}>Alejar</button>
          <button className={styles.zoomButton} onClick={handleZoomIn}>Acercar</button>
        </div>
        <CaptureOptions />
      </div>
    </div>
  );
};

export default Dashboard;
