/**
 * Service for handling device-related operations
 */
class DeviceService {
  /**
   * Creates a new device service
   * @param {Object} apiService - The API service to use for requests
   */
  constructor(apiService) {
    this.apiService = apiService;
    this.deviceCache = new Map(); // Cache device ownership information
  }

  /**
   * Checks if a user is the owner of a special device (internal method)
   * @param {string} deviceId - The device ID to check
   * @param {string} userEmail - The user's email
   * @returns {boolean} Whether the user is the owner of the device
   * @private
   */
  checkSpecialDeviceOwnership(deviceId, userEmail) {
    // This method handles special device ownership checks internally
    // without exposing the actual owner email in the UI

    // ESP32_001 device owner check
    if (deviceId === 'ESP32_001') {
      // The actual owner email is stored here but not displayed in the UI
      const ownerEmail = 'oracle.tech.143@gmail.com';
      return userEmail === ownerEmail;
    }

    return false;
  }

  /**
   * Checks if a user is the owner of a device
   * @param {string} deviceId - The device ID to check
   * @param {Object} user - The user object
   * @returns {Promise<boolean>} Whether the user is the owner of the device
   */
  async isDeviceOwner(deviceId, user) {
    if (!user || !user.email) {
      console.warn('No user or user email provided for device ownership check');
      return false;
    }

    // Special case for ESP32_001 - owner check handled internally
    if (deviceId === 'ESP32_001') {
      // Check if user is the device owner (email check handled internally)
      const isSpecialDeviceOwner = this.checkSpecialDeviceOwnership(deviceId, user.email);
      if (isSpecialDeviceOwner) {
        console.debug(`User is the owner of device ${deviceId} (special case)`);
        // Cache the result
        this.deviceCache.set(`${deviceId}-${user.email}`, true);
        return true;
      }
    }

    // Check cache first
    const cacheKey = `${deviceId}-${user.email}`;
    if (this.deviceCache.has(cacheKey)) {
      console.debug(`Using cached device ownership for ${cacheKey}`);
      return this.deviceCache.get(cacheKey);
    }

    try {
      // Fetch device information from the API
      console.debug(`Checking if user ${user.email} is the owner of device ${deviceId}`);

      // Make API request to get device information
      const response = await this.apiService.get(`api/sensors/devices/`, true, user);

      // Check if the user owns the device
      const devices = Array.isArray(response) ? response : (response.results || []);
      const isOwner = devices.some(device => device.device_id === deviceId);

      // Cache the result
      this.deviceCache.set(cacheKey, isOwner);

      console.debug(`User ${user.email} ${isOwner ? 'is' : 'is not'} the owner of device ${deviceId}`);
      return isOwner;
    } catch (error) {
      console.error(`Error checking device ownership for ${deviceId}:`, error);

      // Special case fallback for ESP32_001
      if (deviceId === 'ESP32_001') {
        const isSpecialDeviceOwner = this.checkSpecialDeviceOwnership(deviceId, user.email);
        if (isSpecialDeviceOwner) {
          console.debug(`Fallback: User is the owner of device ${deviceId} (special case)`);
          // Cache the result
          this.deviceCache.set(`${deviceId}-${user.email}`, true);
          return true;
        }
      }

      return false;
    }
  }

  /**
   * Gets all devices owned by a user
   * @param {Object} user - The user object
   * @returns {Promise<Array>} The devices owned by the user
   */
  async getUserDevices(user) {
    if (!user || !user.email) {
      console.warn('No user or user email provided for getting user devices');
      return [];
    }

    try {
      // Fetch devices from the API
      console.debug(`Getting devices for user ${user.email}`);

      // Make API request to get devices
      const response = await this.apiService.get(`api/sensors/devices/`, true, user);

      // Return the devices
      const devices = Array.isArray(response) ? response : (response.results || []);
      console.debug(`Found ${devices.length} devices for user ${user.email}`);

      return devices;
    } catch (error) {
      console.error(`Error getting devices for user ${user.email}:`, error);
      return [];
    }
  }

  /**
   * Clears the device cache
   */
  clearCache() {
    this.deviceCache.clear();
    console.debug('Device cache cleared');
  }
}

export default DeviceService;
