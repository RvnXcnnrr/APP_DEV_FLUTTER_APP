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
  async getHeaders(requiresAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requiresAuth) {
      // For the motion detector app, we're using a specific token
      // that's recognized by the backend for the ESP32_001 device
      const token = this.getToken();

      if (token) {
        // For this specific application, we know we're using Token authentication
        // with the Django REST framework, so we'll always use the Token prefix
        headers['Authorization'] = `Token ${token}`;

        console.debug('Authorization header:', headers['Authorization']);
      } else {
        console.warn('No token found for authentication');

        // If no token is found, try to use the default token from AppConfig
        if (typeof AppConfig !== 'undefined' && AppConfig.defaultToken) {
          const defaultToken = AppConfig.defaultToken;
          headers['Authorization'] = `Token ${defaultToken}`;
          console.debug('Using default token for Authorization header:', headers['Authorization']);

          // Also save it to localStorage for future requests
          this.setToken(defaultToken);
        }
      }
    }

    return headers;
  }

  /**
   * Handles API response
   * @param {Response} response - The response from the API
   * @returns {Promise<any>} The parsed response data
   * @throws {Error} If the response is not successful
   */
  async handleResponse(response) {
    // Log the raw response for debugging
    console.debug('Response status code:', response.status);
    console.debug('Response headers:', response.headers);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (response.status >= 200 && response.status < 300) {
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        console.debug('Empty response body with status code:', response.status);
        return null;
      }

      try {
        if (isJson) {
          const data = await response.json();
          console.debug('Decoded response:', data);
          return data;
        } else {
          const text = await response.text();
          console.debug('Text response:', text);
          return text;
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        throw new Error(`Invalid response format: ${error.message}`);
      }
    } else {
      console.warn('Error response with status code:', response.status);

      let errorMessage = `API error: ${response.status} ${response.statusText}`;

      try {
        if (isJson) {
          const errorData = await response.json();
          console.debug('Parsed error JSON:', errorData);

          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.non_field_errors) {
            errorMessage = errorData.non_field_errors.join(', ');
          } else {
            // Create a readable error message from all fields
            errorMessage = '';
            Object.entries(errorData).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                errorMessage += `${key}: ${value.join(', ')}\n`;
              } else {
                errorMessage += `${key}: ${value}\n`;
              }
            });
          }
        } else {
          const text = await response.text();
          if (text) {
            errorMessage = text;
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
    const headers = await this.getHeaders(requiresAuth);
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'GET',
      headers,
    });

    return this.handleResponse(response);
  }

  /**
   * Makes a POST request to the API
   * @param {string} endpoint - The API endpoint
   * @param {Object} data - The request data
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<any>} The response data
   */
  async post(endpoint, data, requiresAuth = true) {
    const headers = await this.getHeaders(requiresAuth);

    console.debug(`POST request to: ${this.baseUrl}/${endpoint}`);
    console.debug('Headers:', headers);
    console.debug('Body:', JSON.stringify(data));

    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      console.debug('Response status:', response.status);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Network error during POST request:', error);
      throw error;
    }
  }

  /**
   * Makes a PUT request to the API
   * @param {string} endpoint - The API endpoint
   * @param {Object} data - The request data
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<any>} The response data
   */
  async put(endpoint, data, requiresAuth = true) {
    const headers = await this.getHeaders(requiresAuth);

    console.debug(`PUT request to: ${this.baseUrl}/${endpoint}`);
    console.debug('Headers:', headers);
    console.debug('Body:', JSON.stringify(data));

    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      console.debug('Response status:', response.status);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Network error during PUT request:', error);
      throw error;
    }
  }

  /**
   * Makes a PATCH request to the API
   * @param {string} endpoint - The API endpoint
   * @param {Object} data - The request data
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<any>} The response data
   */
  async patch(endpoint, data, requiresAuth = true) {
    const headers = await this.getHeaders(requiresAuth);

    console.debug(`PATCH request to: ${this.baseUrl}/${endpoint}`);
    console.debug('Headers:', headers);
    console.debug('Body:', JSON.stringify(data));

    try {
      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });

      console.debug('Response status:', response.status);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Network error during PATCH request:', error);
      throw error;
    }
  }

  /**
   * Makes a DELETE request to the API
   * @param {string} endpoint - The API endpoint
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<any>} The response data
   */
  async delete(endpoint, requiresAuth = true) {
    const headers = await this.getHeaders(requiresAuth);
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return this.handleResponse(response);
  }

  /**
   * Uploads a file to the API
   * @param {string} endpoint - The API endpoint
   * @param {File} file - The file to upload
   * @param {string} fieldName - The name of the file field
   * @param {Object} additionalFields - Additional form fields
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @param {string} method - The HTTP method to use (POST, PUT, PATCH)
   * @returns {Promise<any>} The response data
   */
  async uploadFile(
    endpoint,
    file,
    fieldName,
    additionalFields = {},
    requiresAuth = true,
    method = 'POST'
  ) {
    // Get authorization header if needed
    const token = requiresAuth ? this.getToken() : null;

    // Create form data
    const formData = new FormData();
    formData.append(fieldName, file);

    // Add additional fields
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Set headers (don't set Content-Type, let the browser set it with the boundary)
    const headers = {};
    if (token) {
      // For this specific application, we know we're using Token authentication
      // with the Django REST framework, so we'll always use the Token prefix
      headers['Authorization'] = `Token ${token}`;
      console.debug('Authorization header:', headers['Authorization']);
    } else {
      console.warn('No token found for file upload authentication');

      // If no token is found, try to use the default token from AppConfig
      if (typeof AppConfig !== 'undefined' && AppConfig.defaultToken) {
        const defaultToken = AppConfig.defaultToken;
        headers['Authorization'] = `Token ${defaultToken}`;
        console.debug('Using default token for Authorization header:', headers['Authorization']);

        // Also save it to localStorage for future requests
        this.setToken(defaultToken);
      }
    }

    // Make request
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method,
      headers,
      body: formData,
    });

    return this.handleResponse(response);
  }
}

export default ApiService;
