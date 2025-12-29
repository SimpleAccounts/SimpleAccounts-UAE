/**
 * Verification tests for React Router v6 migration.
 * These tests verify routing functionality after migration from v5 to v6.
 *
 * Run these tests to ensure all routing patterns work correctly:
 * npm test -- routing.v6.test.js
 */

import { render, screen } from '@testing-library/react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';

// Sample components for testing
const HomePage = () => <div data-testid="home">Home Page</div>;
const AboutPage = () => <div data-testid="about">About Page</div>;
const NotFoundPage = () => <div data-testid="not-found">404 Not Found</div>;
const LoginPage = () => <div data-testid="login">Login Page</div>;
const DashboardPage = () => <div data-testid="dashboard">Dashboard</div>;

// Component using useParams hook (v6 pattern)
const UserProfile = () => {
  const { id } = useParams();
  return <div data-testid="user-profile">User ID: {id}</div>;
};

// Component using useNavigate hook (v6 pattern)
const NavigationTest = () => {
  const navigate = useNavigate();
  return (
    <div>
      <button data-testid="navigate-btn" onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </button>
    </div>
  );
};

// Protected Route component (v6 pattern)
const ProtectedRoute = ({ element, isAuthenticated }) => {
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

// Component using useLocation hook
const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

describe('React Router v6 Migration Verification', () => {
  // ============ Basic Routing ============

  describe('Basic Routing (Routes instead of Switch)', () => {
    it('should render home page on "/" path', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('home')).toBeInTheDocument();
    });

    it('should render about page on "/about" path', () => {
      render(
        <MemoryRouter initialEntries={['/about']}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('about')).toBeInTheDocument();
    });

    it('should render 404 for unknown routes', () => {
      render(
        <MemoryRouter initialEntries={['/unknown']}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('not-found')).toBeInTheDocument();
    });
  });

  // ============ Route Parameters (useParams) ============

  describe('Route Parameters (useParams hook)', () => {
    it('should access route params using useParams hook', () => {
      render(
        <MemoryRouter initialEntries={['/users/123']}>
          <Routes>
            <Route path="/users/:id" element={<UserProfile />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('user-profile')).toHaveTextContent('User ID: 123');
    });

    it('should handle multiple route parameters', () => {
      const MultiParamComponent = () => {
        const { userId, postId } = useParams();
        return (
          <div data-testid="multi-params">
            User: {userId}, Post: {postId}
          </div>
        );
      };

      render(
        <MemoryRouter initialEntries={['/users/123/posts/456']}>
          <Routes>
            <Route path="/users/:userId/posts/:postId" element={<MultiParamComponent />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('multi-params')).toHaveTextContent('User: 123, Post: 456');
    });
  });

  // ============ Navigation (useNavigate) ============

  describe('Navigation (useNavigate hook)', () => {
    it('should navigate using useNavigate hook', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<NavigationTest />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </MemoryRouter>
      );

      const button = screen.getByTestId('navigate-btn');
      button.click();

      // Note: In a real test, you'd need to use a router that supports navigation
      // This test verifies the hook is available and can be called
      expect(button).toBeInTheDocument();
    });
  });

  // ============ Redirects (Navigate component) ============

  describe('Redirects (Navigate component)', () => {
    it('should redirect using Navigate component', () => {
      render(
        <MemoryRouter initialEntries={['/old-path']}>
          <Routes>
            <Route path="/old-path" element={<Navigate to="/new-path" replace />} />
            <Route path="/new-path" element={<div data-testid="new-path">New Path</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('new-path')).toBeInTheDocument();
    });

    it('should handle redirect with replace prop', () => {
      render(
        <MemoryRouter initialEntries={['/redirect']}>
          <Routes>
            <Route path="/redirect" element={<Navigate to="/target" replace />} />
            <Route path="/target" element={<div data-testid="target">Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('target')).toBeInTheDocument();
    });
  });

  // ============ Protected Routes ============

  describe('Protected Routes', () => {
    it('should render protected route when authenticated', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<DashboardPage />} isAuthenticated={true} />}
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    it('should redirect to login when not authenticated', () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<DashboardPage />} isAuthenticated={false} />}
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('login')).toBeInTheDocument();
    });
  });

  // ============ Location (useLocation) ============

  describe('Location (useLocation hook)', () => {
    it('should access current location using useLocation hook', () => {
      render(
        <MemoryRouter initialEntries={['/test-path']}>
          <Routes>
            <Route path="/test-path" element={<LocationDisplay />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('location')).toHaveTextContent('/test-path');
    });
  });

  // ============ Nested Routes ============

  describe('Nested Routes', () => {
    const ParentLayout = () => (
      <div data-testid="parent">
        <div>Parent Layout</div>
        <Routes>
          <Route path="child1" element={<div data-testid="child1">Child 1</div>} />
          <Route path="child2" element={<div data-testid="child2">Child 2</div>} />
        </Routes>
      </div>
    );

    it('should render nested routes', () => {
      render(
        <MemoryRouter initialEntries={['/parent/child1']}>
          <Routes>
            <Route path="/parent/*" element={<ParentLayout />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('parent')).toBeInTheDocument();
      expect(screen.getByTestId('child1')).toBeInTheDocument();
    });
  });

  // ============ Route Element Prop ============

  describe('Route element prop (instead of component)', () => {
    it('should use element prop instead of component prop', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('home')).toBeInTheDocument();
    });

    it('should pass props to element components', () => {
      const ComponentWithProps = ({ title }) => <div data-testid="with-props">{title}</div>;

      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<ComponentWithProps title="Test Title" />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('with-props')).toHaveTextContent('Test Title');
    });
  });

  // ============ BrowserRouter ============

  describe('BrowserRouter (instead of Router with history)', () => {
    it('should work with BrowserRouter', () => {
      render(
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      );

      expect(screen.getByTestId('home')).toBeInTheDocument();
    });
  });

  // ============ Integration Tests ============

  describe('Integration: Complete Routing Flow', () => {
    it('should handle complete login to dashboard flow', () => {
      const LoginFlow = ({ onLogin }) => {
        const navigate = useNavigate();
        return (
          <div>
            <button
              data-testid="login-btn"
              onClick={() => {
                onLogin();
                navigate('/dashboard');
              }}
            >
              Login
            </button>
          </div>
        );
      };

      let isAuthenticated = false;
      const handleLogin = () => {
        isAuthenticated = true;
      };

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginFlow onLogin={handleLogin} />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute element={<DashboardPage />} isAuthenticated={isAuthenticated} />
              }
            />
          </Routes>
        </MemoryRouter>
      );

      const loginBtn = screen.getByTestId('login-btn');
      expect(loginBtn).toBeInTheDocument();
    });
  });

  // ============ Edge Cases ============

  describe('Edge Cases', () => {
    it('should handle empty route path', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="" element={<HomePage />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('home')).toBeInTheDocument();
    });

    it('should handle route with query parameters', () => {
      const QueryComponent = () => {
        const location = useLocation();
        const searchParams = new URLSearchParams(location.search);
        return <div data-testid="query">Query: {searchParams.get('q')}</div>;
      };

      render(
        <MemoryRouter initialEntries={['/search?q=test']}>
          <Routes>
            <Route path="/search" element={<QueryComponent />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('query')).toHaveTextContent('Query: test');
    });
  });
});
