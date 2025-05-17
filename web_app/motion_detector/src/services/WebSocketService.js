/**
 * Service for handling WebSocket connections to the backend
 */
import { AppConfig } from '../utils/config';
import MotionEvent from '../models/MotionEvent';

class WebSocketService {
  /**
   * Creates a new WebSocket service
   * @param {string} serverUrl - The WebSocket server URL
   * @param {ApiService} apiService - The API service for getting the token
   */
  constructor(serverUrl = AppConfig.wsBaseUrl, apiService = null) {
    this.serverUrl = serverUrl;
    this.apiService = apiService;
    this.socket = null;
    this.isConnected = false;
    this.reconnectTimer = null;
    this.reconnectInterval = 5000; // 5 seconds

    // Event listeners
    this.motionEventListeners = [];
    this.sensorDataListeners = [];
    this.connectionStatusListeners = [];

    // Connect to the WebSocket server
    this.connect();
  }

  /**
   * Connects to the WebSocket server
   */
  connect() {
    try {
      // Always use the default token for WebSocket connections
      let url = this.serverUrl;
      let token = AppConfig.defaultToken;

      console.debug('Using default token from AppConfig for WebSocket connection');

      // Add token to URL - this is how the Django backend expects it for WebSocket connections
      // This matches the approach used in the Flutter app's WebSocketService
      if (url.includes('?')) {
        url = `${url}&token=${token}`;
      } else {
        url = `${url}?token=${token}`;
      }
      console.debug('Using token for WebSocket connection');

      console.debug(`Attempting to connect to WebSocket server: ${url}`);

      // Create a new WebSocket connection
      this.socket = new WebSocket(url);

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);

      console.debug('WebSocket connection created, setting up listeners');
    } catch (error) {
      console.error('Failed to connect to WebSocket server:', error);
      console.error('Stack trace:', error.stack);
      this.handleDisconnection();
    }
  }

  /**
   * Handles WebSocket connection open
   * @param {Event} event - The open event
   */
  handleOpen(event) {
    console.debug('Connected to WebSocket server');
    this.isConnected = true;
    this.notifyConnectionStatus(true);
  }

  /**
   * Handles WebSocket messages
   * @param {MessageEvent} event - The message event
   */
  handleMessage(event) {
    try {
      console.debug('Received WebSocket message:', event.data);

      // Parse the message
      const data = JSON.parse(event.data);

      // Check the message type
      const type = data.type;

      if (type === 'motion_event') {
        try {
          // Create a motion event from the data
          const event = this.createMotionEventFromData(data);

          // Notify listeners
          this.notifyMotionEventListeners(event);

          console.debug(`Processed motion event: ${event.id} at ${event.formattedTime}`);
          console.debug(`Temperature: ${event.temperature.toFixed(1)}°C, Humidity: ${event.humidity.toFixed(1)}%`);
        } catch (error) {
          console.error('Error processing motion event:', error);
          console.error('Event data:', data);
        }
      } else if (type === 'sensor_data') {
        // Notify listeners
        this.notifySensorDataListeners(data);

        console.debug(`Received sensor data: Temperature: ${data.temperature}°C, Humidity: ${data.humidity}%`);
      } else {
        console.debug('Received unknown message type:', type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      console.error('Message:', event.data);
    }
  }

  /**
   * Handles WebSocket connection close
   * @param {CloseEvent} event - The close event
   */
  handleClose(event) {
    console.debug(`WebSocket connection closed with code ${event.code}`);

    // Check close code for more information
    if (event.code === 1000) {
      console.debug('Normal closure, connection closed normally');
    } else if (event.code === 1001) {
      console.debug('Going away, server or client is going away');
    } else if (event.code === 1006) {
      console.error('Abnormal closure, connection closed abnormally');
    } else if (event.code === 1008) {
      console.error('Policy violation, message violates server policy');
    } else if (event.code === 1011) {
      console.error('Internal server error');
    } else if (event.code === 4003) {
      console.error('Authentication failed, invalid token');
    }

    if (event.reason) {
      console.debug('Close reason:', event.reason);
    }

    this.handleDisconnection();
  }

  /**
   * Handles WebSocket errors
   * @param {Event} event - The error event
   */
  handleError(event) {
    console.error('WebSocket error:', event);

    // Check if the error is related to authentication
    if (event.message && event.message.includes('401')) {
      console.error('WebSocket authentication failed. Check your token.');
    } else if (event.message && event.message.includes('403')) {
      console.error('WebSocket access forbidden. Check your permissions.');
    }

    this.handleDisconnection();
  }

  /**
   * Handles disconnection from the WebSocket server
   */
  handleDisconnection() {
    // Update connection status
    this.isConnected = false;
    this.notifyConnectionStatus(false);

    console.debug('Disconnected from WebSocket server');

    // Schedule a reconnection attempt
    this.scheduleReconnect();
  }

  /**
   * Schedules a reconnection attempt
   */
  scheduleReconnect() {
    // Clear any existing timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Schedule a new reconnection attempt
    this.reconnectTimer = setTimeout(() => {
      console.debug('Attempting to reconnect to WebSocket server...');
      this.connect();
    }, this.reconnectInterval);
  }

  /**
   * Creates a motion event from WebSocket data
   * @param {Object} data - The WebSocket data
   * @returns {MotionEvent} The motion event
   */
  createMotionEventFromData(data) {
    // Parse the timestamp
    const timestamp = new Date(data.timestamp);

    // Create a unique ID if none is provided
    const id = data.id || `event_${Date.now()}`;

    // Create the motion event
    return new MotionEvent(
      id,
      timestamp,
      data.device_id,
      parseFloat(data.temperature),
      parseFloat(data.humidity),
      data.image_url || 'https://via.placeholder.com/150'
    );
  }

  /**
   * Adds a motion event listener
   * @param {Function} listener - The listener function
   */
  addMotionEventListener(listener) {
    this.motionEventListeners.push(listener);
  }

  /**
   * Removes a motion event listener
   * @param {Function} listener - The listener function
   */
  removeMotionEventListener(listener) {
    this.motionEventListeners = this.motionEventListeners.filter(l => l !== listener);
  }

  /**
   * Notifies motion event listeners
   * @param {MotionEvent} event - The motion event
   */
  notifyMotionEventListeners(event) {
    this.motionEventListeners.forEach(listener => listener(event));
  }

  /**
   * Adds a sensor data listener
   * @param {Function} listener - The listener function
   */
  addSensorDataListener(listener) {
    this.sensorDataListeners.push(listener);
  }

  /**
   * Removes a sensor data listener
   * @param {Function} listener - The listener function
   */
  removeSensorDataListener(listener) {
    this.sensorDataListeners = this.sensorDataListeners.filter(l => l !== listener);
  }

  /**
   * Notifies sensor data listeners
   * @param {Object} data - The sensor data
   */
  notifySensorDataListeners(data) {
    this.sensorDataListeners.forEach(listener => listener(data));
  }

  /**
   * Adds a connection status listener
   * @param {Function} listener - The listener function
   */
  addConnectionStatusListener(listener) {
    this.connectionStatusListeners.push(listener);
    // Immediately notify with current status
    listener(this.isConnected);
  }

  /**
   * Removes a connection status listener
   * @param {Function} listener - The listener function
   */
  removeConnectionStatusListener(listener) {
    this.connectionStatusListeners = this.connectionStatusListeners.filter(l => l !== listener);
  }

  /**
   * Notifies connection status listeners
   * @param {boolean} connected - Whether the WebSocket is connected
   */
  notifyConnectionStatus(connected) {
    this.connectionStatusListeners.forEach(listener => listener(connected));
  }

  /**
   * Closes the WebSocket connection
   */
  close() {
    if (this.socket) {
      this.socket.close();
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
  }
}

export default WebSocketService;
