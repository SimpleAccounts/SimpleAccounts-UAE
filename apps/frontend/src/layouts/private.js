import React from 'react';
import { Route } from 'react-router-dom';
const permission = require('assets/images/settings/permission-removebg.png');
const PrivateRoute = ({ component: Component, name, node, ...rest }) => {
	
	if(node.length !== 0) {
		let found = node.some((ele) => ele.moduleName === name);
		return (
			<Route
				{...rest}
				render={(props) =>
					node && found ? (
						<Component {...props} />
					) : (
						<center>
						<div ><i className="fas fa-exclamation-triangle fa-8x" >
						</i>
						<br></br><br></br>
							<b>You Are Not Allowed to view this page</b>
						</div>
						</center>
					)
				}
			/>
		);
	}
	else {
		return (
			<div></div>
		);
	}
};

export default PrivateRoute;
