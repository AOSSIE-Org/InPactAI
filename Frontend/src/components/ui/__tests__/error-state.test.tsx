import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorState from '../error-state';

describe('ErrorState', () => {
  it('renders default error state', () => {
    render(<ErrorState />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
  });

  it('renders network error with appropriate icon and message', () => {
    render(<ErrorState type="network" />);
    
    expect(screen.getByText('Connection Error')).toBeInTheDocument();
    expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument();
  });

  it('renders auth error with custom message', () => {
    const customMessage = 'Please sign in to continue';
    render(<ErrorState type="auth" message={customMessage} />);
    
    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when retrying', () => {
    render(<ErrorState onRetry={vi.fn()} retryLoading={true} />);
    
    expect(screen.getByText('Retrying...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retrying/i })).toBeDisabled();
  });

  it('calls onAction when action button is clicked', () => {
    const onAction = vi.fn();
    render(<ErrorState onAction={onAction} actionLabel="Go to Settings" />);
    
    const actionButton = screen.getByText('Go to Settings');
    fireEvent.click(actionButton);
    
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('hides retry button when showRetry is false', () => {
    render(<ErrorState showRetry={false} onRetry={vi.fn()} />);
    
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<ErrorState size="sm" onRetry={vi.fn()} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    
    rerender(<ErrorState size="lg" onRetry={vi.fn()} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders rate limit error with specific message', () => {
    render(<ErrorState type="rate-limit" />);
    
    expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument();
    expect(screen.getByText(/Too many requests/)).toBeInTheDocument();
  });

  it('renders permission error without retry button by default', () => {
    render(<ErrorState type="permission" />);
    
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });
});