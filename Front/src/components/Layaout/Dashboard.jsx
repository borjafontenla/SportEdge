import React from 'react';
import VideoStreamH264 from '../Camera/VideoStreamH264';
import CameraControls from '../Camera/CameraControls';
import PTZControls from '../Camera/PTZControls';
import CaptureOptions from '../Camera/CaptureOptions';
import styles from './Dashboard.module.css';

const Dashboard = ({ credentials }) => {
  // La URL del stream HLS (producida por FFmpeg y servida por tu backend o servidor web)
  const streamUrl = "http://localhost:5000/hls/stream.m3u8";

  return (
    <div className={styles.dashboard}>
      <div className={styles.videoArea}>
        <VideoStreamH264 streamUrl={streamUrl} />
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
