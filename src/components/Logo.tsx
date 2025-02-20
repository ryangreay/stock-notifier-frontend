import React from 'react';

// The SVG path for the stock chart icon
const logoPath = "M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z";

// Logo component for regular use
export const Logo: React.FC<{ size?: number; color?: string }> = ({ 
  size = 32,
  color = '#00C853' // Default to primary green color
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill={color}
  >
    <path d={logoPath} />
  </svg>
);

// Generate SVG string for favicon
export const generateFaviconSvg = (color: string = '#00C853') => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="${color}" d="${logoPath}"/>
  </svg>
`;

export default Logo; 