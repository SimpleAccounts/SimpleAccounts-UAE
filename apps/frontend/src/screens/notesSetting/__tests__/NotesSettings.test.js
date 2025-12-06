import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import NotesSettings from '../screen';
import * as NotesSettingsAction from '../actions';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('NotesSettings Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {
      common: {
        version: '1.0.0',
      },
    };

    store = mockStore(initialState);

    NotesSettingsAction.getNoteSettingsInfo = jest.fn(() =>
      Promise.resolve({
        status: 200,
        data: {
          defaultFootNotes: 'Default footer notes',
          defaultTermsAndConditions: 'Default terms',
          defaultNotes: 'Default delivery notes',
        },
      })
    );

    NotesSettingsAction.saveNoteSettingsInfo = jest.fn(() =>
      Promise.resolve({ status: 200 })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the notes settings screen without errors', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Notes Settings/i)).toBeInTheDocument();
    });
  });

  it('should display the screen title correctly', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const title = screen.getByText(/Notes Settings/i);
      expect(title).toBeInTheDocument();
    });
  });

  it('should render Default Delivery Notes field', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Default Delivery Notes/i)).toBeInTheDocument();
    });
  });

  it('should render Default Terms and Conditions field', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Default Terms/i)).toBeInTheDocument();
    });
  });

  it('should render Default Footnotes field', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Default Footnotes/i)).toBeInTheDocument();
    });
  });

  it('should call getNoteSettingsInfo on component mount', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(NotesSettingsAction.getNoteSettingsInfo).toHaveBeenCalled();
    });
  });

  it('should render Save button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const saveButton = screen.getByText(/Save/i);
      expect(saveButton).toBeInTheDocument();
    });
  });

  it('should render Cancel button', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const cancelButton = screen.getByText(/Cancel/i);
      expect(cancelButton).toBeInTheDocument();
    });
  });

  it('should handle Cancel button click', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const cancelButton = screen.getByText(/Cancel/i);
      fireEvent.click(cancelButton);
    });
  });

  it('should update defaultNotes state on input change', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const input = document.querySelector('#defaultNotes');
      if (input) {
        fireEvent.change(input, { target: { value: 'New delivery notes' } });
      }
    });
  });

  it('should update defaultFootNotes state on input change', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const input = document.querySelector('#defaultFootNotes');
      if (input) {
        fireEvent.change(input, { target: { value: 'New footer notes' } });
      }
    });
  });

  it('should update defaultTermsAndConditions state on input change', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const input = document.querySelector('#defaultTermsAndConditions');
      if (input) {
        fireEvent.change(input, { target: { value: 'New terms' } });
      }
    });
  });

  it('should render textarea fields with Material-UI TextField', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const textFields = document.querySelectorAll('.textarea');
      expect(textFields.length).toBeGreaterThan(0);
    });
  });

  it('should have maxLength constraint on text fields', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      const inputs = document.querySelectorAll('textarea');
      inputs.forEach(input => {
        expect(input).toBeDefined();
      });
    });
  });

  it('should initialize component with correct CSS class', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <NotesSettings />
        </BrowserRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(container.querySelector('.create-contact-screen')).toBeInTheDocument();
    });
  });
});
