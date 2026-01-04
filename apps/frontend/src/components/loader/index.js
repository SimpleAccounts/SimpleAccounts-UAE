// Loader component with CSS animations (replaced framer-motion to save 378KB)
import oldloaderImage from 'assets/images/brand/loader-gif.gif';
import './loader.css';

export default function Loader({ loadingMsg, NextloadingMsg }) {
  return (
    <div style={{ marginTop: '18%' }}>
      <div
        className="mt-5"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="loader-logo-container">
          <img style={{ width: 200, height: 84 }} src={oldloaderImage} alt="logo" />
        </div>

        <div className="loader-ring loader-ring-inner" />
        <div className="loader-ring loader-ring-outer" />
      </div>
      <div className="text-center mt-5" style={{ color: '#1e6eff' }}>
        <b>
          {loadingMsg ? loadingMsg : 'Loading...'}
          <br />
          {NextloadingMsg ? NextloadingMsg : ''}
        </b>
      </div>
    </div>
  );
}
