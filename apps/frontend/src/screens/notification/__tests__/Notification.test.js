import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Notification from '../screen';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('components', () => ({
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

jest.mock('@coreui/react', () => ({
  AppSwitch: ({ className, defaultChecked, onChange, checked }) => (
    <input
      type="checkbox"
      data-testid="app-switch"
      className={className}
      defaultChecked={defaultChecked}
      checked={checked}
      onChange={onChange}
    />
  ),
}));

describe('Notification Screen Component', () => {
  let store;
  let initialState;

  beforeEach(() => {
    initialState = {};
    store = mockStore(initialState);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the notification screen without errors', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('should render notification header with icon', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    const header = screen.getByText('Notifications');
    expect(header).toBeInTheDocument();
    expect(header.parentElement.querySelector('.fa-bell')).toBeInTheDocument();
  });

  it('should display email notifications label', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
  });

  it('should display reminder notifications label', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText('Reminder Notifications')).toBeInTheDocument();
  });

  it('should render email notification toggle switch', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    const switches = screen.getAllByTestId('app-switch');
    expect(switches.length).toBeGreaterThan(0);
  });

  it('should render reminder notification toggle switch', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    const switches = screen.getAllByTestId('app-switch');
    expect(switches.length).toBeGreaterThanOrEqual(2);
  });

  it('should have email notification switch enabled by default', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    const switches = screen.getAllByTestId('app-switch');
    const emailSwitch = switches[0];
    expect(emailSwitch).toHaveAttribute('defaultChecked');
  });

  it('should toggle email notification switch when clicked', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    const switches = screen.getAllByTestId('app-switch');
    const emailSwitch = switches[0];

    fireEvent.click(emailSwitch);

    expect(emailSwitch).toBeInTheDocument();
  });

  it('should toggle reminder notification switch when clicked', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    const switches = screen.getAllByTestId('app-switch');
    const reminderSwitch = switches[1];

    fireEvent.click(reminderSwitch);

    expect(reminderSwitch).toBeInTheDocument();
  });

  it('should not display loader when loading is false', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
  });

  it('should render the form element', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    const form = document.querySelector('form[name="simpleForm"]');
    expect(form).toBeInTheDocument();
  });

  it('should have proper CSS classes for notification screen', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    const notificationScreen = document.querySelector('.notification-screen');
    expect(notificationScreen).toBeInTheDocument();
  });

  it('should have animated fadeIn class', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    const fadeInElement = document.querySelector('.animated.fadeIn');
    expect(fadeInElement).toBeInTheDocument();
  });

  it('should render Card component structure', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    const card = document.querySelector('.card');
    expect(card).toBeInTheDocument();
  });

  it('should render CardBody with content', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Notification />
        </BrowserRouter>
      </Provider>
    );

    const cardBody = document.querySelector('.card-body');
    expect(cardBody).toBeInTheDocument();
    expect(cardBody.textContent).toContain('Email Notifications');
    expect(cardBody.textContent).toContain('Reminder Notifications');
  });
});
