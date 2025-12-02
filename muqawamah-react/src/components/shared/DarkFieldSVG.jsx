import React from 'react';

/**
 * Dark-themed SVG football field component
 * Dark background with white lines for team pages
 */
export const DarkFieldSVG = React.forwardRef(({ children, className = '', ...props }, ref) => {
  return (
    <svg 
      ref={ref}
      xmlns="http://www.w3.org/2000/svg" 
      xmlnsXlink="http://www.w3.org/1999/xlink" 
      viewBox="0 0 74 111"
      className={`dark-field-svg ${className}`}
      {...props}
    >
      {/* Dark background matching the page theme */}
      <rect width="74" height="111" fill="#0d1117"/>
      
      {/* Field markings - white lines with slight transparency */}
      <g fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" transform="translate(3 3)">
        {/* Border */}
        <path d="M 0 0 h 68 v 105 h -68 Z"/>
        
        {/* Center line */}
        <path d="M 0 52.5 h 68"/>
        
        {/* Center circle */}
        <circle r="9.15" cx="34" cy="52.5"/>
        <circle r="0.75" cx="34" cy="52.5" fill="rgba(255,255,255,0.4)" stroke="none"/>
        
        {/* Top penalty area */}
        <g>
          <path d="M 13.84 0 v 16.5 h 40.32 v -16.5"/>
          <path d="M 24.84 0 v 5.5 h 18.32 v -5.5"/>
          <circle r="0.75" cx="34" cy="10.94" fill="rgba(255,255,255,0.4)" stroke="none"/>
          <path d="M 26.733027 16.5 a 9.15 9.15 0 0 0 14.533946 0"/>
        </g>
        
        {/* Bottom penalty area (rotated) */}
        <g transform="rotate(180,34,52.5)">
          <path d="M 13.84 0 v 16.5 h 40.32 v -16.5"/>
          <path d="M 24.84 0 v 5.5 h 18.32 v -5.5"/>
          <circle r="0.75" cx="34" cy="10.94" fill="rgba(255,255,255,0.4)" stroke="none"/>
          <path d="M 26.733027 16.5 a 9.15 9.15 0 0 0 14.533946 0"/>
        </g>
        
        {/* Corner arcs */}
        <path d="M 0 2 a 2 2 0 0 0 2 -2M 66 0 a 2 2 0 0 0 2 2M 68 103 a 2 2 0 0 0 -2 2M 2 105 a 2 2 0 0 0 -2 -2"/>
      </g>
      
      {/* Player elements rendered here */}
      {children}
    </svg>
  );
});

DarkFieldSVG.displayName = 'DarkFieldSVG';

export default DarkFieldSVG;

