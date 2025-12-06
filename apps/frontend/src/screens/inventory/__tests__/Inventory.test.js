import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Inventory from '../screen';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('react-localization', () => {
  const LocalizedStrings = class {
    constructor(data) {
      this.data = data;
    }
    setLanguage() {}
    get Inventory() { return 'Inventory'; }
    get Dashboard() { return 'Dashboard'; }
    get Summary() { return 'Summary'; }
  };
  return LocalizedStrings;
});

jest.mock('../sections', () => ({
  InventoryDashboard: () => <div>Inventory Dashboard Component</div>,
  InventorySummary: () => <div>Inventory Summary Component</div>,
}));

describe('Inventory Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      inventory: {
        summary_list: {
          data: [],
          count: 0,
        },
      },
      common: {},
    };

    store = mockStore(initialState);
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'en'),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the inventory screen without errors', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/Inventory/i)).toBeInTheDocument();
  });

  it('should display card header with inventory icon', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    const warehouseIcon = document.querySelector('.fa-warehouse');
    expect(warehouseIcon).toBeInTheDocument();
  });

  it('should render navigation tabs with Dashboard and Summary', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
  });

  it('should have Dashboard tab active by default', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    const dashboardTab = screen.getByText('Dashboard');
    expect(dashboardTab.closest('.nav-link')).toHaveClass('active');
  });

  it('should display InventoryDashboard component when Dashboard tab is active', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Inventory Dashboard Component')).toBeInTheDocument();
  });

  it('should switch to Summary tab when clicked', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    const summaryTab = screen.getByText('Summary');
    fireEvent.click(summaryTab);

    expect(summaryTab.closest('.nav-link')).toHaveClass('active');
  });

  it('should display InventorySummary component when Summary tab is clicked', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    const summaryTab = screen.getByText('Summary');
    fireEvent.click(summaryTab);

    expect(screen.getByText('Inventory Summary Component')).toBeInTheDocument();
  });

  it('should initialize state with correct default values', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    expect(container.querySelector('.financial-report-screen')).toBeInTheDocument();
  });

  it('should handle tab toggle correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    const dashboardTab = screen.getByText('Dashboard');
    const summaryTab = screen.getByText('Summary');

    fireEvent.click(summaryTab);
    expect(summaryTab.closest('.nav-link')).toHaveClass('active');

    fireEvent.click(dashboardTab);
    expect(dashboardTab.closest('.nav-link')).toHaveClass('active');
  });

  it('should render Card component with proper structure', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    expect(container.querySelector('.card')).toBeInTheDocument();
    expect(container.querySelector('.card-header')).toBeInTheDocument();
    expect(container.querySelector('.card-body')).toBeInTheDocument();
  });

  it('should retrieve language from localStorage', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    expect(window.localStorage.getItem).toHaveBeenCalledWith('language');
  });

  it('should render Nav tabs with pills style', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    const navTabs = container.querySelector('.nav.tabs.pills');
    expect(navTabs).toBeInTheDocument();
  });

  it('should render TabContent with activeTab state', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    const tabContent = container.querySelector('.tab-content');
    expect(tabContent).toBeInTheDocument();
  });

  it('should have proper CSS classes applied', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    expect(container.querySelector('.financial-report-screen')).toBeInTheDocument();
    expect(container.querySelector('.animated.fadeIn')).toBeInTheDocument();
  });

  it('should render table wrapper for tab panes', () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Inventory />
        </BrowserRouter>
      </Provider>
    );

    const tableWrapper = container.querySelector('.table-wrapper');
    expect(tableWrapper).toBeInTheDocument();
  });
});
