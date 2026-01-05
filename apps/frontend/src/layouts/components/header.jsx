import { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Info, LogOut, Mail, Menu, Palette, User, UserCog, Users, Wallet } from 'lucide-react';
import { data } from '../../screens/Language/index';
import LocalizedStrings from 'react-localization';
import logo from 'assets/images/brand/logo.png';
import sygnet from 'assets/images/brand/sygnet.png';
import avatar from 'assets/images/avatars/default-avatar.jpg';
import config from '../../constants/config';
import MobileNav from './mobile-nav';

const propTypes = {
  onToggleSidebar: PropTypes.func,
  onToggleSidebarMinimize: PropTypes.func,
  profile: PropTypes.object,
  authActions: PropTypes.object,
  history: PropTypes.object,
  navigationItems: PropTypes.array,
  pathname: PropTypes.string,
};

const defaultProps = {
  onToggleSidebar: undefined,
  onToggleSidebarMinimize: undefined,
  profile: null,
  authActions: null,
  history: null,
  navigationItems: [],
  pathname: '',
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
      language: window['localStorage'].getItem('language') || 'en',
    };
    this.signOut = this.signOut.bind(this);
  }

  componentDidMount() {
    strings.setLanguage(this.state.language);
  }

  signOut() {
    if (this.props.authActions) {
      this.props.authActions.logOut();
    }
    if (this.props.history) {
      this.props.history.push('/login');
    }
  }

  render() {
    strings.setLanguage(this.state.language);
    const { profile, onToggleSidebar, onToggleSidebarMinimize, navigationItems, pathname } =
      this.props;
    const baseRoute = config.DASHBOARD ? config.BASE_ROUTE : config.SECONDARY_BASE_ROUTE;

    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white shadow-corp-sm">
        <div className="flex h-16 items-center px-4 w-full">
          {/* Mobile menu trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden mr-2"
                onClick={onToggleSidebar}
                aria-label="Toggle mobile menu"
              >
                <Menu className="h-5 w-5 text-corp-text-secondary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <MobileNav items={navigationItems} pathname={pathname} />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <NavLink to={baseRoute} className="mr-4 flex items-center space-x-2">
            <img src={logo} alt="SimpleAccounts Logo" className="h-10 w-auto hidden lg:block" />
            <img src={sygnet} alt="SimpleAccounts" className="h-8 w-8 lg:hidden" />
          </NavLink>

          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={onToggleSidebarMinimize}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-corp-text-secondary" />
          </Button>

          {/* User menu */}
          <div className="ml-auto flex items-center space-x-3">
            <span className="text-sm text-corp-text-secondary hidden md:block">
              {strings.Hey}{' '}
              <span className="font-semibold text-corp-primary">
                {profile && `${profile.firstName} ${profile.lastName}`}
              </span>
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        profile && profile.profileImageBinary !== null
                          ? `data:image/jpg;base64,${profile.profileImageBinary}`
                          : avatar
                      }
                      alt={profile ? `${profile.firstName} ${profile.lastName}` : 'User'}
                    />
                    <AvatarFallback>
                      {profile
                        ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-[100]">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-corp-text-primary">
                    {strings.Hey}{' '}
                    <span className="text-corp-primary font-semibold">
                      {profile && `${profile.firstName} ${profile.lastName}`}
                    </span>
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => this.props.history?.push('/admin/profile')}
                  className="cursor-pointer"
                >
                  <User className="h-4 w-4 text-corp-primary" />
                  {strings.Profile}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => this.props.history?.push('/admin/settings/general')}
                  className="cursor-pointer"
                >
                  <Mail className="h-4 w-4 text-corp-primary" />
                  {strings.GeneralSettings}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => this.props.history?.push('/admin/settings/user')}
                  className="cursor-pointer"
                >
                  <UserCog className="h-4 w-4 text-corp-primary" />
                  {strings.User}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => this.props.history?.push('/admin/settings/user-role')}
                  className="cursor-pointer"
                >
                  <Users className="h-4 w-4 text-corp-primary" />
                  {strings.Role}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => this.props.history?.push('/admin/settings/payrollsettings')}
                  className="cursor-pointer"
                >
                  <Wallet className="h-4 w-4 text-corp-primary" />
                  {strings.PayrollSettings}
                </DropdownMenuItem>
                {config.SETTING_THEME && (
                  <DropdownMenuItem
                    onClick={() => this.props.history?.push('/admin/settings/template')}
                    className="cursor-pointer"
                  >
                    <Palette className="h-4 w-4 text-corp-primary" />
                    {strings.MailThemes}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => this.props.history?.push('/admin/settings/notesSettings')}
                  className="cursor-pointer"
                >
                  <Info className="h-4 w-4 text-corp-primary" />
                  {strings.Notes_Settings}
                </DropdownMenuItem>
                {config.SETTING_IMPORT && (
                  <DropdownMenuItem
                    onClick={() => this.props.history?.push('/admin/settings/import')}
                    className="cursor-pointer"
                  >
                    <Palette className="h-4 w-4 text-corp-primary" />
                    {strings.Import}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => this.props.history?.push('/admin/settings/help')}
                  className="cursor-pointer"
                >
                  <Info className="h-4 w-4 text-corp-primary" />
                  {strings.Help}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={this.signOut}
                  className="cursor-pointer text-corp-danger"
                >
                  <LogOut className="h-4 w-4" />
                  {strings.LogOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    );
  }
}

Header.propTypes = propTypes;
Header.defaultProps = defaultProps;

export default connect(mapStateToProps, null)(Header);
