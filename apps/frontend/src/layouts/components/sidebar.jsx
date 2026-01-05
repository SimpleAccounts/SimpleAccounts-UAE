import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  LogOut,
  LayoutDashboard,
  Receipt,
  Landmark,
  BarChart3,
  Package,
  Settings,
  Calculator,
  FileText,
  Briefcase,
  Wallet,
  User,
  Mail,
  UserCog,
  Users,
  Info,
  Palette,
  HelpCircle,
  Upload,
} from 'lucide-react';
import config from '../../constants/config';
import logo from 'assets/images/brand/logo.png';
import logoShort from 'assets/images/brand/sygnet.png';

// Icon mapping for navigation items
const iconMap = {
  Dashboard: LayoutDashboard,
  Income: Receipt,
  Expense: Wallet,
  Banking: Landmark,
  Accountant: Calculator,
  Report: BarChart3,
  Master: Settings,
  Inventory: Package,
  Payroll: Briefcase,
  // Add more mappings as needed
};

// Get icon for a menu item
const getIcon = name => {
  return iconMap[name] || FileText;
};

/**
 * Sidebar Component
 * Corporate minimal design - clean, professional navigation
 */
export function Sidebar({
  className,
  items = [],
  pathname = '',
  minimized = false,
  onToggleMinimize,
  user,
  onLogout,
}) {
  console.log('[Sidebar] Rendering with items:', items?.length, 'minimized:', minimized);
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState(() => {
    // Auto-expand menus that contain active items
    const expanded = {};
    items.forEach(item => {
      if (item.children?.some(child => child?.url && pathname.startsWith(child.url))) {
        expanded[item.name] = true;
      }
    });
    return expanded;
  });

  const toggleSubmenu = menuName => {
    setExpandedMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  // Corporate theme colors
  const theme = {
    bg: '#ffffff',
    bgSecondary: '#f8f9fa',
    primary: '#2064d8',
    secondary: '#21d8aa',
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    borderMedium: '#d1d5db',
    danger: '#ef4444',
  };

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <aside
        className={cn(
          'flex flex-col relative bg-white border-r',
          'transition-all duration-300 ease-in-out flex-shrink-0',
          minimized ? 'w-20' : 'min-w-64 w-fit',
          className
        )}
        style={{ borderColor: theme.border }}
      >
        <div className="p-4">
          <p className="text-sm text-corp-text-muted">No navigation items</p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'flex flex-col relative bg-white border-r',
        'transition-all duration-300 ease-in-out flex-shrink-0',
        minimized ? 'w-20' : 'min-w-64 w-fit',
        className
      )}
      style={{ borderColor: theme.border }}
    >
      {/* Logo Section */}
      <div
        className="flex items-center justify-center p-4 border-b"
        style={{ borderColor: theme.border }}
      >
        <div className={`flex items-center justify-center ${minimized ? 'w-full' : ''}`}>
          <img
            src={minimized ? logoShort : logo}
            alt="SimpleAccounts Logo"
            className={`drop-shadow-sm transition-all duration-200 ${minimized ? 'h-14 w-auto' : 'h-20 w-auto'}`}
          />
        </div>
      </div>

      {/* Toggle Button */}
      {onToggleMinimize && (
        <button
          onClick={onToggleMinimize}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center z-10 bg-white border shadow-sm hover:shadow-md transition-shadow"
          style={{ borderColor: theme.border }}
        >
          {minimized ? (
            <ChevronRight className="w-4 h-4 text-corp-text-secondary" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-corp-text-secondary" />
          )}
        </button>
      )}

      {/* Menu Items */}
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-1">
          {items.map((item, index) => {
            const Icon = getIcon(item.name);
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const isExpanded = expandedMenus[item.name];
            const isActive = item.url && pathname.startsWith(item.url);
            const isChildActive =
              hasChildren &&
              item.children.some(child => child?.url && pathname.startsWith(child.url));

            // Animation delay for staggered entrance
            const animationDelay = `${index * 50}ms`;

            return (
              <div
                key={item.name}
                className="animate-fade-in"
                style={{
                  animationDelay,
                  animationFillMode: 'backwards',
                }}
              >
                {/* Main Menu Item */}
                {hasChildren ? (
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200',
                      minimized ? 'justify-center' : '',
                      isChildActive || isExpanded
                        ? 'bg-corp-primary-light border border-corp-primary'
                        : 'hover:bg-corp-bg-secondary border border-transparent'
                    )}
                    title={minimized ? item.name : undefined}
                  >
                    {/* Icon */}
                    <Icon
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: isChildActive ? theme.primary : theme.textSecondary }}
                    />
                    {!minimized && (
                      <>
                        <span
                          className="flex-1 text-left font-medium text-sm"
                          style={{ color: isChildActive ? theme.primary : theme.textPrimary }}
                        >
                          {item.name}
                        </span>
                        <ChevronUp
                          className={cn(
                            'w-4 h-4 transition-transform duration-200',
                            isExpanded ? '' : 'rotate-180'
                          )}
                          style={{ color: theme.textMuted }}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  <NavLink
                    to={item.url}
                    className={cn(
                      'w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200',
                      minimized ? 'justify-center' : '',
                      isActive
                        ? 'bg-corp-primary text-white'
                        : 'hover:bg-corp-bg-secondary border border-transparent'
                    )}
                    title={minimized ? item.name : undefined}
                  >
                    {/* Icon */}
                    <Icon
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: isActive ? '#ffffff' : theme.textSecondary }}
                    />
                    {!minimized && (
                      <span
                        className="flex-1 text-left font-medium text-sm"
                        style={{ color: isActive ? '#ffffff' : theme.textPrimary }}
                      >
                        {item.name}
                      </span>
                    )}
                  </NavLink>
                )}

                {/* Submenu */}
                {hasChildren && !minimized && (
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: isExpanded ? '500px' : '0px',
                      opacity: isExpanded ? 1 : 0,
                    }}
                  >
                    <div className="flex mt-1">
                      {/* Indicator Line */}
                      <div
                        className="rounded-full ml-4 mr-2"
                        style={{
                          background: theme.secondary,
                          width: '2px',
                        }}
                      />

                      {/* Submenu Items */}
                      <div className="flex-1 space-y-0.5">
                        {item.children.map(child => {
                          const ChildIcon = getIcon(child.name) || FileText;
                          const isSubActive = child.url && pathname.startsWith(child.url);

                          return (
                            <NavLink
                              key={child.name || child.url}
                              to={child.url}
                              className={cn(
                                'flex items-center gap-2 py-1.5 px-3 rounded-md transition-all duration-200',
                                isSubActive
                                  ? 'bg-corp-primary-light border-l-2'
                                  : 'hover:bg-corp-bg-secondary border-l-2 border-transparent'
                              )}
                              style={{
                                borderLeftColor: isSubActive ? theme.primary : 'transparent',
                              }}
                            >
                              <ChildIcon
                                className="w-4 h-4"
                                style={{ color: isSubActive ? theme.primary : theme.textMuted }}
                              />
                              <span
                                className="text-sm whitespace-nowrap"
                                style={{
                                  color: isSubActive ? theme.primary : theme.textSecondary,
                                  fontWeight: isSubActive ? 600 : 400,
                                }}
                              >
                                {child.name}
                              </span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User Profile Section with Dropdown */}
      <div className="p-3 border-t" style={{ borderColor: theme.border }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded-lg cursor-pointer',
                'transition-all duration-200 hover:bg-corp-bg-secondary',
                minimized ? 'justify-center' : ''
              )}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                style={{ background: theme.primary }}
              >
                {user?.firstName?.[0] || user?.name?.[0] || 'U'}
                {user?.lastName?.[0] || ''}
              </div>
              {!minimized && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate text-corp-text-primary">
                      {user?.firstName
                        ? `${user.firstName} ${user.lastName || ''}`
                        : user?.name || 'User'}
                    </p>
                    <p className="text-xs truncate text-corp-text-muted">
                      {user?.role?.roleName || 'Administrator'}
                    </p>
                  </div>
                  <ChevronUp className="w-4 h-4 text-corp-text-muted" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={minimized ? 'center' : 'end'}
            side="top"
            className="w-56 mb-2"
          >
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-corp-text-primary">
                Hey{' '}
                <span className="text-corp-primary font-semibold">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
                </span>
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/admin/profile')} className="cursor-pointer">
              <User className="h-4 w-4 mr-2 text-corp-primary" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/admin/settings/general')}
              className="cursor-pointer"
            >
              <Mail className="h-4 w-4 mr-2 text-corp-primary" />
              General Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/admin/settings/user')}
              className="cursor-pointer"
            >
              <UserCog className="h-4 w-4 mr-2 text-corp-primary" />
              User
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/admin/settings/user-role')}
              className="cursor-pointer"
            >
              <Users className="h-4 w-4 mr-2 text-corp-primary" />
              Role
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/admin/settings/payrollsettings')}
              className="cursor-pointer"
            >
              <Wallet className="h-4 w-4 mr-2 text-corp-primary" />
              Payroll Settings
            </DropdownMenuItem>
            {config.SETTING_THEME && (
              <DropdownMenuItem
                onClick={() => navigate('/admin/settings/template')}
                className="cursor-pointer"
              >
                <Palette className="h-4 w-4 mr-2 text-corp-primary" />
                Mail Themes
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => navigate('/admin/settings/notesSettings')}
              className="cursor-pointer"
            >
              <Info className="h-4 w-4 mr-2 text-corp-primary" />
              Notes Settings
            </DropdownMenuItem>
            {config.SETTING_IMPORT && (
              <DropdownMenuItem
                onClick={() => navigate('/admin/settings/import')}
                className="cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2 text-corp-primary" />
                Import
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => navigate('/admin/settings/help')}
              className="cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 mr-2 text-corp-primary" />
              Help
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate('/theme-reference')}
              className="cursor-pointer"
            >
              <Palette className="h-4 w-4 mr-2 text-corp-primary" />
              Theme Reference
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onLogout && (
              <DropdownMenuItem
                onClick={onLogout}
                className="cursor-pointer text-corp-danger focus:text-corp-danger"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export default Sidebar;
