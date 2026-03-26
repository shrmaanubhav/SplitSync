// Logging Service
// Simplified implementation to avoid dependency issues

// Define log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Mock logging service
// In a real app, you would use a proper logging library

export const loggingService = {
  // Log info message
  info(message: string, data?: any): void {
    console.log('[INFO]', message, data);
  },

  // Log warning message
  warn(message: string, data?: any): void {
    console.warn('[WARN]', message, data);
  },

  // Log error message
  error(message: string, error?: any): void {
    console.error('[ERROR]', message, error);
  },

  // Log debug message
  debug(message: string, data?: any): void {
    console.debug('[DEBUG]', message, data);
  },
};

export default loggingService;
