import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import WebSocketService from '../services/WebSocketService';
import { useUser } from './UserContext';
import AppConfig from '../utils/config';

// Create the context
const WebSocketContext = createContext();

/**
 * Provider component for WebSocket state
 * @param {Object} props - Component props
 * @returns {JSX.Element} Provider component
 */
export function WebSocketProvider({ children }) {
  // State for WebSocket data
  const [isConnected, setIsConnected] = useState(false);
  const [latestSensorData, setLatestSensorData] = useState(null);
  const [latestMotionEvent, setLatestMotionEvent] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [sensorDataUpdated, setSensorDataUpdated] = useState(false);

  // Get user context
  const { user, isLoggedIn } = useUser();

  // Create WebSocket service
  const [webSocketService] = useState(() => new WebSocketService(AppConfig.wsBaseUrl));

  // Connect to WebSocket when component mounts or user changes
  useEffect(() => {
    // Only connect if user is logged in
    if (!isLoggedIn || !user) {
      setIsConnected(false);
      return;
    }

    // Set up event handlers
    const handleConnect = () => {
      console.info('WebSocket connected in context');
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = () => {
      console.info('WebSocket disconnected in context');
      setIsConnected(false);
    };

    const handleError = (error) => {
      console.error('WebSocket error in context:', error);
      setConnectionError('Failed to connect to WebSocket server');
    };

    const handleSensorData = (data) => {
      console.debug('Received sensor data in context:', data);
      setLatestSensorData(data);

      // Set the sensorDataUpdated flag to true to trigger animations
      setSensorDataUpdated(true);

      // Reset the flag after 3 seconds
      setTimeout(() => {
        setSensorDataUpdated(false);
      }, 3000);
    };

    const handleMotionEvent = (event) => {
      console.debug('Received motion event in context:', event);
      setLatestMotionEvent(event);
    };

    // Register event handlers
    webSocketService.on('connect', handleConnect);
    webSocketService.on('disconnect', handleDisconnect);
    webSocketService.on('error', handleError);
    webSocketService.on('sensorData', handleSensorData);
    webSocketService.on('motionEvent', handleMotionEvent);

    // Set user email for authentication
    if (user && user.email) {
      console.info(`Setting WebSocket authentication email: ${user.email}`);
      webSocketService.setUserEmail(user.email);

      // Force disconnect and reconnect to ensure the email is used
      webSocketService.disconnect();

      // Short delay before reconnecting to ensure clean disconnect
      setTimeout(() => {
        console.info('Reconnecting WebSocket with user email:', user.email);
        webSocketService.connect();
      }, 500);
    } else {
      // Connect to WebSocket without email
      webSocketService.connect();
    }

    // Clean up event handlers when component unmounts
    return () => {
      webSocketService.off('connect', handleConnect);
      webSocketService.off('disconnect', handleDisconnect);
      webSocketService.off('error', handleError);
      webSocketService.off('sensorData', handleSensorData);
      webSocketService.off('motionEvent', handleMotionEvent);

      // Disconnect from WebSocket
      webSocketService.disconnect();
    };
  }, [isLoggedIn, user, webSocketService]);

  // Reconnect function
  const reconnect = useCallback(() => {
    // Make sure we have the user email set
    if (user && user.email) {
      webSocketService.setUserEmail(user.email);
    }
    webSocketService.connect();
  }, [webSocketService, user]);

  // Context value
  const value = {
    isConnected,
    latestSensorData,
    latestMotionEvent,
    connectionError,
    sensorDataUpdated,
    reconnect,
    webSocketService
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

/**
 * Hook to use the WebSocket context
 * @returns {Object} WebSocket context
 */
export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
