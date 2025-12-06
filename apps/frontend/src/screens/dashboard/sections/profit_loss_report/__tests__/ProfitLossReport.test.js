import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProfitAndLossReport from '../index';

const mockDashboardActions = {
  getProfitLossReport: jest.fn(),
  getBankAccountGraphData: jest.fn(),
};

jest.mock('react-apexcharts', () => ({
  __esModule: true,
  default: () => <div>ApexChart Component</div>,
}));

jest.mock('react-localization', () => {
  const LocalizedStrings = class {
    constructor(data) {
      this.data = data;
    }
    setLanguage() {}
    get ProfitLoss() { return 'Profit & Loss'; }
  };
  return LocalizedStrings;
});

describe('ProfitAndLossReport Component', () => {
  let props;

  beforeEach(() => {
    props = {
      DashboardActions: mockDashboardActions,
    };

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'en'),
        setItem: jest.fn(),
      },
      writable: true,
    });

    mockDashboardActions.getProfitLossReport = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          label: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          },
          income: {
            incomeData: [1000, 1500, 2000, 2500, 3000, 3500],
          },
          expense: {
            expenseData: [800, 1200, 1600, 2000, 2400, 2800],
          },
        },
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the profit and loss report component without errors', async () => {
    render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      expect(screen.getByText(/Profit & Loss/i)).toBeInTheDocument();
    });
  });

  it('should call getProfitLossReport on component mount', async () => {
    render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      expect(mockDashboardActions.getProfitLossReport).toHaveBeenCalledWith('6');
    });
  });

  it('should render range selector dropdown', async () => {
    render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });
  });

  it('should have Last 6 Months selected by default', async () => {
    render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select.value).toBe('6');
    });
  });

  it('should render Last 3 Months option', async () => {
    render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      expect(screen.getByText('Last 3 Months')).toBeInTheDocument();
    });
  });

  it('should render Last 6 Months option', async () => {
    render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      expect(screen.getByText('Last 6 Months')).toBeInTheDocument();
    });
  });

  it('should render Last 12 Months option', async () => {
    render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      expect(screen.getByText('Last 12 Months')).toBeInTheDocument();
    });
  });

  it('should change range when dropdown value changes', async () => {
    render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '3' } });
    });

    await waitFor(() => {
      expect(mockDashboardActions.getProfitLossReport).toHaveBeenCalledWith('3');
    });
  });

  it('should call getProfitLossReport with 12 months when Last 12 Months is selected', async () => {
    render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '12' } });
    });

    await waitFor(() => {
      expect(mockDashboardActions.getProfitLossReport).toHaveBeenCalledWith('12');
    });
  });

  it('should render ApexChart component', async () => {
    render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      expect(screen.getByText('ApexChart Component')).toBeInTheDocument();
    });
  });

  it('should update state with chart data after successful API call', async () => {
    const { container } = render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      expect(mockDashboardActions.getProfitLossReport).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('ApexChart Component')).toBeInTheDocument();
    });
  });

  it('should handle API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockDashboardActions.getProfitLossReport = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    );

    render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      expect(mockDashboardActions.getProfitLossReport).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load profit/loss chart',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should render card with proper styling', async () => {
    const { container } = render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      expect(container.querySelector('.cash-card')).toBeInTheDocument();
      expect(container.querySelector('.card-margin')).toBeInTheDocument();
    });
  });

  it('should render card body with proper padding', async () => {
    const { container } = render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      expect(container.querySelector('.card-body-padding')).toBeInTheDocument();
    });
  });

  it('should have animated fadeIn class', async () => {
    const { container } = render(<ProfitAndLossReport {...props} />);

    await waitFor(() => {
      expect(container.querySelector('.animated.fadeIn')).toBeInTheDocument();
    });
  });

  it('should retrieve language from localStorage', () => {
    render(<ProfitAndLossReport {...props} />);

    expect(window.localStorage.getItem).toHaveBeenCalledWith('language');
  });
});
