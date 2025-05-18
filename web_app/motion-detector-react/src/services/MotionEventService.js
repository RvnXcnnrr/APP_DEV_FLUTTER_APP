/**
 * Service for handling motion event data
 */
class MotionEventService {
  /**
   * Creates a new motion event service
   * @param {ApiService} apiService - The API service to use
   */
  constructor(apiService) {
    this.apiService = apiService;
  }

  /**
   * Gets motion events for a specific date range
   * @param {Date} startDate - The start date
   * @param {Date} endDate - The end date
   * @param {Object} user - The current user object (optional)
   * @returns {Promise<Array>} The motion events
   */
  async getMotionEvents(startDate, endDate, user = null) {
    try {
      // Format dates for API request (YYYY-MM-DD)
      const formattedStartDate = this.formatDateForApi(startDate);
      const formattedEndDate = this.formatDateForApi(endDate);

      console.info(`Fetching motion events from ${formattedStartDate} to ${formattedEndDate}`);

      // If user is provided, log the email for debugging
      if (user && user.email) {
        console.debug(`User email for request: ${user.email}`);
      }

      // Make request to get motion events with user object for email header
      const response = await this.apiService.get(
        `api/sensors/motion-events/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`,
        true,
        user
      );

      console.debug('Motion events response:', response);

      // If the response is paginated, extract the results
      const events = response.results || response;

      // Process events to ensure they have proper date objects
      return this.processEvents(events);
    } catch (error) {
      console.error('Error getting motion events:', error);
      throw new Error('Failed to get motion events. Please try again later.');
    }
  }

  /**
   * Gets motion events for a specific day
   * @param {Date} date - The date to get events for
   * @param {Object} user - The current user object (optional)
   * @returns {Promise<Array>} The motion events
   */
  async getMotionEventsForDay(date, user = null) {
    // Create a copy of the date to avoid modifying the original
    const startDate = new Date(date);
    // Set time to beginning of day
    startDate.setHours(0, 0, 0, 0);

    // Create end date (end of the same day)
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    return this.getMotionEvents(startDate, endDate, user);
  }

  /**
   * Gets motion events for a specific month
   * @param {number} year - The year
   * @param {number} month - The month (1-12)
   * @param {Object} user - The current user object (optional)
   * @returns {Promise<Array>} The motion events
   */
  async getMotionEventsForMonth(year, month, user = null) {
    // Create start date (first day of month)
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);

    // Create end date (last day of month)
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    return this.getMotionEvents(startDate, endDate, user);
  }

  /**
   * Formats a date for API requests
   * @param {Date} date - The date to format
   * @returns {string} The formatted date (YYYY-MM-DD)
   */
  formatDateForApi(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Processes events to ensure they have proper date objects
   * @param {Array} events - The events to process
   * @returns {Array} The processed events
   */
  processEvents(events) {
    return events.map(event => ({
      ...event,
      // Convert timestamp string to Date object if it's not already
      timestamp: event.timestamp instanceof Date ? event.timestamp : new Date(event.timestamp),
      // Ensure temperature and humidity are numbers
      temperature: typeof event.temperature === 'string' ? parseFloat(event.temperature) : event.temperature,
      humidity: typeof event.humidity === 'string' ? parseFloat(event.humidity) : event.humidity
    }));
  }

  /**
   * Groups events by day
   * @param {Array} events - The events to group
   * @returns {Object} The events grouped by day
   */
  groupEventsByDay(events) {
    const groupedEvents = {};

    events.forEach(event => {
      const date = new Date(event.timestamp);
      const dateKey = this.formatDateForApi(date);

      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }

      groupedEvents[dateKey].push(event);
    });

    return groupedEvents;
  }
}

export default MotionEventService;
