/**
 * Tests for React Router v5 patterns.
 * These tests verify that routing works correctly and document patterns that would
 * break during React Router v5 → v6 upgrade.
 *
 * Covers: react-router-dom 5.0.1 → 6.x upgrade
 *
 * IMPORTANT: These tests document CURRENT v5 patterns.
 * After upgrading to v6, these tests will need significant changes.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Router, Route, Switch, Redirect, Link, MemoryRouter } from 'react-router-dom';
import { createMemoryHistory } from 'history';

// Sample components for testing
const HomePage = () => <div data-testid="home">Home Page</div>;
const AboutPage = () => <div data-testid="about">About Page</div>;
const NotFoundPage = () => <div data-testid="not-found">404 Not Found</div>;
const LoginPage = () => <div data-testid="login">Login Page</div>;
const DashboardPage = () => <div data-testid="dashboard">Dashboard</div>;

// Protected Route component (v5 pattern)
const ProtectedRoute = ({ component: Component, isAuthenticated, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      isAuthenticated ? (
        <Component {...props} />
      ) : (
        <Redirect to="/login" />
      )
    }
  />
);

// Component with route params (v5 pattern)
const UserProfile = ({ match }) => (
  <div data-testid="user-profile">User ID: {match.params.id}</div>
);

describe('React Router v5 Patterns', () => {
  // ============ Basic Routing ============

  describe('Basic Routing', () => {
    it('should render home page on "/" path', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/about" component={AboutPage} />
          </Switch>
        </MemoryRouter>
      );

      expect(screen.getByTestId('home')).toBeInTheDocument();
    });

    it('should render about page on "/about" path', () => {
      render(
        <MemoryRouter initialEntries={['/about']}>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/about" component={AboutPage} />
          </Switch>
        </MemoryRouter>
      );

      expect(screen.getByTestId('about')).toBeInTheDocument();
    });

    it('should render 404 for unknown routes', () => {
      render(
        <MemoryRouter initialEntries={['/unknown']}>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/about" component={AboutPage} />
            <Route component={NotFoundPage} />
          </Switch>
        </MemoryRouter>
      );

      expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });
  });

  // ============ Route with Parameters ============

  describe('Route Parameters', () => {
    it('should pass route params via match.params', () => {
      render(
        <MemoryRouter initialEntries={['/users/123']}>
          <Switch>
            <Route path="/users/:id" component={UserProfile} />
          </Switch>
        </MemoryRouter>
      );

      expect(screen.getByTestId('user-profile')).toHaveTextContent('User ID: 123');
    });

    it('should handle multiple route params', () => {
      const MultiParamComponent = ({ match }) => (
        <div data-testid="multi">
          {match.params.category}/{match.params.id}
        </div>
      );

      render(
        <MemoryRouter initialEntries={['/products/electronics/456']}>
          <Switch>
            <Route path="/products/:category/:id" component={MultiParamComponent} />
          </Switch>
        </MemoryRouter>
      );

      expect(screen.getByTestId('multi')).toHaveTextContent('electronics/456');
    });
  });

  // ============ Redirect ============

  describe('Redirect Component', () => {
    it('should redirect from old path to new path', () => {
      render(
        <MemoryRouter initialEntries={['/old-path']}>
          <Switch>
            <Redirect exact from="/old-path" to="/new-path" />
            <Route path="/new-path" render={() => <div data-testid="new">New Path</div>} />
          </Switch>
        </MemoryRouter>
      );

      expect(screen.getByTestId('new')).toBeInTheDocument();
    });
  });

  // ============ Protected Routes ============

  describe('Protected Routes', () => {
    it('should render component when authenticated', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Switch>
            <Route path="/login" component={LoginPage} />
            <ProtectedRoute
              path="/dashboard"
              component={DashboardPage}
              isAuthenticated={true}
            />
          </Switch>
        </MemoryRouter>
      );

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    it('should redirect to login when not authenticated', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Switch>
            <Route path="/login" component={LoginPage} />
            <ProtectedRoute
              path="/dashboard"
              component={DashboardPage}
              isAuthenticated={false}
            />
          </Switch>
        </MemoryRouter>
      );

      expect(screen.getByTestId('login')).toBeInTheDocument();
    });
  });

  // ============ History Object (v5 Pattern) ============

  describe('History Object', () => {
    it('should create memory history with initial entries', () => {
      const history = createMemoryHistory({ initialEntries: ['/'] });
      expect(history.location.pathname).toBe('/');
    });

    it('should navigate using history.push', () => {
      const history = createMemoryHistory({ initialEntries: ['/'] });

      // Test history API directly (Router re-render is async)
      expect(history.location.pathname).toBe('/');

      history.push('/about');

      expect(history.location.pathname).toBe('/about');
      expect(history.length).toBe(2);
    });

    it('should navigate back using history.goBack', () => {
      const history = createMemoryHistory({ initialEntries: ['/', '/about'], initialIndex: 1 });

      expect(history.location.pathname).toBe('/about');

      history.goBack();

      expect(history.location.pathname).toBe('/');
    });

    it('should replace history entry using history.replace', () => {
      const history = createMemoryHistory({ initialEntries: ['/'] });

      expect(history.length).toBe(1);

      history.push('/about');
      expect(history.length).toBe(2);
      expect(history.location.pathname).toBe('/about');

      history.replace('/replaced');
      expect(history.length).toBe(2); // Still 2, replaced
      expect(history.location.pathname).toBe('/replaced');
    });

    it('should render component based on history location', () => {
      const history = createMemoryHistory({ initialEntries: ['/about'] });

      render(
        <Router history={history}>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/about" component={AboutPage} />
          </Switch>
        </Router>
      );

      expect(screen.getByTestId('about')).toBeInTheDocument();
    });
  });

  // ============ Link Component ============

  describe('Link Component', () => {
    it('should render Link with correct href', () => {
      render(
        <MemoryRouter>
          <Link to="/about" data-testid="about-link">Go to About</Link>
        </MemoryRouter>
      );

      const link = screen.getByTestId('about-link');
      expect(link).toHaveAttribute('href', '/about');
    });

    it('should support Link with state', () => {
      render(
        <MemoryRouter>
          <Link
            to={{ pathname: '/about', state: { from: 'home' } }}
            data-testid="about-link"
          >
            Go to About
          </Link>
        </MemoryRouter>
      );

      const link = screen.getByTestId('about-link');
      expect(link).toBeInTheDocument();
    });
  });

  // ============ Switch Component ============

  describe('Switch Component', () => {
    it('should only render first matching route', () => {
      render(
        <MemoryRouter initialEntries={['/about']}>
          <Switch>
            <Route path="/about" render={() => <div data-testid="first">First Match</div>} />
            <Route path="/about" render={() => <div data-testid="second">Second Match</div>} />
          </Switch>
        </MemoryRouter>
      );

      expect(screen.getByTestId('first')).toBeInTheDocument();
      expect(screen.queryByTestId('second')).not.toBeInTheDocument();
    });
  });

  // ============ Exact Prop ============

  describe('Exact Prop', () => {
    it('should match exactly when exact prop is true', () => {
      render(
        <MemoryRouter initialEntries={['/users/123']}>
          <Switch>
            <Route exact path="/users" render={() => <div data-testid="users">Users List</div>} />
            <Route path="/users/:id" component={UserProfile} />
          </Switch>
        </MemoryRouter>
      );

      // Should NOT match exact /users
      expect(screen.queryByTestId('users')).not.toBeInTheDocument();
      // Should match /users/:id
      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
    });

    it('should match prefix without exact prop', () => {
      render(
        <MemoryRouter initialEntries={['/users/123']}>
          <Switch>
            <Route path="/users" render={() => <div data-testid="users">Users</div>} />
          </Switch>
        </MemoryRouter>
      );

      // Without exact, /users matches /users/123
      expect(screen.getByTestId('users')).toBeInTheDocument();
    });
  });

  // ============ Render Props Pattern ============

  describe('Render Props Pattern', () => {
    it('should use render prop with route props', () => {
      render(
        <MemoryRouter initialEntries={['/test?query=value']}>
          <Route
            path="/test"
            render={({ location }) => (
              <div data-testid="render-props">
                Path: {location.pathname}, Search: {location.search}
              </div>
            )}
          />
        </MemoryRouter>
      );

      expect(screen.getByTestId('render-props')).toHaveTextContent('Path: /test');
      expect(screen.getByTestId('render-props')).toHaveTextContent('Search: ?query=value');
    });
  });

  // ============ Documentation: v5 → v6 Breaking Changes ============

  describe('BREAKING CHANGES DOCUMENTATION (v5 → v6)', () => {
    /**
     * This test documents what needs to change when upgrading to React Router v6.
     * These are NOT functional tests - they document the migration requirements.
     */

    it('should document Switch → Routes change', () => {
      // v5: <Switch> wraps routes
      // v6: <Routes> wraps routes (renamed)
      expect(true).toBe(true);
    });

    it('should document component prop → element prop change', () => {
      // v5: <Route component={Component} />
      // v6: <Route element={<Component />} />
      expect(true).toBe(true);
    });

    it('should document Redirect → Navigate change', () => {
      // v5: <Redirect to="/path" />
      // v6: <Navigate to="/path" replace />
      expect(true).toBe(true);
    });

    it('should document history.push → useNavigate change', () => {
      // v5: history.push('/path') via props or createBrowserHistory
      // v6: const navigate = useNavigate(); navigate('/path')
      // NOTE: useNavigate only works in functional components!
      expect(true).toBe(true);
    });

    it('should document match.params → useParams change', () => {
      // v5: props.match.params.id
      // v6: const { id } = useParams()
      expect(true).toBe(true);
    });

    it('should document withRouter removal', () => {
      // v5: export default withRouter(Component)
      // v6: withRouter is removed, use hooks instead
      // BLOCKER: Class components cannot use hooks!
      expect(true).toBe(true);
    });
  });
});
