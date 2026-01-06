/**
 * NeuNav - Navigation and Tab Components with Neumorphic Styling
 */
import React from 'react';
import { cn } from '@/lib/utils';

const NEU_NAV_STYLES = {
  nav: {
    display: 'flex',
    gap: '8px',
  },
  navLink: {
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '2px 2px 4px var(--neu-shadow-dark, #c4c9cf), -2px -2px 4px var(--neu-shadow-light, #ffffff)',
    border: 'none',
    borderRadius: '10px',
    padding: '8px 16px',
    color: 'var(--neu-text-muted, #98afc2)',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  },
  navLinkActive: {
    color: 'var(--neu-primary, #2064d8)',
    boxShadow:
      'inset 2px 2px 4px var(--neu-shadow-dark, #c4c9cf), inset -2px -2px 4px var(--neu-shadow-light, #ffffff)',
  },
  tabContent: {
    paddingTop: '16px',
  },
};

const NeuNav = React.forwardRef(
  ({ children, className, tabs: _tabs = false, pills: _pills = false, style, ...props }, ref) => (
    <nav
      ref={ref}
      className={cn('flex flex-wrap', className)}
      style={{ ...NEU_NAV_STYLES.nav, ...style }}
      {...props}
    >
      {children}
    </nav>
  )
);
NeuNav.displayName = 'NeuNav';

const NeuNavItem = React.forwardRef(({ children, className, style, ...props }, ref) => (
  <div ref={ref} className={cn('nav-item', className)} style={style} {...props}>
    {children}
  </div>
));
NeuNavItem.displayName = 'NeuNavItem';

const NeuNavLink = React.forwardRef(
  (
    { children, className, active = false, disabled = false, href, onClick, style, ...props },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const linkStyle = {
      ...NEU_NAV_STYLES.navLink,
      ...(active ? NEU_NAV_STYLES.navLinkActive : {}),
      ...(isHovered && !active && !disabled
        ? {
            color: 'var(--neu-primary, #2064d8)',
            boxShadow:
              '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
          }
        : {}),
      ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
      ...style,
    };

    const Component = href ? 'a' : 'button';

    return (
      <Component
        ref={ref}
        href={href}
        className={className}
        style={linkStyle}
        onClick={disabled ? undefined : onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
NeuNavLink.displayName = 'NeuNavLink';

const NeuTabContent = React.forwardRef(
  ({ children, className, activeTab, style, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      style={{ ...NEU_NAV_STYLES.tabContent, ...style }}
      {...props}
    >
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return null;
        if (child.props.tabId === activeTab) return child;
        return null;
      })}
    </div>
  )
);
NeuTabContent.displayName = 'NeuTabContent';

const NeuTabPane = React.forwardRef(
  ({ children, className, tabId: _tabId, style, ...props }, ref) => (
    <div ref={ref} className={className} style={style} {...props}>
      {children}
    </div>
  )
);
NeuTabPane.displayName = 'NeuTabPane';

export { NeuNav, NeuNavItem, NeuNavLink, NeuTabContent, NeuTabPane };
