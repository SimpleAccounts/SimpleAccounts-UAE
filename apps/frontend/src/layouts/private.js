import React from 'react';

const PrivateRoute = ({ element, name, node }) => {
	if (node.length === 0) {
		return <div></div>;
	}

	let found = node.some((ele) => ele.moduleName === name);

	if (node && found) {
		return element;
	}

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
