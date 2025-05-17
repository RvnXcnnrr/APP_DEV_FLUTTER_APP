import React from 'react';
import { getTheme } from '../utils/theme';
import {
  FaChevronRight,
  FaThermometerHalf,
  FaTint,
  FaCalendarAlt,
  FaImage,
  FaMotorcycle,
  FaMobile
} from 'react-icons/fa';

/**
 * A component that displays a list of motion events
 * @param {Object} props - Component props
 * @returns {JSX.Element} Motion event list component
 */
const MotionEventList = ({ events = [], isDarkMode = false }) => {
  const theme = getTheme(isDarkMode);
  const [showDetailsDialog, setShowDetailsDialog] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  // Show event details
  const showEventDetails = (event) => {
    setSelectedEvent(event);
    setShowDetailsDialog(true);
  };

  // Close event details dialog
  const closeEventDetails = () => {
    setShowDetailsDialog(false);
    setSelectedEvent(null);
  };

  // Render event details dialog
  const renderEventDetailsDialog = () => {
    if (!showDetailsDialog || !selectedEvent) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: theme.surface,
          borderRadius: '16px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          padding: '16px',
        }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Motion Event Details</h3>

          {/* Date and time */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <FaCalendarAlt size={16} color={theme.primary} style={{ marginRight: '8px' }} />
            <span>{selectedEvent.formattedDate} at {selectedEvent.formattedTime}</span>
          </div>

          {/* Device info */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <FaMobile size={16} color={theme.primary} style={{ marginRight: '8px' }} />
            <span>Device: {selectedEvent.deviceId}</span>
          </div>

          {/* Temperature */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <FaThermometerHalf size={16} color={theme.primary} style={{ marginRight: '8px' }} />
            <span>Temperature: {selectedEvent.temperature.toFixed(1)}°C</span>
          </div>

          {/* Humidity */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <FaTint size={16} color={theme.secondary} style={{ marginRight: '8px' }} />
            <span>Humidity: {selectedEvent.humidity.toFixed(1)}%</span>
          </div>

          {/* Image */}
          <div>
            <div style={{ marginBottom: '8px' }}>Image:</div>
            <div style={{
              height: '200px',
              width: '100%',
              backgroundColor: '#e0e0e0',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <FaImage size={48} color="#999" />
            </div>
          </div>

          {/* Close button */}
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button
              onClick={closeEventDetails}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: theme.primary,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
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

  // Calculate a reasonable height based on the number of events
  const itemsToShow = events.length > 4 ? 4 : events.length;
  const estimatedItemHeight = 120; // Approximate height of each card

  return (
    <div style={{ height: itemsToShow * estimatedItemHeight }}>
      {events.map((event) => (
        <div
          key={event.id}
          style={{
            margin: '0 0 12px 0',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
          }}
          onClick={() => showEventDetails(event)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Avatar */}
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: theme.primary,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: '16px',
            }}>
              <FaMobile size={20} color="white" />
            </div>

            {/* Title and time */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', marginRight: '8px' }}>Motion detected</span>
                <span style={{ fontSize: '12px', color: theme.textSecondary }}>{event.formattedTime}</span>
              </div>

              {/* Sensor data */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaThermometerHalf size={16} color={theme.primary} style={{ marginRight: '4px' }} />
                  <span style={{ marginRight: '16px' }}>{event.temperature.toFixed(1)}°C</span>

                  <FaTint size={16} color={theme.secondary} style={{ marginRight: '4px' }} />
                  <span>{event.humidity.toFixed(1)}%</span>
                </div>

                <div style={{ marginTop: '4px', fontSize: '14px' }}>
                  Device: {event.deviceId}
                </div>
              </div>
            </div>

            {/* Arrow icon */}
            <div style={{ marginLeft: 'auto' }}>
              <FaChevronRight color={theme.textSecondary} />
            </div>
          </div>
        </div>
      ))}

      {/* Event details dialog */}
      {renderEventDetailsDialog()}
    </div>
  );
};

export default MotionEventList;
