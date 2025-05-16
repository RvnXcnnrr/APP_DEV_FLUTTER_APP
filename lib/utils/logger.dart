import 'package:flutter/foundation.dart';

/// Log levels
enum LogLevel {
  debug,
  info,
  warning,
  error,
}

/// A simple logger utility for the application
class Logger {
  /// The current log level
  static LogLevel _level = kDebugMode ? LogLevel.debug : LogLevel.info;

  /// Set the log level
  static void setLevel(LogLevel level) {
    _level = level;
  }

  /// Log a debug message
  static void debug(String message) {
    if (_level.index <= LogLevel.debug.index) {
      _log('DEBUG', message);
    }
  }

  /// Log an info message
  static void info(String message) {
    if (_level.index <= LogLevel.info.index) {
      _log('INFO', message);
    }
  }

  /// Log a warning message
  static void warning(String message) {
    if (_level.index <= LogLevel.warning.index) {
      _log('WARNING', message);
    }
  }

  /// Log an error message
  static void error(String message, [Object? error, StackTrace? stackTrace]) {
    if (_level.index <= LogLevel.error.index) {
      _log('ERROR', message);
      if (error != null) {
        _log('ERROR', 'Error details: $error');
      }
      if (stackTrace != null) {
        _log('ERROR', 'Stack trace: $stackTrace');
      }
    }
  }

  /// Internal logging method
  static void _log(String level, String message) {
    if (kDebugMode) {
      debugPrint('[$level] $message');
    }
  }
}
