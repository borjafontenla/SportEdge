import React from 'react';
import VideoStreamH265 from '../Camera/VideoStreamH264';
import CameraControls from '../Camera/CameraControls';
import PTZControls from '../Camera/PTZControls';
import CaptureOptions from '../Camera/CaptureOptions';

const Dashboard = ({ credentials }) => {
  // URL del backend que entrega el stream H.265.
  // Asegúrate de que tu backend esté configurado para entregar un stream en H.265.
  const streamUrl = "http://localhost:5000/api/camera/stream"; 

  return (
    <div style={styles.dashboard}>
      <VideoStreamH265 streamUrl={streamUrl} />
      <div style={styles.sidePanel}>
        <CameraControls />
        <PTZControls />
        <CaptureOptions />
      </div>
    </div>
  );
};

const styles = {
  dashboard: {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#fff'
  },
  sidePanel: {
    flex: '0 0 20%',
    height: '80vh',
    padding: '20px',
    boxSizing: 'border-box',
    borderLeft: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around'
  }
};

export default Dashboard;
