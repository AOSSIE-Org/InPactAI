import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Analytics from '../Analytics';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock the auth context
const mockUser = { id: '1', email: 'test@example.com', role: 'brand' };
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser })
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock the analytics components
jest.mock('@/components/analytics/performance-overview', () => {
  return function MockPerformanceOverview({ loading }: { loading?: boolean }) {
    if (loading) return <div>Loading performance overview...</div>;
    return <div>Performance Overview Component</div>;
  };
});

jest.mock('@/components/analytics/metrics-chart', () => {
  return function MockMetricsChart({ title }: { title?: string }) {
    return <div>Metrics Chart: {title}</div>;
  };
});

jest.mock('@/components/analytics/contract-comparison', () => {
  return function MockContractComparison({ loading }: { loading?: boolean }) {
    if (loading) return <div>Loading contract comparison...</div>;
    return <div>Contract Comparison Component</div>;
  };
});

// Mock fetch
global.fetch = jest.fn();

const AnalyticsWrapper = () => (
  <BrowserRouter>
    <Analytics />
  </BrowserRouter>
);

describe('Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('renders analytics dashboard correctly', async () => {
    // Mock successful API response
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false, // This will trigger fallback to mock data
      json: async () => ({})
    });

    render(<AnalyticsWrapper />);
    
    expect(screen.getByText('Brand Analytics & Tracking')).toBeInTheDocument();
    expect(screen.getByText('Track your brand campaigns, content performance, and ROI')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    // Mock a delayed response
    (fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<AnalyticsWrapper />);
    
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders tabs correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    render(<AnalyticsWrapper />);
    
    await waitFor(() => {
      expect(screen.getByText('Performance Overview')).toBeInTheDocument();
      expect(screen.getByText('Detailed Charts')).toBeInTheDocument();
      expect(screen.getByText('Contract Comparison')).toBeInTheDocument();
    });
  });

  it('handles time range selection', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    render(<AnalyticsWrapper />);
    
    await waitFor(() => {
      // Should have time range selector
      expect(screen.getByDisplayValue('Last 30 days')).toBeInTheDocument();
    });
  });

  it('handles contract selection', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    render(<AnalyticsWrapper />);
    
    await waitFor(() => {
      // Should have contract selector
      expect(screen.getByDisplayValue('All Contracts')).toBeInTheDocument();
    });
  });

  it('handles refresh functionality', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    render(<AnalyticsWrapper />);
    
    await waitFor(() => {
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      
      // Should call fetch again
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('handles export functionality', async () => {
    // Mock URL.createObjectURL and related methods
    const mockCreateObjectURL = jest.fn(() => 'mock-url');
    const mockRevokeObjectURL = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL });

    // Mock document.createElement and appendChild/removeChild
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    };
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();
    
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    jest.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    jest.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    render(<AnalyticsWrapper />);
    
    await waitFor(() => {
      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);
      
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });
  });

  it('switches between tabs correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    render(<AnalyticsWrapper />);
    
    await waitFor(() => {
      // Click on Detailed Charts tab
      const chartsTab = screen.getByText('Detailed Charts');
      fireEvent.click(chartsTab);
      
      expect(screen.getByText('Metrics Chart: Reach Over Time')).toBeInTheDocument();
      expect(screen.getByText('Metrics Chart: Engagement Rate')).toBeInTheDocument();
    });
  });

  it('shows connection status correctly', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    render(<AnalyticsWrapper />);
    
    await waitFor(() => {
      expect(screen.getByText('Data Sources')).toBeInTheDocument();
      expect(screen.getByText('Instagram Connected')).toBeInTheDocument();
      expect(screen.getByText('YouTube Connected')).toBeInTheDocument();
      expect(screen.getByText('Manage Connections')).toBeInTheDocument();
    });
  });

  it('navigates to brand settings when manage connections is clicked', async () => {
    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    render(<AnalyticsWrapper />);
    
    await waitFor(() => {
      const manageButton = screen.getByText('Manage Connections');
      fireEvent.click(manageButton);
      
      expect(window.location.href).toBe('/brand/settings');
    });
  });

  it('handles API errors gracefully', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<AnalyticsWrapper />);
    
    await waitFor(() => {
      // Should still render with mock data
      expect(screen.getByText('Brand Analytics & Tracking')).toBeInTheDocument();
    });
  });

  it('uses mock data when API is unavailable', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Server error' })
    });

    render(<AnalyticsWrapper />);
    
    await waitFor(() => {
      // Should render components with mock data
      expect(screen.getByText('Performance Overview Component')).toBeInTheDocument();
    });
  });
});