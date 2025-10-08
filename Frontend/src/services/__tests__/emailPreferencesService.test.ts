/**
 * Tests for Email Preferences Service - Simple YES/NO toggle functionality
 */

import { emailPreferencesService } from '../emailPreferencesService';

// Mock fetch globally
global.fetch = jest.fn();

describe('EmailPreferencesService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEmailPreference', () => {
    it('should fetch email preference successfully', async () => {
      const mockResponse = {
        email_notifications_enabled: true
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await emailPreferencesService.getEmailPreference();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/email-preferences/',
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle fetch error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ detail: 'Server error' }),
      });

      await expect(emailPreferencesService.getEmailPreference()).rejects.toThrow(
        'Server error'
      );
    });

    it('should handle network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(emailPreferencesService.getEmailPreference()).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('updateEmailPreference', () => {
    it('should update email preference successfully', async () => {
      const mockResponse = {
        email_notifications_enabled: false
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await emailPreferencesService.updateEmailPreference(false);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/email-preferences/',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email_notifications_enabled: false }),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle update error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ detail: 'Invalid request' }),
      });

      await expect(emailPreferencesService.updateEmailPreference(true)).rejects.toThrow(
        'Invalid request'
      );
    });

    it('should handle update with enabled preference', async () => {
      const mockResponse = {
        email_notifications_enabled: true
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await emailPreferencesService.updateEmailPreference(true);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/email-preferences/',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email_notifications_enabled: true }),
        }
      );
      expect(result.email_notifications_enabled).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(emailPreferencesService.getEmailPreference()).rejects.toThrow(
        'HTTP 500: Internal Server Error'
      );
    });

    it('should use default error message when detail is not provided', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}),
      });

      await expect(emailPreferencesService.getEmailPreference()).rejects.toThrow(
        'HTTP 404: Not Found'
      );
    });
  });
});