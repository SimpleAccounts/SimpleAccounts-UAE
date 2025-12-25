/**
 * RouteLoading component - Loading indicator for lazy-loaded routes
 * This component is displayed while route components are being loaded
 */
const RouteLoading = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default RouteLoading;
