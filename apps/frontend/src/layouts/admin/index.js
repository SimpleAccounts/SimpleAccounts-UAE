import React, { Suspense } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import { adminRoutes } from 'routes';
import { AuthActions, CommonActions } from 'services/global';
import PrivateRoute from '../private';
import navigation from 'constants/navigation';
import { Footer, Header, Loading, Loader } from 'components';
import './style.scss';
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
      // language: window['localStorage'].getItem('language'),
      registeredVat: true,
      loading: true,
      loadingMsg: 'Loading...',
      SubscriptionMessage: '',
      sidebarShow: false,
      sidebarMinimized: false,
      navDropdownOpen: {},
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

  toggleNavDropdown = key => {
    this.setState(prevState => ({
      navDropdownOpen: {
        ...prevState.navDropdownOpen,
        [key]: !prevState.navDropdownOpen[key],
      },
    }));
  };

  getNavDropdownOpen = (item, pathname) => {
    if (!item?.url) return false;

    if (Object.prototype.hasOwnProperty.call(this.state.navDropdownOpen, item.url)) {
      return Boolean(this.state.navDropdownOpen[item.url]);
    }

    return Boolean(item.children?.some(child => child?.url && pathname.startsWith(child.url)));
  };

  renderSidebarNavItems = (items, pathname) => {
    if (!Array.isArray(items) || items.length === 0) return null;

    return items.map(item => {
      if (Array.isArray(item.children) && item.children.length > 0) {
        const isOpen = this.getNavDropdownOpen(item, pathname);
        return (
          <li key={item.url} className={`nav-item nav-dropdown${isOpen ? ' open' : ''}`}>
            <a
              href="#/"
              className="nav-link nav-dropdown-toggle"
              onClick={event => {
                event.preventDefault();
                this.toggleNavDropdown(item.url);
              }}
            >
              {item.icon && <i className={`nav-icon ${item.icon}`} />}
              <span>{item.name}</span>
            </a>
            <ul className="nav-dropdown-items">
              {this.renderSidebarNavItems(item.children, pathname)}
            </ul>
          </li>
        );
      }

      return (
        <li key={item.url} className="nav-item">
          <NavLink to={item.url} className="nav-link" activeClassName="active" exact>
            {item.icon && <i className={`nav-icon ${item.icon}`} />}
            <span>{item.name}</span>
          </NavLink>
        </li>
      );
    });
  };

  getBreadcrumbName = pathname => {
    const matched = adminRoutes.find(
      route => !route.redirect && route.path && route.path === pathname
    );
    return matched?.name;
  };

  componentDidMount() {
    if (!window['localStorage'].getItem('accessToken')) {
      this.props.history.push('/login');
    } else {
      this.props.authActions
        .checkAuthStatus()
        .then(async response => {
          await this.props.commonActions.getCompanyDetails().then(res => {
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
        .catch(err => {
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
        .then(res => {
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
        .catch(err => {
          this.setState({ SubscriptionMessage: strings.SubscriptionErrorMessage });
        });
    }
  }

  render() {
    // strings.setLanguage(this.state.language);
    const containerStyle = {
      zIndex: 1999,
      closeOnClick: true,
      draggable: true,
    };
    const { loading, loadingMsg, SubscriptionMessage, sidebarShow, sidebarMinimized } = this.state;
    const { user_role_list, user_list } = this.props;
    var arr = [];

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
        //  if (moduleName === 'Template' && item.name === 'Template') {
        // 	arr.items.push({
        // 		name: item.name,
        // 		url: item.url,
        // 		icon: item.icon,
        // 	});
        //  }
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
      <div className="admin-container">
        <div
          className={`app${sidebarShow ? ' sidebar-show' : ''}${
            sidebarMinimized ? ' sidebar-minimized' : ''
          }`}
        >
          <header className="app-header">
            <Suspense fallback={Loading()}>
              <Header
                {...this.props}
                onToggleSidebar={this.toggleSidebar}
                onToggleSidebarMinimize={this.toggleSidebarMinimize}
              />
            </Suspense>
          </header>
          <div className="app-body">
            <div className={`sidebar${sidebarShow ? ' show' : ''}`}>
              <nav className="sidebar-nav">
                <ul className="nav">{this.renderSidebarNavItems(finalArray.items, pathname)}</ul>
              </nav>
              <button
                type="button"
                className="sidebar-minimizer"
                onClick={this.toggleSidebarMinimize}
                aria-label="Toggle sidebar"
              />
            </div>
            <main className="main">
              {SubscriptionMessage && config.VALIDATE_SUBSCRIPTION && (
                <div className="alert alert-danger mt-3 ml-3 mr-3 mb-0">{SubscriptionMessage}</div>
              )}
              <div className="breadcrumb-container">
                <Breadcrumb>
                  <BreadcrumbItem>
                    <NavLink to={config.BASE_ROUTE}>Home</NavLink>
                  </BreadcrumbItem>
                  {breadcrumbName && <BreadcrumbItem active>{breadcrumbName}</BreadcrumbItem>}
                </Breadcrumb>
              </div>
              <Container fluid className="p-20">
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
                        return <Route path={prop.path} key={key} element={<Navigate to={prop.pathTo} replace />} />;
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
              </Container>
            </main>
          </div>
          <footer className="app-footer">
            <Suspense fallback={Loading()}>
              <Footer {...this.props} />
            </Suspense>
          </footer>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminLayout);
