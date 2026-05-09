// import { useState, useEffect } from "react";
// import { useIsClient, useWindow } from "./useSSR";

// function getWindowSize() {
//   const isClient = useIsClient();
//   const windowObj = useWindow();

//   if (!isClient || !windowObj) return { windowWidth: 1200, windowHeight: 800 };
//   const { innerWidth: windowWidth, innerHeight: windowHeight } = windowObj;
//   return {
//     windowWidth,
//     windowHeight,
//   };
// }

// export default function useWindowSize() {
//   const isClient = useIsClient();

//   const [windowSize, setWindowSize] = useState(getWindowSize());

//   useEffect(() => {
//     if (!isClient || typeof window === "undefined") return;

//     function handleResize() {
//       setWindowSize(getWindowSize());
//     }

//     if (!isClient  ) return;
//     windowObj.addEventListener("resize", handleResize);
//     return () => windowObj.removeEventListener("resize", handleResize);
//   }, [isClient, windowObj]);

//   return windowSize;
// }

import { useState, useEffect } from 'react'
import { useIsClient } from './useSSR'

export default function useWindowSize() {
  const isClient = useIsClient()

  // Provide desktop defaults for SSR
  const [windowSize, setWindowSize] = useState({
    windowWidth: 1200, // Default to desktop width
    windowHeight: 800, // Default to desktop height
  })

  useEffect(() => {
    if (!isClient || typeof window === 'undefined') return

    function handleResize() {
      setWindowSize({
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
      })
    }

    // Set initial values
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isClient])

  return windowSize
}
