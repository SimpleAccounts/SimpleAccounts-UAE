import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Organization from '../screen';
import * as OrganizationActions from '../actions';
import { CommonActions } from 'services/global';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../actions');
jest.mock('services/global', () => ({
  CommonActions: {
    tostifyAlert: jest.fn(),
  },
}));

jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

jest.mock('react-images-upload', () => {
  return function ImageUploader(props) {
    return (
      <div data-testid="image-uploader">
        <button
          onClick={() => props.onChange([new File([''], 'test.png', { type: 'image/png' })])}
        >
          Upload Image
        </button>
      </div>
    );
  };
});

describe('Organization Screen Component', () => {
  let store;
  let history;
  let initialState;

  beforeEach(() => {
    history = createMemoryHistory();
    initialState = {
      organization: {
        country_list: [
          { countryCode: 'US', countryName: 'United States' },
          { countryCode: 'AE', countryName: 'United Arab Emirates' },
        ],
        industry_type_list: [
          { value: 'tech', label: 'Technology' },
          { value: 'finance', label: 'Finance' },
        ],
      },
    };

    store = mockStore(initialState);

    OrganizationActions.getCountryList = jest.fn(() => Promise.resolve({ status: 200 }));
    OrganizationActions.getIndustryTypeList = jest.fn(() => Promise.resolve({ status: 200 }));
    OrganizationActions.createOrganization = jest.fn(() =>
      Promise.resolve({ status: 200, data: {} })
    );

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the organization screen without errors', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    expect(screen.getByText('Organization')).toBeInTheDocument();
  });

  it('should call getCountryList on component mount', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(OrganizationActions.getCountryList).toHaveBeenCalled();
    });
  });

  it('should call getIndustryTypeList on component mount', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(OrganizationActions.getIndustryTypeList).toHaveBeenCalled();
    });
  });

  it('should display company name input field', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    const companyNameInput = screen.getByPlaceholderText('Enter Company Name');
    expect(companyNameInput).toBeInTheDocument();
  });

  it('should display image uploader for company logo', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
  });

  it('should allow user to type company name', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    const companyNameInput = screen.getByPlaceholderText('Enter Company Name');
    fireEvent.change(companyNameInput, { target: { value: 'Test Company Ltd' } });

    expect(companyNameInput.value).toBe('Test Company Ltd');
  });

  it('should display address fields', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    expect(screen.getByPlaceholderText('Street1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Street2')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('City')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('State/Province')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Zip/Postal Code')).toBeInTheDocument();
  });

  it('should display phone number input field', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    const phoneInput = screen.getByPlaceholderText('Enter Phone Number');
    expect(phoneInput).toBeInTheDocument();
  });

  it('should display contact detail fields', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    const contactInputs = screen.getAllByPlaceholderText(/Name|Email|Phone/);
    expect(contactInputs.length).toBeGreaterThan(0);
  });

  it('should display company ID input field', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    const companyIdInput = screen.getByPlaceholderText('Enter Company Id');
    expect(companyIdInput).toBeInTheDocument();
  });

  it('should display VAT number input field', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    const vatInput = screen.getByPlaceholderText('Enter VAT Number');
    expect(vatInput).toBeInTheDocument();
  });

  it('should display save button', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    const saveButton = screen.getByRole('button', { name: /Save/i });
    expect(saveButton).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    const companyNameInput = screen.getByPlaceholderText('Enter Company Name');
    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(OrganizationActions.createOrganization).toHaveBeenCalled();
    });
  });

  it('should show success message after successful organization creation', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    const companyNameInput = screen.getByPlaceholderText('Enter Company Name');
    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(CommonActions.tostifyAlert).toHaveBeenCalledWith(
        'success',
        'New Company Created Successfully'
      );
    });
  });

  it('should redirect after successful organization creation', async () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    const companyNameInput = screen.getByPlaceholderText('Enter Company Name');
    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(history.location.pathname).toMatch(/admin/);
    });
  });

  it('should handle error when organization creation fails', async () => {
    OrganizationActions.createOrganization = jest.fn(() =>
      Promise.reject({ data: { message: 'Creation failed' } })
    );

    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    const companyNameInput = screen.getByPlaceholderText('Enter Company Name');
    fireEvent.change(companyNameInput, { target: { value: 'Test Company' } });

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(CommonActions.tostifyAlert).toHaveBeenCalledWith('error', expect.any(String));
    });
  });

  it('should handle image upload', () => {
    render(
      <Provider store={store}>
        <Router history={history}>
          <Organization history={history} />
        </Router>
      </Provider>
    );

    const uploadButton = screen.getByText('Upload Image');
    fireEvent.click(uploadButton);

    expect(screen.getByTestId('image-uploader')).toBeInTheDocument();
  });
});
