import React, { Suspense } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ToastContainer, toast } from 'react-toastify';
import { adminRoutes } from 'routes';
import { AuthActions, CommonActions } from 'services/global';
import PrivateRoute from '../private';
import navigation from 'constants/navigation';
import { Loading, Loader } from 'components';
import Header from '../components/header';
import Sidebar from '../components/sidebar';
import Footer from '../components/footer';
import { withNavigation } from 'utils/withNavigation';
import { data } from '../../screens/Language/index';
import LocalizedStrings from 'react-localization';
import config from '../../constants/config';

const mapStateToProps = (state) => {
  return {
    user_list: state.user.user_list,
    version: state.common.version,
    user_role_list: state.common.user_role_list,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    authActions: bindActionCreators(AuthActions, dispatch),
    commonActions: bindActionCreators(CommonActions, dispatch),
  };
};

let strings = new LocalizedStrings(data);
if (localStorage.getItem('language') == null) {
  strings.setLanguage('en');
} else {
  strings.setLanguage(localStorage.getItem('language'));
}

class AdminLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      registeredVat: true,
      loading: true,
      loadingMsg: 'Loading...',
      SubscriptionMessage: '',
      sidebarShow: false,
      sidebarMinimized: false,
    };
  }

  toggleSidebar = () => {
    this.setState((prevState) => ({
      sidebarShow: !prevState.sidebarShow,
    }));
  };

  toggleSidebarMinimize = () => {
    this.setState((prevState) => ({
      sidebarMinimized: !prevState.sidebarMinimized,
    }));
  };

  getBreadcrumbName = (pathname) => {
    const matched = adminRoutes.find(
      (route) => !route.redirect && route.path && route.path === pathname
    );
    return matched?.name;
  };

  componentDidMount() {
    if (!window['localStorage'].getItem('accessToken')) {
      this.props.history.push('/login');
    } else {
      this.props.authActions
        .checkAuthStatus()
        .then(async (response) => {
          await this.props.commonActions.getCompanyDetails().then((res) => {
            this.setState({ registeredVat: res.data.isRegisteredVat });
          });
          await this.props.commonActions.getRoleList(response.data.role.roleCode);
          await this.props.commonActions.getCompanyCurrency();
          await this.props.commonActions.getCurrencyConversionList();
          await this.props.commonActions.getVatList();
          await this.props.commonActions.getCurrencyList();
          this.setState({
            loading: false,
          });
        })
        .catch((err) => {
          this.props.commonActions.tostifyAlert('error', 'Session Timed out');
          this.props.authActions.logOut();
          this.props.history.push('/login');
        });
      this.props.commonActions.getSimpleAccountsVersion();
      const toastifyAlert = (status, message) => {
        if (!message) {
          message = 'Unexpected Error';
        }
        if (status === 'success') {
          toast.success(message, {
            position: toast.POSITION.TOP_RIGHT,
          });
        } else if (status === 'error') {
          toast.error(message, {
            position: toast.POSITION.TOP_RIGHT,
          });
        } else if (status === 'warn') {
          toast.warn(message, {
            position: toast.POSITION.TOP_RIGHT,
          });
        } else if (status === 'info') {
          toast.info(message, {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      };
      this.props.commonActions.setTostifyAlertFunc(toastifyAlert);
      this.props.authActions
        .getUserSubscription()
        .then((res) => {
          let message = null;
          if (res.status === 200) {
            if (
              (res.data.message && res.data.message.toLowerCase() === 'active') ||
              (res.data.status && res.data.status.toLowerCase() === 'active')
            ) {
              message = null;
            } else {
              message = strings.SubscriptionExpiredMessage;
            }
          } else {
            message = strings.SubscriptionFailedMessage;
          }
          this.setState({ SubscriptionMessage: message });
        })
        .catch((err) => {
          this.setState({ SubscriptionMessage: strings.SubscriptionErrorMessage });
        });
    }
  }

  render() {
    const containerStyle = {
      zIndex: 1999,
      closeOnClick: true,
      draggable: true,
    };
    const { loading, loadingMsg, SubscriptionMessage, sidebarMinimized } = this.state;
    const { user_role_list } = this.props;

    function parentPathPresent(arr, name) {
      return arr.items.find((path) => path.name == name);
    }

    function filterPaths(arr, moduleName) {
      navigation.items.forEach((item) => {
        if (item.children) {
          var childPath = item.children.find((child) => {
            return child.path == moduleName;
          });

          if (childPath) {
            var existingPath = parentPathPresent(arr, item.name);
            if (existingPath) {
              existingPath['children'].push(childPath);
            } else {
              arr.items.push({
                name: item.name,
                url: item.url,
                icon: item.icon,
                children: [childPath],
              });
            }
          }
        }
        if (moduleName === 'Dashboard' && item.name === strings.Dashboard && config.DASHBOARD) {
          arr.items.push({
            name: item.name,
            url: item.url,
            icon: item.icon,
          });
        }
        if (moduleName === 'Report' && item.name === strings.Report && config.REPORTS_MODULE) {
          arr.items.push({
            name: item.name,
            url: item.url,
            icon: item.icon,
          });
        }
        if (moduleName === 'Inventory Summary' && item.name === strings.Inventory) {
          arr.items.push({
            name: item.name,
            url: item.url,
            icon: item.icon,
          });
        }
      });
    }

    var finalArray = { items: [] };

    user_role_list.forEach((p) => {
      filterPaths(finalArray, p.moduleName);
    });

    var correctSequence = navigation.items.map((item) => item.name);

    finalArray.items = correctSequence.reduce((arr, name) => {
      const filteredItems = finalArray.items.slice();

      filteredItems.filter((item) => {
        if (item.name === 'Master') {
          if (this.state.registeredVat === false) {
            item.children = item.children.filter((i) => i.name !== 'VAT Category');
          }
        }
        return item;
      });

      const ele = filteredItems.find((item) => item.name === name);
      if (ele) arr.push(ele);

      return arr;
    }, []);

    const pathname = this.props.location?.pathname || '';
    const breadcrumbName = this.getBreadcrumbName(pathname);

    return loading == true ? (
      <Loader loadingMsg={loadingMsg} />
    ) : (
      <div className="flex min-h-screen flex-col">
        <Header
          {...this.props}
          onToggleSidebar={this.toggleSidebar}
          onToggleSidebarMinimize={this.toggleSidebarMinimize}
          navigationItems={finalArray.items}
          pathname={pathname}
        />
        <div className="flex flex-1">
          <Sidebar
            items={finalArray.items}
            pathname={pathname}
            minimized={sidebarMinimized}
          />
          <main className="flex-1 overflow-y-auto">
            {SubscriptionMessage && config.VALIDATE_SUBSCRIPTION && (
              <Alert variant="destructive" className="m-4">
                <AlertDescription>{SubscriptionMessage}</AlertDescription>
              </Alert>
            )}
            <div className="border-b bg-background px-6 py-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <NavLink to={config.BASE_ROUTE}>Home</NavLink>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {breadcrumbName && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage>{breadcrumbName}</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="p-6">
              <Suspense fallback={Loading()}>
                <ToastContainer
                  position="top-right"
                  autoClose={1700}
                  style={containerStyle}
                  closeOnClick
                  draggable
                />
                <Routes>
                  {adminRoutes?.map((prop, key) => {
                    if (prop?.redirect) {
                      return (
                        <Route
                          path={prop.path}
                          key={key}
                          element={<Navigate to={prop.pathTo} replace />}
                        />
                      );
                    }
                    return (
                      <Route
                        path={prop.path}
                        key={key}
                        element={
                          <PrivateRoute
                            element={<prop.component />}
                            name={prop.name}
                            node={user_role_list}
                          />
                        }
                      />
                    );
                  })}
                </Routes>
              </Suspense>
            </div>
          </main>
        </div>
        <Footer {...this.props} />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(AdminLayout));

