import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Toaster } from 'react-hot-toast';

const ToastPortal = () => {
  const [portalContainer, setPortalContainer] = useState(null);

  useEffect(() => {
    // Create a new div element for the portal
    const portalDiv = document.createElement('div');
    portalDiv.id = 'toast-portal-root';
    
    // Style the portal container
    Object.assign(portalDiv.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      pointerEvents: 'none',
      zIndex: '2147483647',
      display: 'block',
      isolation: 'isolate'
    });

    // Append it to the body
    document.body.appendChild(portalDiv);
    setPortalContainer(portalDiv);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(portalDiv);
    };
  }, []);

  if (!portalContainer) return null;

  return ReactDOM.createPortal(
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 1000,
        style: {
          background: "#041821",
          color: "white",
          marginTop: "400px",
          position: "relative",
          maxWidth: "90%",
          margin: "0 auto",
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          isolation: 'isolate'
        }
      }}
      containerStyle={{
        position: "fixed",
        marginTop:"3.5rem",
        inset: '0',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pointerEvents: "none"
      }}
    />,
    portalContainer
  );
};

export default ToastPortal; 