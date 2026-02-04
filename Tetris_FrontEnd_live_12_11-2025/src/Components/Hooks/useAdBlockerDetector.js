import { useState, useEffect } from 'react';
import { detectAdBlocker } from '../../utils/adBlockerDetector';

export const useAdBlockerDetector = (options = {}) => {
  const { checkOnMount = true } = options;
  const [hasAdBlocker, setHasAdBlocker] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkAdBlocker = async () => {
    setIsChecking(true);
    try {
      const isBlocked = await detectAdBlocker();
      setHasAdBlocker(isBlocked);
      setShowPopup(isBlocked);
    } catch (error) {
      console.error("Ad blocker detection error:", error);
      setHasAdBlocker(false);
      setShowPopup(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (checkOnMount) {
      checkAdBlocker();
    }
  }, [checkOnMount]);

  return { 
    hasAdBlocker, 
    showPopup, 
    setShowPopup, 
    isChecking, 
    checkAdBlocker 
  };
};