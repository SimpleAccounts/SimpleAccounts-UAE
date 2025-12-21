/**
 * Tests for Sidebar Component
 * Verifies Sidebar component migration to shadcn/ui
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../../layouts/components/sidebar';

describe('Sidebar Component', () => {
  const mockItems = [
    {
      name: 'Dashboard',
      url: '/admin/dashboard',
      icon: 'icon-speedometer',
    },
    {
      name: 'Income',
      url: '/admin/income',
      icon: 'far fa-address-book',
      children: [
        {
          name: 'Customer Invoices',
          url: '/admin/income/customer-invoice',
          icon: 'fas fa-file-invoice',
        },
      ],
    },
  ];

  test('renders sidebar with navigation items', () => {
    render(
      <MemoryRouter>
        <Sidebar items={mockItems} pathname="/admin/dashboard" />
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
  });

  test('highlights active route', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Sidebar items={mockItems} pathname="/admin/dashboard" />
      </MemoryRouter>
    );

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    // NavLink applies classes conditionally, check if it has the active styling
    // The class might be 'bg-accent' or 'text-accent-foreground' or both
    const hasActiveClass =
      dashboardLink.className.includes('bg-accent') ||
      dashboardLink.className.includes('text-primary') ||
      dashboardLink.className.includes('accent');
    expect(hasActiveClass).toBe(true);
  });

  test('renders collapsible menu items', () => {
    render(
      <MemoryRouter>
        <Sidebar items={mockItems} pathname="/admin/dashboard" />
      </MemoryRouter>
    );

    const incomeButton = screen.getByText('Income').closest('button');
    expect(incomeButton).toBeInTheDocument();
  });

  test('expands collapsible menu when clicked', () => {
    render(
      <MemoryRouter>
        <Sidebar items={mockItems} pathname="/admin/dashboard" />
      </MemoryRouter>
    );

    const incomeButton = screen.getByText('Income').closest('button');
    fireEvent.click(incomeButton);

    expect(screen.getByText('Customer Invoices')).toBeInTheDocument();
  });

  test('renders icons for navigation items', () => {
    render(
      <MemoryRouter>
        <Sidebar items={mockItems} pathname="/admin/dashboard" />
      </MemoryRouter>
    );

    const dashboardItem = screen.getByText('Dashboard').closest('a');
    expect(dashboardItem).toContainHTML('<i');
  });

  test('handles empty items array', () => {
    render(
      <MemoryRouter>
        <Sidebar items={[]} pathname="/admin/dashboard" />
      </MemoryRouter>
    );

    expect(screen.getByText(/no navigation items available/i)).toBeInTheDocument();
  });

  test('applies minimized class when minimized prop is true', () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar items={mockItems} pathname="/admin/dashboard" minimized={true} />
      </MemoryRouter>
    );

    // When minimized, text is hidden but icons are still visible
    // Find the sidebar container by class name
    const sidebarContainer = container.querySelector('[class*="w-20"]');
    expect(sidebarContainer).toBeInTheDocument();
    expect(sidebarContainer).toHaveClass('w-20');
  });
});
