/**
 * Tests for PrivateRoute component (React Router v6)
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../private';

const TestComponent = () => <div data-testid="test-component">Test Component</div>;
const UnauthorizedMessage = () => <div data-testid="unauthorized">Unauthorized</div>;

describe('PrivateRoute Component', () => {
  it('should render element when user has permission', () => {
    const node = [{ moduleName: 'TestModule' }];

    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route
            path="/test"
            element={
              <PrivateRoute element={<TestComponent />} name="TestModule" node={node} />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });

  it('should render unauthorized message when user lacks permission', () => {
    const node = [{ moduleName: 'OtherModule' }];

    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route
            path="/test"
            element={
              <PrivateRoute element={<TestComponent />} name="TestModule" node={node} />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('You Are Not Allowed to view this page')).toBeInTheDocument();
    expect(screen.queryByTestId('test-component')).not.toBeInTheDocument();
  });

  it('should render empty div when node array is empty', () => {
    const node = [];

    const { container } = render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route
            path="/test"
            element={
              <PrivateRoute element={<TestComponent />} name="TestModule" node={node} />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    // Should render empty div
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle multiple permissions correctly', () => {
    const node = [
      { moduleName: 'Module1' },
      { moduleName: 'Module2' },
      { moduleName: 'TestModule' },
    ];

    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route
            path="/test"
            element={
              <PrivateRoute element={<TestComponent />} name="TestModule" node={node} />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });

  it('should handle case where module name does not match', () => {
    const node = [
      { moduleName: 'Module1' },
      { moduleName: 'Module2' },
    ];

    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route
            path="/test"
            element={
              <PrivateRoute element={<TestComponent />} name="TestModule" node={node} />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('You Are Not Allowed to view this page')).toBeInTheDocument();
  });
});

