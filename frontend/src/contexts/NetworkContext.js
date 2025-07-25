import React, { createContext, useContext, useState, useEffect } from 'react';

const NetworkContext = createContext();
export { NetworkContext };

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState('unknown');
  const [effectiveType, setEffectiveType] = useState('4g');
  const [downlink, setDownlink] = useState(10);
  const [rtt, setRtt] = useState(100);

  useEffect(() => {
    // Update network information
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
          setConnectionType(connection.type || 'unknown');
          setEffectiveType(connection.effectiveType || '4g');
          setDownlink(connection.downlink || 10);
          setRtt(connection.rtt || 100);
        }
      }
    };

    // Initial network info
    updateNetworkInfo();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      updateNetworkInfo();
      console.log('Network: Back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Network: Gone offline');
    };

    // Listen for connection changes
    const handleConnectionChange = () => {
      updateNetworkInfo();
      console.log('Network: Connection changed');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        connection.addEventListener('change', handleConnectionChange);
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
          connection.removeEventListener('change', handleConnectionChange);
        }
      }
    };
  }, []);

  // Determine connection quality
  const getConnectionQuality = () => {
    if (!isOnline) return 'offline';
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'poor';
    } else if (effectiveType === '3g') {
      return 'fair';
    } else if (effectiveType === '4g' && downlink < 1.5) {
      return 'fair';
    } else {
      return 'good';
    }
  };

  // Check if connection is fast enough for video
  const canStreamVideo = () => {
    const quality = getConnectionQuality();
    return quality === 'good' || (quality === 'fair' && downlink > 1);
  };

  // Check if connection is fast enough for images
  const canLoadImages = () => {
    const quality = getConnectionQuality();
    return quality !== 'offline' && quality !== 'poor';
  };

  // Get recommended content quality based on connection
  const getRecommendedQuality = () => {
    const quality = getConnectionQuality();
    
    switch (quality) {
      case 'poor':
        return 'text-only';
      case 'fair':
        return 'low-images';
      case 'good':
        return 'full-quality';
      default:
        return 'offline';
    }
  };

  // Estimate data usage for different content types
  const estimateDataUsage = (contentType, duration = 1) => {
    const estimates = {
      'text': 0.001, // MB per minute
      'image': 0.5,  // MB per image
      'video-low': 5, // MB per minute
      'video-medium': 15, // MB per minute
      'video-high': 25, // MB per minute
      'quiz': 0.01 // MB per quiz
    };
    
    return estimates[contentType] * duration;
  };

  const value = {
    isOnline,
    connectionType,
    effectiveType,
    downlink,
    rtt,
    getConnectionQuality,
    canStreamVideo,
    canLoadImages,
    getRecommendedQuality,
    estimateDataUsage
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};
