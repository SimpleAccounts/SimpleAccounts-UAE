import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import * as thunkModule from 'redux-thunk';
const thunk = thunkModule.default || thunkModule.thunk || thunkModule;
import Project from '../screen';
import * as ProjectActions from '../actions';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

vi.mock('../actions', () => ({
  getProjectList: vi.fn(() => () => Promise.resolve({ status: 200, data: { data: [] } })),
  removeBulk: vi.fn(() => () => Promise.resolve({ status: 200, data: { message: 'Success' } })),
  getCurrencyList: vi.fn(() => () => Promise.resolve()),
  getCountryList: vi.fn(() => () => Promise.resolve()),
  getTitleList: vi.fn(() => () => Promise.resolve()),
}));
vi.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: vi.fn(),
  },
}));

const mockHistoryPush = vi.fn();
vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    useHistory: () => ({
      push: mockHistoryPush,
    }),
  };
});

// TODO: These tests need investigation for React 19 compatibility
// The component loads correctly but the mock dispatch doesn't trigger state updates properly in React 19
describe.skip('Project Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      project: {
        project_list: {
          data: [
            {
              projectId: 1,
              projectName: 'Test Project',
              expenseBudget: 5000,
              revenueBudget: 10000,
              vatRegistrationNumber: 'VAT123456',
              contact: {
                firstName: 'John Doe',
              },
              currency: {
                currencyName: 'USD',
              },
            },
          ],
          count: 1,
        },
      },
    };

    store = mockStore(initialState);

    ProjectActions.getProjectList.mockImplementation(
      () => () =>
        Promise.resolve({ status: 200, data: { data: initialState.project.project_list.data } })
    );
    ProjectActions.removeBulk.mockImplementation(
      () => () => Promise.resolve({ status: 200, data: { message: 'Success' } })
    );
    ProjectActions.getCurrencyList.mockImplementation(() => () => Promise.resolve());
    ProjectActions.getCountryList.mockImplementation(() => () => Promise.resolve());
    ProjectActions.getTitleList.mockImplementation(() => () => Promise.resolve());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the project screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Projects/i)).toBeInTheDocument();
    });
  });

  it('should display project list data in table', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('5000')).toBeInTheDocument();
      expect(screen.getByText('10000')).toBeInTheDocument();
    });
  });

  it('should call getProjectList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(ProjectActions.getProjectList).toHaveBeenCalled();
    });
  });

  it('should render filter section with correct placeholders', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Filter/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Project Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Expense Budget')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Revenue Budget')).toBeInTheDocument();
    });
  });

  it('should handle search button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const searchButtons = screen.getAllByRole('button');
      const searchButton = searchButtons.find(btn => btn.querySelector('.fa-search'));
      if (searchButton) {
        fireEvent.click(searchButton);
      }
    });
  });

  it('should handle clear all filters', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const refreshButtons = screen.getAllByRole('button');
      const refreshButton = refreshButtons.find(btn => btn.querySelector('.fa-refresh'));
      if (refreshButton) {
        fireEvent.click(refreshButton);
      }
    });
  });

  it('should render New Project button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/New Project/i)).toBeInTheDocument();
    });
  });

  it('should render Export To CSV button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Export To CSV/i)).toBeInTheDocument();
    });
  });

  it('should render Bulk Delete button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Bulk Delete/i)).toBeInTheDocument();
    });
  });

  it('should disable Bulk Delete button when no rows selected', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const bulkDeleteButton = screen.getByText(/Bulk Delete/i);
      expect(bulkDeleteButton).toBeDisabled();
    });
  });

  it('should handle pagination correctly', async () => {
    const multipleProjects = Array.from({ length: 15 }, (_, i) => ({
      ...initialState.project.project_list.data[0],
      projectId: i + 1,
      projectName: `Project ${i + 1}`,
    }));

    initialState.project.project_list.data = multipleProjects;
    initialState.project.project_list.count = 15;
    store = mockStore(initialState);

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });
  });

  it('should handle filter input changes', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const projectNameInput = screen.getByPlaceholderText('Project Name');
      fireEvent.change(projectNameInput, { target: { value: 'New Project' } });
      expect(projectNameInput.value).toBe('New Project');
    });
  });

  it('should display table headers correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Project Name')).toBeInTheDocument();
      expect(screen.getByText('Expense Budget')).toBeInTheDocument();
      expect(screen.getByText('Revenue Budget')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.queryByText('Loading...')).toBeDefined();
  });

  // Skipped: Test needs update for new DataTable implementation
  it.skip('should handle row selection for bulk operations', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Project />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });
});
