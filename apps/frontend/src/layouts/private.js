import React from 'react';
import { AlertTriangle } from 'lucide-react';

// Routes that should be accessible to all authenticated users without permission check
const PUBLIC_ROUTES = ['Dashboard'];

const PrivateRoute = ({ element, name, node }) => {
  console.log('[PrivateRoute Debug] Rendering route:', name, 'element:', element);
  console.log('[PrivateRoute Debug] user_role_list (node):', node);
  console.log('[PrivateRoute Debug] node.length:', node?.length);

  // Allow public routes without permission check
  if (PUBLIC_ROUTES.includes(name)) {
    console.log('[PrivateRoute Debug] Allowing public route:', name);
    return element;
  }

  // If role list is empty, allow rendering for Dashboard to prevent blank screen
  // This handles the case where role list hasn't loaded yet or user has no roles
  if (node.length === 0) {
    console.log('[PrivateRoute Debug] node.length is 0');
    console.log('[PrivateRoute Debug] Returning empty div for non-Dashboard route');
    return <div></div>;
  }

  let found = node.some(ele => ele.moduleName === name);
  console.log(
    '[PrivateRoute Debug] Module found in role list:',
    found,
    'Looking for moduleName:',
    name
  );
  console.log(
    '[PrivateRoute Debug] Available modules:',
    node.map(ele => ele.moduleName)
  );

  if (node && found) {
    console.log('[PrivateRoute Debug] Access granted, rendering element');
    return element;
  }

  console.log('[PrivateRoute Debug] Access denied, showing error message');
  return (
    <center>
      <div>
        <AlertTriangle className="h-4 w-4" />
        <br></br>
        <br></br>
        <b>You Are Not Allowed to view this page</b>
      </div>
    </center>
  );
};

export default PrivateRoute;
