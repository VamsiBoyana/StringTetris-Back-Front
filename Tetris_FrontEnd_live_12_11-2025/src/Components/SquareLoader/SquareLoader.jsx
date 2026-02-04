// Add this at the top of your imports
import React from "react";

// Add this style object somewhere in your file (outside the component)
const squareLoaderStyles = {
  loader: {
    position: 'relative',
    width: '96px',
    height: '96px',
    transform: 'rotate(45deg)',
  },
  loaderSquare: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '28px',
    height: '28px',
    margin: '2px',
    borderRadius: '0px',
    background: 'white',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    animation: 'square-animation 10s ease-in-out infinite both',
  },
  // Keyframes as a string to be injected into a style tag
  keyframes: `
    @keyframes square-animation {
      0% {
        left: 0;
        top: 0;
      }
      10.5% {
        left: 0;
        top: 0;
      }
      12.5% {
        left: 32px;
        top: 0;
      }
      23% {
        left: 32px;
        top: 0;
      }
      25% {
        left: 64px;
        top: 0;
      }
      35.5% {
        left: 64px;
        top: 0;
      }
      37.5% {
        left: 64px;
        top: 32px;
      }
      48% {
        left: 64px;
        top: 32px;
      }
      50% {
        left: 32px;
        top: 32px;
      }
      60.5% {
        left: 32px;
        top: 32px;
      }
      62.5% {
        left: 32px;
        top: 64px;
      }
      73% {
        left: 32px;
        top: 64px;
      }
      75% {
        left: 0;
        top: 64px;
      }
      85.5% {
        left: 0;
        top: 64px;
      }
      87.5% {
        left: 0;
        top: 32px;
      }
      98% {
        left: 0;
        top: 32px;
      }
      100% {
        left: 0;
        top: 0;
      }
    }
  `,
  // Different colors for each square
  squareColors: [
    '#FF4136', // Red
    '#FF851B', // Orange
    '#FFDC00', // Yellow
    '#2ECC40', // Green
    '#0074D9', // Blue
    '#B10DC9', // Purple
    '#F012BE', // Pink
    '#7FDBFF'  // Light Blue
  ]
};

// Create a separate Loader component (you can put this in a separate file if preferred)
const SquareLoader = () => {
  return (
    <>
      {/* Inject the keyframes */}
      <style>{squareLoaderStyles.keyframes}</style>
      
      {/* The loader element */}
      <div style={squareLoaderStyles.loader}>
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            style={{
              ...squareLoaderStyles.loaderSquare,
              animationDelay: `${-1.4285714286 * i}s`,
              background: squareLoaderStyles.squareColors[i]
            }}
          />
        ))}
      </div>
    </>
  );
};

export default SquareLoader;
