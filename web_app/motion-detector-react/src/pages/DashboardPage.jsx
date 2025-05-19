import React, { useState, useEffect } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaChevronDown,
  FaExclamationTriangle,
  FaSpinner,
  FaThermometerHalf,
  FaTint
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useMotionEvents } from '../context/MotionEventContext';
import { useWebSocket } from '../context/WebSocketContext';
import { getTheme } from '../utils/theme';
import TopNavBar from '../components/TopNavBar';
import DeviceService from '../services/DeviceService';

/**
 * Dashboard page component
 * @returns {JSX.Element} Dashboard page
 */
const DashboardPage = () => {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [focusedDay, setFocusedDay] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showNewEventNotification, setShowNewEventNotification] = useState(false);

  const { isDarkMode } = useTheme();
  const { isTokenOwner, user } = useUser();
  const {
    loadEventsForDay,
    loadEventsForMonth,
    hasDayEvents,
    getEventsForDay,
    isLoading,
    error,
    isDeviceOwner,
    wsConnected
  } = useMotionEvents();

  // Get WebSocket context
  const { latestSensorData, latestMotionEvent, reconnect } = useWebSocket();

  // Show notification when new motion event is received
  useEffect(() => {
    if (latestMotionEvent && isDeviceOwner) {
      // Show notification
      setShowNewEventNotification(true);

      // Hide notification after 3 seconds
      const timer = setTimeout(() => {
        setShowNewEventNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [latestMotionEvent, isDeviceOwner]);

  // Create device service instance
  const [deviceService] = useState(() => {
    // Use the global apiService if available
    if (window.apiService) {
      return new DeviceService(window.apiService);
    }
    return null;
  });

  // State for device ownership
  const [isESP32Owner, setIsESP32Owner] = useState(false);

  // Check device ownership when user changes
  useEffect(() => {
    const checkDeviceOwnership = async () => {
      if (user && user.email && deviceService) {
        const isOwner = await deviceService.isDeviceOwner('ESP32_001', user);
        setIsESP32Owner(isOwner);
        console.log(`User ${user.email} ${isOwner ? 'is' : 'is not'} the owner of device ESP32_001`);
      } else {
        setIsESP32Owner(false);
      }
    };

    checkDeviceOwnership();
  }, [user, deviceService]);

  const theme = getTheme(isDarkMode);

  // Load events for the current month when the component mounts or when the focused month changes
  useEffect(() => {
    const loadEvents = async () => {
      await loadEventsForMonth(focusedDay.getFullYear(), focusedDay.getMonth() + 1);
    };

    loadEvents();
  }, [focusedDay.getFullYear(), focusedDay.getMonth(), loadEventsForMonth]);

  // Load events for the selected day when it changes
  useEffect(() => {
    const loadEvents = async () => {
      await loadEventsForDay(selectedDay);
    };

    loadEvents();
  }, [selectedDay, loadEventsForDay]);

  // Get events for the selected day
  const events = getEventsForDay(selectedDay);

  // Helper functions
  const getMonthName = (month) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1];
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month - 1, 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = focusedDay.getFullYear();
    const month = focusedDay.getMonth() + 1;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month - 1, i));
    }

    return days;
  };

  // Show year picker dialog
  const showYearPickerDialog = () => {
    setShowYearPicker(true);
  };

  // Show month picker dialog
  const showMonthPickerDialog = () => {
    setShowMonthPicker(true);
  };

  // Year picker component
  const YearPicker = () => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: showYearPicker ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: theme.surface,
          borderRadius: '16px',
          width: '300px',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}>
          <div style={{
            padding: '16px',
            borderBottom: `1px solid ${theme.divider}`,
            textAlign: 'center',
          }}>
            <h3 style={{
              margin: 0,
              color: theme.primary,
              fontSize: '18px',
              fontWeight: 'bold',
            }}>Select Year</h3>
          </div>

          <div style={{
            height: '300px',
            overflow: 'auto',
          }}>
            {years.map((year) => (
              <div
                key={year}
                onClick={() => {
                  const newDate = new Date(focusedDay);
                  newDate.setFullYear(year);
                  setFocusedDay(newDate);
                  if (selectedDay.getMonth() !== newDate.getMonth() || selectedDay.getFullYear() !== newDate.getFullYear()) {
                    setSelectedDay(new Date(newDate));
                  }
                  setShowYearPicker(false);
                }}
                style={{
                  padding: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: year === focusedDay.getFullYear() ? `${theme.primary}20` : 'transparent',
                  color: year === focusedDay.getFullYear() ? theme.primary : theme.text,
                  fontWeight: year === focusedDay.getFullYear() ? 'bold' : 'normal',
                }}
              >
                {year}
              </div>
            ))}
          </div>

          <div style={{
            padding: '16px',
            borderTop: `1px solid ${theme.divider}`,
            textAlign: 'center',
          }}>
            <button
              onClick={() => setShowYearPicker(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Month picker component
  const MonthPicker = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: showMonthPicker ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: theme.surface,
          borderRadius: '16px',
          width: '300px',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}>
          <div style={{
            padding: '16px',
            borderBottom: `1px solid ${theme.divider}`,
            textAlign: 'center',
          }}>
            <h3 style={{
              margin: 0,
              color: theme.primary,
              fontSize: '18px',
              fontWeight: 'bold',
            }}>Select Month</h3>
          </div>

          <div style={{
            height: '300px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            padding: '16px',
          }}>
            {monthNames.map((month, index) => (
              <div
                key={month}
                style={{
                  padding: '12px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: index === focusedDay.getMonth() ? `${theme.primary}20` : 'transparent',
                  color: index === focusedDay.getMonth() ? theme.primary : theme.text,
                  fontWeight: index === focusedDay.getMonth() ? 'bold' : 'normal',
                  border: index === focusedDay.getMonth() ? `1px solid ${theme.primary}` : 'none',
                  borderRadius: '8px',
                }}
                onClick={() => {
                  const newDate = new Date(focusedDay);
                  newDate.setMonth(index);
                  setFocusedDay(newDate);
                  if (selectedDay.getMonth() !== newDate.getMonth() || selectedDay.getFullYear() !== newDate.getFullYear()) {
                    setSelectedDay(new Date(newDate));
                  }
                  setShowMonthPicker(false);
                }}
              >
                {month}
              </div>
            ))}
          </div>

          <div style={{
            padding: '16px',
            borderTop: `1px solid ${theme.divider}`,
            textAlign: 'center',
          }}>
            <button
              onClick={() => setShowMonthPicker(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
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
      {/* Top navigation bar */}
      <TopNavBar title="Motion Dashboard" />

      {/* WebSocket connection status */}
      {isDeviceOwner && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4px 0',
          backgroundColor: wsConnected ? `${theme.success || '#4caf50'}20` : `${theme.error || '#f44336'}20`,
          color: wsConnected ? (theme.success || '#4caf50') : (theme.error || '#f44336'),
          fontSize: '12px',
          fontWeight: 'bold',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: wsConnected ? (theme.success || '#4caf50') : (theme.error || '#f44336'),
            }} />
            {wsConnected ? 'Real-time updates active' : 'Real-time updates disconnected'}
            {!wsConnected && (
              <button
                onClick={reconnect}
                style={{
                  marginLeft: '8px',
                  padding: '2px 6px',
                  backgroundColor: theme.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                }}
              >
                Reconnect
              </button>
            )}
          </div>
        </div>
      )}

      {/* Latest Sensor Data */}
      {isDeviceOwner && latestSensorData && (
        <div style={{ padding: '16px 16px 0 16px' }}>
          <div style={{
            backgroundColor: theme.surface,
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              fontSize: '16px',
              fontWeight: 'bold',
              color: theme.primary,
            }}>
              Latest Sensor Data
              <span style={{
                fontSize: '12px',
                fontWeight: 'normal',
                color: theme.textSecondary,
                marginLeft: '8px',
              }}>
                {latestSensorData.timestamp ? new Date(latestSensorData.timestamp).toLocaleTimeString() : 'Just now'}
              </span>
            </h3>

            <div style={{
              display: 'flex',
              gap: '16px',
            }}>
              <div style={{
                flex: 1,
                backgroundColor: `${theme.primary}10`,
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <FaThermometerHalf size={24} color={theme.primary} />
                <div style={{
                  fontSize: '12px',
                  color: theme.textSecondary,
                  marginTop: '4px',
                }}>
                  Temperature
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: theme.primary,
                  marginTop: '4px',
                }}>
                  {typeof latestSensorData.temperature !== 'undefined' ?
                    `${parseFloat(latestSensorData.temperature).toFixed(1)}°C` : 'N/A'}
                </div>
              </div>

              <div style={{
                flex: 1,
                backgroundColor: `${theme.secondary || '#2196f3'}10`,
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <FaTint size={24} color={theme.secondary || '#2196f3'} />
                <div style={{
                  fontSize: '12px',
                  color: theme.textSecondary,
                  marginTop: '4px',
                }}>
                  Humidity
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: theme.secondary || '#2196f3',
                  marginTop: '4px',
                }}>
                  {typeof latestSensorData.humidity !== 'undefined' ?
                    `${parseFloat(latestSensorData.humidity).toFixed(1)}%` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Card */}
      <div style={{ padding: '16px' }}>
        <div style={{
          backgroundColor: theme.surface,
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          marginBottom: '16px',
        }}>
          {/* Calendar header with year and month navigation */}
          <div style={{
            backgroundColor: `${theme.primary}1A`, // ~10% opacity
            borderRadius: '8px',
            padding: '8px',
          }}>
            {/* Year navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}>
              <button
                onClick={() => {
                  const newDate = new Date(focusedDay);
                  newDate.setFullYear(newDate.getFullYear() - 1);
                  setFocusedDay(newDate);
                  if (selectedDay.getMonth() !== newDate.getMonth() || selectedDay.getFullYear() !== newDate.getFullYear()) {
                    setSelectedDay(new Date(newDate));
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.primary,
                }}
              >
                <FaAngleDoubleLeft size={20} />
              </button>

              <div
                onClick={showYearPickerDialog}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span style={{
                  fontWeight: 'bold',
                  color: theme.primary,
                  fontSize: '16px',
                }}>
                  {focusedDay.getFullYear()}
                </span>
                <FaChevronDown size={12} color={theme.primary} style={{ marginLeft: '4px' }} />
              </div>

              <button
                onClick={() => {
                  const newDate = new Date(focusedDay);
                  newDate.setFullYear(newDate.getFullYear() + 1);
                  setFocusedDay(newDate);
                  if (selectedDay.getMonth() !== newDate.getMonth() || selectedDay.getFullYear() !== newDate.getFullYear()) {
                    setSelectedDay(new Date(newDate));
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.primary,
                }}
              >
                <FaAngleDoubleRight size={20} />
              </button>
            </div>

            {/* Month navigation */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <button
                onClick={() => {
                  const newDate = new Date(focusedDay);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setFocusedDay(newDate);
                  if (selectedDay.getMonth() !== newDate.getMonth() || selectedDay.getFullYear() !== newDate.getFullYear()) {
                    setSelectedDay(new Date(newDate));
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.primary,
                }}
              >
                <FaChevronLeft size={20} />
              </button>

              <div
                onClick={showMonthPickerDialog}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <span style={{
                  fontWeight: 'bold',
                  color: theme.primary,
                  fontSize: '16px',
                }}>
                  {getMonthName(focusedDay.getMonth() + 1)}
                </span>
                <FaChevronDown size={12} color={theme.primary} style={{ marginLeft: '4px' }} />
              </div>

              <button
                onClick={() => {
                  const newDate = new Date(focusedDay);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setFocusedDay(newDate);
                  if (selectedDay.getMonth() !== newDate.getMonth() || selectedDay.getFullYear() !== newDate.getFullYear()) {
                    setSelectedDay(new Date(newDate));
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.primary,
                }}
              >
                <FaChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div style={{ marginTop: '16px' }}>
            {/* Weekday headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
              marginBottom: '8px',
            }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: theme.textSecondary,
                    fontSize: '14px',
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '4px',
            }}>
              {generateCalendarDays().map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} />;
                }

                const isSelected = day.getDate() === selectedDay.getDate() &&
                  day.getMonth() === selectedDay.getMonth() &&
                  day.getFullYear() === selectedDay.getFullYear();

                // Check if this day has events using the context
                const hasEvents = hasDayEvents(day);

                return (
                  <div
                    key={`day-${index}`}
                    onClick={() => setSelectedDay(day)}
                    style={{
                      margin: '2px',
                      aspectRatio: '1',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? theme.primary : 'transparent',
                      border: hasEvents ? `1.5px solid ${theme.primary}80` : 'none', // 50% opacity
                    }}
                  >
                    <span style={{
                      color: isSelected ? 'white' : theme.text,
                      fontWeight: isSelected ? 'bold' : 'normal',
                      fontSize: '16px',
                    }}>
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Events section */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          padding: '0 8px',
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 'bold',
            color: theme.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            Events on {selectedDay.getDate()} {getMonthName(selectedDay.getMonth() + 1)} {selectedDay.getFullYear()}
          </h2>

          <div style={{
            backgroundColor: `${theme.primary}1A`, // ~10% opacity
            borderRadius: '16px',
            padding: '4px 8px',
            fontSize: '12px',
          }}>
            {events.length} events
          </div>
        </div>

        {/* Event list */}
        <div style={{
          backgroundColor: theme.surface,
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginBottom: '16px',
          overflow: 'auto',
          maxHeight: '400px',
          padding: '16px',
        }}>
          {isLoading ? (
            /* Loading state */
            <div style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: theme.textSecondary,
            }}>
              <FaSpinner
                size={24}
                style={{
                  animation: 'spin 1s linear infinite',
                  marginBottom: '8px',
                  color: theme.primary
                }}
              />
              <div>Loading events...</div>
            </div>
          ) : error ? (
            /* Error state */
            <div style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: theme.error || '#f44336',
            }}>
              <FaExclamationTriangle
                size={24}
                style={{ marginBottom: '8px' }}
              />
              <div>{error}</div>
            </div>
          ) : !isTokenOwner && !isDeviceOwner && !isESP32Owner ? (
            /* No access state */
            <div style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: theme.textSecondary,
            }}>
              <FaExclamationTriangle
                size={24}
                style={{ marginBottom: '8px' }}
              />
              <div>You don't have access to view motion events.</div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                Only the device owner can view motion events for ESP32_001.
              </div>
            </div>
          ) : events.length === 0 ? (
            /* No events state */
            <div style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: theme.textSecondary,
            }}>
              No events on this day
            </div>
          ) : (
            /* Events list with real data */
            <div>
              {events.map((event, index) => (
                <div
                  key={event.id || index}
                  style={{
                    padding: '12px',
                    borderBottom: index < events.length - 1 ? `1px solid ${theme.divider}` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    // Add a subtle highlight animation for new events
                    animation: event === latestMotionEvent ? 'highlightNew 2s ease-out' : 'none',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    position: 'relative',
                  }}>
                    <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      {event === latestMotionEvent && (
                        <span style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: theme.primary,
                          marginRight: '6px',
                        }} />
                      )}
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {event === latestMotionEvent && (
                        <span style={{
                          fontSize: '10px',
                          color: theme.primary,
                          marginLeft: '6px',
                          fontWeight: 'normal',
                        }}>
                          NEW
                        </span>
                      )}
                    </span>
                    <span style={{ color: theme.textSecondary, fontSize: '14px' }}>
                      Device: {event.device_id || 'ESP32_001'}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                  }}>
                    <div>
                      <span style={{
                        color: theme.textSecondary,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FaThermometerHalf size={14} /> Temperature
                      </span>
                      <div style={{ fontWeight: 'bold' }}>
                        {typeof event.temperature !== 'undefined' ? `${event.temperature.toFixed(1)}°C` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span style={{
                        color: theme.textSecondary,
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FaTint size={14} /> Humidity
                      </span>
                      <div style={{ fontWeight: 'bold' }}>
                        {typeof event.humidity !== 'undefined' ? `${event.humidity.toFixed(1)}%` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Year and Month Pickers */}
      <YearPicker />
      <MonthPicker />

      {/* New Event Notification */}
      {showNewEventNotification && latestMotionEvent && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: theme.primary,
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.3s ease-out',
          maxWidth: '300px',
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'white',
          }} />
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>New Motion Detected</div>
            <div style={{ fontSize: '12px' }}>
              {new Date(latestMotionEvent.timestamp).toLocaleTimeString()} •
              {typeof latestMotionEvent.temperature !== 'undefined' ?
                ` ${latestMotionEvent.temperature.toFixed(1)}°C` : ''} •
              {typeof latestMotionEvent.humidity !== 'undefined' ?
                ` ${latestMotionEvent.humidity.toFixed(1)}%` : ''}
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes highlightNew {
            0% { background-color: ${theme.primary}30; }
            100% { background-color: transparent; }
          }

          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default DashboardPage;
