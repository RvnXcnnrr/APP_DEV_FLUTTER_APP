import React, { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';
import { useUser } from '../context/UserContext';
import { useMotionEvents } from '../context/MotionEventContext';
import { getTheme } from '../utils/theme';
import MotionEventList from '../components/MotionEventList';
import AppDrawer from '../components/AppDrawer';
import {
  FaBars,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaChevronDown
} from 'react-icons/fa';

/**
 * Dashboard page component
 * @returns {JSX.Element} Dashboard page
 */
const DashboardPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [focusedDay, setFocusedDay] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const userContext = useUser();
  const { isDarkMode, isTokenOwner, user } = userContext;
  const motionContext = useMotionEvents();
  const { getEventsForDay, loadHistoricalEvents, isConnected: eventsConnected, accessDenied } = motionContext;
  const theme = getTheme(isDarkMode);

  // Debug user and motion contexts
  useEffect(() => {
    console.log('DashboardPage - User Context:', userContext);
    console.log('DashboardPage - User:', user);
    console.log('DashboardPage - isTokenOwner:', isTokenOwner);
    console.log('DashboardPage - User email:', user?.email);
    console.log('DashboardPage - Motion Context:', motionContext);
    console.log('DashboardPage - Access Denied:', accessDenied);
  }, [userContext, user, isTokenOwner, motionContext, accessDenied]);

  // Load historical events for the current month when the component mounts or the selected day changes
  useEffect(() => {
    const start = startOfMonth(focusedDay);
    const end = endOfMonth(focusedDay);
    loadHistoricalEvents(start, end);
  }, [focusedDay, loadHistoricalEvents]);

  // Toggle drawer
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Show year picker
  const showYearPickerDialog = () => {
    setShowYearPicker(true);
  };

  // Show month picker
  const showMonthPickerDialog = () => {
    setShowMonthPicker(true);
  };

  // Get month name
  const getMonthName = (month) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month - 1];
  };

  // Check if two dates are the same day
  const isSameDay = (a, b) => {
    return a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(focusedDay);
    const firstDayOfMonth = new Date(focusedDay.getFullYear(), focusedDay.getMonth(), 1);
    const firstWeekday = firstDayOfMonth.getDay() || 7; // Convert Sunday (0) to 7 for easier calculation
    const adjustedFirstWeekday = firstWeekday === 7 ? 0 : firstWeekday; // Adjust for Sunday

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedFirstWeekday; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(focusedDay.getFullYear(), focusedDay.getMonth(), day));
    }

    // Add empty cells to complete the grid (6 rows x 7 columns = 42 cells)
    while (days.length < 42) {
      days.push(null);
    }

    return days;
  };

  // Year picker dialog
  const renderYearPicker = () => {
    if (!showYearPicker) return null;

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 30 }, (_, i) => currentYear - 10 + i);

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
            overflowY: 'auto',
          }}>
            {years.map(year => (
              <div
                key={year}
                style={{
                  padding: '12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: year === focusedDay.getFullYear() ? `${theme.primary}20` : 'transparent',
                  color: year === focusedDay.getFullYear() ? theme.primary : theme.text,
                  fontWeight: year === focusedDay.getFullYear() ? 'bold' : 'normal',
                }}
                onClick={() => {
                  const newDate = new Date(focusedDay);
                  newDate.setFullYear(year);
                  setFocusedDay(newDate);
                  if (selectedDay.getMonth() !== newDate.getMonth() || selectedDay.getFullYear() !== newDate.getFullYear()) {
                    setSelectedDay(new Date(newDate));
                  }
                  setShowYearPicker(false);
                }}
              >
                {year}
              </div>
            ))}
          </div>

          <div style={{
            padding: '8px',
            borderTop: `1px solid ${theme.divider}`,
            textAlign: 'center',
          }}>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: theme.primary,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onClick={() => setShowYearPicker(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Month picker dialog
  const renderMonthPicker = () => {
    if (!showMonthPicker) return null;

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
        display: 'flex',
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
            padding: '8px',
            borderTop: `1px solid ${theme.divider}`,
            textAlign: 'center',
          }}>
            <button
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: theme.primary,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onClick={() => setShowMonthPicker(false)}
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
                <FaChevronLeft size={16} />
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
                <FaChevronRight size={16} />
              </button>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            {/* Weekday headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              marginBottom: '8px',
            }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: theme.primary,
                  padding: '8px 0',
                }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '2px',
            }}>
              {generateCalendarDays().map((day, index) => {
                if (!day) return <div key={`empty-${index}`} />;

                const isSelected = isSameDay(day, selectedDay);
                const hasEvents = getEventsForDay(day).length > 0;

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
            {getEventsForDay(selectedDay).length} events
          </div>
        </div>

        {/* Access Denied Message */}
        {accessDenied && (
          <div style={{
            backgroundColor: '#ffebee', // Light red background
            color: '#d32f2f', // Red text
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Access Denied</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              Only the device owner can access this data.
              <br />
              Current user: {user?.email || 'Not logged in'}
            </p>
          </div>
        )}

        {/* Event list */}
        <div style={{
          backgroundColor: theme.surface,
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginBottom: '16px',
          overflow: 'auto',
          maxHeight: '400px',
          display: accessDenied ? 'none' : 'block', // Hide if access is denied
        }}>
          <MotionEventList events={getEventsForDay(selectedDay)} isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* Connection status */}
      <div
        style={{
          padding: '10px',
          backgroundColor: theme.surface,
          borderTop: `1px solid ${theme.divider}`,
          fontSize: '12px',
          color: theme.textSecondary,
          textAlign: 'center',
          marginTop: 'auto',
        }}
      >
        WebSocket Status: {eventsConnected ? 'Connected' : 'Disconnected'}
      </div>

      {/* Render dialogs */}
      {renderYearPicker()}
      {renderMonthPicker()}
    </div>
  );
};

export default DashboardPage;
