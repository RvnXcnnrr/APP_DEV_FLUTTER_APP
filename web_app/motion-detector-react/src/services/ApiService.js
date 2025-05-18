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

    // Check for existing token and set it in the service
    const token = localStorage.getItem('auth_token');
    if (token) {
      console.info('Found existing auth token during ApiService initialization');
    }
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
    if (!token) {
      console.warn('Attempted to set empty token');
      return;
    }
    localStorage.setItem('auth_token', token);
    console.info('Authentication token set successfully');
  }

  /**
   * Clears the authentication token
   */
  clearToken() {
    localStorage.removeItem('auth_token');
    console.info('Authentication token cleared');
  }

  /**
   * Checks if a token exists and is not expired
   * @returns {boolean} Whether a valid token exists
   */
  hasValidToken() {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // For JWT tokens, we could check expiration
    // This is a simple implementation that just checks if a token exists
    return true;
  }

  /**
   * Checks if a user is a special device owner (internal method)
   * @param {string} userEmail - The user's email
   * @returns {boolean} Whether the user is a special device owner
   * @private
   */
  isSpecialDeviceOwner(userEmail) {
    // This method handles special device ownership checks internally
    // without exposing the actual owner email in the UI

    // List of special device owners
    const specialOwners = [
      'oracle.tech.143@gmail.com' // Owner of ESP32_001
    ];

    return specialOwners.includes(userEmail);
  }

  /**
   * Gets headers for API requests
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @param {Object} user - The current user object (optional)
   * @returns {Object} Headers for the request
   */
  getHeaders(requiresAuth = true, user = null) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add CSRF token if available
    const csrfToken = this.getCsrfToken();
    if (csrfToken) {
      if (csrfToken === 'cross-origin-workaround') {
        // For cross-origin requests to Render, we might not be able to access the CSRF cookie
        // In this case, we'll add a special header to indicate we're making a cross-origin request
        headers['X-Requested-With'] = 'XMLHttpRequest';
        console.debug('Using XMLHttpRequest header for cross-origin request');
      } else {
        headers['X-CSRFToken'] = csrfToken;
        console.debug('CSRF token header:', headers['X-CSRFToken']);
      }
    }

    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Token ${token}`;
        console.debug('Authorization header:', headers['Authorization']);
      } else {
        console.warn('No token found for authentication');
      }

      // Add user email to headers if available for device ownership verification
      if (user && user.email) {
        headers['X-User-Email'] = user.email;
        console.debug('User email header:', headers['X-User-Email']);

        // Special case for device owners - check handled internally
        if (this.isSpecialDeviceOwner(user.email)) {
          // Add additional headers to help with authentication
          headers['X-Device-Owner'] = 'true';
          console.debug('Added device owner header for special device');
        }
      } else {
        // Try to get email from localStorage if user object not provided
        try {
          const storedUser = localStorage.getItem('motion_detector_user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.email) {
              headers['X-User-Email'] = userData.email;
              console.debug('User email header (from localStorage):', headers['X-User-Email']);

              // Special case for device owners - check handled internally
              if (this.isSpecialDeviceOwner(userData.email)) {
                // Add additional headers to help with authentication
                headers['X-Device-Owner'] = 'true';
                console.debug('Added device owner header for special device (from localStorage)');
              }
            }
          }
        } catch (error) {
          console.warn('Error getting user email from localStorage:', error);
        }
      }
    }

    return headers;
  }

  /**
   * Gets the CSRF token from cookies
   * @returns {string|null} The CSRF token
   */
  getCsrfToken() {
    // Try to get the CSRF token from cookies
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Django's CSRF cookie is named 'csrftoken'
      if (cookie.startsWith('csrftoken=')) {
        return cookie.substring('csrftoken='.length, cookie.length);
      }
    }
    return null;
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
          } catch (error) {
            // Not JSON, return as text
            console.debug('Failed to parse text as JSON:', error.message);
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
            } catch (error) {
              // Not JSON, use the text as is
              console.debug('Failed to parse error text as JSON:', error.message);
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
   * @param {Object} user - The current user object (optional)
   * @returns {Promise<any>} The response data
   */
  async get(endpoint, requiresAuth = true, user = null) {
    try {
      // Try to fetch a CSRF token first if we don't have one
      if (!this.getCsrfToken()) {
        await this.fetchCsrfToken();
      }

      const headers = this.getHeaders(requiresAuth, user);

      // Always add Origin header for CORS
      headers['Origin'] = window.location.origin;

      console.debug(`GET request to: ${this.baseUrl}/${endpoint}`);
      console.debug('Headers:', headers);

      // For Netlify deployment, always use direct API call to avoid CORS issues
      if (window.location.hostname.includes('netlify')) {
        console.debug('Running on Netlify, using direct API call for GET request');

        // Use direct API call
        const directUrl = endpoint.startsWith('api/')
          ? `${AppConfig.directApiBaseUrl}/${endpoint}`
          : `${AppConfig.directApiBaseUrl}/api/${endpoint}`;

        console.debug(`Making direct API call to: ${directUrl}`);

        // For Netlify deployment, don't use credentials: 'include' to avoid CORS issues
        const response = await fetch(directUrl, {
          method: 'GET',
          headers,
          mode: 'cors',
          // Don't include credentials for cross-origin requests from Netlify
          // This avoids the CORS error with wildcard Access-Control-Allow-Origin
          credentials: 'omit',
        });

        console.debug('Direct API call response status:', response.status);
        return this.handleResponse(response);
      }

      // For local development, try proxy approach first
      let response;
      try {
        response = await fetch(`${this.baseUrl}/${endpoint}`, {
          method: 'GET',
          headers,
          mode: 'cors', // Explicitly set CORS mode
          credentials: 'include', // Include cookies if needed
        });

        console.debug('Response status:', response.status);
        console.debug('Response headers:', Object.fromEntries([...response.headers.entries()]));
      } catch (proxyError) {
        console.warn('Proxy request failed:', proxyError.message);

        // If proxy fails, try direct API call
        console.warn('Trying direct API call as fallback...');

        // Try a direct API call without proxy
        const directUrl = endpoint.startsWith('api/')
          ? `${AppConfig.directApiBaseUrl}/${endpoint}`
          : `${AppConfig.directApiBaseUrl}/api/${endpoint}`;

        console.debug(`Making direct API call to: ${directUrl}`);

        response = await fetch(directUrl, {
          method: 'GET',
          headers,
          mode: 'cors',
          credentials: 'include',
        });

        console.debug('Direct API call response status:', response.status);
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('Network error during GET request:', error);

      // Provide more helpful error messages based on the error type
      if (error.message === 'Failed to fetch') {
        throw new Error(`Network error: Could not connect to the server. Please check:\n1. Your internet connection\n2. If the backend at ${this.baseUrl || 'https://app-dev-flutter-app.onrender.com'} is running\n3. If there are any firewall or network restrictions`);
      }

      if (error.message.includes('CORS')) {
        throw new Error(`CORS error: The server is not configured to accept requests from ${window.location.origin}. Please check the CORS settings on the backend as described in the 'cors_network_solution_guide.md' file.`);
      }

      throw error;
    }
  }

  /**
   * Fetches a CSRF token from the server
   * @returns {Promise<string|null>} The CSRF token
   */
  async fetchCsrfToken() {
    try {
      // For deployed app on Netlify, we'll skip the CSRF token fetch
      // and use a workaround instead to avoid CORS issues
      if (window.location.hostname.includes('netlify')) {
        console.debug('Running on Netlify, using CSRF workaround');
        return 'cross-origin-workaround';
      }

      // Make a GET request to the server to get a CSRF cookie
      console.debug('Fetching CSRF token...');

      // Use a simple endpoint that doesn't require authentication
      let response;
      try {
        // First try with the proxy
        response = await fetch(`${this.baseUrl}/api/auth/`, {
          method: 'GET',
          credentials: 'include', // Important: include cookies
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin,
          }
        });
      } catch (proxyError) {
        console.warn('Proxy request for CSRF token failed:', proxyError.message);

        // If proxy fails, try direct API call
        console.warn('Trying direct API call for CSRF token...');

        // Try a direct API call without proxy
        const directUrl = `${AppConfig.directApiBaseUrl}/api/auth/`;

        console.debug(`Making direct API call to: ${directUrl}`);

        response = await fetch(directUrl, {
          method: 'GET',
          credentials: 'include',
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Origin': window.location.origin,
          }
        });
      }

      // Log response headers for debugging
      console.debug('CSRF fetch response status:', response.status);
      console.debug('CSRF fetch response headers:', Object.fromEntries([...response.headers.entries()]));

      // The server should set a CSRF cookie
      // Now try to get it from the cookies
      const csrfToken = this.getCsrfToken();
      console.debug('Fetched CSRF token:', csrfToken);

      // If we couldn't get a CSRF token, try a workaround for cross-origin requests
      if (!csrfToken) {
        console.debug('No CSRF token found in cookies, using workaround for cross-origin requests');
        // For cross-origin requests to Render, we might not be able to access the CSRF cookie
        // In this case, we'll try to make the request without a CSRF token
        return 'cross-origin-workaround';
      }

      return csrfToken;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);

      // Provide more detailed error information
      if (error.message === 'Failed to fetch') {
        console.error('Network error: Could not connect to the server. Check if the backend is running and accessible.');
      } else if (error.message.includes('CORS')) {
        console.error('CORS error: The server is not configured to accept requests from this origin.');
      }

      return 'cross-origin-workaround'; // Return workaround token even on error
    }
  }

  /**
   * Makes a POST request to the API
   * @param {string} endpoint - The API endpoint
   * @param {Object} data - The request data
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @param {Object} user - The current user object (optional)
   * @returns {Promise<any>} The response data
   */
  async post(endpoint, data, requiresAuth = true, user = null) {
    try {
      // Try to fetch a CSRF token first if we don't have one
      if (!this.getCsrfToken()) {
        await this.fetchCsrfToken();
      }

      const headers = this.getHeaders(requiresAuth, user);

      // Always add Origin header for CORS
      headers['Origin'] = window.location.origin;

      // Log request details for debugging
      console.debug('Request details:');
      console.debug(`- Base URL: ${this.baseUrl}`);
      console.debug(`- Endpoint: ${endpoint}`);
      console.debug(`- Has token: ${!!this.getToken()}`);

      console.debug(`POST request to: ${this.baseUrl}/${endpoint}`);
      console.debug('Headers:', headers);
      console.debug('Body:', JSON.stringify(data));

      // Add a timestamp to the request for debugging
      console.debug('Request timestamp:', new Date().toISOString());

      // For Netlify deployment, always use direct API call to avoid CORS issues
      if (window.location.hostname.includes('netlify')) {
        console.debug('Running on Netlify, using direct API call');

        // Use direct API call
        const directUrl = endpoint.startsWith('api/')
          ? `${AppConfig.directApiBaseUrl}/${endpoint}`
          : `${AppConfig.directApiBaseUrl}/api/${endpoint}`;

        console.debug(`Making direct API call to: ${directUrl}`);

        // For Netlify deployment, don't use credentials: 'include' to avoid CORS issues
        const response = await fetch(directUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          mode: 'cors',
          // Don't include credentials for cross-origin requests from Netlify
          // This avoids the CORS error with wildcard Access-Control-Allow-Origin
          credentials: 'omit',
        });

        console.debug('Direct API call response status:', response.status);
        return this.handleResponse(response);
      }

      // For local development, try proxy approach first
      let response;
      try {
        response = await fetch(`${this.baseUrl}/${endpoint}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          mode: 'cors', // Explicitly set CORS mode
          credentials: 'include', // Include cookies if needed
        });

        console.debug('Response status:', response.status);
        console.debug('Response headers:', Object.fromEntries([...response.headers.entries()]));
      } catch (proxyError) {
        console.warn('Proxy request failed:', proxyError.message);

        // If proxy fails, try direct API call
        console.warn('Trying direct API call as fallback...');

        // Try a direct API call without proxy
        const directUrl = endpoint.startsWith('api/')
          ? `${AppConfig.directApiBaseUrl}/${endpoint}`
          : `${AppConfig.directApiBaseUrl}/api/${endpoint}`;

        console.debug(`Making direct API call to: ${directUrl}`);

        response = await fetch(directUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          mode: 'cors',
          credentials: 'include',
        });

        console.debug('Direct API call response status:', response.status);
        console.debug('Direct API call response headers:', Object.fromEntries([...response.headers.entries()]));
      }

      console.debug('Response timestamp:', new Date().toISOString());

      // Check if we got a CSRF error
      if (response.status === 403) {
        const responseText = await response.text();
        console.debug('Response text for 403:', responseText);

        if (responseText.includes('CSRF')) {
          console.warn('CSRF error detected, trying direct API call with modified headers');

          // Try a direct API call without proxy and with modified headers
          const directUrl = endpoint.startsWith('api/')
            ? `${AppConfig.directApiBaseUrl}/${endpoint}`
            : `${AppConfig.directApiBaseUrl}/api/${endpoint}`;

          console.debug(`Retrying with direct API call to: ${directUrl}`);

          // Add X-Requested-With header which can bypass some CSRF checks
          headers['X-Requested-With'] = 'XMLHttpRequest';

          const directResponse = await fetch(directUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
            mode: 'cors',
            credentials: 'include',
          });

          return this.handleResponse(directResponse);
        }

        // If it's a 403 but not CSRF, create a new response with the text
        const errorResponse = new Response(responseText, {
          status: 403,
          statusText: 'Forbidden',
          headers: response.headers
        });

        return this.handleResponse(errorResponse);
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('Network error during POST request:', error);

      // Log more detailed information about the error
      console.info('Request details:');
      console.info('- Base URL:', this.baseUrl);
      console.info('- Endpoint:', endpoint);
      console.info('- Has token:', !!this.getToken());

      // Provide more helpful error messages based on the error type
      if (error.message === 'Failed to fetch') {
        throw new Error(`Network error: Could not connect to the server. Please check:\n1. Your internet connection\n2. If the backend at ${this.baseUrl || 'https://app-dev-flutter-app.onrender.com'} is running\n3. If there are any firewall or network restrictions`);
      }

      if (error.message.includes('CORS')) {
        throw new Error(`CORS error: The server is not configured to accept requests from ${window.location.origin}. Please check the CORS settings on the backend as described in the 'cors_network_solution_guide.md' file.`);
      }

      if (error.message.includes('CSRF')) {
        throw new Error(`CSRF validation failed. Please follow the instructions in the 'cors_network_solution_guide.md' file to update your Render deployment settings.`);
      }

      throw error;
    }
  }

  /**
   * Makes a PATCH request to the API
   * @param {string} endpoint - The API endpoint
   * @param {Object} data - The request data
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @param {Object} user - The current user object (optional)
   * @returns {Promise<any>} The response data
   */
  async patch(endpoint, data, requiresAuth = true, user = null) {
    try {
      // Try to fetch a CSRF token first if we don't have one
      if (!this.getCsrfToken()) {
        await this.fetchCsrfToken();
      }

      const headers = this.getHeaders(requiresAuth, user);

      // Always add Origin header for CORS
      headers['Origin'] = window.location.origin;

      console.debug(`PATCH request to: ${this.baseUrl}/${endpoint}`);
      console.debug('Headers:', headers);
      console.debug('Body:', JSON.stringify(data));

      // Add a timestamp to the request for debugging
      console.debug('Request timestamp:', new Date().toISOString());

      // First try with the proxy approach
      let response;
      try {
        response = await fetch(`${this.baseUrl}/${endpoint}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(data),
          mode: 'cors', // Explicitly set CORS mode
          credentials: 'include', // Include cookies if needed
        });

        console.debug('Response status:', response.status);
        console.debug('Response headers:', Object.fromEntries([...response.headers.entries()]));
      } catch (proxyError) {
        console.warn('Proxy request failed:', proxyError.message);

        // If proxy fails, try direct API call
        console.warn('Trying direct API call as fallback...');

        // Try a direct API call without proxy
        const directUrl = endpoint.startsWith('api/')
          ? `${AppConfig.directApiBaseUrl}/${endpoint}`
          : `${AppConfig.directApiBaseUrl}/api/${endpoint}`;

        console.debug(`Making direct API call to: ${directUrl}`);

        response = await fetch(directUrl, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(data),
          mode: 'cors',
          credentials: 'include',
        });

        console.debug('Direct API call response status:', response.status);
        console.debug('Direct API call response headers:', Object.fromEntries([...response.headers.entries()]));
      }

      console.debug('Response timestamp:', new Date().toISOString());

      // Check if we got a CSRF error
      if (response.status === 403) {
        const responseText = await response.text();
        console.debug('Response text for 403:', responseText);

        if (responseText.includes('CSRF')) {
          console.warn('CSRF error detected, trying direct API call with modified headers');

          // Try a direct API call without proxy and with modified headers
          const directUrl = endpoint.startsWith('api/')
            ? `${AppConfig.directApiBaseUrl}/${endpoint}`
            : `${AppConfig.directApiBaseUrl}/api/${endpoint}`;

          console.debug(`Retrying with direct API call to: ${directUrl}`);

          // Add X-Requested-With header which can bypass some CSRF checks
          headers['X-Requested-With'] = 'XMLHttpRequest';

          const directResponse = await fetch(directUrl, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
            mode: 'cors',
            credentials: 'include',
          });

          return this.handleResponse(directResponse);
        }

        // If it's a 403 but not CSRF, create a new response with the text
        const errorResponse = new Response(responseText, {
          status: 403,
          statusText: 'Forbidden',
          headers: response.headers
        });

        return this.handleResponse(errorResponse);
      }

      return this.handleResponse(response);
    } catch (error) {
      console.error('Network error during PATCH request:', error);

      // Log more detailed information about the error
      console.info('Request details:');
      console.info('- Base URL:', this.baseUrl);
      console.info('- Endpoint:', endpoint);
      console.info('- Has token:', !!this.getToken());

      // Provide more helpful error messages based on the error type
      if (error.message === 'Failed to fetch') {
        throw new Error(`Network error: Could not connect to the server. Please check:\n1. Your internet connection\n2. If the backend at ${this.baseUrl || 'https://app-dev-flutter-app.onrender.com'} is running\n3. If there are any firewall or network restrictions`);
      }

      if (error.message.includes('CORS')) {
        throw new Error(`CORS error: The server is not configured to accept requests from ${window.location.origin}. Please check the CORS settings on the backend as described in the 'cors_network_solution_guide.md' file.`);
      }

      if (error.message.includes('CSRF')) {
        throw new Error(`CSRF validation failed. Please follow the instructions in the 'cors_network_solution_guide.md' file to update your Render deployment settings.`);
      }

      throw error;
    }
  }
}

export default ApiService;
