import React, { createContext, useContext, useEffect, useState } from 'react';

const TelegramContext = createContext();

export function TelegramProvider({ children }) {
  const [tg, setTg] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const webApp = window.Telegram?.WebApp;
      if (!webApp) {
        throw new Error('Telegram WebApp is not available');
      }

      // Initialize WebApp
      webApp.ready();
      webApp.expand();

      // Store the WebApp instance
      setTg(webApp);
      setIsReady(true);

      // Handle viewport changes
      const handleViewportChange = () => {
        if (webApp.isExpanded) {
          webApp.expand();
        }
      };

      window.addEventListener('resize', handleViewportChange);

      // Reinitialize on visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          webApp.ready();
        }
      });

      return () => {
        window.removeEventListener('resize', handleViewportChange);
      };
    } catch (err) {
      console.error('Error initializing Telegram WebApp:', err);
      setError(err.message);
    }
  }, []);

  const value = {
    tg,
    isReady,
    error,
    setHeaderColor: (color) => {
      try {
        tg?.setHeaderColor(color);
      } catch (err) {
        console.warn('Error setting header color:', err);
      }
    },
    setBackgroundColor: (color) => {
      try {
        tg?.setBackgroundColor(color);
      } catch (err) {
        console.warn('Error setting background color:', err);
      }
    },
    showBackButton: () => {
      try {
        tg?.BackButton.show();
      } catch (err) {
        console.warn('Error showing back button:', err);
      }
    },
    hideBackButton: () => {
      try {
        tg?.BackButton.hide();
      } catch (err) {
        console.warn('Error hiding back button:', err);
      }
    }
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}; 