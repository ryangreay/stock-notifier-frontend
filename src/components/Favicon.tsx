import { useEffect } from 'react';
import { generateFaviconSvg } from './Logo';

const Favicon = () => {
  useEffect(() => {
    // Create a new link element
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    
    // Convert SVG to data URL
    const svgString = generateFaviconSvg();
    const encodedSvg = encodeURIComponent(svgString);
    const dataUrl = `data:image/svg+xml,${encodedSvg}`;
    
    // Set the href and update/add favicon
    favicon.href = dataUrl;
    
    // Remove existing favicon if it exists
    const existingFavicon = document.querySelector("link[rel='icon']");
    if (existingFavicon) {
      document.head.removeChild(existingFavicon);
    }
    
    // Add new favicon
    document.head.appendChild(favicon);
    
    // Cleanup on unmount
    return () => {
      if (favicon && document.head.contains(favicon)) {
        document.head.removeChild(favicon);
      }
    };
  }, []);

  return null;
};

export default Favicon; 