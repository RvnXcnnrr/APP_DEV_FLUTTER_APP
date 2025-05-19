import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useUser } from './UserContext';
import { useWebSocket } from './WebSocketContext';
import DeviceService from '../services/DeviceService';

// Create the context
const MotionEventContext = createContext();

// Default device ID - this is the device we're checking ownership for
const DEFAULT_DEVICE_ID = 'ESP32_001';

/**
 * Provider component for motion event state
 * @param {Object} props - Component props
 * @returns {JSX.Element} Provider component
 */
export function MotionEventProvider({ children, motionEventService }) {
  // State for motion events
  const [events, setEvents] = useState([]);
  const [monthEvents, setMonthEvents] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get user context
  const { user, isLoggedIn } = useUser();

  // Get WebSocket context
  const { latestMotionEvent, isConnected: wsConnected } = useWebSocket();

  // Create device service
  const [deviceService] = useState(() => new DeviceService(motionEventService?.apiService));

  // State for device ownership
  const [isDeviceOwner, setIsDeviceOwner] = useState(false);

  // Check device ownership when user changes
  useEffect(() => {
    const checkDeviceOwnership = async () => {
      if (user && user.email && deviceService) {
        // Special case for ESP32_001 - owner check handled by DeviceService
        const specialDeviceCheck = await deviceService.isDeviceOwner(DEFAULT_DEVICE_ID, user);
        if (specialDeviceCheck) {
          console.log(`User is the owner of device ${DEFAULT_DEVICE_ID}`);
          setIsDeviceOwner(true);
          return;
        }

        const isOwner = await deviceService.isDeviceOwner(DEFAULT_DEVICE_ID, user);
        setIsDeviceOwner(isOwner);
        console.log(`User ${user.email} ${isOwner ? 'is' : 'is not'} the owner of device ${DEFAULT_DEVICE_ID}`);
      } else {
        setIsDeviceOwner(false);
      }
    };

    checkDeviceOwnership();
  }, [user, deviceService]);

  // Load events for a specific day
  const loadEventsForDay = useCallback(async (date) => {
    if (!motionEventService || !isLoggedIn) {
      return [];
    }

    // Only device owner can access motion events
    if (!isDeviceOwner) {
      console.warn('User is not device owner, cannot access motion events');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);

      const dayEvents = await motionEventService.getMotionEventsForDay(date, user);
      setEvents(dayEvents);
      setLastUpdated(new Date());

      return dayEvents;
    } catch (error) {
      console.error('Error loading events for day:', error);
      setError(error.message || 'Failed to load events');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [motionEventService, isDeviceOwner, isLoggedIn]);

  // Load events for a specific month
  const loadEventsForMonth = useCallback(async (year, month) => {
    if (!motionEventService || !isLoggedIn) {
      return {};
    }

    // Only device owner can access motion events
    if (!isDeviceOwner) {
      console.warn('User is not device owner, cannot access motion events');
      return {};
    }

    try {
      setIsLoading(true);
      setError(null);

      const monthEvents = await motionEventService.getMotionEventsForMonth(year, month, user);
      const groupedEvents = motionEventService.groupEventsByDay(monthEvents);

      setMonthEvents(groupedEvents);
      setLastUpdated(new Date());

      return groupedEvents;
    } catch (error) {
      console.error('Error loading events for month:', error);
      setError(error.message || 'Failed to load events');
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [motionEventService, isDeviceOwner, isLoggedIn]);

  // Check if a specific day has events
  const hasDayEvents = useCallback((date) => {
    if (!isDeviceOwner || !monthEvents) {
      return false;
    }

    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return monthEvents[dateKey] && monthEvents[dateKey].length > 0;
  }, [monthEvents, isDeviceOwner]);

  // Get events for a specific day
  const getEventsForDay = useCallback((date) => {
    if (!isDeviceOwner || !monthEvents) {
      return [];
    }

    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return monthEvents[dateKey] || [];
  }, [monthEvents, isDeviceOwner]);

  // Handle real-time motion events from WebSocket
  useEffect(() => {
    if (latestMotionEvent && isDeviceOwner) {
      console.info('Received real-time motion event:', latestMotionEvent);

      // Process the event to ensure it has the correct format
      const processedEvent = {
        ...latestMotionEvent,
        // Ensure timestamp is a Date object
        timestamp: latestMotionEvent.timestamp instanceof Date
          ? latestMotionEvent.timestamp
          : new Date(latestMotionEvent.timestamp),
        // Ensure temperature and humidity are numbers
        temperature: typeof latestMotionEvent.temperature === 'string'
          ? parseFloat(latestMotionEvent.temperature)
          : latestMotionEvent.temperature,
        humidity: typeof latestMotionEvent.humidity === 'string'
          ? parseFloat(latestMotionEvent.humidity)
          : latestMotionEvent.humidity,
        // Ensure device_id is set
        device_id: latestMotionEvent.device_id || 'ESP32_001'
      };

      // Add the new event to the events list if it's for the selected day
      setEvents(prevEvents => {
        // Check if the event is already in the list
        const eventExists = prevEvents.some(event =>
          event.id === processedEvent.id ||
          (event.timestamp && processedEvent.timestamp &&
           event.timestamp.getTime() === processedEvent.timestamp.getTime())
        );

        if (eventExists) {
          return prevEvents;
        }

        // Add the new event to the list
        const newEvents = [...prevEvents, processedEvent];

        // Sort by timestamp (newest first)
        newEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        console.info('Updated events list with new real-time event, total events:', newEvents.length);
        return newEvents;
      });

      // Update the month events
      setMonthEvents(prevMonthEvents => {
        // Create a date key for the event
        const date = new Date(processedEvent.timestamp);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // Get the events for this day
        const dayEvents = prevMonthEvents[dateKey] || [];

        // Check if the event is already in the list
        const eventExists = dayEvents.some(event =>
          event.id === processedEvent.id ||
          (event.timestamp && processedEvent.timestamp &&
           event.timestamp.getTime() === processedEvent.timestamp.getTime())
        );

        if (eventExists) {
          return prevMonthEvents;
        }

        // Add the new event to the list
        const newDayEvents = [...dayEvents, processedEvent];

        // Sort by timestamp (newest first)
        newDayEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        console.info('Updated month events with new real-time event for date:', dateKey);

        // Return the updated month events
        return {
          ...prevMonthEvents,
          [dateKey]: newDayEvents
        };
      });

      // Update the last updated timestamp without triggering loading state
      setLastUpdated(new Date());

      // Play a subtle notification sound for real-time events (optional)
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3; // Set volume to 30%
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (error) {
        console.log('Audio notification not supported:', error);
      }
    }
  }, [latestMotionEvent, isDeviceOwner]);

  // Context value
  const value = {
    events,
    monthEvents,
    isLoading,
    error,
    lastUpdated,
    loadEventsForDay,
    loadEventsForMonth,
    hasDayEvents,
    getEventsForDay,
    isDeviceOwner,
    wsConnected
  };

  return <MotionEventContext.Provider value={value}>{children}</MotionEventContext.Provider>;
}

/**
 * Hook to use the motion event context
 * @returns {Object} Motion event context
 */
export function useMotionEvents() {
  const context = useContext(MotionEventContext);
  if (context === undefined) {
    throw new Error('useMotionEvents must be used within a MotionEventProvider');
  }
  return context;
}
