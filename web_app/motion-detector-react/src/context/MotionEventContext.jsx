import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useUser } from './UserContext';
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

  // Create device service
  const [deviceService] = useState(() => new DeviceService(motionEventService?.apiService));

  // State for device ownership
  const [isDeviceOwner, setIsDeviceOwner] = useState(false);

  // Check device ownership when user changes
  useEffect(() => {
    const checkDeviceOwnership = async () => {
      if (user && user.email && deviceService) {
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
    isDeviceOwner
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
