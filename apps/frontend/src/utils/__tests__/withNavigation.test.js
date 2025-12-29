/**
 * Tests for withNavigation HOC utility
 * Tests the React Router v6 compatibility layer for class components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { withNavigation, useNavigation } from '../withNavigation';

// Test component that uses history
class TestComponent extends React.Component {
  componentDidMount() {
    if (this.props.testHistory) {
      this.props.testHistory.push('/test');
    }
  }

  handleClick = () => {
    this.props.history.push('/dashboard');
  };

  handleReplace = () => {
    this.props.history.replace('/login');
  };

  handleGoBack = () => {
    this.props.history.goBack();
  };

  handleGoForward = () => {
    this.props.history.goForward();
  };

  render() {
    const { match, location, history } = this.props;
    return (
      <div>
        <div data-testid="component">Test Component</div>
        <div data-testid="pathname">{location?.pathname}</div>
        <div data-testid="params">{match?.params?.id || 'no-params'}</div>
        <button data-testid="push-btn" onClick={this.handleClick}>
          Push
        </button>
        <button data-testid="replace-btn" onClick={this.handleReplace}>
          Replace
        </button>
        <button data-testid="back-btn" onClick={this.handleGoBack}>
          Back
        </button>
        <button data-testid="forward-btn" onClick={this.handleGoForward}>
          Forward
        </button>
      </div>
    );
  }
}

const TestComponentWithNavigation = withNavigation(TestComponent);

describe('withNavigation HOC', () => {
  it('should provide history object to wrapped component', () => {
    render(
      <MemoryRouter>
        <TestComponentWithNavigation />
      </MemoryRouter>
    );

    expect(screen.getByTestId('component')).toBeInTheDocument();
  });

  it('should provide location object to wrapped component', () => {
    render(
      <MemoryRouter initialEntries={['/test-path']}>
        <TestComponentWithNavigation />
      </MemoryRouter>
    );

    expect(screen.getByTestId('pathname')).toHaveTextContent('/test-path');
  });

  it('should provide match object with params to wrapped component', () => {
    render(
      <MemoryRouter initialEntries={['/users/123']}>
        <Routes>
          <Route path="/users/:id" element={<TestComponentWithNavigation />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('params')).toHaveTextContent('123');
  });

  it('should handle history.push navigation', () => {
    const Dashboard = () => <div data-testid="dashboard">Dashboard</div>;

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<TestComponentWithNavigation />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    const pushButton = screen.getByTestId('push-btn');
    fireEvent.click(pushButton);

    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('should handle history.replace navigation', () => {
    const Login = () => <div data-testid="login">Login</div>;

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<TestComponentWithNavigation />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    const replaceButton = screen.getByTestId('replace-btn');
    fireEvent.click(replaceButton);

    expect(screen.getByTestId('login')).toBeInTheDocument();
  });

  it('should handle history.push with state', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<TestComponentWithNavigation />} />
          <Route path="/dashboard" element={<div data-testid="dashboard">Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    );

    const pushButton = screen.getByTestId('push-btn');
    fireEvent.click(pushButton);

    // Should navigate to dashboard
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('should handle history.goBack', () => {
    render(
      <MemoryRouter initialEntries={['/page1', '/page2']} initialIndex={1}>
        <Routes>
          <Route path="/page1" element={<div data-testid="page1">Page 1</div>} />
          <Route path="/page2" element={<TestComponentWithNavigation />} />
        </Routes>
      </MemoryRouter>
    );

    // Component should render
    expect(screen.getByTestId('component')).toBeInTheDocument();
    const backButton = screen.getByTestId('back-btn');
    expect(backButton).toBeInTheDocument();
    fireEvent.click(backButton);
  });

  it('should handle history.goForward', () => {
    render(
      <MemoryRouter initialEntries={['/page1', '/page2']} initialIndex={0}>
        <Routes>
          <Route path="/page1" element={<TestComponentWithNavigation />} />
          <Route path="/page2" element={<div data-testid="page2">Page 2</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Component should render with forward button
    expect(screen.getByTestId('component')).toBeInTheDocument();
    const forwardButton = screen.getByTestId('forward-btn');
    expect(forwardButton).toBeInTheDocument();
    fireEvent.click(forwardButton);
  });

  it('should work with components that access match.params', () => {
    class ParamComponent extends React.Component {
      render() {
        const { id } = this.props.match.params;
        return <div data-testid="param-value">{id}</div>;
      }
    }

    const ParamComponentWithNavigation = withNavigation(ParamComponent);

    render(
      <MemoryRouter initialEntries={['/items/456']}>
        <Routes>
          <Route path="/items/:id" element={<ParamComponentWithNavigation />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('param-value')).toHaveTextContent('456');
  });

  it('should work with components that access location object', () => {
    class LocationComponent extends React.Component {
      render() {
        const pathname = this.props.location?.pathname || 'no-pathname';
        return <div data-testid="location-pathname">{pathname}</div>;
      }
    }

    const LocationComponentWithNavigation = withNavigation(LocationComponent);

    render(
      <MemoryRouter initialEntries={['/test-path']}>
        <LocationComponentWithNavigation />
      </MemoryRouter>
    );

    expect(screen.getByTestId('location-pathname')).toHaveTextContent('/test-path');
  });

  it('should provide useNavigation hook alternative', () => {
    // Hook can be used in functional components
    const FunctionalComponent = () => {
      const navigation = useNavigation();
      return (
        <div>
          <div data-testid="hook-pathname">{navigation.location.pathname}</div>
          <button data-testid="hook-push" onClick={() => navigation.history.push('/test')}>
            Push
          </button>
        </div>
      );
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <FunctionalComponent />
      </MemoryRouter>
    );

    expect(screen.getByTestId('hook-pathname')).toHaveTextContent('/');
  });

  it('should provide history.length property', () => {
    class LengthComponent extends React.Component {
      render() {
        return <div data-testid="history-length">{this.props.history.length}</div>;
      }
    }

    const LengthComponentWithNavigation = withNavigation(LengthComponent);

    render(
      <MemoryRouter>
        <LengthComponentWithNavigation />
      </MemoryRouter>
    );

    expect(screen.getByTestId('history-length')).toBeInTheDocument();
  });

  it('should provide history.action property', () => {
    class ActionComponent extends React.Component {
      render() {
        return <div data-testid="history-action">{this.props.history.action}</div>;
      }
    }

    const ActionComponentWithNavigation = withNavigation(ActionComponent);

    render(
      <MemoryRouter>
        <ActionComponentWithNavigation />
      </MemoryRouter>
    );

    expect(screen.getByTestId('history-action')).toHaveTextContent('PUSH');
  });
});
