/**
 * Service for handling API requests
 */
import AppConfig from '../utils/config';

class ApiService {
  /**
   * Creates a new API service
   * @param {string} baseUrl - Base URL for the API
   */
  constructor(baseUrl = AppConfig.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }

  /**
   * Gets the authentication token
   * @returns {string|null} The authentication token
   */
  getToken() {
    return localStorage.getItem('auth_token');
  }

  /**
   * Sets the authentication token
   * @param {string} token - The authentication token
   */
  setToken(token) {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clears the authentication token
   */
  clearToken() {
    localStorage.removeItem('auth_token');
  }

  /**
   * Gets headers for API requests
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Object} Headers for the request
   */
  getHeaders(requiresAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Token ${token}`;
        console.debug('Authorization header:', headers['Authorization']);
      } else {
        console.warn('No token found for authentication');
      }
    }

    return headers;
  }

  /**
   * Handles API response
   * @param {Response} response - The fetch API response
   * @returns {Promise<any>} The response data
   */
  async handleResponse(response) {
    console.debug('Response status:', response.status);
    console.debug('Response headers:', Object.fromEntries([...response.headers.entries()]));

    if (response.status >= 200 && response.status < 300) {
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        console.debug('Empty response body with status code:', response.status);
        return null;
      }

      try {
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');

        if (isJson) {
          const data = await response.json();
          console.debug('Decoded response:', data);

          // Log all keys in the response to help diagnose token field name
          console.debug('Response data keys:', Object.keys(data));

          return data;
        } else {
          const text = await response.text();
          console.debug('Text response:', text);

          // Try to parse the text as JSON in case the content-type header is incorrect
          try {
            const jsonData = JSON.parse(text);
            console.debug('Parsed text response as JSON:', jsonData);
            return jsonData;
          } catch (parseError) {
            // Not JSON, return as text
            return text;
          }
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        throw new Error(`Invalid response format: ${error.message}`);
      }
    } else {
      console.warn('Error response with status code:', response.status);

      let errorMessage = `API error: ${response.status} ${response.statusText}`;

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.debug('Error response data:', errorData);

          // Handle different error formats
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors.join(', ');
          } else {
            // Try to extract error messages from nested objects
            const errors = [];
            Object.keys(errorData).forEach(key => {
              const value = errorData[key];
              if (Array.isArray(value)) {
                errors.push(`${key}: ${value.join(', ')}`);
              } else if (typeof value === 'string') {
                errors.push(`${key}: ${value}`);
              } else if (typeof value === 'object' && value !== null) {
                // Handle nested objects
                const nestedErrors = [];
                Object.keys(value).forEach(nestedKey => {
                  const nestedValue = value[nestedKey];
                  if (Array.isArray(nestedValue)) {
                    nestedErrors.push(`${nestedKey}: ${nestedValue.join(', ')}`);
                  } else if (typeof nestedValue === 'string') {
                    nestedErrors.push(`${nestedKey}: ${nestedValue}`);
                  }
                });
                if (nestedErrors.length > 0) {
                  errors.push(`${key}: ${nestedErrors.join(', ')}`);
                }
              }
            });

            if (errors.length > 0) {
              errorMessage = errors.join('; ');
            }
          }
        } else {
          const text = await response.text();
          if (text) {
            errorMessage = text;

            // Try to parse the text as JSON in case the content-type header is incorrect
            try {
              const jsonData = JSON.parse(text);
              console.debug('Parsed error text response as JSON:', jsonData);

              // Extract error message from JSON
              if (jsonData.detail) {
                errorMessage = jsonData.detail;
              } else if (jsonData.non_field_errors) {
                errorMessage = jsonData.non_field_errors.join(', ');
              } else if (jsonData.message) {
                errorMessage = jsonData.message;
              }
            } catch (parseError) {
              // Not JSON, use the text as is
            }
          }
        }
      } catch (error) {
        console.error('Error parsing error response:', error);
      }

      console.debug('Final error message:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Makes a GET request to the API
   * @param {string} endpoint - The API endpoint
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<any>} The response data
   */
  async get(endpoint, requiresAuth = true) {
    try {
      const headers = this.getHeaders(requiresAuth);

      console.debug(`GET request to: ${this.baseUrl}/${endpoint}`);
      console.debug('Headers:', headers);

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'GET',
        headers,
      });

      return this.handleResponse(response);
    } catch (error) {
      console.error('Network error during GET request:', error);
      throw error;
    }
  }

  /**
   * Makes a POST request to the API
   * @param {string} endpoint - The API endpoint
   * @param {Object} data - The request data
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<any>} The response data
   */
  async post(endpoint, data, requiresAuth = true) {
    try {
      const headers = this.getHeaders(requiresAuth);

      console.debug(`POST request to: ${this.baseUrl}/${endpoint}`);
      console.debug('Headers:', headers);
      console.debug('Body:', JSON.stringify(data));

      // Add a timestamp to the request for debugging
      console.debug('Request timestamp:', new Date().toISOString());

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      console.debug('Response timestamp:', new Date().toISOString());
      return this.handleResponse(response);
    } catch (error) {
      console.error('Network error during POST request:', error);

      // Log more detailed information about the error
      console.info('Request details:');
      console.info('- Base URL:', this.baseUrl);
      console.info('- Endpoint:', endpoint);
      console.info('- Has token:', !!this.getToken());

      // If the error is a network error (e.g., CORS, server down), provide a more helpful message
      if (error.message === 'Failed to fetch') {
        throw new Error(`Network error: Could not connect to ${this.baseUrl}. Please check your internet connection and make sure the server is running.`);
      }

      throw error;
    }
  }
}

export default ApiService;
