import React from 'react';
import styles from './styles/VideoStreamH264.module.css';

const VideoStreamH264 = ({ streamUrl }) => {
  return (
    <div className={styles.container}>
      <video className={styles.video} autoPlay controls>
        <source src={streamUrl} type="video/mp4; codecs=h264" />
        Tu navegador no soporta la reproducción de H.264.
      </video>
    </div>
  );
};

export default VideoStreamH264;
