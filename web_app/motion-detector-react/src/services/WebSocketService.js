/**
 * Service for handling WebSocket connections to the backend
 */
import AppConfig from '../utils/config';

class WebSocketService {
  /**
   * Creates a new WebSocket service
   * @param {string} baseUrl - Base URL for the WebSocket connection
   * @param {Object} options - Options for the WebSocket connection
   */
  constructor(baseUrl = AppConfig.wsBaseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.options = {
      reconnectInterval: 5000, // Reconnect every 5 seconds
      maxReconnectAttempts: 0, // Unlimited reconnect attempts
      userEmail: null, // User email for authentication
      ...options,
    };

    // WebSocket instance
    this.socket = null;

    // Connection state
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;

    // Event callbacks
    this.eventCallbacks = {
      connect: [],
      disconnect: [],
      message: [],
      error: [],
      motionEvent: [],
      sensorData: [],
    };

    // Bind methods to this instance
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.reconnect = this.reconnect.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  /**
   * Connects to the WebSocket server
   * @returns {Promise<boolean>} Whether the connection was successful
   */
  connect() {
    return new Promise((resolve) => {
      // Don't try to connect if already connected
      if (this.isConnected && this.socket && this.socket.readyState === WebSocket.OPEN) {
        console.info('WebSocket already connected');
        resolve(true);
        return;
      }

      // Close any existing socket
      if (this.socket) {
        try {
          this.socket.close();
          this.socket = null;
        } catch (closeError) {
          console.warn('Error closing existing WebSocket:', closeError);
        }
      }

      try {
        // Add email parameter to URL if provided
        let wsUrl = this.baseUrl;
        if (this.options.userEmail) {
          // Check if the URL already has parameters
          const hasParams = wsUrl.includes('?');
          wsUrl = `${wsUrl}${hasParams ? '&' : '?'}email=${encodeURIComponent(this.options.userEmail)}`;
        }

        console.info(`Connecting to WebSocket server: ${wsUrl}`);

        // Create new WebSocket connection
        this.socket = new WebSocket(wsUrl);

        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.socket && this.socket.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket connection timeout');

            // Close the socket if it's not already closed
            if (this.socket.readyState !== WebSocket.CLOSED) {
              this.socket.close();
            }

            this.isConnected = false;
            resolve(false);
          }
        }, 10000); // 10 second timeout

        // Set up event handlers
        this.socket.onopen = (event) => {
          clearTimeout(connectionTimeout);
          this.handleOpen(event);
          resolve(true);
        };

        this.socket.onclose = this.handleClose;
        this.socket.onmessage = this.handleMessage;

        this.socket.onerror = (event) => {
          console.error('WebSocket connection error:', event);
          clearTimeout(connectionTimeout);
          this.handleError(event);
          resolve(false);
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        this.handleError(error);
        resolve(false);
      }
    });
  }

  /**
   * Disconnects from the WebSocket server
   */
  disconnect() {
    // Clear any reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Close the socket if it exists
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.isConnected = false;
  }

  /**
   * Attempts to reconnect to the WebSocket server
   */
  reconnect() {
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Check if we've exceeded the maximum number of reconnect attempts
    if (this.options.maxReconnectAttempts > 0 && this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.warn(`Maximum reconnect attempts (${this.options.maxReconnectAttempts}) reached`);
      return;
    }

    // Increment reconnect attempts
    this.reconnectAttempts++;

    // Schedule reconnect
    this.reconnectTimer = setTimeout(() => {
      console.info(`Attempting to reconnect to WebSocket server (attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, this.options.reconnectInterval);
  }

  /**
   * Handles WebSocket open event
   * @param {Event} event - The open event
   */
  handleOpen(event) {
    console.info('WebSocket connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;

    // Trigger connect callbacks
    this.eventCallbacks.connect.forEach(callback => callback(event));
  }

  /**
   * Handles WebSocket close event
   * @param {CloseEvent} event - The close event
   */
  handleClose(event) {
    console.info(`WebSocket disconnected: ${event.code} ${event.reason}`);
    this.isConnected = false;

    // Trigger disconnect callbacks
    this.eventCallbacks.disconnect.forEach(callback => callback(event));

    // Attempt to reconnect
    this.reconnect();
  }

  /**
   * Handles WebSocket message event
   * @param {MessageEvent} event - The message event
   */
  handleMessage(event) {
    try {
      // Parse the message data
      const data = JSON.parse(event.data);
      console.debug('Received WebSocket message:', data);

      // Trigger message callbacks
      this.eventCallbacks.message.forEach(callback => callback(data));

      // Check the message type and trigger specific callbacks
      if (data.type === 'motion_event') {
        // Process motion event
        const processedEvent = this.processMotionEvent(data);
        console.info('Processed motion event:', processedEvent);

        // Trigger motion event callbacks
        this.eventCallbacks.motionEvent.forEach(callback => {
          try {
            callback(processedEvent);
          } catch (callbackError) {
            console.error('Error in motion event callback:', callbackError);
          }
        });
      } else if (data.type === 'sensor_data') {
        // Process sensor data
        const processedData = this.processSensorData(data);
        console.info('Processed sensor data:', processedData);

        // Trigger sensor data callbacks
        this.eventCallbacks.sensorData.forEach(callback => {
          try {
            callback(processedData);
          } catch (callbackError) {
            console.error('Error in sensor data callback:', callbackError);
          }
        });
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      console.error('Raw message data:', event.data);
    }
  }

  /**
   * Handles WebSocket error event
   * @param {Event} event - The error event
   */
  handleError(event) {
    console.error('WebSocket error:', event);

    // Trigger error callbacks
    this.eventCallbacks.error.forEach(callback => callback(event));
  }

  /**
   * Processes a motion event
   * @param {Object} data - The motion event data
   * @returns {Object} The processed motion event
   */
  processMotionEvent(data) {
    // Convert timestamp to Date object with validation
    let timestamp;
    if (data.timestamp) {
      try {
        timestamp = new Date(data.timestamp);
        // Check if date is valid
        if (isNaN(timestamp.getTime())) {
          console.warn('Invalid timestamp received:', data.timestamp);
          // Use current time as fallback
          timestamp = new Date();
        }
      } catch (error) {
        console.warn('Error parsing timestamp:', error);
        timestamp = new Date();
      }
    } else {
      timestamp = new Date();
    }

    // Create a unique ID if none is provided
    const id = data.id || `event_${Date.now()}`;

    // Return processed event
    return {
      ...data,
      id,
      timestamp,
      temperature: typeof data.temperature === 'string' ? parseFloat(data.temperature) : data.temperature,
      humidity: typeof data.humidity === 'string' ? parseFloat(data.humidity) : data.humidity,
    };
  }

  /**
   * Processes sensor data
   * @param {Object} data - The sensor data
   * @returns {Object} The processed sensor data
   */
  processSensorData(data) {
    // Convert timestamp to Date object with validation
    let timestamp;
    if (data.timestamp) {
      try {
        timestamp = new Date(data.timestamp);
        // Check if date is valid
        if (isNaN(timestamp.getTime())) {
          console.warn('Invalid timestamp in sensor data:', data.timestamp);
          // Use current time as fallback
          timestamp = new Date();
        }
      } catch (error) {
        console.warn('Error parsing sensor data timestamp:', error);
        timestamp = new Date();
      }
    } else {
      timestamp = new Date();
    }

    // Process temperature with validation
    let temperature = data.temperature;
    if (typeof temperature === 'string') {
      try {
        temperature = parseFloat(temperature);
        if (isNaN(temperature)) {
          console.warn('Invalid temperature value:', data.temperature);
          temperature = null;
        }
      } catch (error) {
        console.warn('Error parsing temperature:', error);
        temperature = null;
      }
    }

    // Process humidity with validation
    let humidity = data.humidity;
    if (typeof humidity === 'string') {
      try {
        humidity = parseFloat(humidity);
        if (isNaN(humidity)) {
          console.warn('Invalid humidity value:', data.humidity);
          humidity = null;
        }
      } catch (error) {
        console.warn('Error parsing humidity:', error);
        humidity = null;
      }
    }

    // Return processed data
    return {
      ...data,
      timestamp,
      temperature,
      humidity,
      // Add a unique ID for easier tracking
      id: data.id || `sensor_${Date.now()}`,
      // Add received time for display purposes
      receivedAt: new Date(),
      // Ensure device_id is set
      device_id: data.device_id || 'ESP32_001'
    };
  }

  /**
   * Registers an event callback
   * @param {string} event - The event to listen for
   * @param {Function} callback - The callback function
   */
  on(event, callback) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event].push(callback);
    } else {
      console.warn(`Unknown event: ${event}`);
    }
  }

  /**
   * Removes an event callback
   * @param {string} event - The event to remove the callback from
   * @param {Function} callback - The callback function to remove
   */
  off(event, callback) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event] = this.eventCallbacks[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Sets the user email for authentication
   * @param {string} email - The user's email
   * @returns {boolean} Whether the email was updated
   */
  setUserEmail(email) {
    if (!email) {
      console.warn('No email provided for WebSocket authentication');
      return false;
    }

    // Check if email is already set and hasn't changed
    if (this.options.userEmail === email) {
      console.info(`WebSocket authentication email already set to: ${email}`);
      return true;
    }

    // Update the user email
    this.options.userEmail = email;
    console.info(`Updated WebSocket authentication email: ${email}`);

    // Reconnect if already connected to use the new email
    if (this.isConnected) {
      console.info('Reconnecting WebSocket with new authentication email');
      this.disconnect();

      // Short delay before reconnecting to ensure clean disconnect
      setTimeout(() => {
        this.connect();
      }, 300);
    }

    return true;
  }
}

export default WebSocketService;
