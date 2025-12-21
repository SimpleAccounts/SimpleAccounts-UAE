import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import PropTypes from 'prop-types';
import {
  Menu,
  Search,
  ChevronDown,
  User,
  Settings,
  UserCog,
  Users,
  Wallet,
  Palette,
  Info,
  Upload,
  HelpCircle,
  LogOut,
} from 'lucide-react';
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
          <Menu className="h-5 w-5 text-muted-foreground" />
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
          <Menu className="h-5 w-5 text-muted-foreground" />
        </button>
        <div className="ml-auto flex items-center">
          {/* Global Search */}
          <div className="header-search-container mr-3 d-none d-md-block">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0">
                <Search className="h-4 w-4 text-muted-foreground" />
              </span>
              <input
                type="text"
                className="form-control bg-transparent border-0"
                placeholder={strings.Search + '...'}
                aria-label="Search"
              />
            </div>
          </div>

          {/* Language Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="nav-link" style={{ border: 'none' }}>
                <span style={{ fontSize: '18px' }}>{language === 'en' ? '🇺🇸' : '🇦🇪'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => this.changeLanguage('en')}>
                <span className="mr-2">🇺🇸</span> English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => this.changeLanguage('ar')}>
                <span className="mr-2">🇦🇪</span> Arabic
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="nav-link flex items-center gap-2"
                style={{ border: 'none' }}
              >
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
                <span className="hidden md:inline-block flex items-center gap-1">
                  {strings.Hey} <i>{profile && profile.firstName + ' ' + profile.lastName}</i>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => this.props.history.push('/admin/profile')}>
                <User className="h-4 w-4 mr-2" /> {strings.Profile}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => this.props.history.push('/admin/settings/general')}>
                <Settings className="h-4 w-4 mr-2" /> {strings.GeneralSettings}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => this.props.history.push('/admin/settings/user')}>
                <UserCog className="h-4 w-4 mr-2" /> {strings.User}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => this.props.history.push('/admin/settings/user-role')}
              >
                <Users className="h-4 w-4 mr-2" /> {strings.Role}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => this.props.history.push('/admin/settings/payrollsettings')}
              >
                <Wallet className="h-4 w-4 mr-2" /> {strings.PayrollSettings}
              </DropdownMenuItem>
              {config.SETTING_THEME && (
                <DropdownMenuItem
                  onClick={() => this.props.history.push('/admin/settings/template')}
                >
                  <Palette className="h-4 w-4 mr-2" /> {strings.MailThemes}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => this.props.history.push('/admin/settings/notesSettings')}
              >
                <Info className="h-4 w-4 mr-2" /> {strings.Notes_Settings}
              </DropdownMenuItem>
              {config.SETTING_IMPORT && (
                <DropdownMenuItem onClick={() => this.props.history.push('/admin/settings/import')}>
                  <Upload className="h-4 w-4 mr-2" />
                  {strings.Import}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => this.props.history.push('/admin/settings/help')}>
                <HelpCircle className="h-4 w-4 mr-2" /> {strings.Help}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => this.props.history.push('/logout')}>
                <LogOut className="h-4 w-4 mr-2" /> {strings.LogOut}
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
