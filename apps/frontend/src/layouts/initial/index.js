import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { initialRoutes } from 'routes';
import { AuthActions, CommonActions } from 'services/global';
import config from 'constants/config';

const mapStateToProps = (state) => {
	return {};
};
const mapDispatchToProps = (dispatch) => {
	return {
		authActions: bindActionCreators(AuthActions, dispatch),
		commonActions: bindActionCreators(CommonActions, dispatch),
	};
};

class InitialLayout extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidMount() {
		if (window['sessionStorage'].getItem('accessToken')) {
			this.props.history.push(config.DASHBOARD?config.BASE_ROUTE:config.SECONDARY_BASE_ROUTE);
		}
		// this.props.commonActions.getSimpleVATVersion()
	}

	render() {
		return (
			<div className="initial-container">
				<Switch>
					{initialRoutes.map((prop, key) => {
						if (prop.redirect) {
							return <Redirect from={prop.path} to={prop.pathTo} key={key} />;
						}
						return (
							<Route path={prop.path} component={prop.component} key={key} />
						);
					})}
				</Switch>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(InitialLayout);
