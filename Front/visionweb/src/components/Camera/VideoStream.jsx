import React from 'react';

const VideoStream = ({ streamUrl }) => {
  return (
    <div style={styles.container}>
      <img
        src={streamUrl}
        alt="Stream de la Cámara"
        style={styles.video}
      />
    </div>
  );
};

const styles = {
  container: {
    flex: '0 0 80%',   // 80% del ancho
    height: '80vh',    // 80% del alto
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
};

export default VideoStream;
