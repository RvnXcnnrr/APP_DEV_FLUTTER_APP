import { format } from 'date-fns';

/**
 * Model class representing a motion detection event
 */
class MotionEvent {
  /**
   * Creates a new motion event
   * @param {string} id - Unique identifier for the event
   * @param {Date} timestamp - Timestamp when the motion was detected
   * @param {string} deviceId - ID of the device that detected the motion
   * @param {number} temperature - Temperature reading at the time of the event (in Celsius)
   * @param {number} humidity - Humidity reading at the time of the event (in percentage)
   * @param {string} imageUrl - URL to the image captured during the motion event
   */
  constructor(id, timestamp, deviceId, temperature, humidity, imageUrl) {
    this.id = id;
    this.timestamp = timestamp;
    this.deviceId = deviceId;
    this.temperature = temperature;
    this.humidity = humidity;
    this.imageUrl = imageUrl;
  }

  /**
   * Creates a formatted time string from the timestamp with AM/PM
   * @returns {string} Formatted time string
   */
  get formattedTime() {
    return format(this.timestamp, 'h:mm a');
  }

  /**
   * Creates a formatted date string from the timestamp
   * @returns {string} Formatted date string
   */
  get formattedDate() {
    return format(this.timestamp, 'dd/MM/yyyy');
  }
}

export default MotionEvent;
