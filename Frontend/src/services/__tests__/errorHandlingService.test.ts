import { describe, it, expect } from 'vitest';
import { ErrorHandlingService, handleApiError, isRetryableError, getErrorMessage } from '../errorHandlingService';

describe('ErrorHandlingService', () => {
  const service = ErrorHandlingService.getInstance();

  describe('parseError', () => {
    it('parses network errors correctly', () => {
      const networkError = { message: 'Network Error' };
      const result = service.parseError(networkError);

      expect(result.type).toBe('network');
      expect(result.retryable).toBe(true);
      expect(result.userMessage).toContain('Unable to connect');
    });

    it('parses timeout errors correctly', () => {
      const timeoutError = { code: 'ECONNABORTED', message: 'timeout of 5000ms exceeded' };
      const result = service.parseError(timeoutError);

      expect(result.type).toBe('network');
      expect(result.retryable).toBe(true);
      expect(result.userMessage).toContain('took too long');
    });

    it('parses 401 authentication errors correctly', () => {
      const authError = {
        response: {
          status: 401,
          data: { message: 'Token expired' }
        }
      };
      const result = service.parseError(authError);

      expect(result.type).toBe('auth');
      expect(result.statusCode).toBe(401);
      expect(result.retryable).toBe(false);
      expect(result.userMessage).toContain('session has expired');
    });

    it('parses 403 permission errors correctly', () => {
      const permissionError = {
        response: {
          status: 403,
          data: { message: 'Access denied' }
        }
      };
      const result = service.parseError(permissionError);

      expect(result.type).toBe('permission');
      expect(result.statusCode).toBe(403);
      expect(result.retryable).toBe(false);
      expect(result.userMessage).toContain('don\'t have permission');
    });

    it('parses 404 not found errors correctly', () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: 'Resource not found' }
        }
      };
      const result = service.parseError(notFoundError);

      expect(result.type).toBe('not-found');
      expect(result.statusCode).toBe(404);
      expect(result.retryable).toBe(false);
      expect(result.userMessage).toContain('could not be found');
    });

    it('parses 429 rate limit errors correctly', () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { message: 'Rate limit exceeded' },
          headers: { 'retry-after': '60' }
        }
      };
      const result = service.parseError(rateLimitError);

      expect(result.type).toBe('rate-limit');
      expect(result.statusCode).toBe(429);
      expect(result.retryable).toBe(true);
      expect(result.userMessage).toContain('Too many requests');
      expect(result.details?.retryAfter).toBe('60');
    });

    it('parses 400 validation errors correctly', () => {
      const validationError = {
        response: {
          status: 400,
          data: { message: 'Invalid input data' }
        }
      };
      const result = service.parseError(validationError);

      expect(result.type).toBe('validation');
      expect(result.statusCode).toBe(400);
      expect(result.retryable).toBe(false);
      expect(result.userMessage).toContain('Invalid input data');
    });

    it('parses 500 server errors correctly', () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };
      const result = service.parseError(serverError);

      expect(result.type).toBe('server');
      expect(result.statusCode).toBe(500);
      expect(result.retryable).toBe(true);
      expect(result.userMessage).toContain('technical difficulties');
    });
  });

  describe('getUserMessage', () => {
    it('returns context-specific messages for analytics', () => {
      const authError = service.parseError({
        response: { status: 401, data: { message: 'Token expired' } }
      });

      const message = service.getUserMessage(authError, 'analytics');
      expect(message).toContain('reconnect your social media accounts');
    });

    it('returns context-specific messages for content linking', () => {
      const notFoundError = service.parseError({
        response: { status: 404, data: { message: 'Content not found' } }
      });

      const message = service.getUserMessage(notFoundError, 'content-linking');
      expect(message).toContain('Content not found or may have been deleted');
    });

    it('falls back to default message when no context match', () => {
      const genericError = service.parseError({
        response: { status: 500, data: { message: 'Server error' } }
      });

      const message = service.getUserMessage(genericError, 'unknown-context');
      expect(message).toBe(genericError.userMessage);
    });
  });

  describe('getSuggestedAction', () => {
    it('returns context-specific actions for auth errors', () => {
      const authError = service.parseError({
        response: { status: 401, data: { message: 'Token expired' } }
      });

      const action = service.getSuggestedAction(authError, 'analytics');
      expect(action).toContain('Settings → Social Accounts');
    });

    it('returns null when no specific action available', () => {
      const genericError = service.parseError({
        response: { status: 500, data: { message: 'Server error' } }
      });

      const action = service.getSuggestedAction(genericError, 'unknown-context');
      expect(action).toBe(genericError.suggestedAction);
    });
  });

  describe('shouldRetry', () => {
    it('returns false when max retries exceeded', () => {
      const retryableError = service.parseError({
        response: { status: 500, data: { message: 'Server error' } }
      });

      const shouldRetry = service.shouldRetry(retryableError, 3, 3);
      expect(shouldRetry).toBe(false);
    });

    it('returns false for non-retryable errors', () => {
      const authError = service.parseError({
        response: { status: 401, data: { message: 'Token expired' } }
      });

      const shouldRetry = service.shouldRetry(authError, 0, 3);
      expect(shouldRetry).toBe(false);
    });

    it('returns true for retryable errors within limit', () => {
      const serverError = service.parseError({
        response: { status: 500, data: { message: 'Server error' } }
      });

      const shouldRetry = service.shouldRetry(serverError, 1, 3);
      expect(shouldRetry).toBe(true);
    });

    it('returns true for rate limit errors', () => {
      const rateLimitError = service.parseError({
        response: { status: 429, data: { message: 'Rate limit exceeded' } }
      });

      const shouldRetry = service.shouldRetry(rateLimitError, 1, 3);
      expect(shouldRetry).toBe(true);
    });
  });

  describe('getRetryDelay', () => {
    it('calculates exponential backoff correctly', () => {
      const delay1 = service.getRetryDelay(0, 1000);
      const delay2 = service.getRetryDelay(1, 1000);
      const delay3 = service.getRetryDelay(2, 1000);

      expect(delay1).toBe(1000);
      expect(delay2).toBe(2000);
      expect(delay3).toBe(4000);
    });

    it('caps delay at maximum value', () => {
      const delay = service.getRetryDelay(10, 1000, 5000);
      expect(delay).toBe(5000);
    });
  });

  describe('createErrorResponse', () => {
    it('creates complete error response', () => {
      const error = {
        response: { status: 401, data: { message: 'Token expired' } }
      };

      const response = service.createErrorResponse(error, 'analytics');

      expect(response.error.type).toBe('auth');
      expect(response.userMessage).toContain('reconnect your social media accounts');
      expect(response.suggestedAction).toContain('Settings → Social Accounts');
      expect(response.canRetry).toBe(false);
    });
  });
});

describe('Utility functions', () => {
  describe('handleApiError', () => {
    it('returns formatted error response', () => {
      const error = {
        response: { status: 500, data: { message: 'Server error' } }
      };

      const result = handleApiError(error, 'analytics');

      expect(result.error.type).toBe('server');
      expect(result.userMessage).toBeDefined();
      expect(result.canRetry).toBe(true);
    });
  });

  describe('isRetryableError', () => {
    it('returns true for retryable errors', () => {
      const serverError = {
        response: { status: 500, data: { message: 'Server error' } }
      };

      expect(isRetryableError(serverError)).toBe(true);
    });

    it('returns false for non-retryable errors', () => {
      const authError = {
        response: { status: 401, data: { message: 'Token expired' } }
      };

      expect(isRetryableError(authError)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('returns user-friendly error message', () => {
      const error = {
        response: { status: 401, data: { message: 'Token expired' } }
      };

      const message = getErrorMessage(error, 'analytics');
      expect(message).toContain('reconnect your social media accounts');
    });
  });
});