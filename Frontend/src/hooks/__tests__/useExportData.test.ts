import { renderHook, act, waitFor } from '@testing-library/react';
import { useExportData, useExportStatusPolling } from '../useExportData';
import { ExportConfig } from '@/components/analytics/export-configuration';

// Mock fetch
global.fetch = jest.fn();

// Mock environment variable
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8000'
  }
});

describe('useExportData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('createExport', () => {
    it('successfully creates an export', async () => {
      const mockResponse = {
        export_id: 'export-123',
        status: 'pending',
        message: 'Export created successfully'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const { result } = renderHook(() => useExportData());

      const exportConfig: ExportConfig = {
        format: 'csv',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        },
        metrics: ['reach', 'engagement_rate'],
        campaignIds: ['campaign-1']
      };

      let exportId: string;
      await act(async () => {
        exportId = await result.current.createExport(exportConfig);
      });

      expect(exportId!).toBe('export-123');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/exports/create',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            format: 'csv',
            dateRange: {
              start: '2024-01-01T00:00:00.000Z',
              end: '2024-01-31T00:00:00.000Z'
            },
            metrics: ['reach', 'engagement_rate'],
            campaignIds: ['campaign-1']
          })
        })
      );
    });

    it('handles API error during export creation', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ detail: 'Invalid request' })
      });

      const { result } = renderHook(() => useExportData());

      const exportConfig: ExportConfig = {
        format: 'csv',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        },
        metrics: ['reach'],
        campaignIds: []
      };

      await act(async () => {
        await expect(result.current.createExport(exportConfig)).rejects.toThrow('Invalid request');
      });

      expect(result.current.error).toBe('Invalid request');
    });

    it('handles network error during export creation', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useExportData());

      const exportConfig: ExportConfig = {
        format: 'pdf',
        dateRange: {
          start: new Date('2024-01-01'),
          end: new Date('2024-01-31')
        },
        metrics: ['roi'],
        campaignIds: []
      };

      await act(async () => {
        await expect(result.current.createExport(exportConfig)).rejects.toThrow('Network error');
      });

      expect(result.current.error).toBe('Network error');
    });
  });

  describe('getExportStatus', () => {
    it('successfully gets export status', async () => {
      const mockStatus = {
        id: 'export-123',
        status: 'completed',
        format: 'csv',
        created_at: '2024-01-15T10:30:00Z',
        completed_at: '2024-01-15T10:35:00Z',
        file_url: '/downloads/export-123.csv'
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus
      });

      const { result } = renderHook(() => useExportData());

      let status: any;
      await act(async () => {
        status = await result.current.getExportStatus('export-123');
      });

      expect(status).toEqual(mockStatus);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/exports/export-123/status',
        expect.objectContaining({
          headers: {}
        })
      );
    });

    it('returns null for 404 status', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const { result } = renderHook(() => useExportData());

      let status: any;
      await act(async () => {
        status = await result.current.getExportStatus('nonexistent-export');
      });

      expect(status).toBeNull();
    });

    it('handles API error when getting status', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'Internal server error' })
      });

      const { result } = renderHook(() => useExportData());

      await act(async () => {
        await expect(result.current.getExportStatus('export-123')).rejects.toThrow('Internal server error');
      });
    });
  });

  describe('getUserExports', () => {
    it('successfully gets user exports', async () => {
      const mockExports = {
        exports: [
          {
            id: 'export-1',
            status: 'completed',
            format: 'csv',
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: 'export-2',
            status: 'pending',
            format: 'pdf',
            created_at: '2024-01-16T10:30:00Z'
          }
        ],
        total: 2
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockExports
      });

      const { result } = renderHook(() => useExportData());

      let exports: any;
      await act(async () => {
        exports = await result.current.getUserExports();
      });

      expect(exports).toEqual(mockExports.exports);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/exports/user/exports',
        expect.objectContaining({
          headers: {}
        })
      );
    });
  });

  describe('deleteExport', () => {
    it('successfully deletes export', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Export deleted successfully' })
      });

      const { result } = renderHook(() => useExportData());

      await act(async () => {
        await result.current.deleteExport('export-123');
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/exports/export-123',
        expect.objectContaining({
          method: 'DELETE',
          headers: {}
        })
      );
    });

    it('handles error when deleting export', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Export not found' })
      });

      const { result } = renderHook(() => useExportData());

      await act(async () => {
        await expect(result.current.deleteExport('nonexistent-export')).rejects.toThrow('Export not found');
      });
    });
  });

  describe('downloadFile', () => {
    it('creates download link and triggers download', () => {
      // Mock DOM methods
      const mockLink = {
        href: '',
        download: '',
        target: '',
        click: jest.fn()
      };
      
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();

      const { result } = renderHook(() => useExportData());

      act(() => {
        result.current.downloadFile('/downloads/export-123.csv', 'my-export.csv');
      });

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.href).toBe('http://localhost:8000/downloads/export-123.csv');
      expect(mockLink.download).toBe('my-export.csv');
      expect(mockLink.target).toBe('_blank');
      expect(mockLink.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);

      // Cleanup
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });

  describe('loading and error states', () => {
    it('sets loading state during API calls', async () => {
      (fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ export_id: 'test' })
        }), 100))
      );

      const { result } = renderHook(() => useExportData());

      expect(result.current.isLoading).toBe(false);

      const exportConfig: ExportConfig = {
        format: 'csv',
        dateRange: { start: new Date(), end: new Date() },
        metrics: ['reach'],
        campaignIds: []
      };

      act(() => {
        result.current.createExport(exportConfig);
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('clears error on successful API call', async () => {
      const { result } = renderHook(() => useExportData());

      // First, cause an error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const exportConfig: ExportConfig = {
        format: 'csv',
        dateRange: { start: new Date(), end: new Date() },
        metrics: ['reach'],
        campaignIds: []
      };

      await act(async () => {
        try {
          await result.current.createExport(exportConfig);
        } catch (e) {
          // Expected error
        }
      });

      expect(result.current.error).toBe('Network error');

      // Then, make a successful call
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ export_id: 'test' })
      });

      await act(async () => {
        await result.current.createExport(exportConfig);
      });

      expect(result.current.error).toBeNull();
    });
  });
});

describe('useExportStatusPolling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('polls export status until completion', async () => {
    const mockGetExportStatus = jest.fn()
      .mockResolvedValueOnce({ id: 'export-123', status: 'pending' })
      .mockResolvedValueOnce({ id: 'export-123', status: 'processing' })
      .mockResolvedValueOnce({ id: 'export-123', status: 'completed' });

    // Mock the useExportData hook
    jest.doMock('../useExportData', () => ({
      useExportData: () => ({
        getExportStatus: mockGetExportStatus
      })
    }));

    const { result } = renderHook(() => useExportStatusPolling('export-123', 1000));

    act(() => {
      result.current.startPolling();
    });

    expect(result.current.isPolling).toBe(true);

    // First poll
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockGetExportStatus).toHaveBeenCalledWith('export-123');
    expect(result.current.status).toEqual({ id: 'export-123', status: 'pending' });

    // Advance timer and second poll
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.status).toEqual({ id: 'export-123', status: 'processing' });

    // Advance timer and third poll (should stop after completion)
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.status).toEqual({ id: 'export-123', status: 'completed' });
    expect(result.current.isPolling).toBe(false);
  });

  it('stops polling when stopPolling is called', async () => {
    const mockGetExportStatus = jest.fn()
      .mockResolvedValue({ id: 'export-123', status: 'processing' });

    jest.doMock('../useExportData', () => ({
      useExportData: () => ({
        getExportStatus: mockGetExportStatus
      })
    }));

    const { result } = renderHook(() => useExportStatusPolling('export-123', 1000));

    act(() => {
      result.current.startPolling();
    });

    expect(result.current.isPolling).toBe(true);

    act(() => {
      result.current.stopPolling();
    });

    expect(result.current.isPolling).toBe(false);
  });

  it('does not start polling when exportId is null', () => {
    const { result } = renderHook(() => useExportStatusPolling(null, 1000));

    act(() => {
      result.current.startPolling();
    });

    expect(result.current.isPolling).toBe(false);
  });
});