import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import PropTypes from 'prop-types';
import './style.scss';
import logo from 'assets/images/brand/logo.png';
import sygnet from 'assets/images/brand/sygnet.png';
import avatar from 'assets/images/avatars/default-avatar.jpg';
import { data } from '../../screens/Language/index';
import LocalizedStrings from 'react-localization';
import config from '../../constants/config';
const propTypes = {
  children: PropTypes.node,
  onToggleSidebar: PropTypes.func,
  onToggleSidebarMinimize: PropTypes.func,
};

const defaultProps = {
  onToggleSidebar: undefined,
  onToggleSidebarMinimize: undefined,
};

const mapStateToProps = state => {
  return {
    profile: state.auth.profile,
  };
};

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
    const { language } = this.state;
    return (
      <React.Fragment>
        <button
          type="button"
          className="d-lg-none navbar-toggler"
          onClick={this.props.onToggleSidebar}
        >
          <i className="fa fa-bars header-sidebar-icon"></i>
        </button>
        <NavLink
          className="navbar-brand p-2 ml-3"
          to={config.DASHBOARD ? config.BASE_ROUTE : config.SECONDARY_BASE_ROUTE}
        >
          <img
            className="navbar-brand-full"
            src={logo}
            width="115%"
            height="auto"
            alt="CoreUI Logo"
          />
          <img
            className="navbar-brand-minimized"
            src={sygnet}
            width="100%"
            height="auto"
            alt="CoreUI Logo"
          />
        </NavLink>
        <button
          type="button"
          className="d-md-down-none navbar-toggler"
          onClick={this.props.onToggleSidebarMinimize}
        >
          <i className="fa fa-bars header-sidebar-icon"></i>
        </button>
        <div className="ml-auto flex items-center">
          {/* Language Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="nav-link" style={{ border: 'none' }}>
                <i className={language === 'en' ? 'flag-icon flag-icon-us' : 'flag-icon flag-icon-ae'} title="us" id="us"></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => this.changeLanguage('en')}>
                <i className="flag-icon flag-icon-us mr-2" /> English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => this.changeLanguage('ar')}>
                <i className="flag-icon flag-icon-ae mr-2" /> Arabic
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="nav-link flex items-center gap-2" style={{ border: 'none' }}>
                <img
                  src={
                    profile && profile.profileImageBinary !== null
                      ? 'data:image/jpg;base64,' + profile.profileImageBinary
                      : avatar
                  }
                  className="img-avatar"
                  alt=""
                  style={{ height: '35px', width: '35px' }}
                />
                <span className="hidden md:inline-block">
                  {strings.Hey} <i>{profile && profile.firstName + ' ' + profile.lastName}</i>
                  <i className="fas fa-angle-down ml-2"></i>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => this.props.history.push('/admin/profile')}>
                <i className="fas fa-user mr-2"></i> {strings.Profile}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => this.props.history.push('/admin/settings/general')}>
                <i className="fas fa-envelope mr-2"></i> {strings.GeneralSettings}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => this.props.history.push('/admin/settings/user')}>
                <i className="fas fa-user-tag mr-2"></i> {strings.User}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => this.props.history.push('/admin/settings/user-role')}>
                <i className="fas fa-users mr-2"></i> {strings.Role}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => this.props.history.push('/admin/settings/payrollsettings')}
              >
                <i className="fas fa-money-check-alt mr-2"></i> {strings.PayrollSettings}
              </DropdownMenuItem>
              {config.SETTING_THEME && (
                <DropdownMenuItem onClick={() => this.props.history.push('/admin/settings/template')}>
                  <i className="fas fa-palette mr-2"></i> {strings.MailThemes}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => this.props.history.push('/admin/settings/notesSettings')}
              >
                <i className="fas fa-info-circle mr-2"></i> {strings.Notes_Settings}
              </DropdownMenuItem>
              {config.SETTING_IMPORT && (
                <DropdownMenuItem onClick={() => this.props.history.push('/admin/settings/import')}>
                  <i className="fas fa-palette mr-2"></i>
                  {strings.Import}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => this.props.history.push('/admin/settings/help')}>
                <i className="fas fa-info-circle mr-2"></i> {strings.Help}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => this.props.history.push('/logout')}>
                <i className="fa fa-sign-out header-icon mr-2"></i> {strings.LogOut}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </React.Fragment>
    );
  }
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default connect(mapStateToProps, null)(Header);
