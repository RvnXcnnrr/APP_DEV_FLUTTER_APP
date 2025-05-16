import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useUser } from '../context/UserContext';
import { getTheme } from '../utils/theme';
import MotionEventList from '../components/MotionEventList';
import AppDrawer from '../components/AppDrawer';
import MotionEvent from '../models/MotionEvent';
import { FaBars } from 'react-icons/fa';

/**
 * Dashboard page component
 * @returns {JSX.Element} Dashboard page
 */
const DashboardPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [events, setEvents] = useState([]);

  const { isDarkMode } = useUser();
  const theme = getTheme(isDarkMode);

  // Generate mock events
  useEffect(() => {
    const generateMockEvents = () => {
      const mockEvents = [];
      const today = new Date();

      // Generate 5 random events for today
      for (let i = 0; i < 5; i++) {
        const eventDate = new Date(today);
        eventDate.setHours(Math.floor(Math.random() * 24));
        eventDate.setMinutes(Math.floor(Math.random() * 60));

        mockEvents.push(
          new MotionEvent(
            `event-${i}`,
            eventDate,
            `device-${Math.floor(Math.random() * 3) + 1}`,
            20 + Math.random() * 10, // Temperature between 20-30°C
            40 + Math.random() * 40, // Humidity between 40-80%
            'https://via.placeholder.com/150' // Placeholder image
          )
        );
      }

      return mockEvents;
    };

    setEvents(generateMockEvents());
  }, [selectedDay]);

  // Toggle drawer
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Get events for selected day
  const getEventsForDay = (date) => {
    return events.filter(
      (event) => format(event.timestamp, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {/* App drawer */}
      <AppDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* App bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '15px',
          backgroundColor: theme.surface,
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <button
          onClick={toggleDrawer}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginRight: '15px',
            color: theme.text,
          }}
        >
          <FaBars size={24} />
        </button>
        <h1 style={{ margin: 0, fontSize: '20px' }}>Motion Dashboard</h1>
      </div>

      {/* Calendar (simplified) */}
      <div
        style={{
          padding: '15px',
          backgroundColor: theme.surface,
          marginTop: '10px',
          marginBottom: '10px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
          {format(selectedDay, 'MMMM yyyy')}
        </h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => {
              const prevMonth = new Date(selectedDay);
              prevMonth.setMonth(prevMonth.getMonth() - 1);
              setSelectedDay(prevMonth);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme.primary,
              fontSize: '16px',
            }}
          >
            Previous
          </button>
          <div>{format(selectedDay, 'EEEE, MMMM d, yyyy')}</div>
          <button
            onClick={() => {
              const nextMonth = new Date(selectedDay);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setSelectedDay(nextMonth);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: theme.primary,
              fontSize: '16px',
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Event list */}
      <div
        style={{
          flex: 1,
          backgroundColor: theme.surface,
          marginTop: '10px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          overflow: 'auto',
        }}
      >
        <MotionEventList events={getEventsForDay(selectedDay)} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
};

export default DashboardPage;
