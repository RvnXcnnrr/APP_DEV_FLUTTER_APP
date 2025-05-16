import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:appdev_md/utils/logger.dart';

/// Service for handling API requests
class ApiService {
  /// Base URL for the API
  final String baseUrl;

  /// Secure storage for storing tokens
  final FlutterSecureStorage _secureStorage = const FlutterSecureStorage();

  /// Creates a new API service
  ApiService({required this.baseUrl});

  /// Gets the authentication token
  Future<String?> getToken() async {
    return await _secureStorage.read(key: 'auth_token');
  }

  /// Sets the authentication token
  Future<void> setToken(String token) async {
    await _secureStorage.write(key: 'auth_token', value: token);
  }

  /// Clears the authentication token
  Future<void> clearToken() async {
    await _secureStorage.delete(key: 'auth_token');
  }

  /// Creates headers for API requests
  Future<Map<String, String>> _getHeaders({bool requiresAuth = true}) async {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (requiresAuth) {
      final token = await getToken();
      if (token != null) {
        // Support both Token and JWT authentication formats
        if (token.startsWith('eyJ')) {
          // This looks like a JWT token
          headers['Authorization'] = 'Bearer $token';
        } else {
          // Default to Token authentication
          headers['Authorization'] = 'Token $token';
        }
        // Log the authorization header for debugging
        Logger.debug('Authorization header: ${headers['Authorization']}');
      }
    }

    return headers;
  }

  /// Makes a GET request to the API
  Future<dynamic> get(String endpoint, {bool requiresAuth = true}) async {
    final headers = await _getHeaders(requiresAuth: requiresAuth);
    final response = await http.get(
      Uri.parse('$baseUrl/$endpoint'),
      headers: headers,
    );

    return _handleResponse(response);
  }

  /// Makes a POST request to the API
  Future<dynamic> post(String endpoint, dynamic data, {bool requiresAuth = true}) async {
    final headers = await _getHeaders(requiresAuth: requiresAuth);

    // Log request details for debugging
    Logger.debug('POST request to: $baseUrl/$endpoint');
    Logger.debug('Headers: $headers');
    Logger.debug('Body: ${json.encode(data)}');

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/$endpoint'),
        headers: headers,
        body: json.encode(data),
      );

      // Log response status
      Logger.debug('Response status code: ${response.statusCode}');
      Logger.debug('Response headers: ${response.headers}');

      return _handleResponse(response);
    } catch (e) {
      // Log network errors
      Logger.error('Network error during POST request', e);
      rethrow;
    }
  }

  /// Makes a PUT request to the API
  Future<dynamic> put(String endpoint, dynamic data, {bool requiresAuth = true}) async {
    final headers = await _getHeaders(requiresAuth: requiresAuth);
    final response = await http.put(
      Uri.parse('$baseUrl/$endpoint'),
      headers: headers,
      body: json.encode(data),
    );

    return _handleResponse(response);
  }

  /// Makes a PATCH request to the API
  Future<dynamic> patch(String endpoint, dynamic data, {bool requiresAuth = true}) async {
    final headers = await _getHeaders(requiresAuth: requiresAuth);
    final response = await http.patch(
      Uri.parse('$baseUrl/$endpoint'),
      headers: headers,
      body: json.encode(data),
    );

    return _handleResponse(response);
  }

  /// Makes a DELETE request to the API
  Future<dynamic> delete(String endpoint, {bool requiresAuth = true}) async {
    final headers = await _getHeaders(requiresAuth: requiresAuth);
    final response = await http.delete(
      Uri.parse('$baseUrl/$endpoint'),
      headers: headers,
    );

    return _handleResponse(response);
  }

  /// Uploads a file to the API
  Future<dynamic> uploadFile(String endpoint, File file, String fieldName, {Map<String, String>? additionalFields, bool requiresAuth = true}) async {
    final headers = await _getHeaders(requiresAuth: requiresAuth);
    // Remove content-type header as it will be set by the multipart request
    headers.remove('Content-Type');

    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/$endpoint'),
    );

    request.headers.addAll(headers);
    request.files.add(await http.MultipartFile.fromPath(fieldName, file.path));

    if (additionalFields != null) {
      request.fields.addAll(additionalFields);
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);

    return _handleResponse(response);
  }

  /// Handles the response from the API
  dynamic _handleResponse(http.Response response) {
    // Log the raw response for debugging
    Logger.debug('Response body: ${response.body}');

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) {
        Logger.debug('Empty response body with status code: ${response.statusCode}');
        return null;
      }
      try {
        final decodedResponse = json.decode(response.body);
        Logger.debug('Decoded response: $decodedResponse');
        return decodedResponse;
      } catch (e) {
        Logger.error('Error decoding JSON response', e);
        Logger.debug('Response body: ${response.body}');
        throw ApiException(
          statusCode: response.statusCode,
          message: 'Invalid response format: ${response.body}',
        );
      }
    } else {
      Logger.warning('Error response with status code: ${response.statusCode}');

      String errorMessage = response.body;
      try {
        // Try to parse error message from JSON
        final errorJson = json.decode(response.body);
        Logger.debug('Parsed error JSON: $errorJson');

        if (errorJson is Map) {
          // Handle different error formats
          if (errorJson.containsKey('detail')) {
            errorMessage = errorJson['detail'];
          } else if (errorJson.containsKey('non_field_errors')) {
            errorMessage = errorJson['non_field_errors'].join(', ');
          } else {
            // Create a readable error message from all fields
            errorMessage = '';
            errorJson.forEach((key, value) {
              if (value is List) {
                errorMessage += '$key: ${value.join(', ')}\n';
              } else {
                errorMessage += '$key: $value\n';
              }
            });
          }
        }
      } catch (e) {
        // If JSON parsing fails, use the raw response body
        Logger.error('Error parsing error response', e);
      }

      Logger.debug('Final error message: $errorMessage');

      throw ApiException(
        statusCode: response.statusCode,
        message: errorMessage,
      );
    }
  }
}

/// Exception thrown when an API request fails
class ApiException implements Exception {
  /// HTTP status code
  final int statusCode;

  /// Error message
  final String message;

  /// Creates a new API exception
  ApiException({required this.statusCode, required this.message});

  @override
  String toString() {
    return 'ApiException: $statusCode - $message';
  }
}
