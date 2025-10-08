import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from '../empty-state';

describe('EmptyState', () => {
  it('renders default empty state', () => {
    render(<EmptyState />);
    
    expect(screen.getByText('No Data Available')).toBeInTheDocument();
    expect(screen.getByText(/There's no data to display at the moment/)).toBeInTheDocument();
  });

  it('renders analytics empty state with appropriate message', () => {
    render(<EmptyState type="analytics" />);
    
    expect(screen.getByText('No Analytics Data')).toBeInTheDocument();
    expect(screen.getByText(/Connect your social media accounts/)).toBeInTheDocument();
  });

  it('renders content empty state', () => {
    render(<EmptyState type="content" />);
    
    expect(screen.getByText('No Content Linked')).toBeInTheDocument();
    expect(screen.getByText(/Link your social media content/)).toBeInTheDocument();
  });

  it('calls onAction when action button is clicked', () => {
    const onAction = vi.fn();
    render(<EmptyState onAction={onAction} />);
    
    const actionButton = screen.getByText('Refresh');
    fireEvent.click(actionButton);
    
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('calls onSecondaryAction when secondary button is clicked', () => {
    const onSecondaryAction = vi.fn();
    render(<EmptyState onSecondaryAction={onSecondaryAction} />);
    
    const secondaryButton = screen.getByText('Get Help');
    fireEvent.click(secondaryButton);
    
    expect(onSecondaryAction).toHaveBeenCalledTimes(1);
  });

  it('renders custom title and message', () => {
    const customTitle = 'Custom Empty Title';
    const customMessage = 'This is a custom empty state message';
    
    render(<EmptyState title={customTitle} message={customMessage} />);
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('hides illustration when showIllustration is false', () => {
    render(<EmptyState showIllustration={false} />);
    
    // The illustration container should not be present
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders different sizes correctly', () => {
    const { rerender } = render(<EmptyState size="sm" />);
    expect(screen.getByText('No Data Available')).toBeInTheDocument();
    
    rerender(<EmptyState size="lg" />);
    expect(screen.getByText('No Data Available')).toBeInTheDocument();
  });

  it('renders search empty state', () => {
    render(<EmptyState type="search" />);
    
    expect(screen.getByText('No Results Found')).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your search criteria/)).toBeInTheDocument();
  });

  it('renders contracts empty state with create action', () => {
    render(<EmptyState type="contracts" onAction={vi.fn()} />);
    
    expect(screen.getByText('No Contracts Yet')).toBeInTheDocument();
    expect(screen.getByText('Create Contract')).toBeInTheDocument();
  });

  it('renders audience empty state', () => {
    render(<EmptyState type="audience" />);
    
    expect(screen.getByText('No Audience Data')).toBeInTheDocument();
    expect(screen.getByText(/Connect your social accounts/)).toBeInTheDocument();
  });

  it('renders exports empty state', () => {
    render(<EmptyState type="exports" />);
    
    expect(screen.getByText('No Exports Yet')).toBeInTheDocument();
    expect(screen.getByText(/Export your analytics data/)).toBeInTheDocument();
  });

  it('renders alerts empty state', () => {
    render(<EmptyState type="alerts" />);
    
    expect(screen.getByText('No Alerts Configured')).toBeInTheDocument();
    expect(screen.getByText(/Set up performance alerts/)).toBeInTheDocument();
  });
});