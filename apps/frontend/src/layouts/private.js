import React from 'react';

const PrivateRoute = ({ element, name, node }) => {
  console.log('[PrivateRoute Debug] Rendering route:', name, 'element:', element);
  console.log('[PrivateRoute Debug] user_role_list (node):', node);
  console.log('[PrivateRoute Debug] node.length:', node?.length);
	if (node.length === 0) {
		console.log('[PrivateRoute Debug] node.length is 0, returning empty div');
		return <div></div>;
	}

	let found = node.some((ele) => ele.moduleName === name);
	console.log('[PrivateRoute Debug] Module found in role list:', found, 'Looking for moduleName:', name);
	console.log('[PrivateRoute Debug] Available modules:', node.map(ele => ele.moduleName));

	if (node && found) {
		console.log('[PrivateRoute Debug] Access granted, rendering element');
		return element;
	}

	console.log('[PrivateRoute Debug] Access denied, showing error message');
	return (
		<center>
			<div>
				<i className="fas fa-exclamation-triangle fa-8x"></i>
				<br></br><br></br>
				<b>You Are Not Allowed to view this page</b>
			</div>
		</center>
	);
};

export default PrivateRoute;
