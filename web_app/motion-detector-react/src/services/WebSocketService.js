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
        this.socket.close();
      }

      try {
        console.info(`Connecting to WebSocket server: ${this.baseUrl}`);
        this.socket = new WebSocket(this.baseUrl);

        // Set up event handlers
        this.socket.onopen = (event) => {
          this.handleOpen(event);
          resolve(true);
        };
        this.socket.onclose = this.handleClose;
        this.socket.onmessage = this.handleMessage;
        this.socket.onerror = (event) => {
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
        this.eventCallbacks.motionEvent.forEach(callback => callback(processedEvent));
      } else if (data.type === 'sensor_data') {
        // Process sensor data
        this.eventCallbacks.sensorData.forEach(callback => callback(data));
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
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
    // Convert timestamp to Date object
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

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
}

export default WebSocketService;
