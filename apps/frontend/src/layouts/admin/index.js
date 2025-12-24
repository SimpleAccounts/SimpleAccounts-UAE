import React, { Suspense } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { Home, ChevronRight } from 'lucide-react';
import { adminRoutes } from 'routes';
import { AuthActions, CommonActions } from 'services/global';
import PrivateRoute from '../private';
import navigation from 'constants/navigation';
import { Loading, Loader } from 'components';
import Sidebar from '../components/sidebar';
import { withNavigation } from 'utils/withNavigation';
import { data } from '../../screens/Language/index';
import LocalizedStrings from 'react-localization';
import config from '../../constants/config';

const mapStateToProps = state => {
  return {
    user_list: state.user.user_list,
    version: state.common.version,
    user_role_list: state.common.user_role_list,
  };
};
const mapDispatchToProps = dispatch => {
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
    this.setState(prevState => ({
      sidebarShow: !prevState.sidebarShow,
    }));
  };

  toggleSidebarMinimize = () => {
    this.setState(prevState => ({
      sidebarMinimized: !prevState.sidebarMinimized,
    }));
  };

  getBreadcrumbName = pathname => {
    // Convert absolute pathname to relative path for matching
    const relativePath = pathname.startsWith('/admin/')
      ? pathname.slice('/admin/'.length)
      : pathname.startsWith('/admin')
        ? pathname.slice('/admin'.length) || ''
        : pathname;

    const matched = adminRoutes.find(
      route => !route.redirect && route.path && route.path === relativePath
    );
    return matched?.name;
  };

  componentDidMount() {
    if (!window['localStorage'].getItem('accessToken')) {
      this.props.history.push('/login');
    } else {
      this.props.authActions
        .checkAuthStatus()
        .then(async action => {
          // Redux Toolkit thunks return action objects, check for fulfilled
          if (action && action.type && action.type.includes('fulfilled')) {
            const userData = action.payload;

            const companyAction = await this.props.commonActions.getCompanyDetails();
            if (companyAction && companyAction.type && companyAction.type.includes('fulfilled')) {
              this.setState({ registeredVat: companyAction.payload?.isRegisteredVat ?? true });
            }

            if (userData?.role?.roleCode) {
              await this.props.commonActions.getRoleList(userData.role.roleCode);
            }
            await this.props.commonActions.getCompanyCurrency();
            await this.props.commonActions.getCurrencyConversionList();
            await this.props.commonActions.getVatList();
            await this.props.commonActions.getCurrencyList();
            this.setState({
              loading: false,
            });
          } else {
            // Auth check failed - user not authenticated
            this.props.commonActions.tostifyAlert('error', 'Session Timed out');
            this.props.authActions.logOut();
            this.props.history.push('/login');
          }
        })
        .catch(err => {
          console.error('Auth check error:', err);
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
            position: 'top-right',
          });
        } else if (status === 'error') {
          toast.error(message, {
            position: 'top-right',
          });
        } else if (status === 'warn') {
          toast.warn(message, {
            position: 'top-right',
          });
        } else if (status === 'info') {
          toast.info(message, {
            position: 'top-right',
          });
        }
      };
      this.props.commonActions.setTostifyAlertFunc(toastifyAlert);
      this.props.authActions
        .getUserSubscription()
        .then(action => {
          // This thunk may fail for local dev (no subscription service), that's OK
          let message = null;
          if (action && action.type && action.type.includes('fulfilled')) {
            const data = action.payload;
            if (
              (data?.message && data.message.toLowerCase() === 'active') ||
              (data?.status && data.status.toLowerCase() === 'active')
            ) {
              message = null;
            } else {
              message = strings.SubscriptionExpiredMessage;
            }
          }
          // Don't show error for subscription check failures in local dev
          this.setState({ SubscriptionMessage: message });
        })
        .catch(err => {
          // Subscription check is optional, don't break the app
          this.setState({ SubscriptionMessage: null });
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
      return arr.items.find(path => path.name == name);
    }

    function filterPaths(arr, moduleName) {
      navigation.items.forEach(item => {
        if (item.children) {
          var childPath = item.children.find(child => {
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

    user_role_list.forEach(p => {
      filterPaths(finalArray, p.moduleName);
    });

    var correctSequence = navigation.items.map(item => item.name);

    finalArray.items = correctSequence.reduce((arr, name) => {
      const filteredItems = finalArray.items.slice();

      filteredItems.filter(item => {
        if (item.name === 'Master') {
          if (this.state.registeredVat === false) {
            item.children = item.children.filter(i => i.name !== 'VAT Category');
          }
        }
        return item;
      });

      const ele = filteredItems.find(item => item.name === name);
      if (ele) arr.push(ele);

      return arr;
    }, []);

    const pathname = this.props.location?.pathname || '';
    const breadcrumbName = this.getBreadcrumbName(pathname);

    return loading == true ? (
      <Loader loadingMsg={loadingMsg} />
    ) : (
      <div className="admin-container flex min-h-screen bg-neu-bg dark:bg-neu-bg-dark overflow-x-hidden">
        <div className="flex flex-1 p-4 gap-4 w-full max-w-full">
          <Sidebar
            items={finalArray.items}
            pathname={pathname}
            minimized={sidebarMinimized}
            onToggleMinimize={this.toggleSidebarMinimize}
            user={this.props.user_list}
            onLogout={() => {
              this.props.authActions.logOut();
              this.props.history.push('/login');
            }}
          />
          <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto bg-neu-bg dark:bg-neu-bg-dark rounded-2xl shadow-neu-out dark:shadow-neu-out-dark">
            {SubscriptionMessage && config.VALIDATE_SUBSCRIPTION && (
              <Alert variant="destructive" className="m-4">
                <AlertDescription>{SubscriptionMessage}</AlertDescription>
              </Alert>
            )}
            {/* Neumorphic Page Header with Breadcrumb */}
            <div className="px-6 py-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Page Title */}
                <div>
                  <h1
                    className="text-2xl font-bold"
                    style={{ color: 'var(--neu-text-primary, #1e3a5f)' }}
                  >
                    {breadcrumbName || 'Dashboard'}
                  </h1>
                  {/* Breadcrumb Trail */}
                  <nav className="flex items-center gap-2 mt-2">
                    <NavLink
                      to={config.BASE_ROUTE}
                      className="flex items-center gap-1.5 text-sm transition-colors hover:opacity-80"
                      style={{ color: 'var(--neu-primary, #1e6eff)' }}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'var(--neu-bg, #e8eef5)',
                          boxShadow:
                            '2px 2px 4px var(--neu-shadow-dark, #c4c9cf), -2px -2px 4px var(--neu-shadow-light, #ffffff)',
                        }}
                      >
                        <Home className="w-3.5 h-3.5" />
                      </div>
                      <span>Home</span>
                    </NavLink>
                    {breadcrumbName && (
                      <>
                        <ChevronRight
                          className="w-4 h-4"
                          style={{ color: 'var(--neu-text-muted, #98afc2)' }}
                        />
                        <span
                          className="text-sm font-medium px-3 py-1 rounded-lg"
                          style={{
                            color: 'var(--neu-text-secondary, #3d5a80)',
                            background: 'var(--neu-bg, #e8eef5)',
                            boxShadow:
                              'inset 2px 2px 4px var(--neu-shadow-dark, #c4c9cf), inset -2px -2px 4px var(--neu-shadow-light, #ffffff)',
                          }}
                        >
                          {breadcrumbName}
                        </span>
                      </>
                    )}
                  </nav>
                </div>
                {/* Optional: Date or other info on the right */}
                <div
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{
                    background: 'var(--neu-bg, #e8eef5)',
                    boxShadow:
                      '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
                    color: 'var(--neu-text-secondary, #3d5a80)',
                  }}
                >
                  <span>
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <Suspense fallback={Loading()}>
                <Toaster position="top-right" duration={1700} />
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
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(AdminLayout));
