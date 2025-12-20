import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { initialRoutes } from 'routes';
import { AuthActions, CommonActions } from 'services/global';
import { withNavigation } from 'utils/withNavigation';
import config from 'constants/config';

const mapStateToProps = state => {
  return {};
};
const mapDispatchToProps = dispatch => {
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
      this.props.history.push(config.DASHBOARD ? config.BASE_ROUTE : config.SECONDARY_BASE_ROUTE);
    }
    // this.props.commonActions.getSimpleAccountsVersion()
  }

  render() {
    return (
      <div className="initial-container">
        <Routes>
          {initialRoutes.map((prop, key) => {
            if (prop.redirect) {
              return (
                <Route path={prop.path} key={key} element={<Navigate to={prop.pathTo} replace />} />
              );
            }
            return <Route path={prop.path} element={<prop.component />} key={key} />;
          })}
        </Routes>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(InitialLayout));
