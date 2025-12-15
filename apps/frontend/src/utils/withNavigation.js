/**
 * Higher-Order Component for React Router v6 navigation in class components.
 * 
 * This HOC provides a v5-compatible history API for class components that
 * haven't been migrated to functional components yet.
 * 
 * Usage:
 *   import { withNavigation } from 'utils/withNavigation';
 *   export default withNavigation(MyComponent);
 * 
 * The component will receive:
 *   - this.props.history.push(path, state?)
 *   - this.props.history.replace(path, state?)
 *   - this.props.history.go(n)
 *   - this.props.history.goBack()
 *   - this.props.history.goForward()
 *   - this.props.match.params (route parameters)
 *   - this.props.location (current location object)
 */

import { useNavigate, useParams, useLocation } from 'react-router-dom';
import React from 'react';

/**
 * HOC that injects navigation capabilities into class components
 * @param {React.Component} Component - The class component to wrap
 * @returns {React.Component} Wrapped component with navigation props
 */
export function withNavigation(Component) {
  return function WrappedComponent(props) {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    
    // Create a history-like object compatible with v5 API
    const history = {
      push: (path, state) => {
        navigate(path, { state });
      },
      replace: (path, state) => {
        navigate(path, { replace: true, state });
      },
      go: (n) => {
        navigate(n);
      },
      goBack: () => {
        navigate(-1);
      },
      goForward: () => {
        navigate(1);
      },
      // Additional v5-compatible properties
      length: window.history.length,
      action: 'PUSH',
      location: location,
    };
    
    // Create match object compatible with v5 API
    const match = {
      params: params,
      path: location.pathname,
      url: location.pathname,
      isExact: true,
    };
    
    return (
      <Component
        {...props}
        history={history}
        match={match}
        location={location}
      />
    );
  };
}

/**
 * Hook version for functional components (alternative to HOC)
 * @returns {Object} Navigation object with history, match, and location
 */
export function useNavigation() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  
  return {
    history: {
      push: (path, state) => navigate(path, { state }),
      replace: (path, state) => navigate(path, { replace: true, state }),
      go: (n) => navigate(n),
      goBack: () => navigate(-1),
      goForward: () => navigate(1),
      length: window.history.length,
      action: 'PUSH',
      location: location,
    },
    match: {
      params: params,
      path: location.pathname,
      url: location.pathname,
      isExact: true,
    },
    location: location,
  };
}

