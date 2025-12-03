import React, { Suspense } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Container } from 'reactstrap';
import {
	AppAside,
	AppBreadcrumb,
	AppFooter,
	AppHeader,
	AppSidebar,
	AppSidebarFooter,
	AppSidebarForm,
	AppSidebarHeader,
	AppSidebarMinimizer,
	AppSidebarNav,
} from '@coreui/react';
import { ToastContainer, toast } from 'react-toastify';
import { adminRoutes } from 'routes';
import { AuthActions, CommonActions } from 'services/global';
import PrivateRoute from '../private';
import navigation from 'constants/navigation';
import { Aside, Header, Footer, Loading, Loader } from 'components';
import './style.scss';
import { data } from '../../screens/Language/index'
import LocalizedStrings from 'react-localization';
import config from '../../constants/config'

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
}
else {
	strings.setLanguage(localStorage.getItem('language'));
}
class AdminLayout extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			// language: window['localStorage'].getItem('language'),
			registeredVat: true,
			loading: true,
			loadingMsg: "Loading...",
			SubscriptionMessage: '',
		};
	}

	componentDidMount() {
		if (!window['localStorage'].getItem('accessToken')) {
			this.props.history.push('/login');
		} else {
			this.props.authActions
				.checkAuthStatus()
				.then(async (response) => {
					await this.props.commonActions.getCompanyDetails().then((res) => {
						this.setState({ registeredVat: res.data.isRegisteredVat })
					});
					await this.props.commonActions.getRoleList(response.data.role.roleCode);
					await this.props.commonActions.getCompanyCurrency();
					await this.props.commonActions.getCurrencyConversionList();
					await this.props.commonActions.getVatList();
					await this.props.commonActions.getCurrencyList();
					this.setState({
						loading: false,
					})
				})
				.catch((err) => {
					this.props.commonActions.tostifyAlert(
						'error',
						'Session Timed out',
					);
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
			this.props.authActions.getUserSubscription().then((res) => {
				let message = null;
				if (res.status === 200) {
					if ((res.data.message && res.data.message.toLowerCase() === 'active') || 
						(res.data.status && res.data.status.toLowerCase() === 'active')) {
						message = null;
					} else {
						message = strings.SubscriptionExpiredMessage;
					}
				} else {
					message = strings.SubscriptionFailedMessage;
				}
				this.setState({ SubscriptionMessage: message });
			}).catch((err) => {
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
		const { loading, loadingMsg, SubscriptionMessage } = this.state;
		const { user_role_list, user_list } = this.props;
		var arr = [];

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

		user_role_list.forEach((p) => {
			filterPaths(finalArray, p.moduleName);
		});

		var correctSequence = navigation.items.map(item => item.name);

		finalArray.items = correctSequence.reduce((arr, name) => {
			const filteredItems = finalArray.items.slice();

			filteredItems.filter((item) => {
				if (item.name === 'Master') {
					if (this.state.registeredVat === false) {
						item.children = item.children.filter((i) => i.name !== "VAT Category");

					}
				}
				return item;
			});

			const ele = filteredItems.find((item) => item.name === name);
			if (ele) arr.push(ele);

			return arr;
		}, []);

		return (
			loading == true ? <Loader loadingMsg={loadingMsg} /> :
				<div className="admin-container">
					<div className="app">
						<AppHeader fixed>
							<Suspense fallback={Loading()}>
								<Header {...this.props} />
							</Suspense>
						</AppHeader>
						<div className="app-body">
							<AppSidebar fixed display="lg">
								<AppSidebarHeader />
								<AppSidebarForm />
								<Suspense fallback={Loading()}>
									<AppSidebarNav navConfig={finalArray} {...this.props} />
								</Suspense>
								<AppSidebarMinimizer />
								<AppSidebarFooter />
							</AppSidebar>
							<main className="main">
								{SubscriptionMessage && config.VALIDATE_SUBSCRIPTION &&
									<div className="alert alert-danger mt-3 ml-3 mr-3 mb-0">
										{SubscriptionMessage}
									</div>
								}
								<div className="breadcrumb-container">
									<AppBreadcrumb appRoutes={adminRoutes} />
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
										<Switch>
											{adminRoutes?.map((prop, key) => {
												if (prop?.redirect) {
													return (
														<Redirect
															from={prop?.path}
															to={prop?.pathTo}
															key={key}
														/>
													);
												}
												return (
													<PrivateRoute
														path={prop.path}
														name={prop.name}
														node={user_role_list}
														component={prop.component}
														key={key}
														exact
													/>
												);
											})}
										</Switch>
									</Suspense>
								</Container>
							</main>
							<AppAside>
								<Suspense fallback={Loading()}>
									<Aside />
								</Suspense>
							</AppAside>
						</div>
						<AppFooter>
							<Suspense fallback={Loading()}>
								<Footer {...this.props} />
							</Suspense>
						</AppFooter>
					</div>
				</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminLayout);
