import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import MotionEvent from '../models/MotionEvent';
import { useUser } from './UserContext';

// Create the context
const MotionEventContext = createContext();

/**
 * Provider component for motion events
 * @param {Object} props - Component props
 * @returns {JSX.Element} Provider component
 */
export function MotionEventProvider({ children, webSocketService, apiService }) {
  // Get user context to check if user is the token owner
  const { isTokenOwner } = useUser();

  // State for events, organized by date
  const [events, setEvents] = useState({});
  // State for connection status
  const [isConnected, setIsConnected] = useState(false);
  // State for loading status
  const [isLoadingHistoricalEvents, setIsLoadingHistoricalEvents] = useState(false);
  // State for access denied message
  const [accessDenied, setAccessDenied] = useState(false);

  // Handle motion events from WebSocket
  const handleMotionEvent = useCallback((event) => {
    setEvents((prevEvents) => {
      // Format the date as YYYY-MM-DD for use as a key
      const dateKey = format(event.timestamp, 'yyyy-MM-dd');

      // Create a new array with the event added
      const updatedEvents = {
        ...prevEvents,
        [dateKey]: [...(prevEvents[dateKey] || []), event],
      };

      // Sort events by timestamp (newest first)
      updatedEvents[dateKey].sort((a, b) => b.timestamp - a.timestamp);

      return updatedEvents;
    });
  }, []);

  // Handle connection status changes
  const handleConnectionStatus = useCallback((connected) => {
    setIsConnected(connected);
  }, []);

  // Set up WebSocket listeners
  useEffect(() => {
    if (webSocketService) {
      // Add event listeners
      webSocketService.addMotionEventListener(handleMotionEvent);
      webSocketService.addConnectionStatusListener(handleConnectionStatus);

      // Clean up on unmount
      return () => {
        webSocketService.removeMotionEventListener(handleMotionEvent);
        webSocketService.removeConnectionStatusListener(handleConnectionStatus);
      };
    }
  }, [webSocketService, handleMotionEvent, handleConnectionStatus]);

  // Load historical events for a date range
  const loadHistoricalEvents = useCallback(async (startDate, endDate) => {
    if (!apiService) return;

    // Reset access denied state
    setAccessDenied(false);

    // Check if the user is the token owner (oracle.tech.143@gmail.com)
    if (!isTokenOwner) {
      console.error('Access denied: Only the device owner can access this data.');
      setAccessDenied(true);
      setIsLoadingHistoricalEvents(false);
      return;
    }

    try {
      setIsLoadingHistoricalEvents(true);

      // Format dates for API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      // Check if we have a token
      const token = apiService.getToken();
      if (!token) {
        console.error('No authentication token available. Please log in or set a token.');
        setIsLoadingHistoricalEvents(false);
        return;
      }

      console.debug('Using token for API request:', token);
      console.debug('Authorization header will be:', `Token ${token}`);
      console.debug(`Making API request to: api/sensors/motion-events/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);

      try {
        // Make API request
        const response = await apiService.get(
          `api/sensors/motion-events/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`
        );

        console.debug('API request successful, received data:', response);

        // Process events
        const newEvents = {};

        // Check if response is paginated (has 'results' property)
        const eventsArray = response.results ? response.results : response;

        // Make sure eventsArray is actually an array
        if (!Array.isArray(eventsArray)) {
          console.error('Expected an array of events, but got:', eventsArray);
          return;
        }

        console.debug('Processing events array:', eventsArray);

        eventsArray.forEach((eventData) => {
          try {
            // Parse the timestamp
            const timestamp = new Date(eventData.timestamp);

            // Create a motion event
            const event = new MotionEvent(
              eventData.id.toString(),
              timestamp,
              eventData.device_name || 'Unknown Device',
              parseFloat(eventData.temperature || 0),
              parseFloat(eventData.humidity || 0),
              eventData.image || 'https://via.placeholder.com/150'
            );

            // Add the event to the map
            const dateKey = format(timestamp, 'yyyy-MM-dd');
            if (!newEvents[dateKey]) {
              newEvents[dateKey] = [];
            }
            newEvents[dateKey].push(event);
          } catch (error) {
            console.error('Error parsing motion event:', error);
            console.error('Event data:', eventData);
          }
        });

        // Sort events by timestamp (newest first)
        Object.keys(newEvents).forEach((dateKey) => {
          newEvents[dateKey].sort((a, b) => b.timestamp - a.timestamp);
        });

        // Update state
        setEvents((prevEvents) => {
          // Merge with existing events
          const mergedEvents = { ...prevEvents };

          Object.keys(newEvents).forEach((dateKey) => {
            if (mergedEvents[dateKey]) {
              // Combine and deduplicate events
              const combinedEvents = [...mergedEvents[dateKey], ...newEvents[dateKey]];
              const uniqueEvents = Array.from(
                new Map(combinedEvents.map((event) => [event.id, event])).values()
              );
              // Sort events
              uniqueEvents.sort((a, b) => b.timestamp - a.timestamp);
              mergedEvents[dateKey] = uniqueEvents;
            } else {
              mergedEvents[dateKey] = newEvents[dateKey];
            }
          });

          return mergedEvents;
        });
      } catch (apiError) {
        console.error('API request failed:', apiError);
        console.error('Error message:', apiError.message);
        console.error('Error stack:', apiError.stack);

        // Show a more specific error message
        if (apiError.message && (
          apiError.message.includes('Invalid token') ||
          apiError.message.includes('Unauthorized') ||
          apiError.message.includes('401')
        )) {
          console.error('Authentication failed. Please check your token or log in again.');
        } else if (apiError.message && apiError.message.includes('forEach')) {
          console.error('Received unexpected response format. Expected an array but got something else.');
          console.error('This might be due to a pagination issue or API response format change.');
        }

        // Clear events for this date range to avoid showing stale data
        setEvents((prevEvents) => {
          const updatedEvents = { ...prevEvents };
          // Remove any events in the requested date range
          return updatedEvents;
        });
      }
    } catch (error) {
      console.error('Error loading historical events:', error);

      // Clear events for this date range to avoid showing stale data
      setEvents((prevEvents) => {
        const updatedEvents = { ...prevEvents };
        // Remove any events in the requested date range
        return updatedEvents;
      });
    } finally {
      setIsLoadingHistoricalEvents(false);
    }
  }, [apiService]);

  // Get events for a specific day
  const getEventsForDay = useCallback((date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return events[dateKey] || [];
  }, [events]);

  // Clear all events
  const clearEvents = useCallback(() => {
    setEvents({});
  }, []);

  // Context value
  const value = {
    events,
    isConnected,
    isLoadingHistoricalEvents,
    accessDenied,
    getEventsForDay,
    loadHistoricalEvents,
    clearEvents,
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
