import React from 'react';
import { getTheme } from '../utils/theme';
import { FaThermometerHalf, FaTint, FaWifi, FaExclamationTriangle } from 'react-icons/fa';

/**
 * A component that displays real-time sensor data
 * @param {Object} props - Component props
 * @returns {JSX.Element} Sensor data card component
 */
const SensorDataCard = ({ temperature, humidity, isConnected, isDarkMode }) => {
  const theme = getTheme(isDarkMode);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '15px',
        backgroundColor: theme.surface,
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginBottom: '15px',
      }}
    >
      {/* Temperature card */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px',
          borderRight: `1px solid ${theme.divider}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '5px',
          }}
        >
          <FaThermometerHalf
            size={20}
            color={theme.primary}
            style={{ marginRight: '5px' }}
          />
          <span style={{ fontWeight: 'bold' }}>Temperature</span>
        </div>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: theme.primary,
            marginTop: '5px',
          }}
        >
          {temperature !== null ? `${temperature.toFixed(1)}°C` : 'N/A'}
        </div>
      </div>

      {/* Humidity card */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '5px',
          }}
        >
          <FaTint
            size={20}
            color={theme.secondary}
            style={{ marginRight: '5px' }}
          />
          <span style={{ fontWeight: 'bold' }}>Humidity</span>
        </div>
        <div
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: theme.secondary,
            marginTop: '5px',
          }}
        >
          {humidity !== null ? `${humidity.toFixed(1)}%` : 'N/A'}
        </div>
      </div>

      {/* Connection status */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {isConnected ? (
          <FaWifi color={theme.primary} size={16} />
        ) : (
          <FaExclamationTriangle color={theme.error} size={16} />
        )}
        <span
          style={{
            marginLeft: '5px',
            fontSize: '12px',
            color: isConnected ? theme.primary : theme.error,
          }}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};

export default SensorDataCard;
