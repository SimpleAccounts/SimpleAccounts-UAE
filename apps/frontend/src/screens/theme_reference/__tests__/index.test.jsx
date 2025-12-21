import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ComponentLibrary from '../index';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock Recharts to avoid sizing issues in test environment
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <div className="recharts-responsive-container">{children}</div>
    ),
    LineChart: () => <div>LineChart</div>,
    AreaChart: () => <div>AreaChart</div>,
    BarChart: () => <div>BarChart</div>,
    PieChart: () => <div>PieChart</div>,
  };
});

describe('ComponentLibrary (Theme Reference)', () => {
  it('renders without crashing', () => {
    render(
      <TooltipProvider>
        <ComponentLibrary />
      </TooltipProvider>
    );
    expect(screen.getByText('SimpleAccounts Neumorphism UI')).toBeInTheDocument();
  });
});
