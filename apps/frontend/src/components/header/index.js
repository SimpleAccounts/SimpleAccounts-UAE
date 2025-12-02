import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux'
import {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
	Nav,
	NavItem,
	UncontrolledDropdown,
	// Badge
} from 'reactstrap';
import PropTypes from 'prop-types';
import {
	AppAsideToggler,
	AppNavbarBrand,
	AppSidebarToggler,
} from '@coreui/react';
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import sygnet from 'assets/images/brand/sygnet.png';
import avatar from 'assets/images/avatars/default-avatar.jpg';
import {data}  from '../../screens/Language/index'
import LocalizedStrings from 'react-localization';
// import avatar from 'assets/images/avatars/6.jpg'
import config from '../../constants/config'
import { Config } from 'svgo';
const propTypes = {
	children: PropTypes.node,
};

const defaultProps = {};

const mapStateToProps = (state) => {
	return {
		profile: state.auth.profile,
	};
};

// mapDispatchToProps = (dispatch) => {(
//   authAction: BindActionCreators(AuthAction,dispatch)
// )}

let strings = new LocalizedStrings(data);
class Header extends Component {
	constructor(props) {
		super(props);
		this.state = {
			language: window['localStorage'].getItem('language'),
			profilePic: [],
		};

		this.signOut = this.signOut.bind(this);
	}

	componentDidMount() {}

	signOut() {
		this.props.authActions.logOut();
		this.props.history.push('/login');
	}

	render() {
		strings.setLanguage(this.state.language);
		const { profile } = this.props;
		return (
			<React.Fragment>
				<AppSidebarToggler className="d-lg-none" display="md" mobile />
				<AppNavbarBrand
					className="p-2 ml-3 "
					tag={NavLink}
					to={config.DASHBOARD ?config.BASE_ROUTE:config.SECONDARY_BASE_ROUTE}
					full={{
						src: logo,
						width: '115%',
						height: 'auto',
						alt: 'CoreUI Logo',
					}}
					minimized={{
						src: sygnet,
						width: '100%',
						height: 'auto',
						alt: 'CoreUI Logo',
					}}
				/>
				<AppSidebarToggler className="d-md-down-none" display="lg">
					<i className="fa fa-bars header-sidebar-icon"></i>
				</AppSidebarToggler>
				<Nav className="ml-auto" navbar>
					{/* <NavItem>
						<AppAsideToggler className="d-md-down-none">
							<i className="fa fa-bell header-icon"></i>
						</AppAsideToggler>
					</NavItem> */}
						<img
								src={
									profile && profile.profileImageBinary !== null
										? 'data:image/jpg;base64,' + profile.profileImageBinary
										: avatar
								}
								className="img-avatar mr-2"
								alt=""
							/>
					<UncontrolledDropdown nav direction="down">
						<DropdownToggle nav>
						{strings.Hey}	<i>{profile && profile.firstName +" "+ profile.lastName}</i>
							<i className="fas fa-angle-down ml-2 mr-3"></i>
						</DropdownToggle>
						<DropdownMenu right>
							<DropdownItem
								onClick={() => this.props.history.push('/admin/profile')}
							>
								<i className="fas fa-user"></i>  {strings.Profile }
							</DropdownItem>
							<DropdownItem
								onClick={() =>
									this.props.history.push('/admin/settings/general')
								}
							>
								<i className="fas fa-envelope"></i>  {strings.GeneralSettings}
							</DropdownItem>
							{/* <DropdownItem onClick={() => this.props.history.push('/admin/settings/transaction-category')}>
									<i className="icon-graph"></i> Transaction Category
								</DropdownItem> */}
							<DropdownItem
								onClick={() => this.props.history.push('/admin/settings/user')}
							>
								<i className="fas fa-user-tag"></i>  {strings.User}
							</DropdownItem>
							<DropdownItem
								onClick={() =>
									this.props.history.push('/admin/settings/user-role')
								}
							>
								<i className="fas fa-users"></i> {strings.Role}
							</DropdownItem>
							<DropdownItem
								onClick={() =>
									this.props.history.push('/admin/settings/payrollsettings')
								}
							>
								<i className="fas fa-money-check-alt"></i> {strings.PayrollSettings}
							</DropdownItem>
							{config.SETTING_THEME && <DropdownItem
                                onClick={() =>
                                    this.props.history.push('/admin/settings/template')
                                }
                            >
                             <i className="fas fa-palette"></i> {strings.MailThemes}
                            </DropdownItem>}
							<DropdownItem
								onClick={() => this.props.history.push('/admin/settings/notesSettings')}
							>
								<i className="fas fa-info-circle"></i> {strings.Notes_Settings}
							</DropdownItem>
							{config.SETTING_IMPORT && <DropdownItem
                                onClick={() =>
                                    this.props.history.push('/admin/settings/import')
                                }
                            >
                             <i className="fas fa-palette"></i>{strings.Import}
                            </DropdownItem>}
							{/* <DropdownItem
								onClick={() =>
									this.props.history.push('/admin/settings/notification')
								}
							>
								<i className="fas fa-bell"></i> Notifications
							</DropdownItem> */}
							{/* <DropdownItem
								onClick={() =>
									this.props.history.push('/admin/settings/data-backup')
								}
							>
								<i className="fas fa-hdd-o"></i> Data Backup
							</DropdownItem> */}
							<DropdownItem
								onClick={() => this.props.history.push('/admin/settings/help')}
							>
								<i className="fas fa-info-circle"></i> {strings.Help}
							</DropdownItem>
							<DropdownItem
								onClick={() => this.props.history.push('/logout')}
								>
								<i className="fa fa-sign-out header-icon mr-1"></i> {strings.LogOut}
							</DropdownItem>
						</DropdownMenu>
					</UncontrolledDropdown>
				</Nav>
			</React.Fragment>
		);
	}
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default connect(mapStateToProps, null)(Header);
