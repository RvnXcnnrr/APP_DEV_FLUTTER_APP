import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useUser } from './UserContext';

// Create the context
const SensorDataContext = createContext();

/**
 * Provider component for sensor data
 * @param {Object} props - Component props
 * @returns {JSX.Element} Provider component
 */
export function SensorDataProvider({ children, webSocketService }) {
  // Get user context to check if user is the token owner
  const { isTokenOwner } = useUser();

  // State for temperature and humidity
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  // State for connection status
  const [isConnected, setIsConnected] = useState(false);
  // State for access denied
  const [accessDenied, setAccessDenied] = useState(!isTokenOwner);

  // Handle sensor data from WebSocket
  const handleSensorData = useCallback((data) => {
    // Check if the user is the token owner
    if (!isTokenOwner) {
      setAccessDenied(true);
      return;
    }

    // Only process data of type 'sensor_data', not 'motion_event'
    const type = data.type;
    if (type !== 'sensor_data') {
      return;
    }

    // Update temperature and humidity
    if (data.temperature !== undefined) {
      setTemperature(parseFloat(data.temperature));
    }

    if (data.humidity !== undefined) {
      setHumidity(parseFloat(data.humidity));
    }
  }, [isTokenOwner]);

  // Handle connection status changes
  const handleConnectionStatus = useCallback((connected) => {
    setIsConnected(connected);
  }, []);

  // Update accessDenied when isTokenOwner changes
  useEffect(() => {
    setAccessDenied(!isTokenOwner);
  }, [isTokenOwner]);

  // Set up WebSocket listeners
  useEffect(() => {
    if (webSocketService) {
      // Add event listeners
      webSocketService.addSensorDataListener(handleSensorData);
      webSocketService.addConnectionStatusListener(handleConnectionStatus);

      // Clean up on unmount
      return () => {
        webSocketService.removeSensorDataListener(handleSensorData);
        webSocketService.removeConnectionStatusListener(handleConnectionStatus);
      };
    }
  }, [webSocketService, handleSensorData, handleConnectionStatus]);

  // Context value
  const value = {
    temperature,
    humidity,
    isConnected,
    accessDenied,
  };

  return <SensorDataContext.Provider value={value}>{children}</SensorDataContext.Provider>;
}

/**
 * Hook to use the sensor data context
 * @returns {Object} Sensor data context
 */
export function useSensorData() {
  const context = useContext(SensorDataContext);
  if (context === undefined) {
    throw new Error('useSensorData must be used within a SensorDataProvider');
  }
  return context;
}
