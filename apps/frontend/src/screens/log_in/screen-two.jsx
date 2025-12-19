import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AuthActions } from 'services/global';
import { withNavigation } from 'utils/withNavigation';

const mapStateToProps = (state) => {
	return {};
};

const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
	};
};

const LogOut = ({ authActions, history }) => {
	useEffect(() => {
		// Call logout action which clears localStorage and updates Redux state
		authActions.logOut();
		// Also clear sessionStorage to ensure complete logout
		window.sessionStorage.clear();
		// Redirect to login page
		history.push('/login');
	}, [authActions, history]);

	return <div></div>;
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(LogOut));

