import React from 'react';
import VideoStreamHLS from '../Camera/VideoStreamHLS';
import CameraControls from '../Camera/CameraControls';
import PTZControls from '../Camera/PTZControls';
import CaptureOptions from '../Camera/CaptureOptions';
import styles from './Dashboard.module.css';

const Dashboard = ({ credentials }) => {
  // Asegúrate de que la URL apunte al playlist generado por tu backend
  const streamUrl = "http://localhost:5000/hls/stream.m3u8";

  return (
    <div className={styles.dashboard}>
      <div className={styles.videoArea}>
        <VideoStreamHLS streamUrl={streamUrl} />
      </div>
      <div className={styles.sidePanel}>
        <CameraControls />
        <PTZControls />
        <CaptureOptions />
      </div>
    </div>
  );
};

export default Dashboard;
