import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AD_SCRIPT_SRC = "https://richinfo.co/richpartners/telegram/js/rp-ob.js?pub_id=950447&widget_id=354303";

export function useAdAndTelegramControl() {
  const location = useLocation();

  useEffect(() => {
    
    //  // --- Ad Script Management ---
    //  if (location.pathname !== "/games/tetris") {            
    //     // Inject ad script if not present
    //     if (!document.querySelector(`script[src="${AD_SCRIPT_SRC}"]`)) {
    //       const script = document.createElement("script");
    //       script.src = AD_SCRIPT_SRC;
    //       script.async = true;
    //       script.setAttribute("data-cfasync", "false");
    //       document.body.appendChild(script);
    //     }
    //   } else {
    //     // Remove ad script if present
    //     const script = document.querySelector(`script[src="${AD_SCRIPT_SRC}"]`);
    //     if (script) {
    //       script.remove();
    //     }
    //   }
  

    // --- Telegram WebApp Minimize Control ---
    if (window.Telegram && window.Telegram.WebApp) {
      if (location.pathname === "/games/tetris") {
        // Disable vertical swipe to minimize
        if (typeof window.Telegram.WebApp.disableVerticalSwipes === "function") {
          window.Telegram.WebApp.disableVerticalSwipes();
        }
      } else {
        // Enable vertical swipe to minimize on other pages
        if (typeof window.Telegram.WebApp.enableVerticalSwipes === "function") {
          window.Telegram.WebApp.enableVerticalSwipes();
        }
      }
    }

    // Optional cleanup: remove ad script on unmount
    return () => {
      const script = document.querySelector(`script[src="${AD_SCRIPT_SRC}"]`);
      if (script) {
        script.remove();
      }
    };
  }, [location.pathname]);
}
