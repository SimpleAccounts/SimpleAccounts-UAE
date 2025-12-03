import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AuthActions } from 'services/global';

const mapStateToProps = (state) => {
	return {
	};
};
const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
	};
};

class LogIn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount = () => {
		this.props.authActions.logOut();
		this.props.history.push('/login');
	};

	
	render() {
	
		return (
			<div></div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(LogIn);
