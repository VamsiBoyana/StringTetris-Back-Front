// utils/adBlockerDetector.js
export const detectAdBlocker = () => {
    return new Promise((resolve) => {
      let detectionCount = 0;
      let totalTests = 3; // Number of tests we'll run
      let isBlocked = false;
  
      // Cleanup function
      const cleanup = () => {
        if (script.parentNode) document.body.removeChild(script);
        if (baitDiv.parentNode) document.body.removeChild(baitDiv);
      };
  
      // Technique 1: Script Loading
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.onload = () => {
        detectionCount++;
        checkDetectionStatus();
      };
      script.onerror = () => {
        isBlocked = true;
        detectionCount++;
        checkDetectionStatus();
      };
      document.body.appendChild(script);
  
      // Technique 2: Bait Elements
      const baitDiv = document.createElement('div');
      baitDiv.className = 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links';
      baitDiv.style.width = '1px';
      baitDiv.style.height = '1px';
      baitDiv.style.position = 'absolute';
      baitDiv.style.left = '-10000px';
      baitDiv.style.top = '-1000px';
      document.body.appendChild(baitDiv);
  
      setTimeout(() => {
        const styles = window.getComputedStyle(baitDiv);
        if (styles && (styles.display === 'none' || styles.visibility === 'hidden' || styles.height === '0px')) {
          console.log("Bait element blocked");
          isBlocked = true;
        } else {
          console.log("Bait element not blocked");
        }
        detectionCount++;
        checkDetectionStatus();
      }, 100);
  
      // Technique 3: Request Blocking
      fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store'
      }).then(() => {
        console.log("Ad request successful");
        detectionCount++;
        checkDetectionStatus();
      }).catch(() => {
        console.log("Ad request blocked");
        isBlocked = true;
        detectionCount++;
        checkDetectionStatus();
      });
  
      // Check detection status and resolve
      const checkDetectionStatus = () => {
        if (detectionCount === totalTests) {
          cleanup();
          console.log(`Ad blocker ${isBlocked ? 'detected' : 'not detected'}`);
          resolve(isBlocked);
        }
      };
  
      // Fallback in case something hangs
      setTimeout(() => {
        if (detectionCount < totalTests) {
          cleanup();
          console.log("Ad blocker detection timed out");
          resolve(false); // Default to not blocked if timeout occurs
        }
      }, 2000);
    });
  };