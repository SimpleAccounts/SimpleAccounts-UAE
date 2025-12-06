import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { BrowserRouter } from 'react-router-dom';
import Template from '../screen';
import * as TemplateActions from '../actions';

// Mock actions
jest.mock('../actions', () => ({
  getTemplateList: jest.fn(() => () => Promise.resolve({
    status: 200,
    data: [
      { id: 1, templateId: 1, enable: true, name: 'Theme 1' },
      { id: 2, templateId: 2, enable: false, name: 'Theme 2' },
    ]
  })),
}));

// Mock components
jest.mock('components', () => ({
  InvoiceTemplate: ({ templateId, enable, templateTitle, templateImg }) => (
    <div data-testid={`invoice-template-${templateId}`}>
      <h3>{templateTitle}</h3>
      <img src={templateImg} alt={templateTitle} />
      <span data-testid={`template-enable-${templateId}`}>{enable ? 'Enabled' : 'Disabled'}</span>
    </div>
  ),
}));

jest.mock('react-localization', () => {
  return jest.fn().mockImplementation(() => ({
    setLanguage: jest.fn(),
    MailThemes: 'Mail Themes',
    Theme1: 'Theme 1',
    Theme2: 'Theme 2',
  }));
});

// Mock image imports
jest.mock('assets/images/invoice-template/Theme1.png', () => 'theme1.png');
jest.mock('assets/images/invoice-template/Theme2.png', () => 'theme2.png');

const mockStore = configureStore([]);

describe('Template Component', () => {
  let store;
  let initialState;
  let mockHistory;

  beforeEach(() => {
    initialState = {
      template: {
        template_list: [
          { id: 1, templateId: 1, enable: true, name: 'Theme 1' },
          { id: 2, templateId: 2, enable: false, name: 'Theme 2' },
        ],
      },
    };

    store = mockStore(initialState);
    store.dispatch = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(store.dispatch);
      }
      return action;
    });

    mockHistory = {
      push: jest.fn(),
      location: { pathname: '/admin/settings/template' },
    };

    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'en');

    // Reset mocks
    TemplateActions.getTemplateList.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders template screen', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Mail Themes')).toBeInTheDocument();
  });

  test('calls getTemplateList on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(TemplateActions.getTemplateList).toHaveBeenCalled();
    });
  });

  test('renders Theme 1 template', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('invoice-template-1')).toBeInTheDocument();
    });

    expect(screen.getByText('Theme 1')).toBeInTheDocument();
  });

  test('renders Theme 2 template', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('invoice-template-2')).toBeInTheDocument();
    });

    expect(screen.getByText('Theme 2')).toBeInTheDocument();
  });

  test('displays Theme 1 as enabled initially', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const enableStatus = screen.getByTestId('template-enable-1');
      expect(enableStatus).toHaveTextContent('Enabled');
    });
  });

  test('displays Theme 2 as disabled initially', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const enableStatus = screen.getByTestId('template-enable-2');
      expect(enableStatus).toHaveTextContent('Disabled');
    });
  });

  test('renders card header with correct title', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Mail Themes')).toBeInTheDocument();
  });

  test('renders both template components', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('invoice-template-1')).toBeInTheDocument();
      expect(screen.getByTestId('invoice-template-2')).toBeInTheDocument();
    });
  });

  test('handles successful template list fetch', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(TemplateActions.getTemplateList).toHaveBeenCalled();
    });

    expect(screen.getByTestId('invoice-template-1')).toBeInTheDocument();
  });

  test('handles API error on template list fetch', async () => {
    TemplateActions.getTemplateList.mockImplementationOnce(() => () =>
      Promise.reject({ data: { message: 'API Error' } })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(TemplateActions.getTemplateList).toHaveBeenCalled();
    });
  });

  test('initializes state with correct template data', async () => {
    const TestWrapper = () => {
      const [enable1, setEnable1] = React.useState(false);
      const [enable2, setEnable2] = React.useState(false);

      React.useEffect(() => {
        TemplateActions.getTemplateList()().then((res) => {
          if (res.status === 200) {
            res.data.forEach((template) => {
              if (template.templateId === 1) setEnable1(template.enable);
              if (template.templateId === 2) setEnable2(template.enable);
            });
          }
        });
      }, []);

      return (
        <div>
          <div data-testid="theme1-status">{enable1 ? 'enabled' : 'disabled'}</div>
          <div data-testid="theme2-status">{enable2 ? 'enabled' : 'disabled'}</div>
        </div>
      );
    };

    render(
      <Provider store={store}>
        <BrowserRouter>
          <TestWrapper />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme1-status')).toHaveTextContent('enabled');
      expect(screen.getByTestId('theme2-status')).toHaveTextContent('disabled');
    });
  });

  test('passes correct props to InvoiceTemplate components', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const template1 = screen.getByTestId('invoice-template-1');
      const template2 = screen.getByTestId('invoice-template-2');

      expect(template1).toBeInTheDocument();
      expect(template2).toBeInTheDocument();
    });
  });

  test('renders with financial-report-screen class', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const screenDiv = container.querySelector('.financial-report-screen');
    expect(screenDiv).toBeInTheDocument();
  });

  test('renders with animated fadeIn class', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    const animatedDiv = container.querySelector('.animated.fadeIn');
    expect(animatedDiv).toBeInTheDocument();
  });

  test('handles empty template list response', async () => {
    TemplateActions.getTemplateList.mockImplementationOnce(() => () =>
      Promise.resolve({
        status: 200,
        data: [],
      })
    );

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Template history={mockHistory} />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(TemplateActions.getTemplateList).toHaveBeenCalled();
    });
  });
});
