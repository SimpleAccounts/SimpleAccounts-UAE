/**
 * NeuDropdown - Neumorphic Dropdown Components
 * Migration wrapper: reactstrap Dropdown API → shadcn/ui DropdownMenu with neumorphic styling
 *
 * Usage (drop-in replacement for reactstrap Dropdown):
 *   import { NeuDropdown as Dropdown, NeuDropdownToggle as DropdownToggle, NeuDropdownMenu as DropdownMenu, NeuDropdownItem as DropdownItem } from 'components/migration';
 *   <Dropdown isOpen={isOpen} toggle={toggle}>
 *     <DropdownToggle caret>Menu</DropdownToggle>
 *     <DropdownMenu>
 *       <DropdownItem onClick={handleAction}>Action</DropdownItem>
 *     </DropdownMenu>
 *   </Dropdown>
 */
import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Neumorphic dropdown styles
const NEU_DROPDOWN_STYLES = {
  content: {
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '6px 6px 12px var(--neu-shadow-dark, #c4c9cf), -6px -6px 12px var(--neu-shadow-light, #ffffff)',
    border: 'none',
    borderRadius: '12px',
    padding: '8px',
    minWidth: '160px',
  },
  item: {
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    outline: 'none',
    color: 'var(--neu-text-primary, #1e3a5f)',
    transition: 'all 0.15s ease',
  },
  itemHover: {
    background: 'rgba(30, 110, 255, 0.05)',
    color: 'var(--neu-primary, #1e6eff)',
    boxShadow: '2px 2px 4px var(--neu-shadow-dark, #c4c9cf), -2px -2px 4px var(--neu-shadow-light, #ffffff)',
  },
  toggle: {
    background: 'var(--neu-bg, #e8eef5)',
    boxShadow:
      '3px 3px 6px var(--neu-shadow-dark, #c4c9cf), -3px -3px 6px var(--neu-shadow-light, #ffffff)',
    border: 'none',
    borderRadius: '12px',
    padding: '8px 16px',
    cursor: 'pointer',
    color: 'var(--neu-text-primary, #1e3a5f)',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  },
  divider: {
    height: '1px',
    background: 'rgba(200, 210, 220, 0.3)',
    margin: '8px 0',
  },
};

const NeuDropdown = ({ children, isOpen, toggle, direction = 'down', ...props }) => {
  return (
    <DropdownMenuPrimitive.Root open={isOpen} onOpenChange={toggle} {...props}>
      {children}
    </DropdownMenuPrimitive.Root>
  );
};
NeuDropdown.displayName = 'NeuDropdown';

const NeuDropdownToggle = React.forwardRef(
  ({ children, className, caret = false, color = 'secondary', style, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          ref={ref}
          className={cn('inline-flex items-center gap-2', className)}
          style={{
            ...NEU_DROPDOWN_STYLES.toggle,
            ...(isHovered
              ? {
                  transform: 'translateY(-2px)',
                  boxShadow:
                    '4px 4px 8px var(--neu-shadow-dark, #c4c9cf), -4px -4px 8px var(--neu-shadow-light, #ffffff)',
                }
              : {}),
            ...style,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...props}
        >
          {children}
          {caret && <ChevronDown className="h-4 w-4" />}
        </button>
      </DropdownMenuPrimitive.Trigger>
    );
  }
);
NeuDropdownToggle.displayName = 'NeuDropdownToggle';

const NeuDropdownMenu = React.forwardRef(
  ({ children, className, right = false, style, ...props }, ref) => {
    return (
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          ref={ref}
          align={right ? 'end' : 'start'}
          sideOffset={4}
          className={cn(
            'z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className
          )}
          style={{ ...NEU_DROPDOWN_STYLES.content, ...style }}
          {...props}
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    );
  }
);
NeuDropdownMenu.displayName = 'NeuDropdownMenu';

const NeuDropdownItem = React.forwardRef(
  ({ children, className, disabled = false, header = false, divider = false, onClick, style, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    if (divider) {
      return <div style={NEU_DROPDOWN_STYLES.divider} />;
    }

    if (header) {
      return (
        <div
          className={cn('px-3 py-2 text-xs font-semibold uppercase tracking-wider', className)}
          style={{ color: 'var(--neu-text-muted, #98afc2)', ...style }}
        >
          {children}
        </div>
      );
    }

    return (
      <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn('flex items-center', className)}
        style={{
          ...NEU_DROPDOWN_STYLES.item,
          ...(isHovered && !disabled ? NEU_DROPDOWN_STYLES.itemHover : {}),
          ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
          ...style,
        }}
        disabled={disabled}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Item>
    );
  }
);
NeuDropdownItem.displayName = 'NeuDropdownItem';

export { NeuDropdown, NeuDropdownToggle, NeuDropdownMenu, NeuDropdownItem };
