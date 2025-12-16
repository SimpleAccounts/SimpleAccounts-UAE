import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown } from 'lucide-react';

/**
 * Sidebar Component
 * Main navigation sidebar with collapsible items
 */
export function Sidebar({ className, items = [], pathname = '', minimized = false }) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className={cn('hidden md:block w-64 border-r bg-background', className)}>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">No navigation items available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'hidden md:block border-r bg-background transition-all duration-300',
        minimized ? 'w-16' : 'w-64',
        className
      )}
    >
      <ScrollArea className="h-full">
        <nav className="flex flex-col space-y-1 p-4">
          {items.map((item) => (
            <NavItem
              key={item.url || item.name}
              item={item}
              pathname={pathname}
              minimized={minimized}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

function NavItem({ item, pathname, minimized }) {
  const [isOpen, setIsOpen] = useState(
    item.children?.some((child) => child?.url && pathname.startsWith(child.url))
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
            isOpen && 'bg-accent text-accent-foreground',
            minimized && 'justify-center px-2'
          )}
          title={minimized ? item.name : undefined}
        >
          <div className="flex items-center space-x-2">
            {item.icon && <i className={cn(item.icon, minimized && 'text-lg')} />}
            {!minimized && <span>{item.name}</span>}
          </div>
          {!minimized && (
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isOpen && 'transform rotate-180'
              )}
            />
          )}
        </button>
        {isOpen && !minimized && (
          <div className="ml-4 space-y-1 border-l pl-4">
            {item.children.map((child) => (
              <NavItem
                key={child.url || child.name}
                item={child}
                pathname={pathname}
                minimized={false}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.url}
      className={({ isActive }) =>
        cn(
          'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-accent text-accent-foreground',
          minimized && 'justify-center px-2'
        )
      }
      title={minimized ? item.name : undefined}
    >
      {item.icon && <i className={cn(item.icon, minimized && 'text-lg')} />}
      {!minimized && <span>{item.name}</span>}
    </NavLink>
  );
}

export default Sidebar;

