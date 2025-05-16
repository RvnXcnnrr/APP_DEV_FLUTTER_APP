import React from 'react';
import { getTheme } from '../utils/theme';
import { FaChevronRight } from 'react-icons/fa';

/**
 * A component that displays a list of motion events
 * @param {Object} props - Component props
 * @returns {JSX.Element} Motion event list component
 */
const MotionEventList = ({ events = [], isDarkMode = false }) => {
  const theme = getTheme(isDarkMode);

  // Show event details
  const showEventDetails = (event) => {
    alert(`
      Motion Event: ${event.id}
      Device: ${event.deviceId}
      Date: ${event.formattedDate}
      Time: ${event.formattedTime}
      Temperature: ${event.temperature.toFixed(1)}°C
      Humidity: ${event.humidity.toFixed(1)}%
    `);
  };

  // Empty state
  if (events.length === 0) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: theme.textSecondary,
        }}
      >
        No motion events for this day.
      </div>
    );
  }

  return (
    <div>
      {events.map((event) => (
        <div
          key={event.id}
          style={{
            padding: '15px',
            borderBottom: `1px solid ${theme.divider}`,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
          onClick={() => showEventDetails(event)}
        >
          {/* Event image */}
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '4px',
              backgroundColor: theme.surface,
              backgroundImage: `url(${event.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              marginRight: '15px',
            }}
          />

          {/* Event details */}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {event.formattedTime}
            </div>
            <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '3px' }}>
              Device: {event.deviceId}
            </div>
            <div style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '3px' }}>
              Temperature: {event.temperature.toFixed(1)}°C
            </div>
            <div style={{ fontSize: '14px', color: theme.textSecondary }}>
              Humidity: {event.humidity.toFixed(1)}%
            </div>
          </div>

          {/* Arrow icon */}
          <FaChevronRight color={theme.textSecondary} />
        </div>
      ))}
    </div>
  );
};

export default MotionEventList;
