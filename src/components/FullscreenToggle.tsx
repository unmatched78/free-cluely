import React, { useState, useEffect } from 'react';

interface FullscreenToggleProps {
  className?: string;
}

const FullscreenToggle: React.FC<FullscreenToggleProps> = ({ className }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle fullscreen using the Electron API
  const toggleFullscreen = () => {
    if (window.electron) {
      window.electron.toggleFullscreen();
      setIsFullscreen(!isFullscreen);
    } else {
      console.warn('Electron API not available. Running in browser mode.');
      // Fallback for browser testing
      if (!isFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen mode:', err);
        });
      } else if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  // Listen for keyboard shortcut (Cmd/Ctrl + F)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'f') {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // Listen for fullscreen change events from the browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <button 
      className={className} 
      onClick={toggleFullscreen}
      title="Toggle Fullscreen (Cmd/Ctrl+F)"
    >
      {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
    </button>
  );
};

export default FullscreenToggle;