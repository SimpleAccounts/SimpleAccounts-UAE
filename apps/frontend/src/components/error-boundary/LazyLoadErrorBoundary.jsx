import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

/**
 * Error Boundary specifically for lazy loading errors
 * Catches chunk loading failures and provides user-friendly error messages
 */
class LazyLoadErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Lazy loading error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    // Clear error state and reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.message?.includes('Loading chunk') ||
        this.state.error?.message?.includes('Failed to fetch') ||
        this.state.error?.name === 'ChunkLoadError';

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-lg">
            <AlertTitle className="text-lg font-semibold">
              {isChunkError ? 'Failed to Load Component' : 'Something Went Wrong'}
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>
                {isChunkError
                  ? 'Unable to load the requested page. This might be due to a network issue or an outdated version of the application.'
                  : 'An unexpected error occurred while loading this component.'}
              </p>

              {isChunkError && (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Try the following:</p>
                  <ul className="list-inside list-disc space-y-1 pl-2">
                    <li>Check your internet connection</li>
                    <li>Refresh the page</li>
                    <li>Clear your browser cache</li>
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={this.handleReload}
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Reload Page
                </button>

                {this.props.onReset && (
                  <button
                    onClick={() => {
                      this.setState({ hasError: false, error: null, errorInfo: null });
                      this.props.onReset();
                    }}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Try Again
                  </button>
                )}
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 rounded border border-red-300 bg-red-50 p-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyLoadErrorBoundary;
