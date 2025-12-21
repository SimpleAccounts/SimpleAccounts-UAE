import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * MobileNav Component
 * Mobile navigation menu for use in Sheet component
 */
export function MobileNav({ items = [], pathname = '' }) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">No navigation items available</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <nav className="flex flex-col space-y-1 p-4">
        {items.map(item => (
          <NavItem key={item.url || item.name} item={item} pathname={pathname} />
        ))}
      </nav>
    </ScrollArea>
  );
}

function NavItem({ item, pathname }) {
  const [isOpen, setIsOpen] = React.useState(
    item.children?.some(child => child?.url && pathname.startsWith(child.url))
  );

  if (Array.isArray(item.children) && item.children.length > 0) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            isOpen && 'bg-accent text-accent-foreground'
          )}
        >
          <div className="flex items-center space-x-2">
            {item.icon && <i className={item.icon} />}
            <span>{item.name}</span>
          </div>
          {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
        {isOpen && (
          <div className="ml-4 space-y-1 border-l pl-4">
            {item.children.map(child => (
              <NavItem key={child.url || child.name} item={child} pathname={pathname} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.url}
      className={cn(
        'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        pathname === item.url && 'bg-accent text-accent-foreground'
      )}
    >
      {item.icon && <i className={item.icon} />}
      <span>{item.name}</span>
    </NavLink>
  );
}

export default MobileNav;
