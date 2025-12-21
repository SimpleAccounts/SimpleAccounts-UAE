import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from 'lucide-react';

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
 * Neumorphic collapsible navigation sidebar matching theme reference design
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

  // Theme colors (matching the neumorphic theme)
  const theme = {
    bg: '#e8eef5',
    primary: '#1e6eff',
    secondary: '#00c896',
    warning: '#f59e0b',
    textPrimary: '#1e3a5f',
    textSecondary: '#3d5a80',
    textMuted: '#98afc2',
    shadowDark: '#c4c9cf',
    shadowLight: '#ffffff',
  };

  const shadows = {
    raised: {
      sm: '3px 3px 6px #c4c9cf, -3px -3px 6px #ffffff',
      md: '4px 4px 8px #c4c9cf, -4px -4px 8px #ffffff',
      lg: '6px 6px 12px #c4c9cf, -6px -6px 12px #ffffff',
      xs: '2px 2px 4px #c4c9cf, -2px -2px 4px #ffffff',
    },
  };

  const gradients = {
    primary: 'linear-gradient(145deg, #1e6eff, #0052cc)',
  };

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <aside
        className={cn(
          'hidden md:flex flex-col relative',
          'transition-all duration-300 ease-in-out flex-shrink-0 rounded-2xl',
          minimized ? 'w-20' : 'min-w-64 w-fit',
          className
        )}
        style={{
          background: theme.bg,
          boxShadow: shadows.raised.lg,
        }}
      >
        <div className="p-4">
          <p className="text-sm" style={{ color: theme.textMuted }}>
            No navigation items
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col relative',
        'transition-all duration-300 ease-in-out flex-shrink-0 rounded-2xl',
        minimized ? 'w-20' : 'min-w-64 w-fit',
        className
      )}
      style={{
        background: theme.bg,
        boxShadow: shadows.raised.lg,
      }}
    >
      {/* Logo Section */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.shadowDark }}
      >
        <div className={`flex items-center gap-3 ${minimized ? 'justify-center w-full' : ''}`}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ background: gradients.primary, boxShadow: shadows.raised.sm }}
          >
            S
          </div>
          {!minimized && (
            <span className="font-bold text-lg" style={{ color: theme.textPrimary }}>
              Simple<span style={{ color: theme.primary }}>Accounts</span>
            </span>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      {onToggleMinimize && (
        <button
          onClick={onToggleMinimize}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center z-10"
          style={{ background: theme.bg, boxShadow: shadows.raised.sm }}
        >
          {minimized ? (
            <ChevronRight className="w-4 h-4" style={{ color: theme.textSecondary }} />
          ) : (
            <ChevronLeft className="w-4 h-4" style={{ color: theme.textSecondary }} />
          )}
        </button>
      )}

      {/* Menu Items */}
      <ScrollArea className="flex-1">
        <nav className="p-3 space-y-2">
          {items.map(item => {
            const Icon = getIcon(item.name);
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const isExpanded = expandedMenus[item.name];
            const isActive = item.url && pathname.startsWith(item.url);
            const isChildActive =
              hasChildren &&
              item.children.some(child => child?.url && pathname.startsWith(child.url));

            return (
              <div key={item.name}>
                {/* Main Menu Item */}
                {hasChildren ? (
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 ${
                      minimized ? 'justify-center' : ''
                    }`}
                    style={{
                      background: theme.bg,
                      boxShadow: isChildActive ? 'none' : shadows.raised.sm,
                      border:
                        isChildActive || isExpanded
                          ? `2px solid ${theme.warning}`
                          : '2px solid transparent',
                    }}
                    title={minimized ? item.name : undefined}
                  >
                    {/* Icon Container */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: theme.bg,
                        boxShadow: shadows.raised.xs,
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: isChildActive ? theme.primary : theme.textSecondary }}
                      />
                    </div>
                    {!minimized && (
                      <>
                        <span
                          className="flex-1 text-left font-medium text-sm"
                          style={{ color: isChildActive ? theme.primary : theme.textPrimary }}
                        >
                          {item.name}
                        </span>
                        <ChevronUp
                          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? '' : 'rotate-180'}`}
                          style={{ color: theme.textMuted }}
                        />
                      </>
                    )}
                  </button>
                ) : (
                  <NavLink
                    to={item.url}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 ${
                      minimized ? 'justify-center' : ''
                    }`}
                    style={{
                      background: theme.bg,
                      boxShadow: isActive ? 'none' : shadows.raised.sm,
                      border: isActive ? `2px solid ${theme.warning}` : '2px solid transparent',
                    }}
                    title={minimized ? item.name : undefined}
                  >
                    {/* Icon Container */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: theme.bg,
                        boxShadow: shadows.raised.xs,
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: isActive ? theme.primary : theme.textSecondary }}
                      />
                    </div>
                    {!minimized && (
                      <span
                        className="flex-1 text-left font-medium text-sm"
                        style={{ color: isActive ? theme.primary : theme.textPrimary }}
                      >
                        {item.name}
                      </span>
                    )}
                  </NavLink>
                )}

                {/* Submenu with Green Vertical Line */}
                {hasChildren && !minimized && (
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: isExpanded ? '500px' : '0px',
                      opacity: isExpanded ? 1 : 0,
                    }}
                  >
                    <div className="flex mt-2">
                      {/* Green Vertical Line */}
                      <div
                        className="rounded-full ml-6 mr-3"
                        style={{
                          background: theme.secondary,
                          width: '2px',
                        }}
                      />

                      {/* Submenu Items */}
                      <div className="flex-1 space-y-1">
                        {item.children.map(child => {
                          const ChildIcon = getIcon(child.name) || FileText;
                          const isSubActive = child.url && pathname.startsWith(child.url);

                          return (
                            <NavLink
                              key={child.name || child.url}
                              to={child.url}
                              className="flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200"
                              style={{
                                background: isSubActive ? `${theme.primary}10` : 'transparent',
                                border: isSubActive
                                  ? `1px solid ${theme.warning}`
                                  : '1px solid transparent',
                              }}
                            >
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{
                                  background: theme.bg,
                                  boxShadow: isSubActive ? 'none' : shadows.raised.xs,
                                }}
                              >
                                <ChildIcon
                                  className="w-4 h-4"
                                  style={{ color: isSubActive ? theme.primary : theme.textMuted }}
                                />
                              </div>
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

      {/* User Profile Section */}
      <div className="p-3 border-t" style={{ borderColor: theme.shadowDark }}>
        <div
          className={`flex items-center gap-3 p-2 rounded-xl ${minimized ? 'justify-center' : ''}`}
          style={{
            background: theme.bg,
            boxShadow: shadows.raised.sm,
          }}
        >
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
            style={{ background: gradients.primary, boxShadow: shadows.raised.xs }}
          >
            {user?.firstName?.[0] || user?.name?.[0] || 'U'}
            {user?.lastName?.[0] || ''}
          </div>
          {!minimized && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: theme.textPrimary }}>
                  {user?.firstName
                    ? `${user.firstName} ${user.lastName || ''}`
                    : user?.name || 'User'}
                </p>
                <p className="text-xs truncate" style={{ color: theme.textMuted }}>
                  {user?.role?.roleName || 'Administrator'}
                </p>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg transition-colors hover:bg-red-50"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" style={{ color: '#ff4d6a' }} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
